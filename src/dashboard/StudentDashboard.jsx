import { useMemo, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import {
  LayoutDashboard, FileText, User, Bell, LogOut, ArrowRight, ArrowLeft, MapPin,
  CalendarCheck, CheckCircle2, Sparkles, GraduationCap, Target, Clock, Inbox, UserCheck,
} from 'lucide-react';
import { LogoMark } from '../components/Logo';
import {
  getSession, signOut, previewAsStudent, listStudentApplications, getProfile,
  listNotifications, markAllNotificationsRead, listApplications,
} from '../lib/api';
import { OPPORTUNITIES } from '../data/opportunities';
import { STUDENT_PIPELINE, statusMeta } from '../lib/status';
import { StatusBadge, EmptyState, useStore, fmtDate, timeAgo } from '../components/ui';

/* ------------------------------ profile completion ------------------------- */
const PROFILE_FIELDS = [
  ['fullName', 'Full name'], ['email', 'Email'], ['school', 'School'], ['grade', 'Grade'],
  ['skills', 'Skills'], ['topSkills', 'Skill summary'], ['experiences', 'Experience'],
  ['resume', 'Resume'], ['linkedin', 'LinkedIn / portfolio'], ['hoursWeek', 'Availability'],
  ['projectTypes', 'Project preferences'], ['motivation', 'Motivation'],
];
function profileFrom(apps) {
  // Merge the latest application details into a working profile view.
  const latest = apps[0]?.details || {};
  const filled = PROFILE_FIELDS.filter(([k]) => {
    const v = latest[k];
    return Array.isArray(v) ? v.length > 0 : !!(v && String(v).trim());
  });
  const missing = PROFILE_FIELDS.filter(([k]) => !filled.some(([fk]) => fk === k));
  const pct = Math.round((filled.length / PROFILE_FIELDS.length) * 100);
  return { profile: latest, pct, missing };
}

/* --------------------------------- sign-in gate ---------------------------- */
function Gate() {
  const navigate = useNavigate();
  const demoStudents = useMemo(() => {
    const seen = new Map();
    listApplications().forEach((a) => { if (a.applicantEmail && !seen.has(a.applicantEmail)) seen.set(a.applicantEmail, a.applicantName); });
    return [...seen.entries()];
  }, []);
  return (
    <div className="flex min-h-screen items-center justify-center bg-canvas px-5">
      <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-card">
        <span className="mx-auto grid h-12 w-12 place-items-center rounded-xl bg-electric/10 text-electric"><LayoutDashboard className="h-6 w-6" /></span>
        <h1 className="mt-5 text-xl font-bold text-navy">Your dashboard</h1>
        <p className="mt-1 text-sm text-muted">Sign in to track your applications, companies and interviews in one place.</p>
        <button onClick={() => navigate('/apply')} className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-electric px-5 py-3 font-semibold text-white hover:bg-electric-dark">Sign in / Apply <ArrowRight className="h-4 w-4" /></button>
        {demoStudents.length > 0 && (
          <div className="mt-6 border-t border-slate-100 pt-5 text-left">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted">Preview as a demo student</p>
            <div className="mt-2 space-y-1.5">
              {demoStudents.map(([email, name]) => (
                <button key={email} onClick={() => previewAsStudent(email, name)} className="flex w-full items-center justify-between rounded-lg border border-slate-200 px-3 py-2 text-sm text-navy hover:bg-surface">
                  <span className="font-semibold">{name}</span><ArrowRight className="h-4 w-4 text-muted" />
                </button>
              ))}
            </div>
          </div>
        )}
        <Link to="/" className="mt-5 block text-xs font-semibold text-muted hover:text-navy">← Back to site</Link>
      </div>
    </div>
  );
}

/* ------------------------------ application card ---------------------------- */
function AppCard({ a, onOpen }) {
  const m = statusMeta(a.status);
  return (
    <motion.button
      layout onClick={() => onOpen(a.id)}
      whileHover={{ y: -3 }}
      className="flex w-full flex-col rounded-card border border-slate-200 bg-white p-5 text-left shadow-card transition-shadow hover:shadow-cardHover"
    >
      <div className="flex items-center gap-3">
        <span aria-hidden className="grid h-11 w-11 shrink-0 place-items-center rounded-xl font-bold text-white" style={{ backgroundImage: `linear-gradient(135deg, ${a.opportunity?.logoFrom}, ${a.opportunity?.logoTo})` }}>{a.opportunity?.initials}</span>
        <div className="min-w-0 flex-1">
          <p className="truncate font-bold text-navy">{a.opportunity?.company}</p>
          <p className="truncate text-sm text-muted">{a.opportunity?.roleTitle}</p>
        </div>
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

/* --------------------------- application detail view ------------------------ */
// NOTE: `a` is the SANITISED student record — it has no AI evaluation, no admin
// notes and no internal history notes. `a.timeline` is a clean list of the
// student-visible milestones (AI stage already collapsed into "Under Review").
function AppDetail({ a, onBack }) {
  const dateFor = (s) => a.timeline.find((t) => t.status === s)?.at;
  const reachedIdx = Math.max(-1, ...STUDENT_PIPELINE.map((s, i) => (a.timeline.some((t) => t.status === s) ? i : -1)));
  const isRejected = a.status === 'rejected';
  const opp = a.opportunity || {};
  return (
    <div>
      <button onClick={onBack} className="mb-5 inline-flex items-center gap-1.5 text-sm font-semibold text-muted hover:text-navy"><ArrowLeft className="h-4 w-4" /> All applications</button>
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="rounded-card border border-slate-200 bg-white p-6 shadow-card lg:col-span-2">
          <div className="flex items-center gap-3">
            <span aria-hidden className="grid h-12 w-12 place-items-center rounded-xl font-bold text-white" style={{ backgroundImage: `linear-gradient(135deg, ${opp.logoFrom}, ${opp.logoTo})` }}>{opp.initials}</span>
            <div>
              <h2 className="text-xl font-bold text-navy">{opp.roleTitle}</h2>
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

          <div className="mt-6 rounded-lg bg-surface/60 p-4">
            <p className="text-sm font-semibold text-navy">Next step</p>
            <p className="text-sm text-ink/80">{statusMeta(a.status).next}</p>
          </div>
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
                  <span className={`absolute -left-[31px] top-0.5 grid h-5 w-5 place-items-center rounded-full ring-4 ring-white ${reached ? m.dot : 'bg-slate-200'}`}>
                    {reached && <CheckCircle2 className="h-3 w-3 text-white" />}
                  </span>
                  <p className={`text-sm font-semibold ${current ? 'text-electric' : reached ? 'text-navy' : 'text-slate-400'}`}>{m.label}{current ? ' — you are here' : ''}</p>
                  {at && <p className="text-xs text-muted">{fmtDate(at)}</p>}
                </li>
              );
            })}
            {isRejected && (
              <li className="relative">
                <span className="absolute -left-[31px] top-0.5 h-5 w-5 rounded-full bg-rose-400 ring-4 ring-white" />
                <p className="text-sm font-semibold text-rose-600">Not selected</p>
                <p className="text-xs text-muted">{statusMeta('rejected').next}</p>
              </li>
            )}
          </ol>
        </div>
      </div>
    </div>
  );
}

/* --------------------------------- overview -------------------------------- */
function Overview({ apps, email, onOpen }) {
  const interviews = apps.filter((a) => a.status === 'interview');
  const selected = apps.filter((a) => a.status === 'selected');
  const appliedIds = new Set(apps.map((a) => a.opportunityId));
  const mySkills = new Set((apps[0]?.details?.skills || []).map((s) => s.toLowerCase()));
  const recommended = OPPORTUNITIES
    .filter((o) => !appliedIds.has(o.id))
    .map((o) => ({ o, score: (o.skills || []).filter((s) => [...mySkills].some((m) => s.toLowerCase().includes(m) || m.includes(s.toLowerCase()))).length }))
    .sort((a, b) => b.score - a.score).slice(0, 3).map((x) => x.o);

  return (
    <div className="space-y-8">
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-card border border-slate-200 bg-white p-5 shadow-card"><p className="text-sm text-muted">Applications</p><p className="mt-1 text-3xl font-extrabold text-navy">{apps.length}</p></div>
        <div className="rounded-card border border-slate-200 bg-white p-5 shadow-card"><p className="text-sm text-muted">Upcoming interviews</p><p className="mt-1 text-3xl font-extrabold text-blue-600">{interviews.length}</p></div>
        <div className="rounded-card border border-slate-200 bg-white p-5 shadow-card"><p className="text-sm text-muted">Selected</p><p className="mt-1 text-3xl font-extrabold text-emerald-600">{selected.length}</p></div>
      </div>

      {interviews.length > 0 && (
        <section>
          <h3 className="mb-3 flex items-center gap-2 font-bold text-navy"><CalendarCheck className="h-4 w-4 text-blue-600" /> Upcoming interviews</h3>
          <div className="grid gap-3 sm:grid-cols-2">{interviews.map((a) => <AppCard key={a.id} a={a} onOpen={onOpen} />)}</div>
        </section>
      )}
      {selected.length > 0 && (
        <section>
          <h3 className="mb-3 flex items-center gap-2 font-bold text-navy"><CheckCircle2 className="h-4 w-4 text-emerald-600" /> Selected projects</h3>
          <div className="grid gap-3 sm:grid-cols-2">{selected.map((a) => <AppCard key={a.id} a={a} onOpen={onOpen} />)}</div>
        </section>
      )}

      <section>
        <div className="mb-3 flex items-center justify-between">
          <h3 className="flex items-center gap-2 font-bold text-navy"><FileText className="h-4 w-4 text-electric" /> Recent applications</h3>
          {apps.length > 0 && <Link to="#" onClick={(e) => e.preventDefault()} className="text-sm font-semibold text-muted">{apps.length} total</Link>}
        </div>
        {apps.length ? <div className="grid gap-3 sm:grid-cols-2">{apps.slice(0, 4).map((a) => <AppCard key={a.id} a={a} onOpen={onOpen} />)}</div>
          : <EmptyState icon={Inbox} title="No applications yet" body="Browse projects and apply to see them tracked here." action={<Link to="/apply" className="inline-flex items-center gap-2 rounded-lg bg-electric px-4 py-2 font-semibold text-white">Browse projects <ArrowRight className="h-4 w-4" /></Link>} />}
      </section>

      {recommended.length > 0 && (
        <section>
          <h3 className="mb-3 flex items-center gap-2 font-bold text-navy"><Sparkles className="h-4 w-4 text-amber-500" /> Recommended for you</h3>
          <div className="grid gap-3 sm:grid-cols-3">
            {recommended.map((o) => (
              <Link key={o.id} to="/apply" state={{ userType: 'student', opportunityId: o.id }} className="rounded-card border border-slate-200 bg-white p-5 shadow-card transition-shadow hover:shadow-cardHover">
                <p className="font-bold text-navy">{o.company}</p>
                <p className="text-sm text-muted">{o.roleTitle}</p>
                <p className="mt-2 inline-flex items-center gap-1 text-xs text-muted"><MapPin className="h-3.5 w-3.5" /> {o.location}</p>
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

/* ------------------------------ my applications ---------------------------- */
function MyApplications({ apps, onOpen }) {
  if (!apps.length) return <EmptyState icon={Inbox} title="No applications yet" body="Apply to a project to track it here." action={<Link to="/apply" className="inline-flex items-center gap-2 rounded-lg bg-electric px-4 py-2 font-semibold text-white">Browse projects <ArrowRight className="h-4 w-4" /></Link>} />;
  return <div className="grid gap-4 sm:grid-cols-2">{apps.map((a) => <AppCard key={a.id} a={a} onOpen={onOpen} />)}</div>;
}

/* --------------------------------- profile --------------------------------- */
function ProfileView({ apps }) {
  const { profile, pct, missing } = profileFrom(apps);
  return (
    <div className="max-w-2xl space-y-6">
      <div className="rounded-card border border-slate-200 bg-white p-6 shadow-card">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-navy">Profile completion</h3>
          <span className="text-2xl font-extrabold text-navy">{pct}%</span>
        </div>
        <div className="mt-3 h-2.5 w-full overflow-hidden rounded-full bg-slate-100"><div className="h-full rounded-full bg-forest transition-all" style={{ width: `${pct}%` }} /></div>
        {missing.length > 0 && (
          <div className="mt-4 rounded-lg bg-amber-50 p-3">
            <p className="text-sm font-semibold text-amber-800">Add these to strengthen your applications:</p>
            <ul className="mt-1 flex flex-wrap gap-1.5">{missing.map(([k, l]) => <li key={k} className="rounded-full bg-white px-2.5 py-0.5 text-xs font-medium text-amber-700">{l}</li>)}</ul>
          </div>
        )}
      </div>

      <div className="rounded-card border border-slate-200 bg-white p-6 shadow-card">
        <h3 className="mb-4 font-bold text-navy">Your details</h3>
        <dl className="grid gap-4 sm:grid-cols-2">
          {[['Full name', profile.fullName], ['Email', profile.email], ['School', profile.school], ['Grade', profile.grade], ['Hours / week', profile.hoursWeek], ['Start date', profile.startDate]].map(([l, v]) => (
            <div key={l}><dt className="text-xs font-semibold uppercase tracking-wide text-muted">{l}</dt><dd className="mt-0.5 text-ink/85">{v || <span className="text-slate-400">—</span>}</dd></div>
          ))}
        </dl>
        <div className="mt-4"><p className="text-xs font-semibold uppercase tracking-wide text-muted">Skills</p><div className="mt-1.5 flex flex-wrap gap-1.5">{(profile.skills || []).map((s) => <span key={s} className="rounded-full border border-slate-200 px-2.5 py-1 text-sm text-navy">{s}</span>)}{!(profile.skills || []).length && <span className="text-slate-400">—</span>}</div></div>
        <p className="mt-5 text-xs text-muted">Your profile is built from your most recent application. Editing is applied to new applications. Full inline editing is on the roadmap.</p>
      </div>
    </div>
  );
}

/* ------------------------------ notifications ------------------------------ */
function NotificationsView({ email }) {
  const notes = listNotifications({ scope: 'student', forEmail: email });
  const iconFor = { received: Inbox, shortlisted: UserCheck, interview: CalendarCheck, selected: CheckCircle2, assigned: Target };
  if (!notes.length) return <EmptyState icon={Bell} title="No notifications yet" body="We'll let you know when your application status changes." />;
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

/* ---------------------------------- shell ---------------------------------- */
export default function StudentDashboard() {
  useStore();
  const navigate = useNavigate();
  const session = getSession();
  const email = session?.role === 'student' ? session.email : null;

  // Tab + open application live in the URL so the browser Back button returns
  // from an application's detail to the list, and between tabs.
  const [sp, setSp] = useSearchParams();
  const tab = sp.get('tab') || 'overview';
  const openId = sp.get('app') || null;
  const setTab = (t) => setSp((prev) => { const p = new URLSearchParams(prev); p.set('tab', t); p.delete('app'); return p; }, { replace: true });
  const setOpenId = (id) => setSp((prev) => { const p = new URLSearchParams(prev); id ? p.set('app', id) : p.delete('app'); return p; });

  if (!email) return <Gate />;

  const apps = listStudentApplications(email);
  const unread = listNotifications({ scope: 'student', forEmail: email }).filter((n) => !n.read).length;
  const open = openId ? apps.find((a) => a.id === openId) : null;
  const name = session.name || apps[0]?.applicantName || 'there';

  const TABS = [
    { k: 'overview', l: 'Overview', i: LayoutDashboard },
    { k: 'applications', l: 'My Applications', i: FileText },
    { k: 'profile', l: 'Profile', i: User },
    { k: 'notifications', l: 'Notifications', i: Bell },
  ];

  return (
    <div className="min-h-screen bg-canvas">
      <Helmet><title>Dashboard · EkaNex</title><meta name="robots" content="noindex" /></Helmet>
      <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/90 backdrop-blur">
        <div className="container-px flex h-16 items-center justify-between">
          <Link to="/" className="inline-flex items-center gap-2"><LogoMark className="h-8 w-8" /><span className="font-extrabold text-navy">EkaNex</span></Link>
          <button onClick={() => { signOut(); navigate('/'); }} className="inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold text-muted hover:bg-surface hover:text-navy"><LogOut className="h-4 w-4" /> Sign out</button>
        </div>
      </header>

      <main className="container-px py-8">
        <div className="flex flex-wrap items-center gap-3">
          <span className="grid h-12 w-12 place-items-center rounded-full bg-electric/10 text-electric"><GraduationCap className="h-6 w-6" /></span>
          <div>
            <h1 className="text-2xl font-extrabold tracking-tight text-navy">Hi, {String(name).split(' ')[0]} 👋</h1>
            <p className="text-muted">Track your applications, interviews and selected projects.</p>
          </div>
          <Link to="/apply" state={{ userType: 'student' }} className="ml-auto inline-flex items-center gap-2 rounded-xl bg-electric px-5 py-2.5 font-semibold text-white shadow-card transition-all hover:bg-electric-dark hover:-translate-y-0.5">
            <Sparkles className="h-4 w-4" /> Explore Projects
          </Link>
        </div>

        <div className="mt-6 flex flex-wrap gap-1 border-b border-slate-200">
          {TABS.map((t) => {
            const Icon = t.i;
            const active = tab === t.k;
            return (
              <button key={t.k} onClick={() => setTab(t.k)} className={`relative inline-flex items-center gap-2 px-4 py-3 text-sm font-semibold transition-colors ${active ? 'text-navy' : 'text-muted hover:text-navy'}`}>
                <Icon className="h-4 w-4" /> {t.l}
                {t.k === 'notifications' && unread > 0 && <span className="grid h-4 min-w-4 place-items-center rounded-full bg-rose-500 px-1 text-[10px] font-bold text-white">{unread}</span>}
                {active && <motion.span layoutId="dash-tab" className="absolute inset-x-2 -bottom-px h-0.5 rounded-full bg-electric" />}
              </button>
            );
          })}
        </div>

        <div className="mt-8">
          {open ? <AppDetail a={open} onBack={() => setOpenId(null)} />
            : tab === 'overview' ? <Overview apps={apps} email={email} onOpen={setOpenId} />
            : tab === 'applications' ? <MyApplications apps={apps} onOpen={setOpenId} />
            : tab === 'profile' ? <ProfileView apps={apps} />
            : <NotificationsView email={email} />}
        </div>
      </main>
    </div>
  );
}
