-- Dashboard support: let students withdraw their own applications, and give
-- them a server-side "saved opportunities" bookmark list that stays consistent
-- across devices. Safe to re-run.

-- ---------------------------------------------------------------------------
-- 1. Students may UPDATE their own application, but ONLY to withdraw it.
--    (They already had SELECT + INSERT from 0001; there was no UPDATE policy,
--    so the withdraw action failed silently under RLS.)
-- ---------------------------------------------------------------------------
drop policy if exists "students withdraw own applications" on public.applications;
create policy "students withdraw own applications"
  on public.applications for update
  using (auth.uid() = applicant_id)
  with check (auth.uid() = applicant_id and status = 'withdrawn');

-- ---------------------------------------------------------------------------
-- 2. saved_opportunities: a student's bookmarked roles they haven't applied to.
--    We store a small snapshot (company, role, logo, location, work type) so the
--    dashboard can render the card without re-fetching the whole catalogue.
-- ---------------------------------------------------------------------------
create table if not exists public.saved_opportunities (
  id             uuid primary key default gen_random_uuid(),
  user_id        uuid not null references auth.users (id) on delete cascade,
  opportunity_id text not null,
  snapshot       jsonb,
  created_at     timestamptz not null default now(),
  unique (user_id, opportunity_id)
);

alter table public.saved_opportunities enable row level security;

drop policy if exists "saved owner all" on public.saved_opportunities;
create policy "saved owner all"
  on public.saved_opportunities for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- Keep the dashboard in sync in real time (falls back to poll if not enabled).
do $$
begin
  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'saved_opportunities'
  ) then
    alter publication supabase_realtime add table public.saved_opportunities;
  end if;
end $$;

-- ---------------------------------------------------------------------------
-- 3. ORGANIZATION dashboard support.
--    The "company reads project applications" RLS policy (0002) keys off
--    applications.company_id, but student submissions only set project_id. This
--    trigger derives company_id from the linked project so that — once an admin
--    links an organization account to its company (profiles.role='company' +
--    company_id) — that org automatically sees applications to its roles.
-- ---------------------------------------------------------------------------
create or replace function public.set_application_company()
returns trigger language plpgsql as $$
begin
  if new.company_id is null and new.project_id is not null then
    select company_id into new.company_id from public.projects where id = new.project_id;
  end if;
  return new;
end; $$;

drop trigger if exists set_application_company on public.applications;
create trigger set_application_company
  before insert or update of project_id on public.applications
  for each row execute function public.set_application_company();

-- Backfill existing rows so current applications are visible to their company.
update public.applications a
   set company_id = p.company_id
  from public.projects p
 where a.project_id = p.id and a.company_id is null;
