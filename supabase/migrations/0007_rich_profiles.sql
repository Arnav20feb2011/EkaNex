-- EkaNex rich company + project profiles (v7)
-- Adds the detailed fields the student project page surfaces (and the admin
-- editor writes). All nullable so nothing breaks; the UI shows a field only
-- when it has a value (no fabrication). Run AFTER 0006.

-- ---- companies ----------------------------------------------------------
alter table public.companies add column if not exists mission        text;
alter table public.companies add column if not exists founded_year   int;
alter table public.companies add column if not exists employee_count text;   -- e.g. "11-50"
alter table public.companies add column if not exists company_stage  text;   -- e.g. "Growth-stage SME"
alter table public.companies add column if not exists achievements   text[] default '{}';
-- (name, sector, description, website, location, verified already exist)

-- ---- projects -----------------------------------------------------------
alter table public.projects add column if not exists problem           text;   -- the problem the company faces
alter table public.projects add column if not exists why_it_matters    text;
alter table public.projects add column if not exists why_students      text;   -- why they need students
alter table public.projects add column if not exists objectives        text[] default '{}';
alter table public.projects add column if not exists deliverables      text[] default '{}';
alter table public.projects add column if not exists preferred_skills  text[] default '{}';
alter table public.projects add column if not exists duration_weeks    int;
alter table public.projects add column if not exists hours_per_week    text;
alter table public.projects add column if not exists team_size         text;
alter table public.projects add column if not exists mentor_name       text;
alter table public.projects add column if not exists mentor_role       text;
alter table public.projects add column if not exists weekly_plan       jsonb  default '[]';  -- [{week, title, detail}]
alter table public.projects add column if not exists benefits          text[] default '{}';  -- what the student gains (specific)
alter table public.projects add column if not exists learning_outcomes text[] default '{}';
alter table public.projects add column if not exists recommended_grade text;
alter table public.projects add column if not exists relevant_subjects text;
alter table public.projects add column if not exists teamwork          text;
-- (role_title, role_short, role_description, skills, location, work_type,
--  work_detail, supervisor, starts_on, ends_on, window_label, seat_status exist)

-- Admins need UPDATE on companies (already had ALL via "admin manage companies"),
-- and students read everything through the public/published select policies.
