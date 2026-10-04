// Data layer for the EkaNex ADMIN platform. Connects to the SAME Supabase
// backend as the student site (same tables), or runs on a local demo cache when
// Supabase isn't configured so the console is fully previewable.
//
//   • LIVE  (Supabase env present): admin auth is real Supabase Auth + a role
//     check (profiles.role must be 'admin'); sign-up is gated by an invite code
//     validated SERVER-SIDE via the claim_admin() RPC. Reads come from a local
//     cache hydrated from Supabase; writes go to Supabase then re-hydrate.
//   • DEMO  (no env): a local store seeded with sample applications. Admin
//     accounts are stored locally and gated by the same invite code.
import { supabase } from './supabase';
import { isSupabaseConfigured } from './config';
import * as store from './store';
import * as sb from './supabaseData';

const live = () => isSupabaseConfigured && !!supabase;
const demoMode = () => !live();
export const isLive = () => live();

// Admin sign-up invite code. In demo mode it's checked here; in live mode it's
// validated server-side by the claim_admin() SQL function (the client value is
// only a convenience — the real secret lives in the database function).
export const ADMIN_INVITE_CODE = 'EKANEX-ADMIN-2026';

const SKEY = 'ekanex.admin.authed';
export function isAuthed() { try { return sessionStorage.getItem(SKEY) === '1'; } catch { return false; } }
function setAuthed(v) { try { v ? sessionStorage.setItem(SKEY, '1') : sessionStorage.removeItem(SKEY); } catch {} }

export function getSession() { return store.getSession(); }

/* ----------------------------- hydration ----------------------------------- */
export async function rehydrate() {
  if (demoMode()) return;
  try { store.setData(await sb.hydrateAdmin()); } catch (e) { /* ignore */ }
}
export async function bootstrap() {
  if (demoMode()) return;
  if (isAuthed()) { const r = await sb.myRole(); if (r !== 'admin') setAuthed(false); }
  await rehydrate();
}

/* ------------------------------ admin auth --------------------------------- */
export async function adminSignUp({ name, email, password, inviteCode }) {
  if (demoMode()) {
    if (inviteCode !== ADMIN_INVITE_CODE) return { ok: false, error: 'Invalid admin invite code.' };
    if (store.findAdmin(email)) return { ok: false, error: 'An admin with this email already exists.' };
    store.addAdmin({ name, email, password });
    store.setSession({ role: 'admin', email, name });
    store.upsertProfile(email, { role: 'admin', name });
    setAuthed(true);
    return { ok: true };
  }
  const { error } = await supabase.auth.signUp({ email, password, options: { data: { user_type: 'admin', name } } });
  if (error) return { ok: false, error: error.message };
  // Sign in (works when email confirmation is disabled) then claim the admin
  // role via a server-side function that validates the invite code.
  await supabase.auth.signInWithPassword({ email, password });
  const { error: rpcErr } = await supabase.rpc('claim_admin', { code: inviteCode });
  if (rpcErr) return { ok: false, error: 'Account created, but admin role could not be granted: ' + rpcErr.message };
  const role = await sb.myRole();
  if (role !== 'admin') return { ok: false, error: 'Invalid admin invite code. Your account was created but not granted admin access.' };
  setAuthed(true); store.setSession({ role: 'admin', email, name }); await rehydrate();
  return { ok: true };
}

export async function adminSignIn({ email, password }) {
  if (demoMode()) {
    const a = store.findAdmin(email);
    if (!a || a.password !== password) return { ok: false, error: 'Incorrect email or password.' };
    store.setSession({ role: 'admin', email, name: a.name }); setAuthed(true);
    return { ok: true };
  }
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) return { ok: false, error: error.message };
  const role = await sb.myRole();
  if (role !== 'admin') { await supabase.auth.signOut(); return { ok: false, error: 'This account does not have admin access.' }; }
  const p = await sb.getMyProfile();
  setAuthed(true); store.setSession({ role: 'admin', email, name: p?.name }); await rehydrate();
  return { ok: true };
}

export async function signOut() { setAuthed(false); store.clearSession(); if (live()) await supabase.auth.signOut(); }

/* -------------------------------- reads ------------------------------------ */
export const listApplications = () => store.listApplications();
export const getApplication = (id) => store.getApplication(id);
export const getAnalytics = () => store.analytics();
export const listNotifications = (q) => store.listNotifications(q);
export const listDispatches = () => store.listDispatches();
export const subscribe = (cb) => store.subscribe(cb);

/* -------------------------------- writes ----------------------------------- */
export async function setApplicationStatus(id, status, opts) {
  if (demoMode()) return store.setStatus(id, status, opts);
  const r = await sb.setStatus(id, status); await rehydrate(); return r;
}
export async function addAdminNote(id, text, author) {
  if (demoMode()) return store.addNote(id, text, author);
  const r = await sb.addNote(id, text); await rehydrate(); return r;
}
export async function sendToCompany(id, opts) {
  if (demoMode()) return store.sendToCompany(id, opts);
  const r = await sb.sendToCompany(id, opts); await rehydrate(); return r;
}
export async function reEvaluate(id) {
  if (demoMode()) return store.reEvaluate(id);
  await sb.ensureEvaluations([store.getApplication(id)].filter(Boolean)); await rehydrate();
}
export async function ensureEvaluations() {
  if (demoMode()) return 0;
  const n = await sb.ensureEvaluations(store.listApplications()); if (n) await rehydrate(); return n;
}
export async function markNotificationRead(id) {
  if (demoMode()) return store.markNotificationRead(id);
  await sb.markNotificationRead(id); await rehydrate();
}
export async function markAllNotificationsRead(q) {
  if (demoMode()) return store.markAllRead(q);
  await sb.markAllRead('admin'); await rehydrate();
}

/* ----------------------- admin account management -------------------------- */
export const getProfile = (email) => store.getProfile(email);
export async function updateProfile(email, patch) {
  store.upsertProfile(email, patch);
  if (demoMode()) store.updateAdmin(email, patch);
  else await sb.updateMyProfile(patch);
  return { ok: true };
}
