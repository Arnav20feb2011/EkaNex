-- EkaNex initial schema
-- Run this in the Supabase SQL editor (or `supabase db push`) after creating a project.
-- Safe to re-run: uses IF NOT EXISTS / CREATE OR REPLACE where possible.

-- ---------------------------------------------------------------------------
-- Enums
-- ---------------------------------------------------------------------------
do $$ begin
  create type user_type as enum ('student', 'organization', 'admin');
exception when duplicate_object then null; end $$;

do $$ begin
  create type application_status as enum ('submitted', 'screening', 'matched', 'rejected', 'withdrawn');
exception when duplicate_object then null; end $$;

-- ---------------------------------------------------------------------------
-- profiles  (1:1 with auth.users)
-- ---------------------------------------------------------------------------
create table if not exists public.profiles (
  id          uuid primary key references auth.users (id) on delete cascade,
  user_type   user_type not null default 'student',
  name        text,
  org_name    text,
  school      text,
  grade       text,
  org_type    text,
  created_at  timestamptz not null default now()
);

alter table public.profiles enable row level security;

drop policy if exists "profiles are viewable by owner" on public.profiles;
create policy "profiles are viewable by owner"
  on public.profiles for select using (auth.uid() = id);

drop policy if exists "profiles are editable by owner" on public.profiles;
create policy "profiles are editable by owner"
  on public.profiles for all using (auth.uid() = id) with check (auth.uid() = id);

-- Auto-create a profile row when a new auth user signs up.
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, user_type, name, org_name, school, grade, org_type)
  values (
    new.id,
    coalesce((new.raw_user_meta_data ->> 'user_type')::user_type, 'student'),
    new.raw_user_meta_data ->> 'name',
    new.raw_user_meta_data ->> 'org_name',
    new.raw_user_meta_data ->> 'school',
    new.raw_user_meta_data ->> 'grade',
    new.raw_user_meta_data ->> 'org_type'
  )
  on conflict (id) do nothing;
  return new;
end; $$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ---------------------------------------------------------------------------
-- applications
-- ---------------------------------------------------------------------------
create table if not exists public.applications (
  id             uuid primary key default gen_random_uuid(),
  applicant_id   uuid references auth.users (id) on delete set null,
  opportunity_id text,
  company        text,
  role_title     text,
  status         application_status not null default 'submitted',
  created_at     timestamptz not null default now()
);

alter table public.applications enable row level security;

drop policy if exists "students insert own applications" on public.applications;
create policy "students insert own applications"
  on public.applications for insert
  with check (auth.uid() = applicant_id or applicant_id is null);

drop policy if exists "students read own applications" on public.applications;
create policy "students read own applications"
  on public.applications for select using (auth.uid() = applicant_id);

-- ---------------------------------------------------------------------------
-- enquiries  (public contact form — anyone may insert, only staff may read)
-- ---------------------------------------------------------------------------
create table if not exists public.enquiries (
  id           uuid primary key default gen_random_uuid(),
  name         text,
  email        text,
  organisation text,
  topic        text,
  audience     text,
  message      text,
  created_at   timestamptz not null default now()
);

alter table public.enquiries enable row level security;

drop policy if exists "anyone can submit an enquiry" on public.enquiries;
create policy "anyone can submit an enquiry"
  on public.enquiries for insert to anon, authenticated with check (true);

-- Reading enquiries is intentionally NOT granted to normal users. Use the
-- service-role key (server side) or an admin dashboard for that.

-- ---------------------------------------------------------------------------
-- opportunities  (optional CMS store; the app ships with static data in
-- src/data/opportunities.js — move to this table when you build an admin UI)
-- ---------------------------------------------------------------------------
create table if not exists public.opportunities (
  id                 text primary key,
  company            text not null,
  sector             text,
  role_title         text not null,
  role_short         text,
  role_description   text,
  location           text,
  work_type          text,
  is_published       boolean not null default false,
  created_at         timestamptz not null default now()
);

alter table public.opportunities enable row level security;

drop policy if exists "published opportunities are public" on public.opportunities;
create policy "published opportunities are public"
  on public.opportunities for select using (is_published = true);

-- ---------------------------------------------------------------------------
-- Grants — RLS is the gate, but roles still need table-level privileges.
-- Public visitors (anon) submit enquiries and applications; both are guarded
-- by the insert policies above.
-- ---------------------------------------------------------------------------
grant insert on public.enquiries to anon, authenticated;
grant insert on public.applications to anon, authenticated;

-- Full multi-section application payload (JSON). Idempotent add.
alter table public.applications add column if not exists details jsonb;
