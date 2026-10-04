import { useMemo, useState } from 'react';
import { Search, Download, LayoutGrid, BarChart3, Inbox, Users, Star, Trophy, Send } from 'lucide-react';
import { listApplications, getAnalytics, listDispatches } from '../lib/api';
import { ALL_STATUSES, statusMeta } from '../lib/status';
import { StatusBadge, RecommendationBadge, AiTag, Stat, BarChart, EmptyState, fmtDate } from '../components/ui';

const FilterSelect = ({ label, value, onChange, options }) => (
  <label className="flex flex-col gap-1">
    <span className="text-[11px] font-semibold uppercase tracking-wide text-muted">{label}</span>
    <select value={value} onChange={(e) => onChange(e.target.value)} className="rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-sm text-ink shadow-sm focus:border-electric focus:outline-none focus:ring-2 focus:ring-electric/20">
      {options.map((o) => <option key={o.value ?? o} value={o.value ?? o}>{o.label ?? o}</option>)}
    </select>
  </label>
);
const uniqueSorted = (apps, pick) => [...new Set(apps.map(pick).filter(Boolean))].sort();

export function ApplicationsView({ onOpen }) {
  const apps = listApplications();
  const [q, setQ] = useState('');
  const [status, setStatus] = useState('all');
  const [grade, setGrade] = useState('all');
  const [school, setSchool] = useState('all');
  const [skill, setSkill] = useState('all');
  const [project, setProject] = useState('all');
  const [availability, setAvailability] = useState('all');
  const [rec, setRec] = useState('all');
  const [minScore, setMinScore] = useState(0);
  const [sort, setSort] = useState('date_desc');

  const schools = useMemo(() => uniqueSorted(apps, (a) => a.details?.school), [apps]);
  const grades = useMemo(() => uniqueSorted(apps, (a) => a.details?.grade), [apps]);
  const projects = useMemo(() => uniqueSorted(apps, (a) => a.opportunity?.company), [apps]);
  const availabilities = useMemo(() => uniqueSorted(apps, (a) => a.details?.hoursWeek), [apps]);
  const skills = useMemo(() => [...new Set(apps.flatMap((a) => a.details?.skills || []))].sort(), [apps]);

  const filtered = useMemo(() => {
    const list = apps.filter((a) => {
      const score = a.aiEvaluation?.overall ?? 0;
      if (q) {
        const hay = `${a.applicantName} ${a.details?.school} ${a.opportunity?.company} ${a.opportunity?.roleTitle} ${(a.details?.skills || []).join(' ')} ${a.shortId}`.toLowerCase();
        if (!hay.includes(q.toLowerCase())) return false;
      }
      if (status !== 'all' && a.status !== status) return false;
      if (grade !== 'all' && a.details?.grade !== grade) return false;
      if (school !== 'all' && a.details?.school !== school) return false;
      if (project !== 'all' && a.opportunity?.company !== project) return false;
      if (availability !== 'all' && a.details?.hoursWeek !== availability) return false;
      if (skill !== 'all' && !(a.details?.skills || []).includes(skill)) return false;
      if (rec !== 'all' && a.aiEvaluation?.recommendation !== rec) return false;
      if (score < minScore) return false;
      return true;
    });
    const s = {
      date_desc: (a, b) => (a.createdAt < b.createdAt ? 1 : -1),
      date_asc: (a, b) => (a.createdAt > b.createdAt ? 1 : -1),
      score_desc: (a, b) => (b.aiEvaluation?.overall ?? 0) - (a.aiEvaluation?.overall ?? 0),
      score_asc: (a, b) => (a.aiEvaluation?.overall ?? 0) - (b.aiEvaluation?.overall ?? 0),
      name_asc: (a, b) => a.applicantName.localeCompare(b.applicantName),
    };
    return [...list].sort(s[sort] || s.date_desc);
  }, [apps, q, status, grade, school, project, availability, skill, rec, minScore, sort]);

  const exportCsv = () => {
    const cols = ['ID', 'Student', 'Email', 'School', 'Grade', 'Company', 'Role', 'Skills', 'AI Score', 'Recommendation', 'Status', 'Applied'];
    const rows = filtered.map((a) => [a.shortId, a.applicantName, a.applicantEmail, a.details?.school, a.details?.grade, a.opportunity?.company, a.opportunity?.roleTitle, (a.details?.skills || []).join('; '), a.aiEvaluation?.overall ?? '', a.aiEvaluation?.recommendationLabel ?? '', statusMeta(a.status).label, fmtDate(a.createdAt)]);
    const esc = (v) => `"${String(v ?? '').replace(/"/g, '""')}"`;
    const csv = [cols, ...rows].map((r) => r.map(esc).join(',')).join('\n');
    const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv' }));
    const a = document.createElement('a'); a.href = url; a.download = `ekanex-applications-${new Date().toISOString().slice(0, 10)}.csv`; a.click(); URL.revokeObjectURL(url);
  };
  const opt = (list) => ['all', ...list].map((v) => ({ value: v, label: v === 'all' ? 'All' : v }));

  return (
    <div>
      <div className="flex flex-wrap items-end gap-3 rounded-card border border-slate-200 bg-white p-4 shadow-card">
        <label className="relative min-w-[220px] flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search name, school, company, skill, ID…" className="w-full rounded-lg border border-slate-200 bg-white py-2 pl-9 pr-3 text-sm shadow-sm focus:border-electric focus:outline-none focus:ring-2 focus:ring-electric/20" />
        </label>
        <FilterSelect label="Status" value={status} onChange={setStatus} options={[{ value: 'all', label: 'All' }, ...ALL_STATUSES.map((s) => ({ value: s, label: statusMeta(s).label }))]} />
        <FilterSelect label="Grade" value={grade} onChange={setGrade} options={opt(grades)} />
        <FilterSelect label="School" value={school} onChange={setSchool} options={opt(schools)} />
        <FilterSelect label="Skill" value={skill} onChange={setSkill} options={opt(skills)} />
        <FilterSelect label="Project" value={project} onChange={setProject} options={opt(projects)} />
        <FilterSelect label="Availability" value={availability} onChange={setAvailability} options={opt(availabilities)} />
        <FilterSelect label="AI rec." value={rec} onChange={setRec} options={[{ value: 'all', label: 'All' }, { value: 'strongly_shortlist', label: 'Strongly Shortlist' }, { value: 'shortlist', label: 'Shortlist' }, { value: 'review_manually', label: 'Review Manually' }, { value: 'do_not_shortlist', label: 'Do Not Shortlist' }]} />
        <label className="flex flex-col gap-1">
          <span className="text-[11px] font-semibold uppercase tracking-wide text-muted">Min AI score: {minScore}</span>
          <input type="range" min="0" max="100" value={minScore} onChange={(e) => setMinScore(Number(e.target.value))} className="w-28 accent-electric" />
        </label>
        <FilterSelect label="Sort" value={sort} onChange={setSort} options={[{ value: 'date_desc', label: 'Newest' }, { value: 'date_asc', label: 'Oldest' }, { value: 'score_desc', label: 'AI score ↓' }, { value: 'score_asc', label: 'AI score ↑' }, { value: 'name_asc', label: 'Name A–Z' }]} />
        <button onClick={exportCsv} className="ml-auto inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-navy shadow-sm transition-colors hover:bg-surface"><Download className="h-4 w-4" /> Export CSV</button>
      </div>

      <p className="mt-3 text-sm text-muted">{filtered.length} of {apps.length} applications</p>

      <div className="mt-2 overflow-x-auto rounded-card border border-slate-200 bg-white shadow-card">
        <table className="w-full min-w-[980px] text-left text-sm">
          <thead>
            <tr className="border-b border-slate-200 bg-surface text-xs uppercase tracking-wide text-muted">
              <th className="px-4 py-3 font-semibold">Student</th>
              <th className="px-4 py-3 font-semibold">School</th>
              <th className="px-4 py-3 font-semibold">Grade</th>
              <th className="px-4 py-3 font-semibold">Skills</th>
              <th className="px-4 py-3 font-semibold">Project / Company</th>
              <th className="px-4 py-3 font-semibold"><span className="inline-flex items-center gap-1">AI score <AiTag /></span></th>
              <th className="px-4 py-3 font-semibold">Status</th>
              <th className="px-4 py-3 font-semibold">Applied</th>
              <th className="px-4 py-3 text-right font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((a) => (
              <tr key={a.id} className="border-b border-slate-100 transition-colors last:border-0 hover:bg-surface/60">
                <td className="px-4 py-3">
                  <button onClick={() => onOpen(a.id)} className="text-left font-semibold text-navy hover:text-electric">{a.applicantName}</button>
                  <p className="text-xs text-muted">{a.shortId}</p>
                </td>
                <td className="px-4 py-3 text-ink/80">{a.details?.school || '—'}</td>
                <td className="px-4 py-3 text-ink/80">{a.details?.grade || '—'}</td>
                <td className="px-4 py-3">
                  <div className="flex max-w-[180px] flex-wrap gap-1">
                    {(a.details?.skills || []).slice(0, 3).map((s) => <span key={s} className="rounded bg-slate-100 px-1.5 py-0.5 text-[11px] text-ink/70">{s}</span>)}
                    {(a.details?.skills || []).length > 3 && <span className="text-[11px] text-muted">+{a.details.skills.length - 3}</span>}
                  </div>
                </td>
                <td className="px-4 py-3"><p className="font-medium text-navy">{a.opportunity?.roleTitle}</p><p className="text-xs text-muted">{a.opportunity?.company}</p></td>
                <td className="px-4 py-3">
                  {a.aiEvaluation ? <div className="flex items-center gap-2"><span className="font-bold text-navy">{a.aiEvaluation.overall}</span><RecommendationBadge value={a.aiEvaluation.recommendation} /></div> : <span className="text-muted">—</span>}
                </td>
                <td className="px-4 py-3"><StatusBadge status={a.status} /></td>
                <td className="px-4 py-3 text-ink/70">{fmtDate(a.createdAt)}</td>
                <td className="px-4 py-3 text-right"><button onClick={() => onOpen(a.id)} className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold text-navy transition-colors hover:bg-navy hover:text-white">Review</button></td>
              </tr>
            ))}
          </tbody>
        </table>
        {!filtered.length && <div className="p-8"><EmptyState icon={Inbox} title="No applications match these filters" body="Try clearing a filter or lowering the minimum AI score." compact /></div>}
      </div>
    </div>
  );
}

const Panel = ({ title, icon: Icon, children, className = '' }) => (
  <section className={`rounded-card border border-slate-200 bg-white p-5 shadow-card ${className}`}>
    <h3 className="mb-4 flex items-center gap-2 font-bold text-navy">{Icon && <Icon className="h-4 w-4 text-electric" />}{title}</h3>
    {children}
  </section>
);

export function AnalyticsView() {
  const a = getAnalytics();
  const dispatches = listDispatches();
  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Stat label="Total applications" value={a.total} />
        <Stat label="This week" value={a.thisWeek} tone="text-electric" />
        <Stat label="Average AI score" value={a.avgScore} sub="across evaluated applications" tone="text-violet-600" />
        <Stat label="Sent to companies" value={dispatches.length} sub={`Shortlist rate ${a.shortlistRate}%`} tone="text-purple-600" />
      </div>
      <div className="grid gap-5 lg:grid-cols-2">
        <Panel title="Applications by status" icon={LayoutGrid}><BarChart data={a.byStatus} color="bg-indigo-500" /></Panel>
        <Panel title="Applications by project" icon={Trophy}><BarChart data={a.byProject} color="bg-electric" /></Panel>
        <Panel title="Applications by school" icon={Users}><BarChart data={a.bySchool} color="bg-forest" /></Panel>
        <Panel title="Applications by grade" icon={LayoutGrid}><BarChart data={a.byGrade} color="bg-amber-500" /></Panel>
        <Panel title="Top skills among applicants" icon={Star} className="lg:col-span-2"><BarChart data={a.topSkills} color="bg-violet-500" /></Panel>
      </div>
    </div>
  );
}
