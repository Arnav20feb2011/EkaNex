-- EkaNex platform schema (v2): application management, AI evaluations, roles,
-- notifications, interviews, companies/projects, mentors, status history.
-- Run AFTER 0001_init.sql. Idempotent where possible (IF NOT EXISTS / CREATE OR REPLACE).
--
-- Design notes
--   • Roles: student | admin | company | mentor. A user's role lives on
--     public.profiles.user_type (extended below) and is read by RLS via a
--     SECURITY DEFINER helper to avoid recursive policy lookups.
--   • Students see only their own data. Admins see everything. Companies see
--     only applications tied to their own projects. Mentors see assigned students.
--   • The frontend currently runs on a local demo store (src/lib/store.js) with
--     the identical shape; switching api.js to these tables needs no UI changes.

-- ---------------------------------------------------------------------------
-- Enums
-- ---------------------------------------------------------------------------
do $$ begin create type app_role as enum ('student','admin','company','mentor'); exception when duplicate_object then null; end $$;

-- Extend the lifecycle enum from 0001 to the full pipeline.
do $$ begin alter type application_status add value if not exists 'draft'; exception when others then null; end $$;
do $$ begin alter type application_status add value if not exists 'under_review'; exception when others then null; end $$;
do $$ begin alter type application_status add value if not exists 'ai_evaluated'; exception when others then null; end $$;
do $$ begin alter type application_status add value if not exists 'shortlisted'; exception when others then null; end $$;
do $$ begin alter type application_status add value if not exists 'interview'; exception when others then null; end $$;
do $$ begin alter type application_status add value if not exists 'selected'; exception when others then null; end $$;
-- (existing: submitted, screening, matched, rejected, withdrawn)

do $$ begin create type recommendation as enum ('strongly_shortlist','shortlist','review_manually','do_not_shortlist'); exception when duplicate_object then null; end $$;

-- ---------------------------------------------------------------------------
-- profiles: add role + richer identity (1:1 with auth.users, created in 0001)
-- ---------------------------------------------------------------------------
alter table public.profiles add column if not exists role app_role not null default 'student';
alter table public.profiles add column if not exists phone text;
alter table public.profiles add column if not exists city text;
alter table public.profiles add column if not exists company_id uuid;   -- for role=company / mentor
alter table public.profiles add column if not exists avatar_url text;

-- Role helper (SECURITY DEFINER avoids RLS recursion when policies check role).
create or replace function public.current_role_is(target app_role)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = target);
$$;
create or replace function public.is_admin() returns boolean language sql stable as $$ select public.current_role_is('admin'); $$;

-- ---------------------------------------------------------------------------
-- companies
-- ---------------------------------------------------------------------------
create table if not exists public.companies (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  sector      text,
  description text,
  website     text,
  location    text,
  verified    boolean not null default false,
  owner_id    uuid references auth.users(id) on delete set null, -- the company account
  created_at  timestamptz not null default now()
);
alter table public.companies enable row level security;
drop policy if exists "companies readable" on public.companies;
create policy "companies readable" on public.companies for select using (true);
drop policy if exists "admin manage companies" on public.companies;
create policy "admin manage companies" on public.companies for all using (public.is_admin()) with check (public.is_admin());
drop policy if exists "company edits own" on public.companies;
create policy "company edits own" on public.companies for update using (owner_id = auth.uid()) with check (owner_id = auth.uid());

-- ---------------------------------------------------------------------------
-- projects  (a role/opportunity offered by a company)
-- ---------------------------------------------------------------------------
create table if not exists public.projects (
  id               uuid primary key default gen_random_uuid(),
  legacy_id        text,                 -- maps to src/data/opportunities.js id
  company_id       uuid references public.companies(id) on delete cascade,
  role_title       text not null,
  role_short       text,
  role_description text,
  sector           text,
  location         text,
  work_type        text,
  skills           text[] default '{}',
  seats            int default 1,
  window_label     text,
  is_published     boolean not null default false,
  created_at       timestamptz not null default now()
);
alter table public.projects enable row level security;
drop policy if exists "published projects public" on public.projects;
create policy "published projects public" on public.projects for select using (is_published or public.is_admin() or company_id in (select company_id from public.profiles where id = auth.uid()));
drop policy if exists "admin manage projects" on public.projects;
create policy "admin manage projects" on public.projects for all using (public.is_admin()) with check (public.is_admin());
drop policy if exists "company manage own projects" on public.projects;
create policy "company manage own projects" on public.projects for all
  using (company_id in (select company_id from public.profiles where id = auth.uid()))
  with check (company_id in (select company_id from public.profiles where id = auth.uid()));

-- ---------------------------------------------------------------------------
-- applications: enrich the table from 0001
-- ---------------------------------------------------------------------------
alter table public.applications add column if not exists project_id   uuid references public.projects(id) on delete set null;
alter table public.applications add column if not exists company_id    uuid references public.companies(id) on delete set null;
alter table public.applications add column if not exists short_id      text unique;
alter table public.applications add column if not exists applicant_name text;
alter table public.applications add column if not exists applicant_email text;
alter table public.applications add column if not exists assigned_project_id uuid references public.projects(id) on delete set null;
alter table public.applications add column if not exists updated_at    timestamptz not null default now();
-- details jsonb already added in 0001.

-- Human-friendly, unique application id (EKX-26-0001) generated server-side.
create sequence if not exists public.application_seq start 1;
alter table public.applications
  alter column short_id set default 'EKX-26-' || lpad(nextval('public.application_seq')::text, 4, '0');

-- Admins: full access. Companies: read applications to their projects. Students:
-- own rows (from 0001). Students may update only to withdraw (handled app-side).
drop policy if exists "admin full applications" on public.applications;
create policy "admin full applications" on public.applications for all using (public.is_admin()) with check (public.is_admin());
drop policy if exists "company reads project applications" on public.applications;
create policy "company reads project applications" on public.applications for select
  using (company_id in (select company_id from public.profiles where id = auth.uid()));

-- ---------------------------------------------------------------------------
-- ai_evaluations  (1 current + history; advisory, never the final decision)
-- ---------------------------------------------------------------------------
create table if not exists public.ai_evaluations (
  id              uuid primary key default gen_random_uuid(),
  application_id  uuid not null references public.applications(id) on delete cascade,
  model           text not null,
  overall         int not null check (overall between 0 and 100),
  scores          jsonb not null default '[]',   -- [{key,label,score,reason,weight}]
  strengths       jsonb default '[]',
  concerns        jsonb default '[]',
  recommended_role text,
  recommended_project_types text[] default '{}',
  interview_questions jsonb default '[]',
  recommendation  recommendation not null default 'review_manually',
  summary         text,
  fairness_note   text,
  created_at      timestamptz not null default now()
);
alter table public.ai_evaluations enable row level security;
-- Admins manage evaluations. Companies may read evaluations for their own
-- projects' applicants. STUDENTS HAVE NO POLICY HERE — they can never select,
-- insert or update ai_evaluations, not even for their own application. This is
-- the database-level guarantee that AI scores never reach a student.
drop policy if exists "admin reads evals" on public.ai_evaluations;
create policy "admin reads evals" on public.ai_evaluations for all using (public.is_admin()) with check (public.is_admin());
drop policy if exists "owner reads own eval" on public.ai_evaluations;  -- explicitly removed
drop policy if exists "company reads project eval" on public.ai_evaluations;
create policy "company reads project eval" on public.ai_evaluations for select
  using (application_id in (select id from public.applications where company_id in (select company_id from public.profiles where id = auth.uid())));

-- ---------------------------------------------------------------------------
-- normalised student sub-entities (optional; details jsonb already holds these,
-- but these tables support querying/analytics at scale)
-- ---------------------------------------------------------------------------
create table if not exists public.skills (
  id uuid primary key default gen_random_uuid(), name text unique not null
);
alter table public.skills enable row level security;
drop policy if exists "skills public" on public.skills;
create policy "skills public" on public.skills for select using (true);

create table if not exists public.experiences (
  id uuid primary key default gen_random_uuid(),
  student_id uuid references auth.users(id) on delete cascade,
  role text, org text, detail text, started_on date, ended_on date
);
alter table public.experiences enable row level security;
drop policy if exists "experiences owner" on public.experiences;
create policy "experiences owner" on public.experiences for all using (student_id = auth.uid() or public.is_admin()) with check (student_id = auth.uid() or public.is_admin());

create table if not exists public.portfolios (
  id uuid primary key default gen_random_uuid(),
  student_id uuid references auth.users(id) on delete cascade,
  kind text,          -- resume | link | work_sample
  label text, url text, storage_path text, created_at timestamptz not null default now()
);
alter table public.portfolios enable row level security;
drop policy if exists "portfolios owner" on public.portfolios;
create policy "portfolios owner" on public.portfolios for all using (student_id = auth.uid() or public.is_admin()) with check (student_id = auth.uid() or public.is_admin());

-- ---------------------------------------------------------------------------
-- admin_notes  (private to staff)
-- ---------------------------------------------------------------------------
create table if not exists public.admin_notes (
  id uuid primary key default gen_random_uuid(),
  application_id uuid not null references public.applications(id) on delete cascade,
  author_id uuid references auth.users(id) on delete set null,
  author_name text,
  body text not null,
  created_at timestamptz not null default now()
);
alter table public.admin_notes enable row level security;
drop policy if exists "admin notes staff only" on public.admin_notes;
create policy "admin notes staff only" on public.admin_notes for all using (public.is_admin()) with check (public.is_admin());

-- ---------------------------------------------------------------------------
-- application_status_history  (immutable audit log → timelines)
-- ---------------------------------------------------------------------------
create table if not exists public.application_status_history (
  id uuid primary key default gen_random_uuid(),
  application_id uuid not null references public.applications(id) on delete cascade,
  status application_status not null,
  note text,
  changed_by text,                       -- student | system | ai | admin | company
  created_at timestamptz not null default now()
);
alter table public.application_status_history enable row level security;
drop policy if exists "history admin" on public.application_status_history;
create policy "history admin" on public.application_status_history for all using (public.is_admin()) with check (public.is_admin());
drop policy if exists "history owner reads" on public.application_status_history;
create policy "history owner reads" on public.application_status_history for select
  using (application_id in (select id from public.applications where applicant_id = auth.uid()));

-- ---------------------------------------------------------------------------
-- interviews
-- ---------------------------------------------------------------------------
create table if not exists public.interviews (
  id uuid primary key default gen_random_uuid(),
  application_id uuid not null references public.applications(id) on delete cascade,
  scheduled_at timestamptz,
  mode text,             -- call | video | in_person
  location_or_link text,
  notes text,
  status text default 'scheduled',
  created_at timestamptz not null default now()
);
alter table public.interviews enable row level security;
drop policy if exists "interviews admin" on public.interviews;
create policy "interviews admin" on public.interviews for all using (public.is_admin()) with check (public.is_admin());
drop policy if exists "interviews owner reads" on public.interviews;
create policy "interviews owner reads" on public.interviews for select
  using (application_id in (select id from public.applications where applicant_id = auth.uid()));
drop policy if exists "interviews company reads" on public.interviews;
create policy "interviews company reads" on public.interviews for select
  using (application_id in (select id from public.applications where company_id in (select company_id from public.profiles where id = auth.uid())));

-- ---------------------------------------------------------------------------
-- mentors  (assigned to selected students)
-- ---------------------------------------------------------------------------
create table if not exists public.mentors (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete set null,
  name text not null,
  expertise text,
  company_id uuid references public.companies(id) on delete set null,
  created_at timestamptz not null default now()
);
alter table public.mentors enable row level security;
drop policy if exists "mentors readable" on public.mentors;
create policy "mentors readable" on public.mentors for select using (true);
drop policy if exists "mentors admin" on public.mentors;
create policy "mentors admin" on public.mentors for all using (public.is_admin()) with check (public.is_admin());

create table if not exists public.mentor_assignments (
  id uuid primary key default gen_random_uuid(),
  mentor_id uuid references public.mentors(id) on delete cascade,
  application_id uuid references public.applications(id) on delete cascade,
  created_at timestamptz not null default now()
);
alter table public.mentor_assignments enable row level security;
drop policy if exists "mentor assign admin" on public.mentor_assignments;
create policy "mentor assign admin" on public.mentor_assignments for all using (public.is_admin()) with check (public.is_admin());
drop policy if exists "mentor assign student reads" on public.mentor_assignments;
create policy "mentor assign student reads" on public.mentor_assignments for select
  using (application_id in (select id from public.applications where applicant_id = auth.uid()));

-- ---------------------------------------------------------------------------
-- notifications
-- ---------------------------------------------------------------------------
create table if not exists public.notifications (
  id uuid primary key default gen_random_uuid(),
  scope text not null,                  -- student | admin | company
  user_id uuid references auth.users(id) on delete cascade,  -- recipient (student/company)
  type text not null,
  title text not null,
  body text,
  application_id uuid references public.applications(id) on delete cascade,
  read boolean not null default false,
  created_at timestamptz not null default now()
);
alter table public.notifications enable row level security;
drop policy if exists "notifications own" on public.notifications;
create policy "notifications own" on public.notifications for select using (user_id = auth.uid() or (scope = 'admin' and public.is_admin()));
drop policy if exists "notifications own update" on public.notifications;
create policy "notifications own update" on public.notifications for update using (user_id = auth.uid() or (scope = 'admin' and public.is_admin()));
drop policy if exists "notifications admin insert" on public.notifications;
create policy "notifications admin insert" on public.notifications for insert with check (public.is_admin());

-- ---------------------------------------------------------------------------
-- Storage bucket for resumes/documents (private; signed URLs only)
-- ---------------------------------------------------------------------------
insert into storage.buckets (id, name, public) values ('applicant-docs','applicant-docs', false)
  on conflict (id) do nothing;
-- Students upload to a folder named by their user id; admins read all.
drop policy if exists "docs student write own" on storage.objects;
create policy "docs student write own" on storage.objects for insert to authenticated
  with check (bucket_id = 'applicant-docs' and (storage.foldername(name))[1] = auth.uid()::text);
drop policy if exists "docs student read own" on storage.objects;
create policy "docs student read own" on storage.objects for select to authenticated
  using (bucket_id = 'applicant-docs' and ((storage.foldername(name))[1] = auth.uid()::text or public.is_admin()));

-- ---------------------------------------------------------------------------
-- Helpful indexes
-- ---------------------------------------------------------------------------
create index if not exists idx_applications_status   on public.applications(status);
create index if not exists idx_applications_project  on public.applications(project_id);
create index if not exists idx_applications_applicant on public.applications(applicant_id);
create index if not exists idx_history_application   on public.application_status_history(application_id);
create index if not exists idx_evals_application     on public.ai_evaluations(application_id);
create index if not exists idx_notifications_user    on public.notifications(user_id);

-- ---------------------------------------------------------------------------
-- Triggers: status history + notifications are written server-side, so the
-- client can never fabricate a status change or a notification. All functions
-- are SECURITY DEFINER (owned by a role that bypasses RLS).
-- ---------------------------------------------------------------------------

-- New application → log 'submitted', notify student (received) + admins.
create or replace function public.on_application_insert()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.application_status_history (application_id, status, note, changed_by)
    values (new.id, new.status, 'Application submitted.', 'student');
  if new.applicant_id is not null then
    insert into public.notifications (scope, user_id, type, title, body, application_id)
      values ('student', new.applicant_id, 'received', 'Application received',
              'We have received your application for ' || coalesce(new.role_title,'a role') || ' at ' || coalesce(new.company,'a company') || '.', new.id);
  end if;
  insert into public.notifications (scope, user_id, type, title, body, application_id)
    values ('admin', null, 'new_application', 'New application',
            coalesce(new.applicant_name,'A student') || ' applied for ' || coalesce(new.role_title,'a role') || ' at ' || coalesce(new.company,'a company') || '.', new.id);
  return new;
end; $$;
drop trigger if exists trg_application_insert on public.applications;
create trigger trg_application_insert after insert on public.applications
  for each row execute function public.on_application_insert();

-- Status change → log history (neutral note, no AI score) + notify the student
-- on the milestones that matter to them.
create or replace function public.on_application_status_change()
returns trigger language plpgsql security definer set search_path = public as $$
declare t text; b text;
begin
  if new.status is distinct from old.status then
    insert into public.application_status_history (application_id, status, note, changed_by)
      values (new.id, new.status, 'Status updated.', 'admin');
    if new.applicant_id is not null then
      if new.status = 'shortlisted' then t := 'You have been shortlisted'; b := 'You have been shortlisted for ' || coalesce(new.role_title,'a role') || ' at ' || coalesce(new.company,'a company') || '.';
      elsif new.status = 'interview' then t := 'Interview invitation'; b := 'You have been invited to interview for ' || coalesce(new.role_title,'a role') || ' at ' || coalesce(new.company,'a company') || '.';
      elsif new.status = 'selected' then t := 'You have been selected!'; b := 'Congratulations — you have been selected for ' || coalesce(new.role_title,'a role') || ' at ' || coalesce(new.company,'a company') || '.';
      elsif new.status = 'rejected' then t := 'Application update'; b := 'Your application for ' || coalesce(new.role_title,'a role') || ' was not taken forward this time.';
      end if;
      if t is not null then
        insert into public.notifications (scope, user_id, type, title, body, application_id)
          values ('student', new.applicant_id, new.status, t, b, new.id);
      end if;
    end if;
  end if;
  return new;
end; $$;
drop trigger if exists trg_application_status on public.applications;
create trigger trg_application_status after update on public.applications
  for each row execute function public.on_application_status_change();

-- AI evaluation stored → notify admins (incl. high scorers). Student is never
-- notified of AI activity.
create or replace function public.on_evaluation_insert()
returns trigger language plpgsql security definer set search_path = public as $$
declare nm text;
begin
  select applicant_name into nm from public.applications where id = new.application_id;
  insert into public.notifications (scope, user_id, type, title, body, application_id)
    values ('admin', null, 'ai_done', 'AI evaluation complete',
            coalesce(nm,'An applicant') || ': ' || new.overall || '/100.', new.application_id);
  if new.overall >= 82 then
    insert into public.notifications (scope, user_id, type, title, body, application_id)
      values ('admin', null, 'high_scorer', 'High-scoring applicant',
              coalesce(nm,'An applicant') || ' scored ' || new.overall || '/100.', new.application_id);
  end if;
  return new;
end; $$;
drop trigger if exists trg_evaluation_insert on public.ai_evaluations;
create trigger trg_evaluation_insert after insert on public.ai_evaluations
  for each row execute function public.on_evaluation_insert();
