// Data layer for the app. UI components call these functions and never touch
// Supabase directly. Two modes, selected automatically by src/lib/config.js:
//
//   • LIVE  (Supabase env present): reads are served from a synchronous local
//     CACHE that is HYDRATED from Supabase (bootstrap/rehydrate); writes go to
//     Supabase and then re-hydrate the cache. Row Level Security is the real
//     gate — students literally cannot fetch AI evaluations or admin notes.
//   • DEMO  (no env): the local store IS the backend, fully functional offline
//     so the whole platform is previewable. It enforces the SAME access rules
//     (sanitised student reads) so the preview faithfully mirrors production.
//
// Either way, student-facing reads go through the sanitised projections
// (listStudentApplications / getStudentApplication) which never include AI
// scores, evaluations, admin notes or internal reviewer notes.
import { supabase } from './supabase';
import { isSupabaseConfigured } from './config';
import * as store from './store';
import * as sb from './supabaseData';

const wait = (ms) => new Promise((r) => setTimeout(r, ms));
const live = () => isSupabaseConfigured && !!supabase;
const demoMode = () => !live();
/** True when a real Supabase backend is wired up (vs. the offline demo cache). */
export const isLive = () => live();

const ADMIN_KEY = 'ekanex.admin';
const ADMIN_PASSPHRASE = 'ekanex-admin';
export function isAdmin() { try { return sessionStorage.getItem(ADMIN_KEY) === '1'; } catch { return false; } }
function setAdmin(v) { try { v ? sessionStorage.setItem(ADMIN_KEY, '1') : sessionStorage.removeItem(ADMIN_KEY); } catch {} }

/* ----------------------------- hydration ----------------------------------- */
// Pull the right slice of data from Supabase into the local cache. Safe no-op
// in demo mode. Call on app start and after writes.
export async function rehydrate() {
  if (demoMode()) return;
  try {
    const data = isAdmin() ? await sb.hydrateAdmin() : await sb.hydrateStudent();
    store.setData(data);
  } catch (e) { /* surfaced by callers where relevant */ }
}
export async function bootstrap() {
  if (demoMode()) return;
  // Keep the admin flag honest with the real role.
  if (isAdmin()) {
    const role = await sb.myRole();
    if (role !== 'admin') setAdmin(false);
  }
  await rehydrate();
}

/* --------------------------------- auth ------------------------------------ */
export async function signUp(userType, fields) {
  store.setSession({ role: userType, email: fields.email, name: fields.name || fields.orgName, school: fields.school, year: fields.year });
  if (fields.email) store.upsertProfile(fields.email, { role: userType, name: fields.name, school: fields.school, grade: fields.year, orgName: fields.orgName, orgType: fields.orgType });
  if (demoMode()) { await wait(500); return { ok: true, demo: true }; }
  const { email, password, name, orgName, school, year, orgType } = fields;
  const { data, error } = await supabase.auth.signUp({
    email, password,
    options: { data: { user_type: userType, name: name || null, org_name: orgName || null, school: school || null, grade: year || null, org_type: orgType || null } },
  });
  if (error) return { ok: false, error: error.message };
  await rehydrate();
  return { ok: true, user: data.user };
}

export async function signIn(fields) {
  if (demoMode()) {
    store.setSession({ role: 'student', email: fields.email, name: store.getProfile(fields.email)?.name });
    await wait(500); return { ok: true, demo: true };
  }
  const { email, password } = fields;
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) return { ok: false, error: error.message };
  const prof = await sb.getMyProfile();
  store.setSession({ role: prof?.role || 'student', email, name: prof?.name });
  await rehydrate();
  return { ok: true, user: data.user };
}

export function getSession() { return store.getSession(); }
export async function signOut() { store.clearSession(); setAdmin(false); if (live()) await supabase.auth.signOut(); }
export function previewAsStudent(email, name) { store.setSession({ role: 'student', email, name: name || store.getProfile(email)?.name }); }

/* --------------------------- admin sign-in --------------------------------- */
// A deliberately SEPARATE admin authentication path. In live mode it is real
// Supabase auth plus a server-side role check (profiles.role must be 'admin');
// a non-admin account is rejected and signed straight back out. In demo mode it
// falls back to a passphrase so the console is previewable.
export async function adminLogin({ email, password, passphrase } = {}) {
  if (demoMode()) {
    if (passphrase === ADMIN_PASSPHRASE) { setAdmin(true); return { ok: true, demo: true }; }
    return { ok: false, error: 'Incorrect admin passphrase.' };
  }
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) return { ok: false, error: error.message };
  const role = await sb.myRole();
  if (role !== 'admin') {
    await supabase.auth.signOut();
    return { ok: false, error: 'This account does not have admin access.' };
  }
  setAdmin(true);
  store.setSession({ role: 'admin', email });
  await rehydrate();
  return { ok: true };
}
export async function adminLogout() { setAdmin(false); if (live()) await supabase.auth.signOut(); store.clearSession(); }

/* ----------------------------- applications -------------------------------- */
export async function submitApplication({ opportunityId, opportunity, project, details }) {
  if (demoMode()) {
    const rec = store.createApplication({ opportunityId, opportunity, details });
    await wait(300);
    return { ok: true, demo: true, id: rec.shortId };
  }
  const res = await sb.createApplication({ opportunity, project, details });
  await rehydrate();
  return res;
}

// Admin reads (full/internal) — synchronous from the hydrated cache.
export const listApplications = () => store.listApplications();
export const getApplication = (id) => store.getApplication(id);

// Student reads (sanitised — never any AI/eval/notes).
export const listStudentApplications = (email) => store.listStudentApplications(email);
export const getStudentApplication = (id, email) => store.getStudentApplication(id, email);
export const hasApplied = (email, oppId) => store.hasApplied(email, oppId);

// Admin writes.
export async function setApplicationStatus(id, status, opts) {
  if (demoMode()) return store.setStatus(id, status, opts);
  const res = await sb.setStatus(id, status); await rehydrate(); return res;
}
export async function addAdminNote(id, text, author) {
  if (demoMode()) return store.addNote(id, text, author);
  const res = await sb.addNote(id, text); await rehydrate(); return res;
}
export async function assignToProject(id, opts) {
  if (demoMode()) return store.assignToProject(id, opts);
  const res = await sb.assignToProject(id, opts); await rehydrate(); return res;
}
export async function reEvaluate(id) {
  if (demoMode()) return store.reEvaluate(id);
  await sb.ensureEvaluations([store.getApplication(id)].filter(Boolean)); await rehydrate();
}
// Admin: make sure every application has an AI evaluation (admin-privileged).
export async function ensureEvaluations() {
  if (demoMode()) return 0; // demo store evaluates on submit already
  const n = await sb.ensureEvaluations(store.listApplications());
  if (n) await rehydrate();
  return n;
}

/* ----------------------------- notifications ------------------------------- */
export const listNotifications = (q) => store.listNotifications(q);
export async function markNotificationRead(id) {
  if (demoMode()) return store.markNotificationRead(id);
  await sb.markNotificationRead(id); await rehydrate();
}
export async function markAllNotificationsRead(q) {
  if (demoMode()) return store.markAllRead(q);
  await sb.markAllRead(q?.scope || 'student'); await rehydrate();
}

/* ------------------------------- profiles ---------------------------------- */
export const getProfile = (email) => store.getProfile(email);
export async function updateProfile(email, patch) {
  store.upsertProfile(email, patch);
  if (live()) await sb.updateMyProfile(patch);
  return { ok: true };
}

/* ------------------------------- browse ------------------------------------ */
// Companies + published projects for the student browse experience. Real data
// only: in live mode from Supabase, otherwise empty (no demo content).
let _browseCache = null;
let _browseAt = 0;
export async function getBrowseData() {
  if (demoMode()) return { companies: [], projects: [] };
  // Short-lived cache so Back-navigation to browse doesn't re-hit Supabase.
  if (_browseCache && Date.now() - _browseAt < 60000) return _browseCache;
  try {
    const [companies, projects] = await Promise.all([sb.listCompanies(), sb.listProjects()]);
    _browseCache = { companies: companies || [], projects: projects || [] };
    _browseAt = Date.now();
    return _browseCache;
  } catch (e) {
    return { companies: [], projects: [], error: e.message };
  }
}
export function invalidateBrowseCache() { _browseCache = null; }

/* ------------------------------- analytics --------------------------------- */
export const getAnalytics = () => store.analytics();

/* ------------------------------- subscribe --------------------------------- */
export const subscribe = (cb) => store.subscribe(cb);

/* -------------------------------- enquiries -------------------------------- */
export async function submitEnquiry(payload) {
  if (demoMode()) { await wait(500); return { ok: true, demo: true }; }
  const { error } = await supabase.from('enquiries').insert({
    name: payload.name ?? null, email: payload.email ?? null, organisation: payload.org ?? null,
    topic: payload.topic ?? null, audience: payload.audience ?? null, message: payload.message ?? null,
  });
  if (error) return { ok: false, error: error.message };
  return { ok: true };
}
