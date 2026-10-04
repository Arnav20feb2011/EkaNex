import { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { ShieldCheck, Lock, Loader2, ArrowRight, KeyRound } from 'lucide-react';
import { LogoMark } from '../components/Logo';
import { adminSignIn, adminSignUp, isLive, ADMIN_INVITE_CODE } from '../lib/api';

const field = 'mt-1 w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 shadow-sm focus:border-electric focus:outline-none focus:ring-2 focus:ring-electric/30';
const Label = ({ children, htmlFor }) => <label htmlFor={htmlFor} className="mt-4 block text-sm font-semibold text-ink first:mt-0">{children}</label>;

export default function AuthPage({ onAuthed }) {
  const [mode, setMode] = useState('signin');
  const [v, setV] = useState({});
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');
  const set = (k) => (e) => { setV((s) => ({ ...s, [k]: e.target.value })); setErr(''); };

  const submit = async (e) => {
    e.preventDefault();
    setErr('');
    if (mode === 'signup') {
      for (const [k, l] of [['name', 'Name'], ['email', 'Email'], ['password', 'Password'], ['inviteCode', 'Invite code']]) {
        if (!v[k]?.trim()) { setErr(`${l} is required.`); return; }
      }
      if (v.password.length < 6) { setErr('Password must be at least 6 characters.'); return; }
    } else {
      if (!v.email?.trim() || !v.password?.trim()) { setErr('Enter your email and password.'); return; }
    }
    setBusy(true);
    const res = mode === 'signup'
      ? await adminSignUp({ name: v.name, email: v.email.trim(), password: v.password, inviteCode: v.inviteCode.trim() })
      : await adminSignIn({ email: v.email.trim(), password: v.password });
    setBusy(false);
    if (res.ok) onAuthed();
    else setErr(res.error);
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-navy via-navy-800 to-navy-900 px-5 py-12">
      <Helmet><title>{mode === 'signup' ? 'Admin sign up' : 'Admin sign in'} · EkaNex</title></Helmet>

      <div className="w-full max-w-md">
        <div className="mb-6 flex items-center justify-center gap-2.5">
          <LogoMark className="h-9 w-9" />
          <span className="text-xl font-extrabold tracking-tight text-white">EkaNex</span>
          <span className="rounded-md bg-white/15 px-2 py-0.5 text-xs font-bold uppercase tracking-wide text-white">Admin</span>
        </div>

        <form onSubmit={submit} className="rounded-2xl border border-white/10 bg-white p-8 shadow-float">
          <span className="grid h-12 w-12 place-items-center rounded-xl bg-navy text-white"><ShieldCheck className="h-6 w-6" /></span>
          <h1 className="mt-5 text-xl font-bold text-navy">{mode === 'signup' ? 'Create admin account' : 'Admin sign in'}</h1>
          <p className="mt-1 text-sm text-muted">The administrator console for EkaNex. Student accounts cannot access this platform.</p>

          <div className="mt-6 grid grid-cols-2 gap-1 rounded-xl bg-surface p-1" role="tablist">
            {[['signin', 'Sign In'], ['signup', 'Sign Up']].map(([m, l]) => (
              <button key={m} type="button" role="tab" aria-selected={mode === m} onClick={() => { setMode(m); setErr(''); }}
                className={`rounded-lg px-3 py-2 text-sm font-semibold transition-colors ${mode === m ? 'bg-white text-navy shadow-sm' : 'text-muted hover:text-navy'}`}>
                {l}
              </button>
            ))}
          </div>

          <div className="mt-5">
            {mode === 'signup' && (<><Label htmlFor="a-name">Full name</Label>
              <input id="a-name" value={v.name || ''} onChange={set('name')} placeholder="Your name" autoComplete="name" className={field} /></>)}

            <Label htmlFor="a-email">Work email</Label>
            <input id="a-email" type="email" value={v.email || ''} onChange={set('email')} placeholder="you@ekanex.work" autoComplete="email" className={field} />

            <Label htmlFor="a-pass">Password</Label>
            <input id="a-pass" type="password" value={v.password || ''} onChange={set('password')} placeholder="••••••••" autoComplete={mode === 'signup' ? 'new-password' : 'current-password'} className={field} />

            {mode === 'signup' && (<>
              <Label htmlFor="a-code"><span className="inline-flex items-center gap-1.5"><KeyRound className="h-4 w-4 text-accent-dark" /> Admin invite code</span></Label>
              <input id="a-code" value={v.inviteCode || ''} onChange={set('inviteCode')} placeholder="Enter the admin invite code" className={field} />
              <p className="mt-1 text-xs text-muted">Admin sign-up is restricted. You need the invite code from EkaNex.</p>
            </>)}
          </div>

          {err && <p role="alert" className="mt-3 rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-700">{err}</p>}

          <button type="submit" disabled={busy} className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-navy px-5 py-3 font-semibold text-white transition-all hover:bg-navy-800 disabled:opacity-70">
            {busy ? <Loader2 className="h-5 w-5 animate-spin" /> : <Lock className="h-5 w-5" />}
            {mode === 'signup' ? 'Create account' : 'Sign in'} <ArrowRight className="h-4 w-4" />
          </button>

          {!isLive() && (
            <p className="mt-4 rounded-lg bg-amber-50 px-3 py-2 text-center text-xs text-amber-800">
              Demo mode · invite code <code className="rounded bg-white px-1 py-0.5 font-semibold">{ADMIN_INVITE_CODE}</code>
            </p>
          )}
        </form>
      </div>
    </div>
  );
}
