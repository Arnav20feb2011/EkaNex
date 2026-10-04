-- EkaNex draft applications (v5)
-- Lets a student keep editing their OWN application while it is a Draft, and
-- submit it by moving it to 'submitted'. Once submitted, students can no longer
-- change it (admins control the lifecycle thereafter) — so status integrity is
-- preserved. Run AFTER 0002.
--
-- 'draft' already exists in the application_status enum (added in 0002).

-- Allow students to UPDATE their own application only while it is a draft, and
-- only to keep it a draft or move it to 'submitted'. This is the sole student
-- write path for status; all later transitions remain admin-only.
drop policy if exists "students update own drafts" on public.applications;
create policy "students update own drafts" on public.applications for update
  using (auth.uid() = applicant_id and status = 'draft')
  with check (auth.uid() = applicant_id and status in ('draft', 'submitted'));

-- Students need table-level UPDATE privilege too (RLS still gates the rows).
grant update on public.applications to authenticated;

-- Note: the 'submitted' trigger (on_application_insert) logs history + notifies
-- on INSERT. For the draft→submitted path we also want a submit event; the app
-- inserts a status_history row on submit. If you prefer DB-driven history for
-- the draft→submitted transition, add an UPDATE trigger mirroring
-- on_application_status_change for when status moves from 'draft' to 'submitted'.
