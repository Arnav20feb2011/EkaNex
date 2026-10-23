import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import {
  LayoutDashboard, FileText, User, Bell, LogOut, ArrowRight, ArrowLeft, MapPin,
  CalendarCheck, CheckCircle2, Sparkles, GraduationCap, Inbox, Search, Bookmark,
  Trophy, XCircle, Clock, Star, PartyPopper, Phone, Trash2, ExternalLink, Menu, X,
  ArrowUpDown, Briefcase,
} from 'lucide-react';
import { LogoMark } from '../components/Logo';
import {
  getSession, signOut, signIn, signUp, getAuthUser, rehydrate,
  requestPasswordReset, completePasswordReset, onPasswordRecovery,
  listStudentApplications, listSavedOpportunities, unsaveOpportunity, withdrawApplication,
  listNotifications, markAllNotificationsRead, getProfile, updateProfile, startLiveSync,
} from '../lib/api';
import OrganizationDashboard from './OrganizationDashboard';
import { STUDENT_YEARS } from '../data/opportunities';
import { STUDENT_PIPELINE, statusMeta } from '../lib/status';
import { StatusBadge, EmptyState, useStore, fmtDate, timeAgo } from '../components/ui';
import { SITE } from '../data/site';

const ease = [0.22, 1, 0.36, 1];

/* =========================================================================== */
/*  SIGN-IN GATE (protects the dashboard)                                      */
/* =========================================================================== */
const gInput = 'mt-1 w-full rounded-xl border border-slate-200 px-4 py-2.5 text-navy outline-none transition-colors focus:border-electric focus:ring-2 focus:ring-electric/20';

function Gate() {
  // modes: 'signin' | 'signup' | 'forgot' | 'recovery'
  const [mode, setMode] = useState('signin');
  const [v, setV] = useState({ email: '', password: '', name: '', school: '', year: '', password2: '' });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const set = (k) => (e) => { setV((s) => ({ ...s, [k]: e.target.value })); setError(''); };
  const switchMode = (m) => { setMode(m); setError(''); setNotice(''); };

  // If the user arrived via a password-reset email, show the "set new password" view.
  useEffect(() => {
    if (/type=recovery/.test(window.location.hash) || /recovery/.test(window.location.search)) setMode('recovery');
    const off = onPasswordRecovery(() => setMode('recovery'));
    return off;
  }, []);

  const submit = async (e) => {
    e.preventDefault();
    setError(''); setNotice('');
    const email = v.email.trim();

    if (mode === 'forgot') {
      if (!email) { setError('Enter your email.'); return; }
      setSubmitting(true);
      const res = await requestPasswordReset(email);
      setSubmitting(false);
      if (res.ok) setNotice('If an account exists for that email, we’ve sent a password reset link. Check your inbox (and spam).');
      else setError(res.error || 'Could not send the reset link.');
      return;
    }

    if (mode === 'recovery') {
      if (!v.password || v.password.length < 6) { setError('Choose a password of at least 6 characters.'); return; }
      if (v.password !== v.password2) { setError('Passwords don’t match.'); return; }
      setSubmitting(true);
      const res = await completePasswordReset(v.password);
      setSubmitting(false);
      if (!res.ok) setError(res.error || 'Could not update your password.');
      // On success the session is set → the shell re-renders into the dashboard.
      return;
    }

    if (mode === 'signup') {
      if (!v.name.trim() || !email || !v.password) { setError('Enter your name, email and a password.'); return; }
      if (v.password.length < 6) { setError('Choose a password of at least 6 characters.'); return; }
      setSubmitting(true);
      const res = await signUp('student', { name: v.name.trim(), email, password: v.password, school: v.school.trim(), year: v.year });
      setSubmitting(false);
      if (!res.ok) setError(res.error || 'Could not create your account.');
      return;
    }

    // sign in
    if (!email || !v.password) { setError('Enter your email and password to continue.'); return; }
    setSubmitting(true);
    const res = await signIn({ email, password: v.password });
    setSubmitting(false);
    if (!res.ok) setError(res.error || 'Could not sign in. Please try again.');
  };

  const titles = {
    signin: ['Sign in to your dashboard', 'Track your applications, interviews and selected projects in one place.'],
    signup: ['Create your dashboard account', 'Sign up to apply and track everything in one place.'],
    forgot: ['Reset your password', 'Enter your email and we’ll send you a reset link.'],
    recovery: ['Set a new password', 'Choose a new password for your account.'],
  }[mode];

  return (
    <div className="flex min-h-screen items-center justify-center bg-canvas px-5 py-10">
      <Helmet><title>Sign in · EkaNex Dashboard</title><meta name="robots" content="noindex" /></Helmet>
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, ease }} className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-8 shadow-card">
        <div className="text-center">
          <span className="mx-auto grid h-12 w-12 place-items-center rounded-xl bg-electric/10 text-electric"><LayoutDashboard className="h-6 w-6" /></span>
          <h1 className="mt-5 text-xl font-bold text-navy">{titles[0]}</h1>
          <p className="mt-1 text-sm text-muted">{titles[1]}</p>
        </div>

        {/* Sign in / Sign up toggle */}
        {(mode === 'signin' || mode === 'signup') && (
          <div className="mt-6 grid grid-cols-2 gap-1 rounded-xl bg-surface p-1" role="tablist">
            {[['signin', 'Sign In'], ['signup', 'Sign Up']].map(([m, l]) => (
              <button key={m} type="button" onClick={() => switchMode(m)} className={`rounded-lg px-3 py-2 text-sm font-semibold transition-colors ${mode === m ? 'bg-white text-navy shadow-sm' : 'text-muted hover:text-navy'}`}>{l}</button>
            ))}
          </div>
        )}

        <form onSubmit={submit} noValidate className="mt-5 space-y-4">
          {mode === 'signup' && (
            <label className="block"><span className="text-sm font-semibold text-navy">Full name</span><input autoComplete="name" value={v.name} onChange={set('name')} placeholder="Your full name" className={gInput} /></label>
          )}
          {mode !== 'recovery' && (
            <label className="block"><span className="text-sm font-semibold text-navy">Email</span><input type="email" autoComplete="email" value={v.email} onChange={set('email')} placeholder="you@example.com" className={gInput} /></label>
          )}
          {(mode === 'signin' || mode === 'signup' || mode === 'recovery') && (
            <label className="block">
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold text-navy">{mode === 'recovery' ? 'New password' : 'Password'}</span>
                {mode === 'signin' && <button type="button" onClick={() => switchMode('forgot')} className="text-xs font-semibold text-electric hover:underline">Forgot password?</button>}
              </div>
              <input type="password" autoComplete={mode === 'signin' ? 'current-password' : 'new-password'} value={v.password} onChange={set('password')} placeholder="••••••••" className={gInput} />
            </label>
          )}
          {mode === 'recovery' && (
            <label className="block"><span className="text-sm font-semibold text-navy">Confirm new password</span><input type="password" autoComplete="new-password" value={v.password2} onChange={set('password2')} placeholder="••••••••" className={gInput} /></label>
          )}
          {mode === 'signup' && (
            <div className="grid grid-cols-2 gap-3">
              <label className="block"><span className="text-sm font-semibold text-navy">School <span className="font-normal text-muted">(optional)</span></span><input value={v.school} onChange={set('school')} placeholder="Your school" className={gInput} /></label>
              <label className="block"><span className="text-sm font-semibold text-navy">Grade <span className="font-normal text-muted">(optional)</span></span>
                <select value={v.year} onChange={set('year')} className={gInput}><option value="">Select…</option>{STUDENT_YEARS.map((y) => <option key={y} value={y}>{y}</option>)}</select>
              </label>
            </div>
          )}

          {error && <p className="rounded-lg bg-rose-50 px-3 py-2 text-sm font-medium text-rose-600">{error}</p>}
          {notice && <p className="rounded-lg bg-emerald-50 px-3 py-2 text-sm font-medium text-emerald-700">{notice}</p>}

          <button type="submit" disabled={submitting} className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-electric px-5 py-3 font-semibold text-white transition-colors hover:bg-electric-dark disabled:opacity-60">
            {submitting ? 'Please wait…' : (
              mode === 'signup' ? <>Create account <ArrowRight className="h-4 w-4" /></>
                : mode === 'forgot' ? 'Send reset link'
                : mode === 'recovery' ? 'Save new password'
                : <>Sign in <ArrowRight className="h-4 w-4" /></>
            )}
          </button>
        </form>

        <div className="mt-5 border-t border-slate-100 pt-4 text-center">
          {mode === 'forgot' && <button type="button" onClick={() => switchMode('signin')} className="text-sm font-semibold text-electric hover:underline">← Back to sign in</button>}
          {mode === 'recovery' && <button type="button" onClick={() => switchMode('signin')} className="text-sm font-semibold text-electric hover:underline">← Back to sign in</button>}
          {(mode === 'signin' || mode === 'signup') && <Link to="/" className="block text-xs font-semibold text-muted hover:text-navy">← Back to site</Link>}
        </div>
      </motion.div>
    </div>
  );
}

/* =========================================================================== */
/*  SHARED PIECES                                                              */
/* =========================================================================== */
function CompanyBadge({ opp, size = 'md' }) {
  const cls = size === 'sm' ? 'h-9 w-9 text-xs' : 'h-11 w-11';
  return (
    <span aria-hidden className={`grid shrink-0 place-items-center rounded-xl font-bold text-white ${cls}`} style={{ backgroundImage: `linear-gradient(135deg, ${opp?.logoFrom || '#1F3864'}, ${opp?.logoTo || '#2563EB'})` }}>
      {opp?.initials || (opp?.company || 'EK').slice(0, 2).toUpperCase()}
    </span>
  );
}

// Schedule-a-call / next-steps panel shown on outcomes that need student action.
function NextSteps({ a }) {
  const opp = a.opportunity || {};
  const CFG = {
    selected: { tone: 'emerald', Icon: PartyPopper, kind: 'kickoff', title: "You're selected! 🎉", body: `Congratulations — ${opp.company} selected you for ${opp.roleTitle}. The final step is your kickoff call to confirm start dates and logistics.`, cta: 'Schedule your kickoff call' },
    interview: { tone: 'blue', Icon: CalendarCheck, kind: 'interview', title: 'Time to schedule your interview', body: `${opp.company} wants to interview you for ${opp.roleTitle}. Book your screening call through EkaNex.`, cta: 'Schedule your interview call' },
    shortlisted: { tone: 'amber', Icon: CalendarCheck, kind: 'interview', title: "You've been shortlisted", body: `Great news — you're shortlisted for ${opp.roleTitle}. An interview invitation is on the way, and you can request a time now.`, cta: 'Request an interview time' },
  };
  const c = CFG[a.status];
  if (!c) return null;
  const subject = encodeURIComponent(`EkaNex · ${opp.roleTitle} at ${opp.company} — ${c.kind} call (${a.shortId})`);
  const mailBody = encodeURIComponent(`Hi EkaNex team,\n\nI'd like to schedule my ${c.kind} call for ${opp.roleTitle} at ${opp.company} (ref ${a.shortId}).\n\nMy availability (please adjust):\n- \n- \n\nThank you!`);
  const href = `mailto:${SITE.email}?subject=${subject}&body=${mailBody}`;
  const tone = {
    emerald: { box: 'border-emerald-200 bg-emerald-50 text-emerald-900', btn: 'bg-emerald-600 hover:bg-emerald-700' },
    blue: { box: 'border-blue-200 bg-blue-50 text-blue-900', btn: 'bg-blue-600 hover:bg-blue-700' },
    amber: { box: 'border-amber-200 bg-amber-50 text-amber-900', btn: 'bg-amber-500 hover:bg-amber-600' },
  }[c.tone];
  const Icon = c.Icon;
  return (
    <div className={`mt-6 rounded-xl border p-5 ${tone.box}`}>
      <div className="flex items-center gap-2"><Icon className="h-5 w-5" /><p className="font-bold">{c.title}</p></div>
      <p className="mt-1.5 text-sm opacity-90">{c.body}</p>
      <a href={href} className={`mt-4 inline-flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold text-white transition-colors ${tone.btn}`}>
        <Phone className="h-4 w-4" /> {c.cta}
      </a>
      <p className="mt-2 text-xs opacity-70">Scheduling is coordinated through EkaNex — we confirm the final time with you and {opp.company}.</p>
    </div>
  );
}

/* --------------------------- application detail ----------------------------- */
function AppDetail({ a, onBack, onWithdraw }) {
  const dateFor = (s) => a.timeline?.find((t) => t.status === s)?.at;
  const reachedIdx = Math.max(-1, ...STUDENT_PIPELINE.map((s, i) => (a.timeline?.some((t) => t.status === s) ? i : -1)));
  const isRejected = a.status === 'rejected';
  const isWithdrawn = a.status === 'withdrawn';
  const opp = a.opportunity || {};
  const canWithdraw = !['selected', 'rejected', 'withdrawn'].includes(a.status);
  return (
    <div>
      <button onClick={onBack} className="mb-5 inline-flex items-center gap-1.5 text-sm font-semibold text-muted hover:text-navy"><ArrowLeft className="h-4 w-4" /> All applications</button>
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="rounded-card border border-slate-200 bg-white p-6 shadow-card lg:col-span-2">
          <div className="flex items-center gap-3">
            <CompanyBadge opp={opp} />
            <div className="min-w-0">
              <h2 className="truncate text-xl font-bold text-navy">{opp.roleTitle}</h2>
              <p className="text-muted">{opp.company} · <span className="font-mono text-xs">{a.shortId}</span></p>
            </div>
            <div className="ml-auto"><StatusBadge status={a.status} /></div>
          </div>

          <dl className="mt-5 grid grid-cols-2 gap-4 border-t border-slate-100 pt-5 text-sm sm:grid-cols-3">
            <div><dt className="text-muted">Company</dt><dd className="font-semibold text-navy">{opp.company}</dd></div>
            <div><dt className="text-muted">Role</dt><dd className="font-semibold text-navy">{opp.roleTitle}</dd></div>
            <div><dt className="text-muted">Applied</dt><dd className="font-semibold text-navy">{fmtDate(a.createdAt)}</dd></div>
            <div><dt className="text-muted">Location</dt><dd className="font-semibold text-navy">{opp.location || '—'}</dd></div>
            <div><dt className="text-muted">Work type</dt><dd className="font-semibold text-navy">{opp.workType || '—'}</dd></div>
            <div><dt className="text-muted">Last updated</dt><dd className="font-semibold text-navy">{timeAgo(a.updatedAt)}</dd></div>
          </dl>

          {opp.sector && <p className="mt-4 text-sm text-ink/80"><span className="font-semibold text-navy">About the company:</span> {opp.sector}</p>}
          {opp.roleShort && <p className="mt-2 text-sm text-ink/80"><span className="font-semibold text-navy">The role:</span> {opp.roleShort}</p>}
          {Array.isArray(opp.skills) && opp.skills.length > 0 && (
            <div className="mt-4"><p className="text-xs font-semibold uppercase tracking-wide text-muted">Skills</p><div className="mt-1.5 flex flex-wrap gap-1.5">{opp.skills.map((s) => <span key={s} className="rounded-full border border-slate-200 px-2.5 py-1 text-xs text-navy">{s}</span>)}</div></div>
          )}

          <div className="mt-6 rounded-lg bg-surface/60 p-4">
            <p className="text-sm font-semibold text-navy">Next step</p>
            <p className="text-sm text-ink/80">{statusMeta(a.status).next}</p>
          </div>

          <NextSteps a={a} />

          {canWithdraw && (
            <button onClick={() => onWithdraw(a)} className="mt-5 inline-flex items-center gap-2 rounded-lg border border-rose-200 px-4 py-2 text-sm font-semibold text-rose-600 transition-colors hover:bg-rose-50">
              <XCircle className="h-4 w-4" /> Withdraw this application
            </button>
          )}
        </div>

        <div className="rounded-card border border-slate-200 bg-white p-6 shadow-card">
          <h3 className="font-bold text-navy">Progress</h3>
          <ol className="mt-4 space-y-5 border-l-2 border-slate-100 pl-6">
            {STUDENT_PIPELINE.map((s, i) => {
              const reached = i <= reachedIdx;
              const current = s === a.status;
              const m = statusMeta(s);
              const at = dateFor(s);
              return (
                <li key={s} className="relative">
                  <span className={`absolute -left-[31px] top-0.5 grid h-5 w-5 place-items-center rounded-full ring-4 ring-white ${reached ? m.dot : 'bg-slate-200'}`}>{reached && <CheckCircle2 className="h-3 w-3 text-white" />}</span>
                  <p className={`text-sm font-semibold ${current ? 'text-electric' : reached ? 'text-navy' : 'text-slate-400'}`}>{m.label}{current ? ' — you are here' : ''}</p>
                  {at && <p className="text-xs text-muted">{fmtDate(at)}</p>}
                </li>
              );
            })}
            {isRejected && (
              <li className="relative"><span className="absolute -left-[31px] top-0.5 h-5 w-5 rounded-full bg-rose-400 ring-4 ring-white" /><p className="text-sm font-semibold text-rose-600">Not selected</p><p className="text-xs text-muted">{statusMeta('rejected').next}</p></li>
            )}
            {isWithdrawn && (
              <li className="relative"><span className="absolute -left-[31px] top-0.5 h-5 w-5 rounded-full bg-slate-400 ring-4 ring-white" /><p className="text-sm font-semibold text-slate-500">Withdrawn</p><p className="text-xs text-muted">You withdrew this application.</p></li>
            )}
          </ol>
        </div>
      </div>
    </div>
  );
}

/* =========================================================================== */
/*  OVERVIEW                                                                   */
/* =========================================================================== */
const STAT_CARDS = [
  { key: 'all', label: 'Total Applications', Icon: FileText, accent: 'text-navy', ring: 'bg-navy/5 text-navy' },
  { key: 'submitted', label: 'Submitted', Icon: Inbox, accent: 'text-sky-700', ring: 'bg-sky-50 text-sky-600' },
  { key: 'under_review', label: 'Under Review', Icon: Clock, accent: 'text-indigo-700', ring: 'bg-indigo-50 text-indigo-600' },
  { key: 'shortlisted', label: 'Shortlisted', Icon: Star, accent: 'text-amber-700', ring: 'bg-amber-50 text-amber-600' },
  { key: 'selected', label: 'Selected', Icon: Trophy, accent: 'text-emerald-700', ring: 'bg-emerald-50 text-emerald-600' },
  { key: 'rejected', label: 'Not Selected', Icon: XCircle, accent: 'text-rose-700', ring: 'bg-rose-50 text-rose-600' },
  { key: 'saved', label: 'Saved Opportunities', Icon: Bookmark, accent: 'text-violet-700', ring: 'bg-violet-50 text-violet-600' },
];

function StatCard({ card, value, onClick }) {
  const { label, Icon, accent, ring } = card;
  return (
    <button onClick={onClick} className="group flex items-center justify-between rounded-xl border border-slate-200 bg-white p-4 text-left shadow-card transition-all hover:-translate-y-0.5 hover:shadow-cardHover">
      <div>
        <p className="text-xs font-semibold uppercase tracking-wide text-muted">{label}</p>
        <p className={`mt-1 text-3xl font-extrabold ${accent}`}>{value}</p>
      </div>
      <span className={`grid h-11 w-11 place-items-center rounded-xl ${ring}`}><Icon className="h-5 w-5" /></span>
    </button>
  );
}

function Overview({ apps, saved, counts, notes, onCard, onOpen }) {
  const activity = useMemo(() => {
    const ev = [];
    apps.forEach((a) => (a.timeline || []).forEach((t) => ev.push({ at: t.at, label: `${statusMeta(t.status).label} · ${a.opportunity?.roleTitle || 'Application'}`, company: a.opportunity?.company, id: a.id })));
    notes.forEach((n) => ev.push({ at: n.at, label: n.title, company: n.body, note: true }));
    return ev.filter((e) => e.at).sort((a, b) => (a.at < b.at ? 1 : -1)).slice(0, 8);
  }, [apps, notes]);

  const needsAction = apps.filter((a) => ['shortlisted', 'interview', 'selected'].includes(a.status));

  return (
    <div className="space-y-8">
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {STAT_CARDS.map((c) => <StatCard key={c.key} card={c} value={counts[c.key]} onClick={() => onCard(c.key)} />)}
      </div>

      {needsAction.length > 0 && (
        <section>
          <h3 className="mb-3 flex items-center gap-2 font-bold text-navy"><Sparkles className="h-4 w-4 text-amber-500" /> Needs your attention</h3>
          <div className="grid gap-3 sm:grid-cols-2">
            {needsAction.map((a) => <AppCard key={a.id} a={a} onOpen={onOpen} highlight />)}
          </div>
        </section>
      )}

      <div className="grid gap-6 lg:grid-cols-3">
        <section className="lg:col-span-2">
          <h3 className="mb-3 flex items-center gap-2 font-bold text-navy"><FileText className="h-4 w-4 text-electric" /> Recent applications</h3>
          {apps.length ? <div className="grid gap-3 sm:grid-cols-2">{apps.slice(0, 4).map((a) => <AppCard key={a.id} a={a} onOpen={onOpen} />)}</div>
            : <EmptyState icon={Inbox} title="No applications yet" body="Browse projects and apply to see them tracked here." action={<Link to="/apply" className="inline-flex items-center gap-2 rounded-lg bg-electric px-4 py-2 font-semibold text-white">Browse projects <ArrowRight className="h-4 w-4" /></Link>} />}
        </section>
        <section>
          <h3 className="mb-3 flex items-center gap-2 font-bold text-navy"><Clock className="h-4 w-4 text-muted" /> Recent activity</h3>
          {activity.length ? (
            <ol className="space-y-3 rounded-card border border-slate-200 bg-white p-4 shadow-card">
              {activity.map((e, i) => (
                <li key={i} className="flex gap-3">
                  <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-electric" />
                  <div className="min-w-0"><p className="truncate text-sm font-semibold text-navy">{e.label}</p><p className="truncate text-xs text-muted">{e.company}</p><p className="text-[11px] text-slate-400">{timeAgo(e.at)}</p></div>
                </li>
              ))}
            </ol>
          ) : <div className="rounded-card border border-slate-200 bg-white p-6 text-center text-sm text-muted shadow-card">No activity yet.</div>}
        </section>
      </div>
    </div>
  );
}

/* ------------------------------ application card ---------------------------- */
function AppCard({ a, onOpen, highlight }) {
  const m = statusMeta(a.status);
  return (
    <motion.button layout onClick={() => onOpen(a.id)} whileHover={{ y: -3 }}
      className={`flex w-full flex-col rounded-card border bg-white p-5 text-left shadow-card transition-shadow hover:shadow-cardHover ${highlight ? 'border-amber-200 ring-1 ring-amber-100' : 'border-slate-200'}`}>
      <div className="flex items-center gap-3">
        <CompanyBadge opp={a.opportunity} />
        <div className="min-w-0 flex-1"><p className="truncate font-bold text-navy">{a.opportunity?.company}</p><p className="truncate text-sm text-muted">{a.opportunity?.roleTitle}</p></div>
        <StatusBadge status={a.status} />
      </div>
      <div className="mt-4 grid grid-cols-2 gap-x-4 gap-y-2 border-t border-slate-100 pt-3 text-xs">
        <div><p className="text-muted">Applied</p><p className="font-semibold text-ink">{fmtDate(a.createdAt)}</p></div>
        <div><p className="text-muted">Last updated</p><p className="font-semibold text-ink">{timeAgo(a.updatedAt)}</p></div>
        <div className="col-span-2"><p className="text-muted">Next step</p><p className="font-semibold text-ink">{m.next}</p></div>
      </div>
    </motion.button>
  );
}

/* =========================================================================== */
/*  MY APPLICATIONS (searchable / filterable / sortable table)                 */
/* =========================================================================== */
const STATUS_FILTERS = ['all', 'submitted', 'under_review', 'shortlisted', 'interview', 'selected', 'rejected', 'withdrawn'];

function MyApplications({ apps, statusFilter, setStatusFilter, onOpen, onWithdraw }) {
  const [q, setQ] = useState('');
  const [sortDesc, setSortDesc] = useState(true);

  const rows = useMemo(() => {
    let r = apps.slice();
    if (statusFilter && statusFilter !== 'all') r = r.filter((a) => a.status === statusFilter);
    if (q.trim()) {
      const n = q.trim().toLowerCase();
      r = r.filter((a) => (a.opportunity?.company || '').toLowerCase().includes(n) || (a.opportunity?.roleTitle || '').toLowerCase().includes(n));
    }
    r.sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1) * (sortDesc ? 1 : -1));
    return r;
  }, [apps, statusFilter, q, sortDesc]);

  return (
    <div>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1 sm:max-w-xs">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search company or role…" className="w-full rounded-xl border border-slate-200 py-2.5 pl-9 pr-3 text-sm text-navy outline-none focus:border-electric focus:ring-2 focus:ring-electric/20" />
        </div>
        <div className="flex items-center gap-2 overflow-x-auto">
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="rounded-xl border border-slate-200 px-3 py-2.5 text-sm font-semibold text-navy outline-none focus:border-electric">
            {STATUS_FILTERS.map((s) => <option key={s} value={s}>{s === 'all' ? 'All statuses' : statusMeta(s).label}</option>)}
          </select>
          <button onClick={() => setSortDesc((d) => !d)} className="inline-flex items-center gap-1.5 whitespace-nowrap rounded-xl border border-slate-200 px-3 py-2.5 text-sm font-semibold text-navy hover:bg-surface"><ArrowUpDown className="h-4 w-4" /> {sortDesc ? 'Newest' : 'Oldest'}</button>
        </div>
      </div>

      {rows.length === 0 ? (
        <div className="mt-6"><EmptyState icon={Inbox} title="No applications here" body={q || statusFilter !== 'all' ? 'Try clearing the search or filter.' : 'Apply to a project to track it here.'} action={<Link to="/apply" className="inline-flex items-center gap-2 rounded-lg bg-electric px-4 py-2 font-semibold text-white">Browse projects <ArrowRight className="h-4 w-4" /></Link>} /></div>
      ) : (
        <>
          {/* Table — desktop */}
          <div className="mt-5 hidden overflow-hidden rounded-card border border-slate-200 bg-white shadow-card md:block">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-slate-100 bg-surface/50 text-xs uppercase tracking-wide text-muted">
                <tr>
                  <th className="px-4 py-3 font-semibold">Company</th>
                  <th className="px-4 py-3 font-semibold">Role</th>
                  <th className="px-4 py-3 font-semibold">Applied</th>
                  <th className="px-4 py-3 font-semibold">Status</th>
                  <th className="px-4 py-3 font-semibold">Updated</th>
                  <th className="px-4 py-3 text-right font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((a) => {
                  const canWithdraw = !['selected', 'rejected', 'withdrawn'].includes(a.status);
                  return (
                    <tr key={a.id} className="border-b border-slate-50 last:border-0 hover:bg-surface/40">
                      <td className="px-4 py-3"><div className="flex items-center gap-2.5"><CompanyBadge opp={a.opportunity} size="sm" /><span className="font-semibold text-navy">{a.opportunity?.company}</span></div></td>
                      <td className="px-4 py-3 text-ink/80">{a.opportunity?.roleTitle}</td>
                      <td className="px-4 py-3 text-ink/70">{fmtDate(a.createdAt)}</td>
                      <td className="px-4 py-3"><StatusBadge status={a.status} /></td>
                      <td className="px-4 py-3 text-ink/70">{timeAgo(a.updatedAt)}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-1">
                          <button onClick={() => onOpen(a.id)} className="rounded-lg px-2.5 py-1.5 text-xs font-semibold text-electric hover:bg-electric/10">View</button>
                          {canWithdraw && <button onClick={() => onWithdraw(a)} className="rounded-lg px-2.5 py-1.5 text-xs font-semibold text-rose-600 hover:bg-rose-50">Withdraw</button>}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          {/* Cards — mobile */}
          <div className="mt-5 grid gap-3 md:hidden">{rows.map((a) => <AppCard key={a.id} a={a} onOpen={onOpen} />)}</div>
        </>
      )}
    </div>
  );
}

/* =========================================================================== */
/*  OUTCOME SECTIONS (Selected / Shortlisted / Not Selected)                   */
/* =========================================================================== */
function OutcomeCard({ a, onOpen, tone }) {
  const opp = a.opportunity || {};
  const toneBox = { emerald: 'border-emerald-200 bg-emerald-50/40', amber: 'border-amber-200 bg-amber-50/40', slate: 'border-slate-200 bg-white' }[tone];
  return (
    <div className={`rounded-card border p-5 shadow-card ${toneBox}`}>
      <div className="flex items-center gap-3">
        <CompanyBadge opp={opp} />
        <div className="min-w-0 flex-1"><p className="truncate font-bold text-navy">{opp.company}</p><p className="truncate text-sm text-muted">{opp.roleTitle}</p></div>
        <StatusBadge status={a.status} />
      </div>
      <div className="mt-3 grid grid-cols-2 gap-2 border-t border-slate-100 pt-3 text-xs">
        <div><p className="text-muted">Applied</p><p className="font-semibold text-ink">{fmtDate(a.createdAt)}</p></div>
        <div><p className="text-muted">{a.status === 'selected' ? 'Selected' : 'Updated'}</p><p className="font-semibold text-ink">{timeAgo(a.updatedAt)}</p></div>
      </div>
      <p className="mt-3 text-sm text-ink/80">{statusMeta(a.status).next}</p>
      <button onClick={() => onOpen(a.id)} className="mt-3 inline-flex items-center gap-1.5 text-sm font-semibold text-electric hover:underline">View details & next steps <ArrowRight className="h-4 w-4" /></button>
    </div>
  );
}

function OutcomeSection({ apps, onOpen, kind }) {
  const CFG = {
    selected: { statuses: ['selected'], tone: 'emerald', Icon: Trophy, title: 'Selected', empty: 'No selections yet — keep applying and nailing those interviews.' },
    shortlisted: { statuses: ['shortlisted', 'interview'], tone: 'amber', Icon: Star, title: 'Shortlisted & interviewing', empty: "You haven't been shortlisted yet. Strong applications get noticed." },
    rejected: { statuses: ['rejected', 'withdrawn'], tone: 'slate', Icon: XCircle, title: 'Not selected & withdrawn', empty: 'Nothing here — that’s a good thing!' },
  }[kind];
  const list = apps.filter((a) => CFG.statuses.includes(a.status));
  if (!list.length) {
    return <EmptyState icon={CFG.Icon} title={`No ${CFG.title.toLowerCase()}`} body={CFG.empty} action={<Link to="/apply" className="inline-flex items-center gap-2 rounded-lg bg-electric px-4 py-2 font-semibold text-white">Explore opportunities <ArrowRight className="h-4 w-4" /></Link>} />;
  }
  return (
    <div>
      {kind === 'rejected' && <p className="mb-4 text-sm text-muted">These applications didn’t move forward. Reviewing them can help your next one — explore other roles anytime.</p>}
      <div className="grid gap-3 sm:grid-cols-2">{list.map((a) => <OutcomeCard key={a.id} a={a} onOpen={onOpen} tone={CFG.tone} />)}</div>
      {kind === 'rejected' && <Link to="/apply" className="mt-5 inline-flex items-center gap-2 rounded-xl bg-electric px-5 py-2.5 font-semibold text-white hover:bg-electric-dark">Explore other opportunities <ArrowRight className="h-4 w-4" /></Link>}
    </div>
  );
}

/* =========================================================================== */
/*  SAVED OPPORTUNITIES                                                        */
/* =========================================================================== */
function SavedSection({ saved, onRemove }) {
  const navigate = useNavigate();
  if (!saved.length) return <EmptyState icon={Bookmark} title="No saved opportunities" body="Bookmark roles while browsing to compare them here before you apply." action={<Link to="/apply" className="inline-flex items-center gap-2 rounded-lg bg-electric px-4 py-2 font-semibold text-white">Browse projects <ArrowRight className="h-4 w-4" /></Link>} />;
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      {saved.map((s) => {
        const o = s.snapshot || {};
        return (
          <div key={s.opportunityId} className="flex flex-col rounded-card border border-slate-200 bg-white p-5 shadow-card">
            <div className="flex items-center gap-3">
              <CompanyBadge opp={o} />
              <div className="min-w-0 flex-1"><p className="truncate font-bold text-navy">{o.company}</p><p className="truncate text-sm text-muted">{o.roleTitle}</p></div>
              <button onClick={() => onRemove(s.opportunityId)} aria-label="Remove" className="rounded-lg p-2 text-slate-400 hover:bg-rose-50 hover:text-rose-600"><Trash2 className="h-4 w-4" /></button>
            </div>
            {o.roleShort && <p className="mt-3 line-clamp-2 text-sm text-ink/75">{o.roleShort}</p>}
            <div className="mt-3 flex flex-wrap gap-3 text-xs text-muted">
              {o.location && <span className="inline-flex items-center gap-1"><MapPin className="h-3.5 w-3.5" /> {o.location}</span>}
              {o.workType && <span className="inline-flex items-center gap-1"><Briefcase className="h-3.5 w-3.5" /> {o.workType}</span>}
            </div>
            <div className="mt-4 flex items-center gap-2">
              <button onClick={() => navigate('/apply', { state: { userType: 'student', opportunityId: s.opportunityId } })} className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-electric px-4 py-2 text-sm font-semibold text-white hover:bg-electric-dark">Apply now <ArrowRight className="h-4 w-4" /></button>
              <button onClick={() => navigate('/apply', { state: { userType: 'student', opportunityId: s.opportunityId } })} className="inline-flex items-center justify-center gap-1.5 rounded-lg border border-slate-200 px-3 py-2 text-sm font-semibold text-navy hover:bg-surface"><ExternalLink className="h-4 w-4" /></button>
            </div>
          </div>
        );
      })}
    </div>
  );
}

/* =========================================================================== */
/*  PROFILE                                                                    */
/* =========================================================================== */
const PROFILE_FIELDS = [['fullName', 'Full name'], ['email', 'Email'], ['school', 'School'], ['grade', 'Grade'], ['skills', 'Skills'], ['interests', 'Interests']];

function ProfileSection({ email, apps }) {
  const stored = getProfile(email) || {};
  const latest = apps[0]?.details || {};
  const base = {
    fullName: stored.name || latest.fullName || '',
    email: email || stored.email || latest.email || '',
    school: stored.school || latest.school || '',
    grade: stored.grade || latest.grade || '',
    skills: (stored.skills || latest.skills || []).join ? (stored.skills || latest.skills || []).join(', ') : (stored.skills || ''),
    interests: Array.isArray(stored.interests) ? stored.interests.join(', ') : (stored.interests || ''),
  };
  const [form, setForm] = useState(base);
  const [saved, setSaved] = useState(false);
  const set = (k) => (e) => { setForm((s) => ({ ...s, [k]: e.target.value })); setSaved(false); };

  const filled = PROFILE_FIELDS.filter(([k]) => String(form[k] || '').trim()).length;
  const pct = Math.round((filled / PROFILE_FIELDS.length) * 100);
  const missing = PROFILE_FIELDS.filter(([k]) => !String(form[k] || '').trim());

  const save = async () => {
    await updateProfile(email, {
      name: form.fullName, school: form.school, grade: form.grade,
      skills: form.skills.split(',').map((s) => s.trim()).filter(Boolean),
      interests: form.interests.split(',').map((s) => s.trim()).filter(Boolean),
    });
    setSaved(true);
  };

  const field = (k, label, opts = {}) => (
    <label className="block">
      <span className="text-xs font-semibold uppercase tracking-wide text-muted">{label}</span>
      <input value={form[k]} onChange={set(k)} disabled={opts.readOnly} placeholder={opts.placeholder}
        className={`mt-1 w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm text-navy outline-none focus:border-electric focus:ring-2 focus:ring-electric/20 ${opts.readOnly ? 'bg-surface text-muted' : ''}`} />
    </label>
  );

  return (
    <div className="max-w-2xl space-y-6">
      <div className="rounded-card border border-slate-200 bg-white p-6 shadow-card">
        <div className="flex items-center justify-between"><h3 className="font-bold text-navy">Profile completion</h3><span className="text-2xl font-extrabold text-navy">{pct}%</span></div>
        <div className="mt-3 h-2.5 w-full overflow-hidden rounded-full bg-slate-100"><div className="h-full rounded-full bg-forest transition-all" style={{ width: `${pct}%` }} /></div>
        {missing.length > 0 && (
          <div className="mt-4 rounded-lg bg-amber-50 p-3">
            <p className="text-sm font-semibold text-amber-800">Complete these to strengthen your applications:</p>
            <ul className="mt-1 flex flex-wrap gap-1.5">{missing.map(([k, l]) => <li key={k} className="rounded-full bg-white px-2.5 py-0.5 text-xs font-medium text-amber-700">{l}</li>)}</ul>
          </div>
        )}
      </div>

      <div className="rounded-card border border-slate-200 bg-white p-6 shadow-card">
        <h3 className="mb-4 font-bold text-navy">Your details</h3>
        <div className="grid gap-4 sm:grid-cols-2">
          {field('fullName', 'Full name')}
          {field('email', 'Email', { readOnly: true })}
          {field('school', 'School / University')}
          {field('grade', 'Grade or year')}
        </div>
        {field('skills', 'Skills (comma separated)', { placeholder: 'Google Sheets, Research, Writing' })}
        <div className="mt-4">{field('interests', 'Interests (comma separated)', { placeholder: 'Data analysis, Marketing' })}</div>
        <div className="mt-5 flex items-center gap-3">
          <button onClick={save} className="inline-flex items-center gap-2 rounded-xl bg-electric px-5 py-2.5 font-semibold text-white hover:bg-electric-dark">Save changes</button>
          {saved && <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-forest"><CheckCircle2 className="h-4 w-4" /> Saved</span>}
        </div>
        <p className="mt-3 text-xs text-muted">Name, school and grade sync to your account. Skills and interests are saved to your profile on this platform.</p>
      </div>
    </div>
  );
}

/* =========================================================================== */
/*  NOTIFICATIONS                                                              */
/* =========================================================================== */
function NotificationsView({ email }) {
  const notes = listNotifications({ scope: 'student', forEmail: email });
  const iconFor = { received: Inbox, shortlisted: Star, interview: CalendarCheck, selected: Trophy, status: Bell, assigned: CheckCircle2 };
  if (!notes.length) return <EmptyState icon={Bell} title="No notifications yet" body="We'll let you know when your application status changes or an interview is scheduled." />;
  return (
    <div className="max-w-2xl space-y-2">
      <div className="flex justify-end"><button onClick={() => markAllNotificationsRead({ scope: 'student', forEmail: email })} className="text-sm font-semibold text-electric hover:underline">Mark all read</button></div>
      {notes.map((n) => {
        const Icon = iconFor[n.type] || Bell;
        return (
          <div key={n.id} className={`flex gap-3 rounded-card border border-slate-200 bg-white p-4 shadow-card ${n.read ? '' : 'ring-1 ring-electric/30'}`}>
            <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-surface text-navy"><Icon className="h-5 w-5" /></span>
            <div><p className="font-semibold text-navy">{n.title}</p><p className="text-sm text-muted">{n.body}</p><p className="mt-0.5 text-xs text-slate-400">{timeAgo(n.at)}</p></div>
          </div>
        );
      })}
    </div>
  );
}

/* =========================================================================== */
/*  SHELL                                                                      */
/* =========================================================================== */
const NAV = [
  { k: 'overview', l: 'Overview', i: LayoutDashboard },
  { k: 'applications', l: 'My Applications', i: FileText },
  { k: 'selected', l: 'Selected', i: Trophy },
  { k: 'shortlisted', l: 'Shortlisted', i: Star },
  { k: 'rejected', l: 'Not Selected', i: XCircle },
  { k: 'saved', l: 'Saved Opportunities', i: Bookmark },
  { k: 'profile', l: 'Profile', i: User },
  { k: 'notifications', l: 'Notifications', i: Bell },
];

function Loading() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-canvas">
      <div className="flex flex-col items-center gap-3 text-muted">
        <span className="h-8 w-8 animate-spin rounded-full border-2 border-slate-200 border-t-electric" />
        <p className="text-sm font-semibold">Loading your dashboard…</p>
      </div>
    </div>
  );
}

function StudentDashboardView({ session }) {
  useStore();
  const navigate = useNavigate();
  const email = session.email;

  const [sp, setSp] = useSearchParams();
  const view = sp.get('view') || 'overview';
  const statusFilter = sp.get('status') || 'all';
  const openId = sp.get('app') || null;
  const [menuOpen, setMenuOpen] = useState(false);

  const setView = (v) => { setSp((prev) => { const p = new URLSearchParams(prev); p.set('view', v); p.delete('app'); p.delete('status'); return p; }, { replace: true }); setMenuOpen(false); };
  const setStatusFilter = (s) => setSp((prev) => { const p = new URLSearchParams(prev); p.set('status', s); p.set('view', 'applications'); return p; }, { replace: true });
  const setOpenId = (id) => setSp((prev) => { const p = new URLSearchParams(prev); id ? p.set('app', id) : p.delete('app'); return p; });

  // Live updates while the dashboard is open.
  useEffect(() => { const stop = startLiveSync(); return () => { if (stop) stop(); }; }, []);

  const apps = listStudentApplications(email);
  const saved = listSavedOpportunities(email);
  const notes = listNotifications({ scope: 'student', forEmail: email });
  const unread = notes.filter((n) => !n.read).length;
  const name = session.name || apps[0]?.applicantName || 'there';

  const counts = {
    all: apps.length,
    submitted: apps.filter((a) => a.status === 'submitted').length,
    under_review: apps.filter((a) => a.status === 'under_review').length,
    shortlisted: apps.filter((a) => ['shortlisted', 'interview'].includes(a.status)).length,
    selected: apps.filter((a) => a.status === 'selected').length,
    rejected: apps.filter((a) => ['rejected', 'withdrawn'].includes(a.status)).length,
    saved: saved.length,
  };

  const onCard = (key) => { if (key === 'saved') return setView('saved'); if (key === 'selected') return setView('selected'); if (key === 'rejected') return setView('rejected'); if (key === 'shortlisted') return setView('shortlisted'); setStatusFilter(key); };

  const handleWithdraw = async (a) => {
    if (!window.confirm(`Withdraw your application for ${a.opportunity?.roleTitle} at ${a.opportunity?.company}? This can't be undone.`)) return;
    await withdrawApplication(a.id);
  };
  const handleUnsave = async (oppId) => { await unsaveOpportunity(oppId); };

  const open = openId ? apps.find((a) => a.id === openId) : null;

  const section = () => {
    if (open) return <AppDetail a={open} onBack={() => setOpenId(null)} onWithdraw={handleWithdraw} />;
    switch (view) {
      case 'applications': return <MyApplications apps={apps} statusFilter={statusFilter} setStatusFilter={setStatusFilter} onOpen={setOpenId} onWithdraw={handleWithdraw} />;
      case 'selected': return <OutcomeSection apps={apps} onOpen={setOpenId} kind="selected" />;
      case 'shortlisted': return <OutcomeSection apps={apps} onOpen={setOpenId} kind="shortlisted" />;
      case 'rejected': return <OutcomeSection apps={apps} onOpen={setOpenId} kind="rejected" />;
      case 'saved': return <SavedSection saved={saved} onRemove={handleUnsave} />;
      case 'profile': return <ProfileSection email={email} apps={apps} />;
      case 'notifications': return <NotificationsView email={email} />;
      default: return <Overview apps={apps} saved={saved} counts={counts} notes={notes} onCard={onCard} onOpen={setOpenId} />;
    }
  };

  const NavList = ({ onPick }) => (
    <nav className="space-y-1">
      {NAV.map((t) => {
        const Icon = t.i;
        const active = view === t.k && !open;
        const badge = t.k === 'notifications' ? unread : t.k === 'saved' ? counts.saved : t.k === 'applications' ? counts.all : t.k === 'selected' ? counts.selected : t.k === 'shortlisted' ? counts.shortlisted : t.k === 'rejected' ? counts.rejected : 0;
        return (
          <button key={t.k} onClick={() => onPick(t.k)} className={`flex w-full items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-semibold transition-colors ${active ? 'bg-electric/10 text-electric' : 'text-muted hover:bg-surface hover:text-navy'}`}>
            <Icon className="h-4 w-4 shrink-0" /><span className="flex-1 text-left">{t.l}</span>
            {badge > 0 && <span className={`grid h-5 min-w-5 place-items-center rounded-full px-1.5 text-[11px] font-bold ${t.k === 'notifications' ? 'bg-rose-500 text-white' : active ? 'bg-electric text-white' : 'bg-slate-200 text-slate-600'}`}>{badge}</span>}
          </button>
        );
      })}
    </nav>
  );

  const title = NAV.find((n) => n.k === view)?.l || 'Overview';

  return (
    <div className="min-h-screen bg-canvas">
      <Helmet><title>Dashboard · EkaNex</title><meta name="robots" content="noindex" /></Helmet>

      {/* Header */}
      <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/90 backdrop-blur">
        <div className="container-px flex h-16 items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={() => setMenuOpen((o) => !o)} className="grid h-10 w-10 place-items-center rounded-lg text-muted hover:bg-surface lg:hidden" aria-label="Menu">{menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}</button>
            <Link to="/" className="inline-flex items-center gap-2"><LogoMark className="h-8 w-8" /><span className="font-extrabold text-navy">EkaNex</span></Link>
          </div>
          <div className="flex items-center gap-1">
            <button onClick={() => setView('notifications')} className="relative grid h-10 w-10 place-items-center rounded-lg text-muted hover:bg-surface hover:text-navy" aria-label="Notifications">
              <Bell className="h-5 w-5" />{unread > 0 && <span className="absolute right-1.5 top-1.5 grid h-4 min-w-4 place-items-center rounded-full bg-rose-500 px-1 text-[10px] font-bold text-white">{unread}</span>}
            </button>
            <button onClick={async () => { await signOut(); navigate('/'); }} className="inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold text-muted hover:bg-surface hover:text-navy"><LogOut className="h-4 w-4" /> <span className="hidden sm:inline">Sign out</span></button>
          </div>
        </div>
      </header>

      <div className="container-px flex gap-8 py-8">
        {/* Sidebar — desktop */}
        <aside className="hidden w-60 shrink-0 lg:block">
          <div className="sticky top-24"><NavList onPick={setView} /></div>
        </aside>

        {/* Mobile drawer */}
        {menuOpen && (
          <div className="fixed inset-0 z-40 lg:hidden">
            <div className="absolute inset-0 bg-black/40" onClick={() => setMenuOpen(false)} />
            <div className="absolute left-0 top-0 h-full w-72 max-w-[80%] bg-white p-4 shadow-2xl">
              <div className="mb-4 flex items-center gap-2 px-2"><LogoMark className="h-7 w-7" /><span className="font-extrabold text-navy">Dashboard</span></div>
              <NavList onPick={setView} />
            </div>
          </div>
        )}

        {/* Main */}
        <main className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-3">
            <span className="grid h-12 w-12 place-items-center rounded-full bg-electric/10 text-electric"><GraduationCap className="h-6 w-6" /></span>
            <div>
              <h1 className="text-2xl font-extrabold tracking-tight text-navy">Welcome back, {String(name).split(' ')[0]} 👋</h1>
              <p className="text-muted">{apps.length ? `You have ${counts.all} application${counts.all === 1 ? '' : 's'}${counts.selected ? `, ${counts.selected} selected` : ''}${counts.shortlisted ? `, ${counts.shortlisted} shortlisted` : ''}.` : 'Start by exploring opportunities and applying to your first project.'}</p>
            </div>
            <Link to="/apply" state={{ userType: 'student' }} className="ml-auto inline-flex items-center gap-2 rounded-xl bg-electric px-5 py-2.5 font-semibold text-white shadow-card transition-all hover:bg-electric-dark hover:-translate-y-0.5"><Sparkles className="h-4 w-4" /> Explore Projects</Link>
          </div>

          {!open && <h2 className="mt-7 text-lg font-bold text-navy">{title}</h2>}
          <div className="mt-5">{section()}</div>
        </main>
      </div>
    </div>
  );
}

/* =========================================================================== */
/*  ENTRY — protects + routes by user type                                     */
/* =========================================================================== */
export default function StudentDashboard() {
  useStore();
  const session = getSession();
  const userType = session?.userType || session?.role;
  const authed = !!session?.email && (userType === 'student' || userType === 'organization');
  const [checking, setChecking] = useState(true);

  // Validate + refresh on mount: detect an expired Supabase session and show a
  // loading state until the first hydration completes.
  useEffect(() => {
    let alive = true;
    (async () => {
      if (authed) {
        const user = await getAuthUser();
        if (alive && !user) { await signOut(); if (alive) setChecking(false); return; }
        await rehydrate();
      }
      if (alive) setChecking(false);
    })();
    return () => { alive = false; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!authed) return <Gate />;
  if (checking) return <Loading />;
  if (userType === 'organization') return <OrganizationDashboard session={session} />;
  return <StudentDashboardView session={session} />;
}
