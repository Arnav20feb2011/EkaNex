import { useEffect, useState } from 'react';
import { Building2, Briefcase, Plus, ArrowLeft, Loader2, Check, Pencil, Globe } from 'lucide-react';
import { adminListCompanies, adminListProjects, saveCompany, saveProject, isLive } from '../lib/api';
import { EmptyState, Spinner } from '../components/ui';

/* ------------------------------- field inputs ------------------------------ */
const inputCls = 'w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm shadow-sm focus:border-electric focus:outline-none focus:ring-2 focus:ring-electric/20';
const Label = ({ children, hint }) => (
  <span className="mb-1 block text-xs font-semibold uppercase tracking-wide text-muted">{children}{hint ? <span className="ml-2 font-normal normal-case text-slate-400">{hint}</span> : null}</span>
);
function TextF({ label, value, onChange, type = 'text', hint, placeholder, span }) {
  return <label className={`block ${span ? 'sm:col-span-2' : ''}`}><Label hint={hint}>{label}</Label><input type={type} value={value ?? ''} placeholder={placeholder} onChange={(e) => onChange(type === 'number' ? (e.target.value === '' ? null : Number(e.target.value)) : e.target.value)} className={inputCls} /></label>;
}
function AreaF({ label, value, onChange, rows = 3, hint, span = true }) {
  return <label className={`block ${span ? 'sm:col-span-2' : ''}`}><Label hint={hint}>{label}</Label><textarea rows={rows} value={value ?? ''} onChange={(e) => onChange(e.target.value)} className={inputCls} /></label>;
}
function ListF({ label, value, onChange, hint = 'one per line' }) {
  return <AreaF label={label} hint={hint} value={(value || []).join('\n')} onChange={(v) => onChange(v.split('\n').map((x) => x.trim()).filter(Boolean))} />;
}
function SelectF({ label, value, onChange, options, hint }) {
  return <label className="block"><Label hint={hint}>{label}</Label><select value={value ?? ''} onChange={(e) => onChange(e.target.value)} className={inputCls}><option value="">Select…</option>{options.map((o) => <option key={o.value ?? o} value={o.value ?? o}>{o.label ?? o}</option>)}</select></label>;
}
function CheckF({ label, value, onChange }) {
  return <label className="inline-flex items-center gap-2 text-sm font-semibold text-navy"><input type="checkbox" checked={!!value} onChange={(e) => onChange(e.target.checked)} className="h-4 w-4 accent-electric" /> {label}</label>;
}
function WeeklyF({ value, onChange }) {
  const text = (value || []).map((w) => `${w.title || ''}${w.detail ? ` | ${w.detail}` : ''}`).join('\n');
  return <AreaF label="Weekly plan" rows={6} hint="one week per line: Title | what happens that week"
    value={text} onChange={(v) => onChange(v.split('\n').map((l) => l.trim()).filter(Boolean).map((l, i) => { const [t, ...d] = l.split('|'); return { week: i + 1, title: (t || '').trim(), detail: d.join('|').trim() }; }))} />;
}
const Group = ({ title, children }) => (
  <div className="rounded-card border border-slate-200 bg-white p-5 shadow-card">
    <h4 className="mb-4 font-bold text-navy">{title}</h4>
    <div className="grid gap-4 sm:grid-cols-2">{children}</div>
  </div>
);

/* --------------------------------- forms ----------------------------------- */
function CompanyForm({ row, onDone, onCancel }) {
  const [f, setF] = useState(() => ({ verified: true, achievements: [], ...row }));
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');
  const set = (k) => (v) => setF((s) => ({ ...s, [k]: v }));
  const submit = async () => {
    if (!f.name?.trim()) { setErr('Company name is required.'); return; }
    setBusy(true); const res = await saveCompany(f); setBusy(false);
    if (res.ok) onDone(); else setErr(res.error || 'Save failed.');
  };
  return (
    <div className="space-y-5">
      <button onClick={onCancel} className="inline-flex items-center gap-1.5 text-sm font-semibold text-muted hover:text-navy"><ArrowLeft className="h-4 w-4" /> Back to list</button>
      <h3 className="text-xl font-bold text-navy">{row.id ? 'Edit company' : 'New company'}</h3>
      <Group title="Company">
        <TextF label="Name" value={f.name} onChange={set('name')} />
        <TextF label="Industry / sector" value={f.sector} onChange={set('sector')} />
        <AreaF label="Description" value={f.description} onChange={set('description')} />
        <AreaF label="Mission" value={f.mission} onChange={set('mission')} rows={2} />
        <TextF label="Website" value={f.website} onChange={set('website')} placeholder="https://…" />
        <TextF label="Location" value={f.location} onChange={set('location')} />
        <TextF label="Founded year" type="number" value={f.founded_year} onChange={set('founded_year')} />
        <TextF label="Employees" value={f.employee_count} onChange={set('employee_count')} placeholder="e.g. 11–50" />
        <TextF label="Company stage" value={f.company_stage} onChange={set('company_stage')} placeholder="e.g. Growth-stage SME" />
        <ListF label="Highlights / achievements" value={f.achievements} onChange={set('achievements')} />
        <div className="sm:col-span-2"><CheckF label="Verified partner" value={f.verified} onChange={set('verified')} /></div>
      </Group>
      {err && <p className="text-sm text-rose-600">{err}</p>}
      <div className="flex gap-2"><button onClick={submit} disabled={busy} className="inline-flex items-center gap-2 rounded-xl bg-navy px-5 py-2.5 text-sm font-semibold text-white hover:bg-navy-800 disabled:opacity-70">{busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />} Save company</button><button onClick={onCancel} className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-navy hover:bg-surface">Cancel</button></div>
    </div>
  );
}

function ProjectForm({ row, companies, onDone, onCancel }) {
  const [f, setF] = useState(() => ({ is_published: true, skills: [], preferred_skills: [], objectives: [], deliverables: [], benefits: [], learning_outcomes: [], weekly_plan: [], work_type: 'Remote', seat_status: 'Seat not yet confirmed', ...row }));
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');
  const set = (k) => (v) => setF((s) => ({ ...s, [k]: v }));
  const submit = async () => {
    if (!f.company_id) { setErr('Pick a company.'); return; }
    if (!f.role_title?.trim()) { setErr('Role title is required.'); return; }
    setBusy(true); const res = await saveProject(f); setBusy(false);
    if (res.ok) onDone(); else setErr(res.error || 'Save failed.');
  };
  return (
    <div className="space-y-5">
      <button onClick={onCancel} className="inline-flex items-center gap-1.5 text-sm font-semibold text-muted hover:text-navy"><ArrowLeft className="h-4 w-4" /> Back to list</button>
      <h3 className="text-xl font-bold text-navy">{row.id ? 'Edit project' : 'New project'}</h3>

      <Group title="Basics">
        <SelectF label="Company" value={f.company_id} onChange={set('company_id')} options={companies.map((c) => ({ value: c.id, label: c.name }))} />
        <TextF label="Role title" value={f.role_title} onChange={set('role_title')} />
        <TextF label="One-line tagline" value={f.role_short} onChange={set('role_short')} span />
        <AreaF label="Role description" value={f.role_description} onChange={set('role_description')} />
        <TextF label="Legacy id (slug)" value={f.legacy_id} onChange={set('legacy_id')} hint="optional, unique" />
        <div><CheckF label="Published (visible to students)" value={f.is_published} onChange={set('is_published')} /></div>
      </Group>

      <Group title="The problem & goals">
        <AreaF label="The problem" value={f.problem} onChange={set('problem')} />
        <AreaF label="Why it matters" value={f.why_it_matters} onChange={set('why_it_matters')} rows={2} />
        <AreaF label="Why a student" value={f.why_students} onChange={set('why_students')} rows={2} />
        <ListF label="Objectives" value={f.objectives} onChange={set('objectives')} />
        <ListF label="Deliverables" value={f.deliverables} onChange={set('deliverables')} />
      </Group>

      <Group title="Skills & who it's for">
        <ListF label="Required skills" value={f.skills} onChange={set('skills')} />
        <ListF label="Preferred skills" value={f.preferred_skills} onChange={set('preferred_skills')} />
        <TextF label="Recommended grade" value={f.recommended_grade} onChange={set('recommended_grade')} placeholder="e.g. Grade 11–12" />
        <TextF label="Relevant subjects" value={f.relevant_subjects} onChange={set('relevant_subjects')} />
        <TextF label="Teamwork" value={f.teamwork} onChange={set('teamwork')} placeholder="e.g. Pair or small team" />
      </Group>

      <Group title="Value to the student">
        <ListF label="Benefits (specific)" value={f.benefits} onChange={set('benefits')} />
        <ListF label="What they'll learn" value={f.learning_outcomes} onChange={set('learning_outcomes')} />
        <div className="sm:col-span-2"><WeeklyF value={f.weekly_plan} onChange={set('weekly_plan')} /></div>
      </Group>

      <Group title="Logistics">
        <SelectF label="Work type" value={f.work_type} onChange={set('work_type')} options={['Remote', 'Hybrid', 'On-site']} />
        <TextF label="Work arrangement (detail)" value={f.work_detail} onChange={set('work_detail')} placeholder="e.g. Remote + 2 site visits" />
        <TextF label="Location" value={f.location} onChange={set('location')} />
        <TextF label="Window label" value={f.window_label} onChange={set('window_label')} placeholder="e.g. 7-18 Dec 2026" />
        <TextF label="Start date" type="date" value={f.starts_on} onChange={set('starts_on')} />
        <TextF label="End date" type="date" value={f.ends_on} onChange={set('ends_on')} />
        <TextF label="Duration (weeks)" type="number" value={f.duration_weeks} onChange={set('duration_weeks')} />
        <TextF label="Hours / week" value={f.hours_per_week} onChange={set('hours_per_week')} placeholder="e.g. 6–8 hours" />
        <TextF label="Team size" value={f.team_size} onChange={set('team_size')} />
        <TextF label="Supervisor" value={f.supervisor} onChange={set('supervisor')} />
        <TextF label="Mentor name" value={f.mentor_name} onChange={set('mentor_name')} />
        <TextF label="Mentor role" value={f.mentor_role} onChange={set('mentor_role')} />
        <TextF label="Seat status" value={f.seat_status} onChange={set('seat_status')} />
      </Group>

      {err && <p className="text-sm text-rose-600">{err}</p>}
      <div className="flex gap-2"><button onClick={submit} disabled={busy} className="inline-flex items-center gap-2 rounded-xl bg-navy px-5 py-2.5 text-sm font-semibold text-white hover:bg-navy-800 disabled:opacity-70">{busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />} Save project</button><button onClick={onCancel} className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-navy hover:bg-surface">Cancel</button></div>
    </div>
  );
}

/* --------------------------------- list ------------------------------------ */
export default function ContentEditor() {
  const [loading, setLoading] = useState(true);
  const [companies, setCompanies] = useState([]);
  const [projects, setProjects] = useState([]);
  const [editing, setEditing] = useState(null); // { type:'company'|'project', row }

  const load = async () => {
    setLoading(true);
    const [c, p] = await Promise.all([adminListCompanies(), adminListProjects()]);
    setCompanies(c); setProjects(p); setLoading(false);
  };
  useEffect(() => { load(); }, []);
  const done = () => { setEditing(null); load(); };

  if (!isLive()) return <EmptyState icon={Building2} title="Content editing needs the live backend" body="Run the admin app against Supabase (npm run dev / deployed) to create and edit companies and projects." />;
  if (loading) return <div className="flex items-center justify-center py-20 text-muted"><Spinner className="h-6 w-6 text-electric" /><span className="ml-3">Loading content…</span></div>;

  if (editing?.type === 'company') return <CompanyForm row={editing.row} onDone={done} onCancel={() => setEditing(null)} />;
  if (editing?.type === 'project') return <ProjectForm row={editing.row} companies={companies} onDone={done} onCancel={() => setEditing(null)} />;

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-muted">{companies.length} companies · {projects.length} projects</p>
        <div className="flex gap-2">
          <button onClick={() => setEditing({ type: 'company', row: {} })} className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-navy hover:bg-surface"><Plus className="h-4 w-4" /> Company</button>
          <button onClick={() => setEditing({ type: 'project', row: {} })} className="inline-flex items-center gap-2 rounded-lg bg-navy px-3 py-2 text-sm font-semibold text-white hover:bg-navy-800"><Plus className="h-4 w-4" /> Project</button>
        </div>
      </div>

      {companies.length === 0 ? <EmptyState icon={Building2} title="No companies yet" body="Add your first company, then add its projects." /> : (
        <div className="space-y-4">
          {companies.map((c) => {
            const cps = projects.filter((p) => p.company_id === c.id);
            return (
              <div key={c.id} className="rounded-card border border-slate-200 bg-white p-5 shadow-card">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <p className="flex items-center gap-2 font-bold text-navy"><Building2 className="h-4 w-4 text-electric" /> {c.name} {c.verified && <span className="rounded-full bg-electric/10 px-2 py-0.5 text-[11px] font-semibold text-electric">Verified</span>}</p>
                    <p className="text-xs text-muted">{c.sector || 'No industry set'}{c.website ? ' · ' : ''}{c.website && <a href={c.website.startsWith('http') ? c.website : `https://${c.website}`} target="_blank" rel="noreferrer" className="text-electric hover:underline"><Globe className="mr-0.5 inline h-3 w-3" />site</a>}</p>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => setEditing({ type: 'company', row: c })} className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold text-navy hover:bg-surface"><Pencil className="h-3.5 w-3.5" /> Edit</button>
                    <button onClick={() => setEditing({ type: 'project', row: { company_id: c.id } })} className="inline-flex items-center gap-1 rounded-lg bg-navy px-3 py-1.5 text-xs font-semibold text-white hover:bg-navy-800"><Plus className="h-3.5 w-3.5" /> Project</button>
                  </div>
                </div>
                {cps.length > 0 && (
                  <ul className="mt-3 divide-y divide-slate-100 border-t border-slate-100">
                    {cps.map((p) => (
                      <li key={p.id} className="flex items-center justify-between gap-3 py-2.5">
                        <div className="min-w-0">
                          <p className="truncate font-semibold text-navy">{p.role_title} {!p.is_published && <span className="rounded bg-slate-100 px-1.5 py-0.5 text-[10px] font-semibold text-slate-500">Draft</span>}</p>
                          <p className="truncate text-xs text-muted">{p.role_short || p.work_type}</p>
                        </div>
                        <button onClick={() => setEditing({ type: 'project', row: p })} className="inline-flex shrink-0 items-center gap-1 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold text-navy hover:bg-navy hover:text-white"><Pencil className="h-3.5 w-3.5" /> Edit</button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
