-- Enable Supabase Realtime for the tables the dashboards subscribe to, so admin
-- decisions reach the student (and new applications reach the admin console) in
-- SUB-SECOND time instead of waiting for the client-side poll.
--
-- Safe to re-run. Row Level Security still applies to realtime: a student only
-- receives change events for their OWN application / notification rows; admins
-- receive all of them. Without this the apps still work — they fall back to a
-- short poll (every 10s student / 15s admin) — this just makes it instant.

do $$
begin
  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'applications'
  ) then
    alter publication supabase_realtime add table public.applications;
  end if;

  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'notifications'
  ) then
    alter publication supabase_realtime add table public.notifications;
  end if;

  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'application_status_history'
  ) then
    alter publication supabase_realtime add table public.application_status_history;
  end if;
end $$;
