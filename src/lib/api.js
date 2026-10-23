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

// Turn a raw auth error into a message that's safe + helpful for users. Network
// failures (backend paused/unreachable, offline, DNS) otherwise surface as a
// misleading "Invalid login credentials", so we detect and relabel them.
const NETWORK_RE = /failed to fetch|fetch failed|networkerror|network error|load failed|err_|timed? ?out|timeout| enotfound|getaddrinfo|dns/i;
function authErrorMessage(error) {
  if (!error) return 'Something went wrong. Please try again.';
  const msg = typeof error === 'string' ? error : error.message || '';
  const status = error.status;
  if (NETWORK_RE.test(msg) || status === 0 || status === 503 || status === 504) {
    return "Can't reach the server right now. Please check your connection and try again in a moment.";
  }
  return msg || 'Something went wrong. Please try again.';
}

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

// Keep the signed-in student's dashboard in sync with the admin console in near
// real time: when an admin changes an application's status or sends a new
// notification, it shows up here without a manual refresh. Uses Supabase
// Realtime when the publication is enabled, plus a short poll as a safety net
// (RLS still guarantees the student only ever sees their OWN rows). Returns an
// unsubscribe function. No-op in demo mode.
export function startLiveSync(onChange) {
  if (demoMode()) return () => {};
  const refresh = async () => { await rehydrate(); if (onChange) onChange(); };
  let channel;
  try {
    channel = supabase
      .channel('student-live')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'applications' }, refresh)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'notifications' }, refresh)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'saved_opportunities' }, refresh)
      .subscribe();
  } catch { /* realtime optional — poll covers it */ }
  const poll = setInterval(refresh, 10000);
  return () => { clearInterval(poll); try { if (channel) supabase.removeChannel(channel); } catch {} };
}

/* --------------------------------- auth ------------------------------------ */
export async function signUp(userType, fields) {
  store.setSession({ role: userType, userType, email: fields.email, name: fields.name || fields.orgName, school: fields.school, year: fields.year });
  if (fields.email) store.upsertProfile(fields.email, { role: userType, name: fields.name, school: fields.school, grade: fields.year, orgName: fields.orgName, orgType: fields.orgType });
  if (demoMode()) { await wait(500); return { ok: true, demo: true }; }
  const { email, password, name, orgName, school, year, orgType } = fields;
  try {
    const { data, error } = await supabase.auth.signUp({
      email, password,
      options: { data: { user_type: userType, name: name || null, org_name: orgName || null, school: school || null, grade: year || null, org_type: orgType || null } },
    });
    if (error) return { ok: false, error: authErrorMessage(error) };
    await rehydrate();
    return { ok: true, user: data.user };
  } catch (e) {
    return { ok: false, error: authErrorMessage(e) };
  }
}

export async function signIn(fields) {
  if (demoMode()) {
    store.setSession({ role: 'student', email: fields.email, name: store.getProfile(fields.email)?.name });
    await wait(500); return { ok: true, demo: true };
  }
  const { email, password } = fields;
  try {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) return { ok: false, error: authErrorMessage(error) };
    const prof = await sb.getMyProfile();
    store.setSession({ role: prof?.role || 'student', userType: prof?.user_type || 'student', email, name: prof?.name });
    await rehydrate();
    return { ok: true, user: data.user };
  } catch (e) {
    return { ok: false, error: authErrorMessage(e) };
  }
}

export function getSession() { return store.getSession(); }
export async function signOut() { store.clearSession(); setAdmin(false); if (live()) await supabase.auth.signOut(); }

// Confirm the Supabase session is still valid (used to detect an expired login
// on the protected dashboard). In demo mode there's nothing to check.
export async function getAuthUser() {
  if (demoMode()) return store.getSession()?.email ? { email: store.getSession().email } : null;
  try { const { data } = await supabase.auth.getUser(); return data?.user || null; } catch { return null; }
}

/* ---------------------------- password reset ------------------------------- */
// Send a reset link to the email. Supabase returns success even if the address
// isn't registered (anti-enumeration), so the UI always shows a neutral message.
export async function requestPasswordReset(email) {
  if (demoMode()) { await wait(400); return { ok: true, demo: true }; }
  try {
    const redirectTo = `${window.location.origin}/dashboard`;
    const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo });
    if (error) return { ok: false, error: authErrorMessage(error) };
    return { ok: true };
  } catch (e) { return { ok: false, error: authErrorMessage(e) }; }
}
// Set a new password for the user who arrived via a recovery link (they have a
// temporary recovery session).
export async function completePasswordReset(newPassword) {
  if (demoMode()) { await wait(400); return { ok: true, demo: true }; }
  try {
    const { data, error } = await supabase.auth.updateUser({ password: newPassword });
    if (error) return { ok: false, error: authErrorMessage(error) };
    const prof = await sb.getMyProfile().catch(() => null);
    const email = data?.user?.email;
    if (email) store.setSession({ role: prof?.role || 'student', userType: prof?.user_type || 'student', email, name: prof?.name });
    await rehydrate();
    return { ok: true };
  } catch (e) { return { ok: false, error: authErrorMessage(e) }; }
}
// Fire `cb` when Supabase detects a recovery link in the URL (PASSWORD_RECOVERY).
export function onPasswordRecovery(cb) {
  if (demoMode() || !supabase) return () => {};
  const { data } = supabase.auth.onAuthStateChange((event) => { if (event === 'PASSWORD_RECOVERY') cb(); });
  return () => { try { data?.subscription?.unsubscribe(); } catch {} };
}

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

// Student withdraws their own application.
export async function withdrawApplication(id) {
  if (demoMode()) { store.withdrawApplication(id); return { ok: true, demo: true }; }
  store.withdrawApplication(id); // optimistic
  const res = await sb.withdrawApplication(id);
  await rehydrate();
  return res;
}

/* --------------------------- saved opportunities --------------------------- */
export const listSavedOpportunities = (email) => store.listSaved(email);
export const isOpportunitySaved = (email, oppId) => store.isSaved(email, oppId);
export async function saveOpportunity(opportunity) {
  const email = getSession()?.email || null;
  store.saveOpportunity(email, opportunity); // optimistic / demo
  if (live()) { const r = await sb.saveOpportunity(opportunity); if (r?.ok) await rehydrate(); }
  return { ok: true };
}
export async function unsaveOpportunity(opportunityId) {
  const email = getSession()?.email || null;
  store.unsaveOpportunity(email, opportunityId); // optimistic / demo
  if (live()) { const r = await sb.unsaveOpportunity(opportunityId); if (r?.ok) await rehydrate(); }
  return { ok: true };
}

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
// Columns that actually exist on public.profiles — everything else (skills,
// interests, …) is kept in the local profile cache only, so a live update never
// fails on an unknown column.
const DB_PROFILE_COLS = ['name', 'school', 'grade', 'phone', 'city', 'org_name', 'org_type', 'avatar_url'];
export async function updateProfile(email, patch) {
  store.upsertProfile(email, patch);
  if (live()) {
    const dbPatch = {};
    for (const k of DB_PROFILE_COLS) if (k in patch) dbPatch[k] = patch[k];
    if (Object.keys(dbPatch).length) await sb.updateMyProfile(dbPatch);
  }
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

/* ----------------------------- organization -------------------------------- */
// Organization dashboard data. In demo mode there's no org backend, so this
// returns an unlinked workspace (the UI shows a setup state).
export async function getOrgWorkspace() {
  if (demoMode()) return { linked: false, company: null, projects: [], applications: [] };
  try { return await sb.orgWorkspace(); } catch (e) { return { linked: false, company: null, projects: [], applications: [], error: e.message }; }
}

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
