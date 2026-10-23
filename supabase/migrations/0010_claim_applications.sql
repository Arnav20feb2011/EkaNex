-- Make sure a student always sees the applications submitted with their email,
-- even if the application row was created before they had an account (e.g.
-- imported, or submitted while signed out). Two parts:
--   1. When a user signs up, claim any orphaned applications with their email.
--   2. RLS: a student may also read applications whose applicant_email matches
--      their own (verified) JWT email — belt-and-suspenders so nothing is lost.
-- Safe to re-run.

-- ---------------------------------------------------------------------------
-- 1. Extend the signup trigger to claim matching orphaned applications.
-- ---------------------------------------------------------------------------
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

  -- Link any applications that were submitted with this email but never tied to
  -- an account, so they show up in the new user's dashboard immediately.
  update public.applications
     set applicant_id = new.id
   where applicant_id is null
     and lower(applicant_email) = lower(new.email);

  return new;
end; $$;

-- ---------------------------------------------------------------------------
-- 2. Let a signed-in student read applications that carry their own email.
--    auth.jwt()->>'email' is the authenticated user's email — a student can
--    only ever match their OWN rows, so this exposes nothing private.
-- ---------------------------------------------------------------------------
drop policy if exists "students read own applications by email" on public.applications;
create policy "students read own applications by email"
  on public.applications for select
  using (lower(applicant_email) = lower(auth.jwt() ->> 'email'));
