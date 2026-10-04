-- EkaNex project detail columns (v6)
-- Richer role info sourced from the partner sheet: supervisor, start/end dates,
-- the detailed work arrangement, and seat confirmation status. Run AFTER 0002.

alter table public.projects add column if not exists supervisor  text;
alter table public.projects add column if not exists starts_on   date;
alter table public.projects add column if not exists ends_on     date;
alter table public.projects add column if not exists work_detail text;   -- e.g. "Remote + 2 site visits"
alter table public.projects add column if not exists seat_status text default 'Seat not yet confirmed';
