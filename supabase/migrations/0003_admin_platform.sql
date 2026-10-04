-- EkaNex admin platform additions (v3)
-- Run AFTER 0001_init.sql and 0002_platform.sql. Idempotent where possible.
-- Adds: the extended admin lifecycle statuses, the company-dispatch tracking
-- table, and a secure claim_admin() function so the separate admin website can
-- grant the admin role to an invite-code holder without exposing a privileged key.

-- ---------------------------------------------------------------------------
-- Extended application lifecycle statuses used by the admin platform.
-- ---------------------------------------------------------------------------
do $$ begin alter type application_status add value if not exists 'admin_reviewed';    exception when others then null; end $$;
do $$ begin alter type application_status add value if not exists 'hold';               exception when others then null; end $$;
do $$ begin alter type application_status add value if not exists 'approved';           exception when others then null; end $$;
do $$ begin alter type application_status add value if not exists 'sent_to_company';    exception when others then null; end $$;
do $$ begin alter type application_status add value if not exists 'company_reviewing';  exception when others then null; end $$;

-- ---------------------------------------------------------------------------
-- company_dispatches: records each time an application is sent to a company for
-- a specific role, with its own status so admins can track company-side progress.
-- ---------------------------------------------------------------------------
create table if not exists public.company_dispatches (
  id             uuid primary key default gen_random_uuid(),
  application_id uuid not null references public.applications(id) on delete cascade,
  company_id     uuid references public.companies(id) on delete set null,
  project_id     uuid references public.projects(id) on delete set null,
  company_name   text,
  role_title     text,
  status         text not null default 'sent',   -- sent | viewed | reviewing | interview | selected | declined
  sent_at        timestamptz not null default now(),
  updated_at     timestamptz not null default now()
);
alter table public.company_dispatches enable row level security;

drop policy if exists "dispatches admin" on public.company_dispatches;
create policy "dispatches admin" on public.company_dispatches for all
  using (public.is_admin()) with check (public.is_admin());

drop policy if exists "dispatches company reads own" on public.company_dispatches;
create policy "dispatches company reads own" on public.company_dispatches for select
  using (company_id in (select company_id from public.profiles where id = auth.uid()));

create index if not exists idx_dispatches_application on public.company_dispatches(application_id);
create index if not exists idx_dispatches_company on public.company_dispatches(company_id);

-- ---------------------------------------------------------------------------
-- claim_admin(code): lets a freshly signed-up user on the admin website become
-- an admin IF they present the correct invite code. The code is checked here,
-- server-side, so no privileged key is ever shipped to the browser. Change the
-- code below to rotate it.
-- ---------------------------------------------------------------------------
create or replace function public.claim_admin(code text)
returns boolean language plpgsql security definer set search_path = public as $$
begin
  if auth.uid() is null then
    raise exception 'Not authenticated';
  end if;
  if code = 'EKANEX-ADMIN-2026' then
    update public.profiles set role = 'admin' where id = auth.uid();
    return true;
  end if;
  return false;
end; $$;

revoke all on function public.claim_admin(text) from public;
grant execute on function public.claim_admin(text) to authenticated;
