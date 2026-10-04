import { useMemo, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { AnimatePresence, motion } from 'framer-motion';
import {
  ArrowLeft, GraduationCap, Wrench, Briefcase, Link2 as LinkIcon, Target, CalendarClock,
  Heart, Brain, Sparkles, StickyNote, History, Star, AlertTriangle, MessageSquareQuote,
  ShieldCheck, Plus, UserCheck, CheckCircle2, XCircle, CalendarCheck, PauseCircle, BadgeCheck,
  Send, RefreshCw, X, Building2,
} from 'lucide-react';
import { getApplication, setApplicationStatus, addAdminNote, sendToCompany, reEvaluate } from '../lib/api';
import { allowedTransitions, statusMeta, PIPELINE } from '../lib/status';
import { PROTECTED_EXCLUDED } from '../lib/evaluation';
import { OPPORTUNITIES } from '../data/opportunities';
import { StatusBadge, RecommendationBadge, AiTag, ScoreRing, ScoreBar, EmptyState, useStore, fmtDate, timeAgo } from '../components/ui';

const Section = ({ icon: Icon, title, children, aside }) => (
  <section className="rounded-card border border-slate-200 bg-white p-6 shadow-card">
    <div className="mb-4 flex items-center justify-between">
      <h3 className="flex items-center gap-2 font-bold text-navy"><Icon className="h-4 w-4 text-electric" />{title}</h3>
      {aside}
    </div>
    {children}
  </section>
);
const Field = ({ label, value, long }) => (
  <div className={long ? 'sm:col-span-2' : ''}>
    <dt className="text-xs font-semibold uppercase tracking-wide text-muted">{label}</dt>
    <dd className={`mt-0.5 text-ink/85 ${long ? 'whitespace-pre-wrap leading-relaxed' : ''}`}>{value || <span className="text-slate-400">Not provided</span>}</dd>
  </div>
);
const Chips = ({ items }) => (
  <div className="flex flex-wrap gap-1.5">
    {(items && items.length) ? items.map((s) => <span key={s} className="rounded-full border border-slate-200 bg-white px-2.5 py-1 text-sm text-navy">{s}</span>) : <span className="text-slate-400">None selected</span>}
  </div>
);

/* --------------------------- send to company modal ------------------------- */
const COMPANIES = [...new Map(OPPORTUNITIES.map((o) => [o.company, { name: o.company, sector: o.sector }])).values()];

function SendToCompanyModal({ app, onClose, onSent }) {
  const [company, setCompany] = useState(app.opportunity?.company || '');
  const [roleTitle, setRoleTitle] = useState(app.opportunity?.roleTitle || '');
  const [busy, setBusy] = useState(false);
  const roles = useMemo(() => OPPORTUNITIES.filter((o) => o.company === company), [company]);

  const send = async () => {
    setBusy(true);
    await sendToCompany(app.id, { company, roleTitle, projectId: roles.find((r) => r.roleTitle === roleTitle)?.id });
    setBusy(false);
    onSent();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={onClose}>
      <motion.div initial={{ opacity: 0, y: 12, scale: 0.98 }} animate={{ opacity: 1, y: 0, scale: 1 }} className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-float" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between">
          <h3 className="flex items-center gap-2 text-lg font-bold text-navy"><Send className="h-5 w-5 text-purple-600" /> Send to company</h3>
          <button onClick={onClose} className="grid h-9 w-9 place-items-center rounded-lg text-muted hover:bg-surface"><X className="h-5 w-5" /></button>
        </div>
        <p className="mt-1 text-sm text-muted">Share <span className="font-semibold text-navy">{app.applicantName}</span>’s application with a company for a specific role.</p>

        <label className="mt-5 block text-sm font-semibold text-ink">1 · Select company</label>
        <select value={company} onChange={(e) => { setCompany(e.target.value); setRoleTitle(''); }} className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 shadow-sm focus:border-electric focus:outline-none focus:ring-2 focus:ring-electric/20">
          <option value="" disabled>Choose a company…</option>
          {COMPANIES.map((c) => <option key={c.name} value={c.name}>{c.name}</option>)}
        </select>

        <label className="mt-4 block text-sm font-semibold text-ink">2 · Select project / role</label>
        <select value={roleTitle} onChange={(e) => setRoleTitle(e.target.value)} disabled={!company} className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 shadow-sm focus:border-electric focus:outline-none focus:ring-2 focus:ring-electric/20 disabled:opacity-50">
          <option value="" disabled>Choose a role…</option>
          {roles.map((r) => <option key={r.id} value={r.roleTitle}>{r.roleTitle}</option>)}
        </select>

        <div className="mt-6 flex justify-end gap-2">
          <button onClick={onClose} className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-navy hover:bg-surface">Cancel</button>
          <button onClick={send} disabled={!company || !roleTitle || busy} className="inline-flex items-center gap-2 rounded-xl bg-purple-600 px-4 py-2 text-sm font-semibold text-white hover:bg-purple-700 disabled:opacity-50">
            <Send className="h-4 w-4" /> {busy ? 'Sending…' : 'Send application'}
          </button>
        </div>
      </motion.div>
    </div>
  );
}

export default function Review({ id, onBack }) {
  useStore();
  const a = getApplication(id);
  const [note, setNote] = useState('');
  const [showSend, setShowSend] = useState(false);
  if (!a) return <div className="p-10"><EmptyState title="Application not found" action={<button onClick={onBack} className="font-semibold text-electric">← Back</button>} /></div>;

  const f = a.details || {};
  const ev = a.aiEvaluation;
  const transitions = allowedTransitions(a.status);
  const act = (status) => setApplicationStatus(a.id, status);

  // The six primary admin decisions requested.
  const actions = [
    { status: 'shortlisted', label: 'Shortlist', icon: UserCheck, cls: 'bg-amber-500 hover:bg-amber-600' },
    { status: 'interview', label: 'Request Interview', icon: CalendarCheck, cls: 'bg-blue-600 hover:bg-blue-700' },
    { status: 'approved', label: 'Approve', icon: BadgeCheck, cls: 'bg-teal-600 hover:bg-teal-700' },
    { status: 'hold', label: 'Hold for Review', icon: PauseCircle, cls: 'bg-slate-500 hover:bg-slate-600' },
    { status: 'rejected', label: 'Reject', icon: XCircle, cls: 'bg-rose-500 hover:bg-rose-600' },
  ];

  return (
    <div className="min-h-screen bg-canvas">
      <Helmet><title>{a.applicantName} · Review · EkaNex Admin</title></Helmet>
      <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/90 backdrop-blur">
        <div className="container-px flex h-16 items-center gap-3">
          <button onClick={onBack} className="inline-flex items-center gap-1.5 text-sm font-semibold text-muted hover:text-navy"><ArrowLeft className="h-4 w-4" /> Back to console</button>
        </div>
      </header>

      <main className="container-px py-8">
        {/* Summary */}
        <div className="rounded-card border border-slate-200 bg-white p-6 shadow-card">
          <div className="flex flex-wrap items-start justify-between gap-6">
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-2xl font-extrabold tracking-tight text-navy">{a.applicantName}</h1>
                <StatusBadge status={a.status} />
              </div>
              <p className="mt-1 text-muted">{f.school || '—'} · {f.grade || '—'} · Applied {fmtDate(a.createdAt)} · <span className="font-mono text-xs">{a.shortId}</span></p>
              <p className="mt-1 text-sm text-ink/70">Applying for <span className="font-semibold text-navy">{a.opportunity?.roleTitle}</span> at <span className="font-semibold text-navy">{a.opportunity?.company}</span></p>
              {a.assignment && <p className="mt-2 inline-flex items-center gap-1.5 rounded-full bg-purple-50 px-3 py-1 text-sm font-semibold text-purple-700"><Building2 className="h-4 w-4" /> Sent to {a.assignment.company}{a.assignment.roleTitle ? ` · ${a.assignment.roleTitle}` : ''}</p>}
            </div>
            {ev && (
              <div className="flex items-center gap-4">
                <ScoreRing score={ev.overall} size={72} stroke={7} />
                <div>
                  <p className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-muted">Overall AI score <AiTag /></p>
                  <div className="mt-1"><RecommendationBadge value={ev.recommendation} /></div>
                  <p className="mt-1 max-w-xs text-xs text-muted">{ev.summary}</p>
                </div>
              </div>
            )}
          </div>

          <div className="mt-6 flex flex-wrap items-center gap-2 border-t border-slate-100 pt-5">
            {actions.map((b) => {
              const Icon = b.icon; const isCurrent = b.status === a.status;
              return <button key={b.status} disabled={isCurrent} onClick={() => act(b.status)} className={`inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold text-white transition-all disabled:cursor-not-allowed disabled:opacity-40 ${b.cls}`}><Icon className="h-4 w-4" /> {b.label}</button>;
            })}
            <button onClick={() => setShowSend(true)} className="inline-flex items-center gap-2 rounded-lg bg-purple-600 px-4 py-2 text-sm font-semibold text-white hover:bg-purple-700"><Send className="h-4 w-4" /> Send to Company</button>
            <label className="ml-auto flex items-center gap-2 text-sm">
              <span className="font-semibold text-muted">Set status</span>
              <select value={a.status} onChange={(e) => act(e.target.value)} className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-navy shadow-sm focus:border-electric focus:outline-none">
                <option value={a.status}>{statusMeta(a.status).label} (current)</option>
                {transitions.map((s) => <option key={s} value={s}>{statusMeta(s).label}</option>)}
              </select>
            </label>
          </div>
        </div>

        <div className="mt-6 grid gap-6 lg:grid-cols-3">
          {/* Application content */}
          <div className="space-y-6 lg:col-span-2">
            <Section icon={GraduationCap} title="Academic profile">
              <dl className="grid gap-4 sm:grid-cols-2">
                <Field label="School" value={f.school} /><Field label="Curriculum" value={f.curriculum} />
                <Field label="Grade" value={f.grade} /><Field label="Graduation year" value={f.gradYear} />
                <Field label="Performance" value={f.performance} long />
                <Field label="Strongest subjects" value={f.strongestSubjects} /><Field label="Subjects of interest" value={f.interestSubjects} />
                <Field label="Achievements" value={f.achievements} long />
              </dl>
            </Section>
            <Section icon={Wrench} title="Skills">
              <div className="space-y-4">
                <div><p className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-muted">Selected skills</p><Chips items={f.skills} /></div>
                <dl className="grid gap-4 sm:grid-cols-2"><Field label="Top skills (described)" value={f.topSkills} long /><Field label="Certifications" value={f.certifications} /><Field label="Self-rated confidence" value={f.confidence ? `${f.confidence}/5` : null} /></dl>
              </div>
            </Section>
            <Section icon={Briefcase} title="Experience">
              {(f.experiences && f.experiences.length) ? (
                <ul className="space-y-3">{f.experiences.map((e, i) => (
                  <li key={i} className="rounded-lg border border-slate-100 bg-surface/50 p-3 text-sm">
                    {typeof e === 'string' ? e : (<><p className="font-semibold text-navy">{e.role || 'Role'} {e.org ? <span className="font-normal text-muted">· {e.org}</span> : null}</p>{e.detail && <p className="mt-0.5 text-ink/75">{e.detail}</p>}</>)}
                  </li>))}
                </ul>
              ) : <p className="text-sm text-muted">No prior experience listed — expected for a first project.</p>}
            </Section>
            <Section icon={LinkIcon} title="Portfolio & links">
              <dl className="grid gap-4 sm:grid-cols-2">
                <Field label="Resume" value={f.resume} /><Field label="LinkedIn" value={f.linkedin} /><Field label="GitHub" value={f.github} />
                <Field label="Website" value={f.website} /><Field label="Project links" value={f.projectLinks} long /><Field label="Work samples" value={f.workSamples} long />
              </dl>
            </Section>
            <Section icon={Target} title="Project preferences">
              <div className="space-y-4">
                <div><p className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-muted">Preferred project types</p><Chips items={f.projectTypes} /></div>
                <dl className="grid gap-4 sm:grid-cols-2"><Field label="Project interest" value={f.projectInterest} long /><Field label="What they want to learn" value={f.learn} long /><Field label="Team preference" value={f.teamMode} /><Field label="Preferred team role" value={f.teamRole} /></dl>
              </div>
            </Section>
            <Section icon={CalendarClock} title="Availability">
              <dl className="grid gap-4 sm:grid-cols-2">
                <Field label="Start date" value={f.startDate} /><Field label="Duration" value={f.duration} /><Field label="Hours per week" value={f.hoursWeek} />
                <Field label="Available over holidays" value={f.holidays} /><Field label="Working days" value={(f.workingDays || []).join(', ')} /><Field label="Working hours" value={(f.workingHours || []).join(', ')} />
              </dl>
            </Section>
            <Section icon={Heart} title="Motivation">
              <dl className="grid gap-4"><Field label="Why this project" value={f.motivation} long /><Field label="Why you" value={f.whyYou} long /></dl>
            </Section>
            <Section icon={Brain} title="Problem-solving response">
              <p className="whitespace-pre-wrap leading-relaxed text-ink/85">{f.caseResponse || <span className="text-slate-400">Not provided</span>}</p>
            </Section>
          </div>

          {/* AI, notes, timeline */}
          <div className="space-y-6">
            <Section icon={Sparkles} title="AI evaluation" aside={<button onClick={() => reEvaluate(a.id)} className="inline-flex items-center gap-1 text-xs font-semibold text-electric hover:underline"><RefreshCw className="h-3.5 w-3.5" /> Re-run</button>}>
              {ev ? (
                <div className="space-y-5">
                  <div className="flex items-center gap-3 rounded-lg bg-violet-50 p-3"><AiTag /><p className="text-xs text-violet-800">Generated by <span className="font-semibold">{ev.model}</span>. Advisory only — you make the final decision.</p></div>
                  <div className="space-y-3">{ev.scores.map((s) => <ScoreBar key={s.key} label={s.label} score={s.score} reason={s.reason} />)}</div>
                  <div><p className="mb-2 flex items-center gap-1.5 font-semibold text-navy"><Star className="h-4 w-4 text-emerald-500" /> Strongest aspects</p><ul className="space-y-1.5 text-sm text-ink/80">{ev.strengths.map((s) => <li key={s.label}>• <span className="font-semibold">{s.label}</span> ({s.score}) — {s.reason}</li>)}</ul></div>
                  <div><p className="mb-2 flex items-center gap-1.5 font-semibold text-navy"><AlertTriangle className="h-4 w-4 text-amber-500" /> Areas of concern</p><ul className="space-y-1.5 text-sm text-ink/80">{ev.concerns.map((s) => <li key={s.label}>• <span className="font-semibold">{s.label}</span> ({s.score}) — {s.reason}</li>)}</ul></div>
                  <div className="grid gap-3 rounded-lg bg-surface/60 p-3 text-sm">
                    <div><span className="font-semibold text-navy">Recommended role:</span> {ev.recommendedRole}</div>
                    <div><span className="font-semibold text-navy">Recommended project types:</span> {(ev.recommendedProjectTypes || []).join(', ') || '—'}</div>
                    <div><span className="font-semibold text-navy">Overall recommendation:</span> <RecommendationBadge value={ev.recommendation} /></div>
                  </div>
                  <div><p className="mb-2 flex items-center gap-1.5 font-semibold text-navy"><MessageSquareQuote className="h-4 w-4 text-electric" /> Suggested interview questions</p><ol className="list-decimal space-y-1.5 pl-5 text-sm text-ink/80">{(ev.interviewQuestions || []).map((q, i) => <li key={i}>{q}</li>)}</ol></div>
                  <div className="rounded-lg border border-slate-200 p-3"><p className="flex items-center gap-1.5 text-xs font-semibold text-navy"><ShieldCheck className="h-4 w-4 text-forest" /> Fairness</p><p className="mt-1 text-xs text-muted">{ev.fairnessNote}</p><p className="mt-2 text-[11px] text-slate-400">Excluded from scoring: {PROTECTED_EXCLUDED.join(', ')}.</p></div>
                </div>
              ) : <EmptyState icon={Sparkles} title="Not evaluated yet" compact />}
            </Section>

            <Section icon={StickyNote} title="Admin notes">
              <div className="space-y-3">
                {(a.notes && a.notes.length) ? a.notes.map((n) => (<div key={n.id} className="rounded-lg border border-slate-100 bg-surface/50 p-3 text-sm"><p className="text-ink/85">{n.text}</p><p className="mt-1 text-[11px] text-slate-400">{n.author} · {timeAgo(n.at)}</p></div>)) : <p className="text-sm text-muted">No notes yet. Notes are private to EkaNex staff.</p>}
                <div className="flex gap-2">
                  <input value={note} onChange={(e) => setNote(e.target.value)} placeholder="Add a private note…" className="flex-1 rounded-lg border border-slate-200 px-3 py-2 text-sm shadow-sm focus:border-electric focus:outline-none focus:ring-2 focus:ring-electric/20" onKeyDown={(e) => { if (e.key === 'Enter') { addAdminNote(a.id, note); setNote(''); } }} />
                  <button onClick={() => { addAdminNote(a.id, note); setNote(''); }} className="inline-flex items-center gap-1 rounded-lg bg-navy px-3 py-2 text-sm font-semibold text-white hover:bg-navy-800"><Plus className="h-4 w-4" /> Add</button>
                </div>
              </div>
            </Section>

            <Section icon={History} title="Application timeline">
              <ol className="relative space-y-4 border-l-2 border-slate-100 pl-5">
                {[...a.history].reverse().map((h, i) => (
                  <li key={i} className="relative">
                    <span className={`absolute -left-[26px] top-1 h-3 w-3 rounded-full ring-4 ring-white ${statusMeta(h.status).dot}`} />
                    <p className="text-sm font-semibold text-navy">{statusMeta(h.status).label}</p>
                    <p className="text-xs text-muted">{h.note}</p>
                    <p className="text-[11px] text-slate-400">{fmtDate(h.at)} · {timeAgo(h.at)} · by {h.by}</p>
                  </li>
                ))}
              </ol>
            </Section>
          </div>
        </div>
      </main>

      <AnimatePresence>
        {showSend && <SendToCompanyModal app={a} onClose={() => setShowSend(false)} onSent={() => setShowSend(false)} />}
      </AnimatePresence>
    </div>
  );
}
