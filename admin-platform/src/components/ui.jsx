// Small shared UI building blocks for the dashboards + admin console, so status
// chips, score rings and empty/loading states look identical everywhere.
import { useEffect, useState } from 'react';
import { statusMeta, scoreTone, RECOMMENDATION } from '../lib/status';
import { subscribe } from '../lib/api';

/** Re-render a component whenever the local store changes. Returns a tick. */
export function useStore() {
  const [, setTick] = useState(0);
  useEffect(() => subscribe(() => setTick((t) => t + 1)), []);
}

export function StatusBadge({ status, className = '' }) {
  const m = statusMeta(status);
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${m.badge} ${className}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${m.dot}`} />
      {m.label}
    </span>
  );
}

export function RecommendationBadge({ value, className = '' }) {
  const r = RECOMMENDATION[value] || RECOMMENDATION.review_manually;
  return <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-bold ${r.badge} ${className}`}>{r.label}</span>;
}

export function AiTag({ className = '' }) {
  return (
    <span className={`inline-flex items-center gap-1 rounded-md bg-violet-100 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-violet-700 ${className}`}>
      <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 2l2.4 6.3L21 10.7l-5.3 4 1.9 6.6L12 17.8 6.4 21.3l1.9-6.6-5.3-4 6.6-2.4z" /></svg>
      AI
    </span>
  );
}

/** A compact circular score indicator (0–100). */
export function ScoreRing({ score = 0, size = 56, stroke = 6, label }) {
  const tone = scoreTone(score);
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const off = c - (score / 100) * c;
  return (
    <div className="inline-flex flex-col items-center">
      <span className="relative inline-grid place-items-center" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="-rotate-90">
          <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#e2e8f0" strokeWidth={stroke} />
          <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={tone.ring} strokeWidth={stroke} strokeDasharray={c} strokeDashoffset={off} strokeLinecap="round" />
        </svg>
        <span className={`absolute text-base font-extrabold ${tone.text}`}>{score}</span>
      </span>
      {label && <span className="mt-1 text-[11px] font-medium text-muted">{label}</span>}
    </div>
  );
}

/** Horizontal labelled score bar with an optional reason tooltip. */
export function ScoreBar({ label, score = 0, reason }) {
  const tone = scoreTone(score);
  return (
    <div>
      <div className="flex items-baseline justify-between">
        <span className="text-sm font-medium text-ink">{label}</span>
        <span className={`text-sm font-bold ${tone.text}`}>{score}<span className="text-xs font-medium text-muted">/100</span></span>
      </div>
      <div className="mt-1 h-2 w-full overflow-hidden rounded-full bg-slate-100">
        <div className={`h-full rounded-full ${tone.bar} transition-all`} style={{ width: `${score}%` }} />
      </div>
      {reason && <p className="mt-1.5 text-xs leading-relaxed text-muted">{reason}</p>}
    </div>
  );
}

export function Stat({ label, value, sub, tone = 'text-navy' }) {
  return (
    <div className="rounded-card border border-slate-200 bg-white p-5 shadow-card">
      <p className="text-sm font-medium text-muted">{label}</p>
      <p className={`mt-1 text-3xl font-extrabold tracking-tight ${tone}`}>{value}</p>
      {sub && <p className="mt-0.5 text-xs text-muted">{sub}</p>}
    </div>
  );
}

/** Simple horizontal bar chart from an object/array of [label, count]. */
export function BarChart({ data, color = 'bg-electric', max }) {
  const entries = Array.isArray(data) ? data : Object.entries(data);
  const top = max || Math.max(1, ...entries.map(([, v]) => v));
  if (!entries.length) return <EmptyState compact title="No data yet" />;
  return (
    <div className="space-y-2.5">
      {entries.map(([k, v]) => (
        <div key={k} className="flex items-center gap-3">
          <span className="w-40 shrink-0 truncate text-sm text-ink" title={k}>{k}</span>
          <div className="h-5 flex-1 overflow-hidden rounded-md bg-slate-100">
            <div className={`flex h-full items-center justify-end rounded-md ${color} px-2 text-[11px] font-bold text-white`} style={{ width: `${Math.max(8, (v / top) * 100)}%` }}>{v}</div>
          </div>
        </div>
      ))}
    </div>
  );
}

export function EmptyState({ icon: Icon, title, body, action, compact }) {
  return (
    <div className={`flex flex-col items-center justify-center rounded-card border border-dashed border-slate-300 bg-white text-center ${compact ? 'p-6' : 'p-12'}`}>
      {Icon && <span className="mb-3 grid h-12 w-12 place-items-center rounded-full bg-surface text-muted"><Icon className="h-6 w-6" /></span>}
      <p className="font-semibold text-navy">{title}</p>
      {body && <p className="mt-1 max-w-sm text-sm text-muted">{body}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}

export function Spinner({ className = 'h-5 w-5' }) {
  return (
    <svg className={`animate-spin ${className}`} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
    </svg>
  );
}

export function timeAgo(iso) {
  if (!iso) return '';
  const s = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
  if (s < 60) return 'just now';
  const m = Math.floor(s / 60); if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60); if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24); if (d < 30) return `${d}d ago`;
  return new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
}

export function fmtDate(iso) {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
}
