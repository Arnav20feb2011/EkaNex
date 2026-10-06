import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { LayoutGrid, BarChart3, Bell, LogOut, Inbox, Trophy, CheckCircle2, Send, Building2 } from 'lucide-react';
import { LogoMark } from './components/Logo';
import {
  isAuthed, signOut, bootstrap, ensureEvaluations, getSession,
  listNotifications, markAllNotificationsRead, startLiveSync,
} from './lib/api';
import { useStore, timeAgo } from './components/ui';
import AuthPage from './admin/AuthPage';
import { ApplicationsView, AnalyticsView } from './admin/Dashboard';
import Review from './admin/Review';
import ContentEditor from './admin/ContentEditor';

function NotifPanel({ open, onClose }) {
  if (!open) return null;
  const notes = listNotifications({ scope: 'admin' });
  const iconFor = { new_application: Inbox, ai_done: BarChart3, high_scorer: Trophy, selected: CheckCircle2, sent_to_company: Send };
  return (
    <>
      <button className="fixed inset-0 z-40 cursor-default" aria-label="Close" onClick={onClose} />
      <div className="absolute right-0 top-12 z-50 w-80 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-float">
        <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3">
          <p className="font-bold text-navy">Notifications</p>
          <button onClick={() => markAllNotificationsRead({ scope: 'admin' })} className="text-xs font-semibold text-electric hover:underline">Mark all read</button>
        </div>
        <div className="max-h-96 overflow-y-auto">
          {notes.length ? notes.map((n) => {
            const Icon = iconFor[n.type] || Bell;
            return (
              <div key={n.id} className={`flex gap-3 border-b border-slate-50 px-4 py-3 ${n.read ? '' : 'bg-electric/5'}`}>
                <span className="mt-0.5 grid h-8 w-8 shrink-0 place-items-center rounded-full bg-surface text-navy"><Icon className="h-4 w-4" /></span>
                <div className="min-w-0"><p className="text-sm font-semibold text-navy">{n.title}</p><p className="text-xs text-muted">{n.body}</p><p className="mt-0.5 text-[11px] text-slate-400">{timeAgo(n.at)}</p></div>
              </div>
            );
          }) : <p className="p-6 text-center text-sm text-muted">No notifications yet.</p>}
        </div>
      </div>
    </>
  );
}

export default function App() {
  useStore();
  const [authed, setAuthed] = useState(isAuthed());
  // Tab + open application live in the URL so the browser Back button returns
  // from a review to the list, and from a tab to the previous tab.
  const [sp, setSp] = useSearchParams();
  const tab = sp.get('tab') || 'applications';
  const openId = sp.get('app') || null;
  const setTab = (t) => setSp((prev) => { const p = new URLSearchParams(prev); p.set('tab', t); p.delete('app'); return p; }, { replace: true });
  const setOpenId = (id) => setSp((prev) => { const p = new URLSearchParams(prev); id ? p.set('app', id) : p.delete('app'); return p; });
  const [notifOpen, setNotifOpen] = useState(false);

  useEffect(() => {
    if (!authed) return undefined;
    let stop;
    (async () => { await bootstrap(); await ensureEvaluations(); stop = startLiveSync(); })();
    return () => { if (stop) stop(); };
  }, [authed]);

  if (!authed) return <AuthPage onAuthed={() => setAuthed(true)} />;
  if (openId) return <Review id={openId} onBack={() => setOpenId(null)} />;

  const unread = listNotifications({ scope: 'admin' }).filter((n) => !n.read).length;
  const session = getSession();

  return (
    <div className="min-h-screen bg-canvas">
      <Helmet><title>Admin Console · EkaNex</title></Helmet>
      <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/90 backdrop-blur">
        <div className="container-px flex h-16 items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="inline-flex items-center gap-2"><LogoMark className="h-8 w-8" /><span className="font-extrabold text-navy">EkaNex</span></span>
            <span className="rounded-md bg-navy px-2 py-0.5 text-xs font-bold uppercase tracking-wide text-white">Admin</span>
          </div>
          <div className="flex items-center gap-1">
            {session?.name && <span className="mr-2 hidden text-sm text-muted sm:inline">{session.name}</span>}
            <div className="relative">
              <button onClick={() => setNotifOpen((o) => !o)} className="relative grid h-10 w-10 place-items-center rounded-lg text-muted hover:bg-surface hover:text-navy" aria-label="Notifications">
                <Bell className="h-5 w-5" />
                {unread > 0 && <span className="absolute right-1.5 top-1.5 grid h-4 min-w-4 place-items-center rounded-full bg-rose-500 px-1 text-[10px] font-bold text-white">{unread}</span>}
              </button>
              <NotifPanel open={notifOpen} onClose={() => setNotifOpen(false)} />
            </div>
            <button onClick={async () => { await signOut(); setAuthed(false); }} className="inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold text-muted hover:bg-surface hover:text-navy"><LogOut className="h-4 w-4" /> Sign out</button>
          </div>
        </div>
      </header>

      <main className="container-px py-8">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-navy">Application console</h1>
          <p className="text-muted">Review applicants, read AI evaluations, decide, and send students to companies.</p>
        </div>

        <div className="mt-6 inline-flex rounded-xl bg-surface p-1">
          {[{ k: 'applications', l: 'Applications', i: LayoutGrid }, { k: 'content', l: 'Companies & Projects', i: Building2 }, { k: 'analytics', l: 'Analytics', i: BarChart3 }].map((t) => {
            const Icon = t.i;
            return <button key={t.k} onClick={() => setTab(t.k)} className={`inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold transition-colors ${tab === t.k ? 'bg-white text-navy shadow-sm' : 'text-muted hover:text-navy'}`}><Icon className="h-4 w-4" /> {t.l}</button>;
          })}
        </div>

        <div className="mt-6">
          {tab === 'applications' ? <ApplicationsView onOpen={setOpenId} /> : tab === 'content' ? <ContentEditor /> : <AnalyticsView />}
        </div>
      </main>
    </div>
  );
}
