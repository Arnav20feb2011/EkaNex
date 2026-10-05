import { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import {
  GraduationCap,
  Building2,
  ArrowRight,
  ArrowLeft,
  X,
  Check,
  CheckCircle2,
  MapPin,
  Loader2,
  ShieldCheck,
  BadgeCheck,
  Briefcase,
  CalendarClock,
  ClipboardList,
  Sparkles,
  Search,
  LayoutDashboard,
  User,
  Clock,
  Target,
  Users,
  Globe,
  Award,
  TrendingUp,
  Rocket,
} from 'lucide-react';
import { Helmet } from 'react-helmet-async';
import { OPPORTUNITIES, WORK_TYPES, ORG_TYPES, STUDENT_YEARS, getOpportunity } from '../data/opportunities';
import { ORG_ENQUIRY_TYPES } from '../data/site';
import { LogoMark } from '../components/Logo';
import { signUp, signIn, submitApplication, hasApplied, getSession, getProfile, getBrowseData, listStudentApplications } from '../lib/api';
import { StatusBadge, EmptyState, Spinner } from '../components/ui';
import { companyGradient, initials as monogram } from '../lib/brand';
import { track } from '../lib/analytics';
import CTAButton from '../components/CTAButton';
import ContactForm from '../components/ContactForm';
import ApplicationForm from './ApplicationForm';

const ease = [0.22, 1, 0.36, 1];

// Format an ISO date (2026-12-07) as "7 Dec 2026".
const fmtDMY = (iso) => {
  if (!iso) return '';
  const d = new Date(`${iso}T00:00:00`);
  return isNaN(d.getTime()) ? iso : d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
};

/* ------------------------------ shared bits ------------------------------ */

function CompanyLogo({ opp, className = 'h-12 w-12 text-base' }) {
  return (
    <span
      aria-hidden="true"
      className={`grid shrink-0 place-items-center rounded-xl font-bold text-white shadow-sm ${className}`}
      style={{ backgroundImage: `linear-gradient(135deg, ${opp.logoFrom}, ${opp.logoTo})` }}
    >
      {opp.initials}
    </span>
  );
}

function WorkTypeChip({ type }) {
  const map = {
    Remote: 'bg-forest/10 text-forest',
    Hybrid: 'bg-electric/10 text-electric',
    'On-site': 'bg-accent/15 text-accent-dark',
  };
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ${map[type] || 'bg-slate-100 text-slate-600'}`}>
      {type}
    </span>
  );
}

function VerifiedBadge() {
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-electric/10 px-2 py-0.5 text-[11px] font-semibold text-electric">
      <BadgeCheck className="h-3.5 w-3.5" /> Verified
    </span>
  );
}

/* ------------------------------ step 1: who ------------------------------ */

function WhoAreYou({ initialPick, onPick }) {
  const [picked, setPicked] = useState(null);
  const choose = (type) => {
    setPicked(type);
    setTimeout(() => onPick(type), 320);
  };
  const cards = [
    {
      type: 'student',
      icon: GraduationCap,
      title: 'Student',
      body: 'Grade 11–12, looking for your first real work experience before university.',
    },
    {
      type: 'organization',
      icon: Building2,
      title: 'Organization',
      body: 'A business, school or sponsor that wants to work with EkaNex.',
    },
  ];
  return (
    <div className="container-px flex flex-1 flex-col items-center justify-center py-14 text-center sm:py-20">
      <motion.p
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease }}
        className="eyebrow text-electric"
      >
        Get started
      </motion.p>
      <motion.h1
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.55, ease, delay: 0.05 }}
        className="mt-3 text-[clamp(2rem,4vw,3rem)] font-extrabold tracking-tight text-navy"
      >
        Who are you?
      </motion.h1>
      <motion.p
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.55, ease, delay: 0.1 }}
        className="mx-auto mt-4 max-w-xl text-lg text-muted"
      >
        Tell us how you’d like to join EkaNex — we’ll tailor the next steps to you.
      </motion.p>

      <div className="mt-10 grid w-full max-w-3xl gap-5 sm:grid-cols-2">
        {cards.map((c, i) => {
          const Icon = c.icon;
          const active = (picked || initialPick) === c.type;
          const isPicked = picked === c.type;
          return (
            <motion.button
              key={c.type}
              type="button"
              onClick={() => choose(c.type)}
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease, delay: 0.15 + i * 0.08 }}
              whileHover={{ y: -5 }}
              whileTap={{ scale: 0.98 }}
              className={`group relative flex flex-col items-start gap-4 overflow-hidden rounded-2xl border-2 bg-white p-7 text-left shadow-card transition-colors ${
                active ? 'border-electric ring-4 ring-electric/15' : 'border-transparent hover:border-electric/40'
              }`}
            >
              <span
                className={`grid h-14 w-14 place-items-center rounded-2xl transition-colors ${
                  active ? 'bg-electric text-white' : 'bg-electric/10 text-electric group-hover:bg-electric group-hover:text-white'
                }`}
              >
                <Icon className="h-7 w-7" />
              </span>
              <div>
                <h2 className="text-xl font-bold text-navy">{c.title}</h2>
                <p className="mt-1 leading-relaxed text-muted">{c.body}</p>
              </div>
              <span className="mt-auto inline-flex items-center gap-1.5 font-semibold text-electric">
                Continue
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </span>
              <AnimatePresence>
                {isPicked && (
                  <motion.span
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="absolute right-4 top-4 grid h-7 w-7 place-items-center rounded-full bg-electric text-white"
                  >
                    <Check className="h-4 w-4" strokeWidth={3} />
                  </motion.span>
                )}
              </AnimatePresence>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}

/* ------------------------------ step 2: auth ----------------------------- */

const inputBase =
  'w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-ink shadow-sm transition-colors placeholder:text-slate-400 focus:border-electric focus:outline-none focus:ring-2 focus:ring-electric/30';

function Field({ id, label, type = 'text', value = '', onChange, placeholder, autoComplete, as = 'input', options }) {
  return (
    <div>
      <label htmlFor={id} className="mb-1 block text-sm font-semibold text-ink">
        {label} <span className="text-red-500">*</span>
      </label>
      {as === 'select' ? (
        <select id={id} value={value} onChange={onChange} className={`${inputBase} ${value ? 'text-ink' : 'text-slate-400'}`}>
          <option value="" disabled>
            Select…
          </option>
          {options.map((o) => (
            <option key={o} value={o} className="text-ink">
              {o}
            </option>
          ))}
        </select>
      ) : (
        <input id={id} type={type} value={value} onChange={onChange} placeholder={placeholder} autoComplete={autoComplete} className={inputBase} />
      )}
    </div>
  );
}

function AuthPanel({ userType, onBack, onAuthed }) {
  const isStudent = userType === 'student';
  const [mode, setMode] = useState('signup');
  const [v, setV] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const set = (k) => (e) => setV((s) => ({ ...s, [k]: e.target.value }));

  const submit = async (e) => {
    e.preventDefault();
    let req;
    if (mode === 'signin') req = ['email', 'password'];
    else req = isStudent ? ['name', 'email', 'password', 'school', 'year'] : ['orgName', 'email', 'password', 'orgType'];
    for (const k of req) {
      if (!(v[k] && String(v[k]).trim())) {
        setError('Please fill in all fields to continue.');
        return;
      }
    }
    if (v.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.email)) {
      setError('Please enter a valid email address.');
      return;
    }
    setError('');
    setSubmitting(true);
    // Real auth when Supabase is configured; otherwise a demo request resolves ok.
    const res = mode === 'signup' ? await signUp(userType, v) : await signIn(v);
    setSubmitting(false);
    if (res.ok) {
      track(mode === 'signup' ? 'auth_sign_up' : 'auth_sign_in', { user_type: userType });
      onAuthed(v);
    } else {
      setError(res.error || 'Something went wrong. Please try again.');
    }
  };

  const emailLabel = isStudent ? 'Email' : 'Work email';

  return (
    <div className="container-px flex flex-1 items-center justify-center py-12 sm:py-16">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease }}
        className="w-full max-w-md"
      >
        <button
          type="button"
          onClick={onBack}
          className="mb-6 inline-flex items-center gap-1.5 text-sm font-semibold text-muted transition-colors hover:text-navy"
        >
          <ArrowLeft className="h-4 w-4" /> Back
        </button>

        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-card sm:p-8">
          <div className="flex items-center gap-3">
            <span className="grid h-11 w-11 place-items-center rounded-xl bg-navy/5 text-navy">
              {isStudent ? <GraduationCap className="h-6 w-6" /> : <Building2 className="h-6 w-6" />}
            </span>
            <div>
              <p className="eyebrow text-electric">{isStudent ? 'Student' : 'Organization'}</p>
              <h1 className="text-xl font-bold text-navy">
                {mode === 'signup' ? 'Create your account' : 'Welcome back'}
              </h1>
            </div>
          </div>

          {/* Segmented control */}
          <div className="mt-6 grid grid-cols-2 gap-1 rounded-xl bg-surface p-1" role="tablist" aria-label="Authentication mode">
            {['signup', 'signin'].map((m) => (
              <button
                key={m}
                type="button"
                role="tab"
                aria-selected={mode === m}
                onClick={() => {
                  setMode(m);
                  setError('');
                }}
                className={`rounded-lg px-3 py-2 text-sm font-semibold transition-colors ${
                  mode === m ? 'bg-white text-navy shadow-sm' : 'text-muted hover:text-navy'
                }`}
              >
                {m === 'signup' ? 'Sign Up' : 'Sign In'}
              </button>
            ))}
          </div>

          <form onSubmit={submit} noValidate className="mt-6">
            <AnimatePresence mode="wait">
              <motion.div
                key={mode + userType}
                initial={{ opacity: 0, x: mode === 'signup' ? -12 : 12 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: mode === 'signup' ? 12 : -12 }}
                transition={{ duration: 0.25, ease }}
                className="space-y-4"
              >
                {mode === 'signup' && isStudent && (
                  <Field id="au-name" label="Name" value={v.name} onChange={set('name')} placeholder="Your full name" autoComplete="name" />
                )}
                {mode === 'signup' && !isStudent && (
                  <Field id="au-org" label="Organization name" value={v.orgName} onChange={set('orgName')} placeholder="Your organisation" autoComplete="organization" />
                )}

                <Field
                  id="au-email"
                  label={emailLabel}
                  type="email"
                  value={v.email}
                  onChange={set('email')}
                  placeholder={isStudent ? 'you@example.com' : 'you@company.com'}
                  autoComplete="email"
                />
                <Field id="au-pass" label="Password" type="password" value={v.password} onChange={set('password')} placeholder="••••••••" autoComplete={mode === 'signup' ? 'new-password' : 'current-password'} />

                {mode === 'signup' && isStudent && (
                  <>
                    <Field id="au-school" label="School / University" value={v.school} onChange={set('school')} placeholder="Your school or university" autoComplete="organization" />
                    <Field id="au-year" label="Grade or year" as="select" value={v.year} onChange={set('year')} options={STUDENT_YEARS} />
                  </>
                )}
                {mode === 'signup' && !isStudent && (
                  <Field id="au-type" label="Organization type" as="select" value={v.orgType} onChange={set('orgType')} options={ORG_TYPES} />
                )}
              </motion.div>
            </AnimatePresence>

            {error && (
              <p role="alert" className="mt-3 text-sm text-red-600">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-electric px-6 py-3 font-semibold text-white shadow-card ring-1 ring-inset ring-white/15 transition-all hover:bg-electric-dark hover:-translate-y-0.5 hover:shadow-cardHover active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-80"
            >
              {submitting ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" /> {mode === 'signup' ? 'Creating account…' : 'Signing in…'}
                </>
              ) : (
                <>
                  {mode === 'signup' ? 'Create account' : 'Sign in'} <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>
          </form>

          <p className="mt-4 text-center text-xs text-slate-400">
            Demo flow — authentication isn’t connected to a backend yet.
          </p>
        </div>
      </motion.div>
    </div>
  );
}

/* --------------------------- step 3: discover ---------------------------- */

function OpportunityCard({ opp, index, onView, onApply, applied }) {
  return (
    <motion.article
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease, delay: Math.min(index * 0.05, 0.3) }}
      whileHover={{ y: -5 }}
      className="flex h-full flex-col rounded-card border border-slate-200/80 bg-white p-6 shadow-card transition-shadow hover:shadow-cardHover"
    >
      <div className="flex items-center gap-3">
        <CompanyLogo opp={opp} />
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="truncate font-bold text-navy">{opp.company}</h3>
            {opp.verified && <VerifiedBadge />}
          </div>
          <p className="truncate text-xs text-muted">{opp.sector}</p>
        </div>
      </div>

      <div className="my-4 h-px bg-slate-100" />

      <p className="text-lg font-bold text-navy">{opp.roleTitle}</p>
      <p className="mt-1.5 flex-1 text-sm leading-relaxed text-ink/75">{opp.roleShort}</p>

      <div className="mt-4 flex flex-wrap items-center gap-2 text-xs">
        {(opp.skills || []).slice(0, 3).map((s) => (
          <span key={s} className="rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-ink/70">{s}</span>
        ))}
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-2 text-xs text-muted">
        <span className="inline-flex items-center gap-1">
          <MapPin className="h-3.5 w-3.5" /> {opp.location}
        </span>
        <WorkTypeChip type={opp.workType} />
      </div>

      <div className="mt-5 flex gap-2.5">
        <button
          type="button"
          onClick={() => onView(opp)}
          className="flex-1 rounded-xl border-2 border-navy px-4 py-2.5 text-sm font-semibold text-navy transition-colors hover:bg-navy hover:text-white"
        >
          View Role
        </button>
        {applied ? (
          <span className="flex flex-1 items-center justify-center gap-1.5 rounded-xl border-2 border-forest/30 bg-forest/5 px-4 py-2.5 text-sm font-semibold text-forest">
            <Check className="h-4 w-4" strokeWidth={3} /> Applied
          </span>
        ) : (
          <button
            type="button"
            onClick={() => onApply(opp)}
            className="flex-1 rounded-xl bg-electric px-4 py-2.5 text-sm font-semibold text-white shadow-card ring-1 ring-inset ring-white/15 transition-all hover:bg-electric-dark active:scale-[0.98]"
          >
            Apply
          </button>
        )}
      </div>
    </motion.article>
  );
}

function CompanyRow({ company }) {
  const g = companyGradient(company.name);
  return (
    <div className="flex items-center gap-3 rounded-card border border-slate-200 bg-white p-4 shadow-card">
      <span aria-hidden className="grid h-11 w-11 shrink-0 place-items-center rounded-xl font-bold text-white" style={{ backgroundImage: `linear-gradient(135deg, ${g.from}, ${g.to})` }}>{monogram(company.name)}</span>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <p className="truncate font-bold text-navy">{company.name}</p>
          {company.verified && <VerifiedBadge />}
        </div>
        <p className="truncate text-xs text-muted">{company.sector || 'Partner company'}</p>
      </div>
      <span className="rounded-full bg-surface px-3 py-1 text-xs font-semibold text-muted">Roles opening soon</span>
    </div>
  );
}

function Discover({ onView, onApply, appliedIds }) {
  const [data, setData] = useState(null); // { companies, projects }
  // Search / skill / work-type filters live in the URL so Back from a role
  // restores the exact browse state. Filter edits replace (don't spam history).
  const [sp, setSp] = useSearchParams();
  const query = sp.get('q') || '';
  const skill = sp.get('sk') || 'All';
  const filter = sp.get('wt') || 'All';
  const setParam = (k, v) => setSp((prev) => { const p = new URLSearchParams(prev); (v && v !== 'All') ? p.set(k, v) : p.delete(k); return p; }, { replace: true });
  const setQuery = (v) => setParam('q', v);
  const setSkill = (v) => setParam('sk', v);
  const setFilter = (v) => setParam('wt', v);

  useEffect(() => {
    let alive = true;
    getBrowseData().then((d) => { if (alive) setData(d); });
    return () => { alive = false; };
  }, []);

  if (!data) {
    return (
      <div className="container-px flex flex-1 items-center justify-center py-24 text-muted">
        <Spinner className="h-6 w-6 text-electric" /> <span className="ml-3">Loading projects…</span>
      </div>
    );
  }

  const projects = data.projects || [];
  const companies = data.companies || [];
  const allSkills = ['All', ...new Set(projects.flatMap((o) => o.skills || []))];
  const list = projects.filter((o) => {
    if (filter !== 'All' && o.workType !== filter) return false;
    if (skill !== 'All' && !(o.skills || []).includes(skill)) return false;
    if (query) {
      const hay = `${o.company} ${o.roleTitle} ${o.sector} ${(o.skills || []).join(' ')}`.toLowerCase();
      if (!hay.includes(query.toLowerCase())) return false;
    }
    return true;
  });

  return (
    <div className="container-px py-10 sm:py-14">
      <div className="max-w-3xl">
        <p className="eyebrow text-electric">Delhi NCR</p>
        <h1 className="mt-2 text-[clamp(1.8rem,3.5vw,2.6rem)] font-extrabold tracking-tight text-navy">
          Find your first real project.
        </h1>
        <p className="mt-3 text-lg text-muted">
          Every role is a real business challenge with a supervisor, a clear deliverable and a certificate at the end.
        </p>
      </div>

      {projects.length > 0 ? (
        <>
          <div className="mt-8 space-y-4">
            <div className="flex flex-col gap-3 sm:flex-row">
              <label className="relative flex-1">
                <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
                <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search by company, role, industry or skill…" className="w-full rounded-xl border border-slate-200 bg-white py-3 pl-10 pr-4 text-ink shadow-sm placeholder:text-slate-400 focus:border-electric focus:outline-none focus:ring-2 focus:ring-electric/20" />
              </label>
              <select value={skill} onChange={(e) => setSkill(e.target.value)} className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-navy shadow-sm focus:border-electric focus:outline-none focus:ring-2 focus:ring-electric/20">
                {allSkills.map((s) => <option key={s} value={s}>{s === 'All' ? 'All skills' : s}</option>)}
              </select>
            </div>
            <div className="flex flex-wrap gap-2">
              {WORK_TYPES.map((t) => (
                <button key={t} type="button" onClick={() => setFilter(t)} className={`rounded-full border px-4 py-1.5 text-sm font-semibold transition-colors ${filter === t ? 'border-navy bg-navy text-white' : 'border-slate-200 bg-white text-muted hover:border-navy/40 hover:text-navy'}`}>{t}</button>
              ))}
              <span className="ml-auto self-center text-sm text-muted">{list.length} role{list.length === 1 ? '' : 's'}</span>
            </div>
          </div>
          <div className="mt-6 grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
            <AnimatePresence mode="popLayout">
              {list.map((opp, i) => (
                <OpportunityCard key={opp.id} opp={opp} index={i} onView={onView} onApply={onApply} applied={appliedIds?.has(opp.id)} />
              ))}
            </AnimatePresence>
          </div>
        </>
      ) : (
        <div className="mt-8 space-y-6">
          <EmptyState
            icon={Briefcase}
            title="No open roles yet"
            body="Our partner companies are scoping their first projects. Create an account and we'll notify you the moment roles open."
          />
          {companies.length > 0 && (
            <div>
              <p className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted">Partner companies</p>
              <div className="grid gap-3 sm:grid-cols-2">
                {companies.map((c) => <CompanyRow key={c.id || c.name} company={c} />)}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

/* -------------------------- step 4: role details ------------------------- */

/* --- RoleDetails building blocks --- */
function RDBlock({ title, icon: Icon, children }) {
  return (
    <section className="rounded-card border border-slate-200 bg-white p-6 shadow-card sm:p-7">
      <h3 className="flex items-center gap-2 text-lg font-bold text-navy">{Icon && <Icon className="h-5 w-5 text-electric" />}{title}</h3>
      <div className="mt-4">{children}</div>
    </section>
  );
}
function RDFact({ icon: Icon, label, value }) {
  if (!value) return null;
  return (
    <div className="flex items-start gap-3">
      <Icon className="mt-0.5 h-5 w-5 shrink-0 text-electric" />
      <div><dt className="font-semibold text-muted">{label}</dt><dd className="text-navy">{value}</dd></div>
    </div>
  );
}
function RDBullets({ items, tone = 'bg-electric' }) {
  return (
    <ul className="space-y-2.5">
      {items.map((r, i) => (
        <li key={i} className="flex gap-3 text-ink/80"><span className={`mt-2 h-1.5 w-1.5 shrink-0 rounded-full ${tone}`} />{r}</li>
      ))}
    </ul>
  );
}
function RDChips({ items }) {
  return (
    <div className="flex flex-wrap gap-2">
      {items.map((s) => <span key={s} className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-sm font-medium text-navy">{s}</span>)}
    </div>
  );
}

function RoleDetails({ opp: rawOpp, onBack, onApply }) {
  // Normalise so every array/field exists (a legacy/deep-linked opp may lack the
  // rich Supabase fields — this keeps the page crash-free).
  const opp = {
    skills: [], preferredSkills: [], objectives: [], deliverables: [],
    benefits: [], learningOutcomes: [], weeklyPlan: [], companyProfile: {},
    ...rawOpp,
  };
  const cp = opp.companyProfile || {};
  const email = getSession()?.email;
  const myApp = email ? listStudentApplications(email).find((a) => a.opportunityId === opp.id) : null;

  const commitment = [opp.hoursPerWeek, opp.durationWeeks ? `${opp.durationWeeks} weeks` : opp.window].filter(Boolean).join(' · ');
  const hasCompanyFacts = cp.foundedYear || cp.employeeCount || cp.stage || cp.website || cp.location || cp.sector;
  const hasWhoFor = opp.recommendedGrade || (opp.skills && opp.skills.length) || (opp.preferredSkills && opp.preferredSkills.length) || opp.relevantSubjects || commitment || opp.teamwork;
  const websiteHref = cp.website ? (cp.website.startsWith('http') ? cp.website : `https://${cp.website}`) : '';

  const ApplyCTA = myApp ? (
    <div className="rounded-xl border border-forest/25 bg-forest/5 p-4 text-center">
      <p className="flex items-center justify-center gap-1.5 font-semibold text-forest"><CheckCircle2 className="h-5 w-5" /> Application submitted</p>
      <div className="mt-2 flex justify-center"><StatusBadge status={myApp.status} /></div>
      <Link to="/dashboard" className="mt-3 inline-flex items-center gap-1.5 text-sm font-semibold text-electric hover:underline">Track in dashboard <ArrowRight className="h-4 w-4" /></Link>
    </div>
  ) : (
    <button type="button" onClick={() => onApply(opp)} className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-electric px-6 py-3 font-semibold text-white shadow-card ring-1 ring-inset ring-white/15 transition-all hover:bg-electric-dark hover:-translate-y-0.5 hover:shadow-cardHover active:scale-[0.98]">
      Apply now <ArrowRight className="h-4 w-4" />
    </button>
  );

  return (
    <div className="container-px pb-28 pt-10 sm:py-14 lg:pb-14">
      <button type="button" onClick={onBack} className="mb-6 inline-flex items-center gap-1.5 text-sm font-semibold text-muted transition-colors hover:text-navy"><ArrowLeft className="h-4 w-4" /> Back to roles</button>

      {/* Header */}
      <div className="flex flex-wrap items-start gap-4">
        <CompanyLogo opp={opp} className="h-16 w-16 text-xl" />
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="text-lg font-bold text-navy">{opp.company}</h2>
            {opp.verified && <VerifiedBadge />}
            {opp.seatStatus && <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-semibold text-amber-700"><Clock className="h-3.5 w-3.5" /> {opp.seatStatus}</span>}
          </div>
          <p className="text-sm text-muted">{opp.sector}</p>
          <h1 className="mt-3 text-[clamp(1.6rem,3vw,2.3rem)] font-extrabold tracking-tight text-navy">{opp.roleTitle}</h1>
          {opp.roleShort && <p className="mt-2 max-w-2xl text-lg text-ink/70">{opp.roleShort}</p>}
        </div>
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-3">
        {/* Main column */}
        <div className="space-y-6 lg:col-span-2">
          <RDBlock title="The project" icon={Target}>
            <div className="space-y-4 text-[15px] leading-relaxed text-ink/80">
              {opp.roleDescription && <p>{opp.roleDescription}</p>}
              {opp.problem && (<div><p className="font-semibold text-navy">The problem</p><p className="mt-1">{opp.problem}</p></div>)}
              {opp.whyItMatters && (<div><p className="font-semibold text-navy">Why it matters</p><p className="mt-1">{opp.whyItMatters}</p></div>)}
              {opp.whyStudents && (<div><p className="font-semibold text-navy">Why a student</p><p className="mt-1">{opp.whyStudents}</p></div>)}
              {opp.objectives.length > 0 && (<div><p className="font-semibold text-navy">Objectives</p><div className="mt-2"><RDBullets items={opp.objectives} /></div></div>)}
              {opp.deliverables.length > 0 && (<div><p className="font-semibold text-navy">Deliverables</p><div className="mt-2"><RDBullets items={opp.deliverables} tone="bg-forest" /></div></div>)}
            </div>
          </RDBlock>

          {opp.weeklyPlan.length > 0 && (
            <RDBlock title="What you'll work on" icon={ClipboardList}>
              <ol className="relative space-y-4 border-l-2 border-slate-100 pl-6">
                {opp.weeklyPlan.map((w, i) => (
                  <li key={i} className="relative">
                    <span className="absolute -left-[31px] top-0.5 grid h-5 w-5 place-items-center rounded-full bg-electric text-[10px] font-bold text-white">{w.week || i + 1}</span>
                    <p className="font-semibold text-navy">{w.title || `Week ${w.week || i + 1}`}</p>
                    {w.detail && <p className="text-sm text-ink/75">{w.detail}</p>}
                  </li>
                ))}
              </ol>
            </RDBlock>
          )}

          {(opp.benefits.length > 0 || opp.learningOutcomes.length > 0) && (
            <RDBlock title="Why do this?" icon={TrendingUp}>
              {opp.benefits.length > 0 && <RDBullets items={opp.benefits} tone="bg-electric" />}
              {opp.learningOutcomes.length > 0 && (<div className={opp.benefits.length ? 'mt-4' : ''}><p className="font-semibold text-navy">What you'll learn</p><div className="mt-2"><RDBullets items={opp.learningOutcomes} tone="bg-accent" /></div></div>)}
            </RDBlock>
          )}

          {hasWhoFor && (
            <RDBlock title="Who this is for" icon={GraduationCap}>
              <dl className="grid gap-4 sm:grid-cols-2">
                <RDFact icon={GraduationCap} label="Recommended grade" value={opp.recommendedGrade} />
                <RDFact icon={Clock} label="Commitment" value={commitment} />
                <RDFact icon={ClipboardList} label="Relevant subjects" value={opp.relevantSubjects} />
                <RDFact icon={Users} label="Teamwork" value={opp.teamwork} />
              </dl>
              {opp.skills.length > 0 && (<div className="mt-5"><p className="mb-2 text-sm font-semibold text-muted">Required skills</p><RDChips items={opp.skills} /></div>)}
              {opp.preferredSkills.length > 0 && (<div className="mt-4"><p className="mb-2 text-sm font-semibold text-muted">Preferred (nice to have)</p><RDChips items={opp.preferredSkills} /></div>)}
            </RDBlock>
          )}

          {(cp.description || cp.mission || hasCompanyFacts || (cp.achievements && cp.achievements.length)) && (
            <RDBlock title={`About ${opp.company}`} icon={Building2}>
              {cp.description && <p className="text-[15px] leading-relaxed text-ink/80">{cp.description}</p>}
              {cp.mission && (<div className="mt-4 rounded-lg bg-surface/60 p-3"><p className="text-sm font-semibold text-navy">Mission</p><p className="mt-1 text-sm text-ink/75">{cp.mission}</p></div>)}
              {hasCompanyFacts && (
                <dl className="mt-4 grid gap-4 sm:grid-cols-2">
                  <RDFact icon={Briefcase} label="Industry" value={cp.sector} />
                  <RDFact icon={MapPin} label="Location" value={cp.location} />
                  <RDFact icon={CalendarClock} label="Founded" value={cp.foundedYear ? String(cp.foundedYear) : ''} />
                  <RDFact icon={Users} label="Team size" value={cp.employeeCount} />
                  <RDFact icon={TrendingUp} label="Stage" value={cp.stage} />
                  {cp.website && (<div className="flex items-start gap-3"><Globe className="mt-0.5 h-5 w-5 shrink-0 text-electric" /><div><dt className="font-semibold text-muted">Website</dt><dd><a href={websiteHref} target="_blank" rel="noopener noreferrer" className="text-electric hover:underline">{cp.website.replace(/^https?:\/\//, '')}</a></dd></div></div>)}
                </dl>
              )}
              {cp.achievements && cp.achievements.length > 0 && (<div className="mt-5"><p className="mb-2 flex items-center gap-1.5 text-sm font-semibold text-navy"><Award className="h-4 w-4 text-accent-dark" /> Highlights</p><RDBullets items={cp.achievements} tone="bg-accent" /></div>)}
            </RDBlock>
          )}

          <RDBlock title="How to apply" icon={Rocket}>
            <p className="text-[15px] leading-relaxed text-ink/80">{opp.applicationProcess}</p>
          </RDBlock>
        </div>

        {/* Sticky sidebar */}
        <aside className="lg:col-span-1">
          <div className="space-y-4 lg:sticky lg:top-24">
            <div className="rounded-card border border-slate-200 bg-white p-6 shadow-card">
              {ApplyCTA}
              <dl className="mt-6 space-y-4 text-sm">
                <RDFact icon={MapPin} label="Location" value={opp.location} />
                <RDFact icon={Briefcase} label="Work arrangement" value={opp.workDetail || opp.workType} />
                <RDFact icon={Clock} label="Commitment" value={commitment} />
                <RDFact icon={Users} label="Team size" value={opp.teamSize} />
                {(opp.startsOn && opp.endsOn) ? (
                  <div className="flex items-start gap-3"><CalendarClock className="mt-0.5 h-5 w-5 shrink-0 text-electric" /><div><dt className="font-semibold text-muted">Dates</dt><dd className="text-navy">{opp.window}</dd><dd className="text-xs text-muted">{fmtDMY(opp.startsOn)} → {fmtDMY(opp.endsOn)}</dd></div></div>
                ) : <RDFact icon={CalendarClock} label="Dates" value={opp.window} />}
                <RDFact icon={User} label="Supervisor" value={opp.supervisor} />
                {opp.mentorName && <RDFact icon={User} label="Mentor" value={`${opp.mentorName}${opp.mentorRole ? ` · ${opp.mentorRole}` : ''}`} />}
                <div className="flex items-start gap-3"><ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-electric" /><div><dt className="font-semibold text-muted">Eligibility</dt><dd className="text-navy">Grade 11–12 student in Delhi NCR · parental consent required · no prior experience needed{opp.workType === 'On-site' ? ' · on-site safety induction' : ''}</dd></div></div>
              </dl>
            </div>
          </div>
        </aside>
      </div>

      {/* Mobile sticky apply bar */}
      {!myApp && (
        <div className="fixed inset-x-0 bottom-0 z-20 border-t border-slate-200 bg-white/95 p-3 backdrop-blur lg:hidden">
          <button type="button" onClick={() => onApply(opp)} className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-electric px-6 py-3 font-semibold text-white shadow-card active:scale-[0.98]">Apply now <ArrowRight className="h-4 w-4" /></button>
        </div>
      )}
    </div>
  );
}

/* ---------------------------- step 5: success ---------------------------- */

function ApplySuccess({ opp, onBrowse, onDashboard }) {
  return (
    <div className="container-px flex flex-1 items-center justify-center py-16">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease }}
        className="w-full max-w-lg rounded-2xl border border-forest/25 bg-white p-8 text-center shadow-card sm:p-10"
      >
        <motion.span
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 200, damping: 15, delay: 0.1 }}
          className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-forest/10 text-forest"
        >
          <CheckCircle2 className="h-9 w-9" />
        </motion.span>
        <h1 className="mt-5 text-2xl font-bold text-navy">Application submitted! 🎉</h1>
        <p className="mx-auto mt-3 max-w-md leading-relaxed text-ink/75">
          Your application {opp ? <>for <span className="font-semibold text-navy">{opp.roleTitle}</span> at <span className="font-semibold text-navy">{opp.company}</span></> : null} has been submitted. Our team will review it and get back to you within 2 working days — we may reach out to arrange a short screening call.
        </p>
        <div className="mt-7 flex flex-col justify-center gap-3 sm:flex-row">
          <button
            type="button"
            onClick={onDashboard}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-electric px-6 py-3 font-semibold text-white shadow-card ring-1 ring-inset ring-white/15 transition-all hover:bg-electric-dark hover:-translate-y-0.5"
          >
            <LayoutDashboard className="h-4 w-4" /> Track in my dashboard
          </button>
          <button
            type="button"
            onClick={onBrowse}
            className="inline-flex items-center justify-center gap-2 rounded-xl border-2 border-navy px-6 py-3 font-semibold text-navy transition-colors hover:bg-navy hover:text-white"
          >
            Browse more roles
          </button>
        </div>
        <p className="mt-5 text-xs text-slate-400">
          You’ll get updates here and by email as your application moves through review.
        </p>
      </motion.div>
    </div>
  );
}

/* --------------------- organization post-auth screen --------------------- */

function OrgHome() {
  const perks = [
    { icon: ClipboardList, title: 'You define the problem', body: 'Market research, competitor analysis, social strategy, operations — whatever’s stuck on your list.' },
    { icon: ShieldCheck, title: 'We manage everything', body: 'Matching, safeguarding, supervision and weekly updates — at zero cost during Cohort 1.' },
    { icon: Sparkles, title: 'A real deliverable', body: 'A written report and a live final presentation your team can act on.' },
  ];
  return (
    <div className="container-px py-10 sm:py-14">
      <div className="max-w-3xl">
        <p className="eyebrow text-electric">For organizations</p>
        <h1 className="mt-2 text-[clamp(1.8rem,3.5vw,2.6rem)] font-extrabold tracking-tight text-navy">
          Welcome to EkaNex. Let’s scope your first project.
        </h1>
        <p className="mt-3 text-lg text-muted">
          Tell us the challenge you’d like a supervised student team to work on for 5–7 weeks. We’ll take it from there.
        </p>
      </div>

      <div className="mt-8 grid gap-5 lg:grid-cols-3">
        {perks.map((p) => {
          const Icon = p.icon;
          return (
            <div key={p.title} className="rounded-card border border-slate-200/80 bg-white p-6 shadow-card">
              <span className="grid h-11 w-11 place-items-center rounded-xl bg-navy/5 text-navy">
                <Icon className="h-6 w-6" />
              </span>
              <h3 className="mt-4 font-bold text-navy">{p.title}</h3>
              <p className="mt-1.5 text-sm leading-relaxed text-ink/75">{p.body}</p>
            </div>
          );
        })}
      </div>

      <div className="mt-8 rounded-2xl border border-slate-200 bg-white p-6 shadow-card sm:p-8">
        <h2 className="text-xl font-bold text-navy">Post a project</h2>
        <p className="mt-1 text-muted">Share a few details and our team will reply within 2 working days.</p>
        <div className="mt-6 max-w-2xl">
          <ContactForm
            idPrefix="org-post"
            orgLabel="Organisation / School"
            orgPlaceholder="Your organisation or school name"
            orgRequired
            dropdownLabel="Enquiry type"
            options={ORG_ENQUIRY_TYPES}
            submitLabel="Post Project →"
            submitVariant="primary"
          />
        </div>
      </div>
    </div>
  );
}

/* ------------------------------ orchestrator ----------------------------- */

function normaliseType(state) {
  if (!state) return null;
  if (state.userType === 'student' || state.userType === 'organization') return state.userType;
  if (state.role === 'Student' || state.role === 'Parent') return 'student';
  if (state.role === 'Organization' || state.role === 'School') return 'organization';
  return null;
}

const STUDENT_STEPS = [
  { key: 'who', label: 'You' },
  { key: 'auth', label: 'Account' },
  { key: 'discover', label: 'Browse' },
  { key: 'role', label: 'Role' },
  { key: 'application', label: 'Apply' },
];
const ORG_STEPS = [
  { key: 'who', label: 'You' },
  { key: 'auth', label: 'Account' },
  { key: 'org', label: 'Post' },
];

export default function ApplyFlow() {
  const location = useLocation();
  const navigate = useNavigate();

  const initialPick = normaliseType(location.state);
  const pendingId = location.state?.opportunityId || null;

  // If a student is already signed in, skip "Who are you?" + sign-in entirely so
  // they can apply to multiple projects without authenticating again.
  const session = getSession();
  const signedInStudent = session?.role === 'student' && !!session.email;
  const sessionProfile = signedInStudent ? getProfile(session.email) : null;
  const sessionAuthData = signedInStudent
    ? { name: session.name || sessionProfile?.name, email: session.email, school: sessionProfile?.school, year: sessionProfile?.grade }
    : {};

  // The current step lives in the URL (?step=…) so the browser's native Back /
  // Forward buttons walk the flow correctly, and reloads restore the view.
  const [searchParams, setSearchParams] = useSearchParams();
  const defaultStep = signedInStudent ? (pendingId && getOpportunity(pendingId) ? 'role' : 'discover') : 'who';
  const step = searchParams.get('step') || defaultStep;
  const setStep = (next) => setSearchParams((prev) => { const p = new URLSearchParams(prev); p.set('step', next); return p; });

  const [userType, setUserType] = useState(signedInStudent ? 'student' : null);
  const [selected, setSelected] = useState(signedInStudent && pendingId ? getOpportunity(pendingId) : null);
  const [authData, setAuthData] = useState(sessionAuthData);

  // Never dead-end on a step that needs a selected role but has none (e.g. a
  // direct reload of ?step=role) — fall back to browse.
  useEffect(() => {
    if ((step === 'role' || step === 'application' || step === 'success') && !selected) setStep('discover');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step, selected]);

  useEffect(() => { window.scrollTo({ top: 0, left: 0 }); }, [step]);

  const pick = (type) => {
    setUserType(type);
    setStep('auth');
  };
  const onAuthed = (data) => {
    setAuthData(data || {});
    if (userType === 'organization') return setStep('org');
    if (pendingId) {
      const opp = getOpportunity(pendingId);
      if (opp) {
        setSelected(opp);
        return setStep('role');
      }
    }
    return setStep('discover');
  };
  const viewRole = (opp) => {
    setSelected(opp);
    setStep('role');
  };
  // "Apply now" opens the full application form (does not submit yet).
  const applyRole = (opp) => {
    setSelected(opp);
    setStep('application');
  };
  // Called when the multi-step application form is completed and validated.
  const completeApplication = async (form) => {
    track('application_submitted', { opportunity: selected?.id, company: selected?.company });
    const res = await submitApplication({
      opportunityId: selected?.id,
      opportunity: selected,
      details: form,
    });
    if (res.ok) setStep('success');
    return res;
  };

  const steps = userType === 'organization' ? ORG_STEPS : STUDENT_STEPS;
  const activeIndex = Math.max(
    0,
    steps.findIndex((s) => s.key === (step === 'success' ? 'application' : step))
  );

  const renderStep = () => {
    switch (step) {
      case 'who':
        return <WhoAreYou initialPick={initialPick} onPick={pick} />;
      case 'auth':
        return <AuthPanel userType={userType} onBack={() => setStep('who')} onAuthed={onAuthed} />;
      case 'discover': {
        const email = getSession()?.email;
        const appliedIds = new Set(OPPORTUNITIES.filter((o) => email && hasApplied(email, o.id)).map((o) => o.id));
        return <Discover onView={viewRole} onApply={applyRole} appliedIds={appliedIds} />;
      }
      case 'role':
        return <RoleDetails opp={selected} onBack={() => setStep('discover')} onApply={applyRole} />;
      case 'application':
        return (
          <ApplicationForm
            opp={selected}
            prefill={authData}
            onBack={() => setStep('role')}
            onSubmit={completeApplication}
          />
        );
      case 'success':
        return <ApplySuccess opp={selected} onBrowse={() => setStep('discover')} onDashboard={() => navigate('/dashboard')} />;
      case 'org':
        return <OrgHome />;
      default:
        return null;
    }
  };

  return (
    <motion.main
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      className="relative flex min-h-screen flex-col bg-canvas"
    >
      <Helmet>
        <title>Apply — EkaNex</title>
        <meta name="robots" content="noindex" />
      </Helmet>

      <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 right-0 h-96 w-96 rounded-full bg-electric/10 blur-3xl" />
        <div className="absolute -left-24 bottom-0 h-80 w-80 rounded-full bg-accent/10 blur-3xl" />
      </div>

      {/* Top bar */}
      <header className="relative z-10 border-b border-slate-200/70 bg-white/80 backdrop-blur">
        <div className="container-px flex h-16 items-center justify-between">
          <Link to="/" className="inline-flex items-center gap-2.5" aria-label="EkaNex — home">
            <LogoMark className="h-8 w-8" />
            <span className="text-lg font-extrabold tracking-tight text-navy">EkaNex</span>
          </Link>

          {/* Progress */}
          {step !== 'who' && (
            <ol className="hidden items-center gap-2 md:flex" aria-label="Progress">
              {steps.map((s, i) => (
                <li key={s.key} className="flex items-center gap-2">
                  <span
                    className={`flex items-center gap-1.5 text-sm font-semibold ${
                      i <= activeIndex ? 'text-navy' : 'text-slate-400'
                    }`}
                  >
                    <span
                      className={`grid h-6 w-6 place-items-center rounded-full text-xs ${
                        i < activeIndex
                          ? 'bg-forest text-white'
                          : i === activeIndex
                          ? 'bg-electric text-white'
                          : 'bg-slate-200 text-slate-500'
                      }`}
                    >
                      {i < activeIndex ? <Check className="h-3.5 w-3.5" strokeWidth={3} /> : i + 1}
                    </span>
                    {s.label}
                  </span>
                  {i < steps.length - 1 && <span className="h-px w-5 bg-slate-200" />}
                </li>
              ))}
            </ol>
          )}

          <button
            type="button"
            onClick={() => navigate('/')}
            aria-label="Exit application"
            className="inline-flex h-10 w-10 items-center justify-center rounded-lg text-muted transition-colors hover:bg-surface hover:text-navy"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
      </header>

      {/* Steps */}
      <div className="relative z-10 flex flex-1 flex-col">
        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -14 }}
            transition={{ duration: 0.35, ease }}
            className="flex flex-1 flex-col"
          >
            {renderStep()}
          </motion.div>
        </AnimatePresence>
      </div>
    </motion.main>
  );
}
