import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import {
  LogOut, Building2, Briefcase, Users, Star, Trophy, Inbox, Mail, ArrowRight, Search,
} from 'lucide-react';
import { LogoMark } from '../components/Logo';
import { getOrgWorkspace, signOut } from '../lib/api';
import { StatusBadge, EmptyState, fmtDate, timeAgo } from '../components/ui';
import { statusMeta } from '../lib/status';
import { SITE } from '../data/site';

function StatCard({ label, value, Icon, ring }) {
  return (
    <div className="flex items-center justify-between rounded-xl border border-slate-200 bg-white p-4 shadow-card">
      <div><p className="text-xs font-semibold uppercase tracking-wide text-muted">{label}</p><p className="mt-1 text-3xl font-extrabold text-navy">{value}</p></div>
      <span className={`grid h-11 w-11 place-items-center rounded-xl ${ring}`}><Icon className="h-5 w-5" /></span>
    </div>
  );
}

// Shown when the org account isn't yet linked to a company (the one remaining
// backend step, performed by an EkaNex admin).
function SetupState({ orgName }) {
  const href = `mailto:${SITE.email}?subject=${encodeURIComponent(`Connect our organization workspace — ${orgName || ''}`)}&body=${encodeURIComponent(`Hi EkaNex team,\n\nPlease connect our organization account to our company profile so we can review applications to our roles.\n\nOrganization: ${orgName || ''}\n\nThanks!`)}`;
  return (
    <div className="rounded-card border border-slate-200 bg-white p-8 text-center shadow-card">
      <span className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-electric/10 text-electric"><Building2 className="h-7 w-7" /></span>
      <h2 className="mt-5 text-xl font-bold text-navy">Your organization workspace is almost ready</h2>
      <p className="mx-auto mt-2 max-w-md text-sm text-muted">
        To protect student data, applications are only released to a verified company. An EkaNex admin links your account to your
        company profile — then your posted roles, received applications, shortlisted and selected candidates appear here automatically.
      </p>
      <a href={href} className="mt-6 inline-flex items-center gap-2 rounded-xl bg-electric px-5 py-2.5 font-semibold text-white hover:bg-electric-dark"><Mail className="h-4 w-4" /> Request workspace access</a>
      <p className="mt-4 text-xs text-slate-400">Once connected, this page updates automatically — no re-signup needed.</p>
    </div>
  );
}

export default function OrganizationDashboard({ session }) {
  const navigate = useNavigate();
  const [ws, setWs] = useState(null);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState('');
  const [status, setStatus] = useState('all');

  useEffect(() => {
    let alive = true;
    (async () => { const data = await getOrgWorkspace(); if (alive) { setWs(data); setLoading(false); } })();
    return () => { alive = false; };
  }, []);

  const name = session?.name || ws?.company?.name || 'there';
  const apps = ws?.applications || [];
  const projects = ws?.projects || [];

  const counts = {
    roles: projects.length,
    apps: apps.length,
    shortlisted: apps.filter((a) => ['shortlisted', 'interview'].includes(a.status)).length,
    selected: apps.filter((a) => a.status === 'selected').length,
  };

  const rows = useMemo(() => {
    let r = apps.slice();
    if (status !== 'all') r = r.filter((a) => a.status === status);
    if (q.trim()) { const n = q.trim().toLowerCase(); r = r.filter((a) => (a.applicant_name || '').toLowerCase().includes(n) || (a.role_title || '').toLowerCase().includes(n)); }
    return r;
  }, [apps, status, q]);

  return (
    <div className="min-h-screen bg-canvas">
      <Helmet><title>Organization Dashboard · EkaNex</title><meta name="robots" content="noindex" /></Helmet>
      <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/90 backdrop-blur">
        <div className="container-px flex h-16 items-center justify-between">
          <div className="flex items-center gap-3">
            <Link to="/" className="inline-flex items-center gap-2"><LogoMark className="h-8 w-8" /><span className="font-extrabold text-navy">EkaNex</span></Link>
            <span className="rounded-md bg-navy px-2 py-0.5 text-xs font-bold uppercase tracking-wide text-white">Organization</span>
          </div>
          <button onClick={async () => { await signOut(); navigate('/'); }} className="inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold text-muted hover:bg-surface hover:text-navy"><LogOut className="h-4 w-4" /> <span className="hidden sm:inline">Sign out</span></button>
        </div>
      </header>

      <main className="container-px py-8">
        <div className="flex flex-wrap items-center gap-3">
          <span className="grid h-12 w-12 place-items-center rounded-full bg-electric/10 text-electric"><Building2 className="h-6 w-6" /></span>
          <div>
            <h1 className="text-2xl font-extrabold tracking-tight text-navy">Welcome back, {name} 👋</h1>
            <p className="text-muted">Your recruitment workspace — posted roles, applications and selected candidates.</p>
          </div>
        </div>

        {loading ? (
          <div className="mt-10 flex items-center justify-center"><span className="h-8 w-8 animate-spin rounded-full border-2 border-slate-200 border-t-electric" /></div>
        ) : !ws?.linked ? (
          <div className="mt-8"><SetupState orgName={name} /></div>
        ) : (
          <div className="mt-8 space-y-8">
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <StatCard label="Posted Roles" value={counts.roles} Icon={Briefcase} ring="bg-navy/5 text-navy" />
              <StatCard label="Applications" value={counts.apps} Icon={Users} ring="bg-sky-50 text-sky-600" />
              <StatCard label="Shortlisted" value={counts.shortlisted} Icon={Star} ring="bg-amber-50 text-amber-600" />
              <StatCard label="Selected" value={counts.selected} Icon={Trophy} ring="bg-emerald-50 text-emerald-600" />
            </div>

            <section>
              <h3 className="mb-3 flex items-center gap-2 font-bold text-navy"><Briefcase className="h-4 w-4 text-electric" /> Your posted roles</h3>
              {projects.length ? (
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {projects.map((p) => (
                    <div key={p.id} className="rounded-card border border-slate-200 bg-white p-5 shadow-card">
                      <p className="font-bold text-navy">{p.role_title}</p>
                      <p className="mt-1 text-sm text-muted">{p.sector || p.location || '—'}</p>
                      <p className="mt-3 text-xs text-muted">{apps.filter((a) => a.project_id === p.id).length} application(s)</p>
                    </div>
                  ))}
                </div>
              ) : <EmptyState icon={Briefcase} title="No posted roles yet" body="Roles you post with EkaNex will appear here." />}
            </section>

            <section>
              <div className="mb-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <h3 className="flex items-center gap-2 font-bold text-navy"><Users className="h-4 w-4 text-electric" /> Received applications</h3>
                <div className="flex items-center gap-2">
                  <div className="relative"><Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" /><input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search candidate or role…" className="rounded-xl border border-slate-200 py-2 pl-9 pr-3 text-sm outline-none focus:border-electric" /></div>
                  <select value={status} onChange={(e) => setStatus(e.target.value)} className="rounded-xl border border-slate-200 px-3 py-2 text-sm font-semibold text-navy outline-none focus:border-electric">
                    {['all', 'submitted', 'shortlisted', 'interview', 'selected', 'rejected'].map((s) => <option key={s} value={s}>{s === 'all' ? 'All statuses' : statusMeta(s).label}</option>)}
                  </select>
                </div>
              </div>
              {rows.length ? (
                <div className="overflow-hidden rounded-card border border-slate-200 bg-white shadow-card">
                  <table className="w-full text-left text-sm">
                    <thead className="border-b border-slate-100 bg-surface/50 text-xs uppercase tracking-wide text-muted">
                      <tr><th className="px-4 py-3 font-semibold">Candidate</th><th className="px-4 py-3 font-semibold">Role</th><th className="px-4 py-3 font-semibold">Applied</th><th className="px-4 py-3 font-semibold">Status</th><th className="px-4 py-3 font-semibold">Updated</th></tr>
                    </thead>
                    <tbody>
                      {rows.map((a) => (
                        <tr key={a.id} className="border-b border-slate-50 last:border-0 hover:bg-surface/40">
                          <td className="px-4 py-3 font-semibold text-navy">{a.applicant_name || '—'}</td>
                          <td className="px-4 py-3 text-ink/80">{a.role_title || '—'}</td>
                          <td className="px-4 py-3 text-ink/70">{fmtDate(a.created_at)}</td>
                          <td className="px-4 py-3"><StatusBadge status={a.status} /></td>
                          <td className="px-4 py-3 text-ink/70">{timeAgo(a.updated_at || a.created_at)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : <EmptyState icon={Inbox} title="No applications yet" body="Applications to your roles will show up here as students apply." />}
            </section>
          </div>
        )}
      </main>
    </div>
  );
}
