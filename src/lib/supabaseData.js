// Real Supabase data-access layer.
// -----------------------------------------------------------------------------
// These functions talk directly to the Postgres tables defined in
// supabase/migrations/0001_init.sql + 0002_platform.sql. They are used by
// src/lib/api.js ONLY when Supabase is configured (env present). Row Level
// Security is the real gate — these queries simply return whatever the signed-in
// user is allowed to see:
//   • A student selecting `applications` gets only their own rows, and cannot
//     read `ai_evaluations` or `admin_notes` at all (RLS denies).
//   • An admin (profiles.role = 'admin') sees everything.
//
// The UI stays synchronous by reading a local cache (src/lib/store.js). The
// functions here HYDRATE that cache from Supabase (`hydrateAdmin` /
// `hydrateStudent`) and perform WRITES; after any write we re-hydrate so the
// cache (and therefore the UI) reflects the database.
import { supabase } from './supabase';
import { evaluateApplication } from './evaluation';
import { companyGradient, initials as monogram } from './brand';

/* ------------------------------- helpers ----------------------------------- */
async function uid() {
  const { data } = await supabase.auth.getUser();
  return data?.user?.id ?? null;
}
async function myProfile() {
  const id = await uid();
  if (!id) return null;
  const { data } = await supabase.from('profiles').select('*').eq('id', id).maybeSingle();
  return data || null;
}
export async function myRole() {
  return (await myProfile())?.role ?? null;
}

// Map a DB application row (with embedded relations) to the cache record shape
// used throughout the UI (see store.js createApplication()).
function toRecord(row, { includeInternal }) {
  const ev = includeInternal ? (row.ai_evaluations?.[0] || null) : null;
  return {
    id: row.id,
    shortId: row.short_id,
    applicantId: row.applicant_id,
    applicantEmail: row.applicant_email,
    applicantName: row.applicant_name,
    opportunityId: row.opportunity_id,
    // Prefer the linked project; else the stored snapshot; else rebuild a minimal
    // opportunity from the application's own columns (works when projects aren't
    // yet in the DB and the app still uses the static opportunity catalogue).
    opportunity: row.projects ? projectToOpp(row.projects) : (row.opportunity_snapshot || {
      id: row.opportunity_id, company: row.company, roleTitle: row.role_title,
      initials: (row.company || 'EK').slice(0, 2).toUpperCase(), logoFrom: '#1F3864', logoTo: '#2563EB',
    }),
    details: row.details || {},
    status: row.status,
    assignment: row.assigned_project_id ? { projectId: row.assigned_project_id } : null,
    createdAt: row.created_at,
    updatedAt: row.updated_at || row.created_at,
    history: (row.application_status_history || [])
      .slice()
      .sort((a, b) => (a.created_at < b.created_at ? -1 : 1))
      .map((h) => ({ status: h.status, at: h.created_at, by: h.changed_by, note: includeInternal ? h.note : undefined })),
    notes: includeInternal ? (row.admin_notes || []).map((n) => ({ id: n.id, text: n.body, author: n.author_name, at: n.created_at })) : [],
    aiEvaluation: ev ? {
      model: ev.model, overall: ev.overall, scores: ev.scores || [], strengths: ev.strengths || [],
      concerns: ev.concerns || [], recommendedRole: ev.recommended_role,
      recommendedProjectTypes: ev.recommended_project_types || [], interviewQuestions: ev.interview_questions || [],
      recommendation: ev.recommendation, recommendationLabel: labelFor(ev.recommendation), summary: ev.summary,
      fairnessNote: ev.fairness_note, generatedAt: ev.created_at,
    } : null,
  };
}
function labelFor(rec) {
  return { strongly_shortlist: 'Strongly Shortlist', shortlist: 'Shortlist', review_manually: 'Review Manually', do_not_shortlist: 'Do Not Shortlist' }[rec] || 'Review Manually';
}
function projectToOpp(p) {
  const c = p.companies || {};
  const name = c.name || p.company_name || 'Company';
  const g = companyGradient(name);
  return {
    id: p.legacy_id || p.id,
    dbId: p.id,
    company: name,
    verified: !!c.verified,
    sector: p.sector || c.sector || '',
    roleTitle: p.role_title,
    roleShort: p.role_short || p.role_description || '',
    roleDescription: p.role_description || p.role_short || '',
    companyDescription: c.description || '',
    responsibilities: Array.isArray(p.responsibilities) ? p.responsibilities : [],
    skills: p.skills || [],
    workType: p.work_type,
    workDetail: p.work_detail || p.work_type || '',
    location: p.location,
    supervisor: p.supervisor || '',
    startsOn: p.starts_on || '',
    endsOn: p.ends_on || '',
    seatStatus: p.seat_status || '',
    window: p.window_label || '',
    deadline: p.window_label ? `Programme window · ${p.window_label}` : 'Rolling for Winter 2026',
    applicationProcess: 'Apply via EkaNex → short screening call → matched to the project → parental consent + confidentiality undertaking → start.',
    initials: monogram(name), logoFrom: g.from, logoTo: g.to,
  };
}

const APP_SELECT_ADMIN =
  '*, projects(*, companies(name)), ai_evaluations(*), admin_notes(*), application_status_history(*)';
const APP_SELECT_STUDENT =
  '*, projects(*, companies(name)), application_status_history(status, created_at)';

/* ------------------------------- hydration --------------------------------- */
// Return { applications, notifications } to replace the local cache. Admins get
// the internal view (AI + notes); students get the sanitized view (RLS also
// enforces this server-side — the embed simply returns nothing for denied rows).
export async function hydrateAdmin() {
  const { data, error } = await supabase.from('applications').select(APP_SELECT_ADMIN).order('created_at', { ascending: false });
  if (error) throw error;
  const applications = (data || []).map((r) => toRecord(r, { includeInternal: true }));
  const { data: notifs } = await supabase.from('notifications').select('*').eq('scope', 'admin').order('created_at', { ascending: false });
  const notifications = (notifs || []).map((n) => ({ id: n.id, scope: n.scope, type: n.type, title: n.title, body: n.body, applicationId: n.application_id, read: n.read, at: n.created_at }));
  return { applications, notifications };
}

export async function hydrateStudent() {
  // RLS guarantees these are the signed-in student's own rows only, and that
  // ai_evaluations / admin_notes are never returned.
  const { data, error } = await supabase.from('applications').select(APP_SELECT_STUDENT).order('created_at', { ascending: false });
  if (error) throw error;
  const applications = (data || []).map((r) => toRecord(r, { includeInternal: false }));
  const id = await uid();
  const { data: notifs } = await supabase.from('notifications').select('*').eq('scope', 'student').eq('user_id', id).order('created_at', { ascending: false });
  const notifications = (notifs || []).map((n) => ({ id: n.id, scope: n.scope, forEmail: n.user_id, type: n.type, title: n.title, body: n.body, applicationId: n.application_id, read: n.read, at: n.created_at }));
  return { applications, notifications };
}

/* --------------------------------- writes ---------------------------------- */
export async function createApplication({ project, opportunity, details }) {
  const id = await uid();
  const opp = opportunity || project;
  const row = {
    applicant_id: id,
    opportunity_id: opp?.id || null,
    project_id: project?.dbId || null,
    company: opp?.company || null,
    role_title: opp?.roleTitle || null,
    applicant_name: details?.fullName || null,
    applicant_email: details?.email || null,
    status: 'submitted',
    details: details || null,
  };
  // short_id + 'submitted' history + student/admin notifications are created by
  // DB triggers (see 0002_platform.sql).
  const { data, error } = await supabase.from('applications').insert(row).select('short_id').single();
  if (error) return { ok: false, error: error.message };
  return { ok: true, id: data?.short_id };
}

export async function setStatus(appId, status) {
  // Status history + student notification are handled by a DB trigger.
  const { error } = await supabase.from('applications').update({ status, updated_at: new Date().toISOString() }).eq('id', appId);
  if (error) return { ok: false, error: error.message };
  return { ok: true };
}

export async function addNote(appId, body) {
  const p = await myProfile();
  const { error } = await supabase.from('admin_notes').insert({ application_id: appId, author_id: p?.id, author_name: p?.name || 'Admin', body });
  if (error) return { ok: false, error: error.message };
  return { ok: true };
}

export async function assignToProject(appId, { projectId } = {}) {
  const { error } = await supabase.from('applications').update({ assigned_project_id: projectId || null }).eq('id', appId);
  if (error) return { ok: false, error: error.message };
  return { ok: true };
}

// Admin-only: generate + persist an AI evaluation for any application that
// doesn't have one yet (RLS lets only admins insert into ai_evaluations).
export async function ensureEvaluations(records) {
  const pending = records.filter((r) => !r.aiEvaluation);
  for (const r of pending) {
    const ev = evaluateApplication(r);
    await supabase.from('ai_evaluations').insert({
      application_id: r.id, model: ev.model, overall: ev.overall, scores: ev.scores,
      strengths: ev.strengths, concerns: ev.concerns, recommended_role: ev.recommendedRole,
      recommended_project_types: ev.recommendedProjectTypes, interview_questions: ev.interviewQuestions,
      recommendation: ev.recommendation, summary: ev.summary, fairness_note: ev.fairnessNote,
    });
    // Advance to ai_evaluated if still in an early stage.
    if (['submitted', 'under_review'].includes(r.status)) {
      await supabase.from('applications').update({ status: 'ai_evaluated' }).eq('id', r.id);
    }
  }
  return pending.length;
}

export async function markNotificationRead(id) {
  await supabase.from('notifications').update({ read: true }).eq('id', id);
}
export async function markAllRead(scope) {
  const q = supabase.from('notifications').update({ read: true }).eq('scope', scope);
  await q;
}

/* -------------------------------- profiles --------------------------------- */
export async function getMyProfile() { return myProfile(); }
export async function updateMyProfile(patch) {
  const id = await uid();
  if (!id) return { ok: false };
  const { error } = await supabase.from('profiles').update(patch).eq('id', id);
  return { ok: !error, error: error?.message };
}

/* ---------------------------- companies / projects ------------------------- */
export async function listProjects() {
  const { data } = await supabase.from('projects').select('*, companies(name, verified, sector, description)').eq('is_published', true);
  return (data || []).map(projectToOpp);
}
export async function listCompanies() {
  const { data } = await supabase.from('companies').select('*');
  return data || [];
}
