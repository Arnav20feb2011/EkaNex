-- EkaNex real project seed — Winter 2026 roles for the two verified partners.
-- Source: provided by EkaNex (Partner Sheet). Idempotent by legacy_id.
-- Links each project to its company by name; published so students can browse/apply.

insert into public.projects (legacy_id, company_id, role_title, role_short, role_description, sector, location, work_type, skills, window_label, is_published)
select 'columbus-retail-audit', c.id, 'Retail Audit Intern', 'Field Audit',
       'Visits the 15 retail points, photographs shelf presence, records pricing and competitor facings on a standard form.',
       'Footwear manufacturing', 'NCR — office + market (TBC)', 'Hybrid',
       array['Field comfort','Mobile forms','Punctuality'], '21–31 Dec 2026', true
from public.companies c where c.name = 'Columbus Footwear Ltd'
and not exists (select 1 from public.projects p where p.legacy_id = 'columbus-retail-audit');

insert into public.projects (legacy_id, company_id, role_title, role_short, role_description, sector, location, work_type, skills, window_label, is_published)
select 'columbus-sales-analyst', c.id, 'Sales Data Analyst', 'Sales Analysis',
       'Cuts 12 months of sales by channel, region and SKU, finds the dormant outlets, builds the coverage plan.',
       'Footwear manufacturing', 'NCR — office + market (TBC)', 'Hybrid',
       array['Sheets (pivots, VLOOKUP)','Charting'], '21–31 Dec 2026', true
from public.companies c where c.name = 'Columbus Footwear Ltd'
and not exists (select 1 from public.projects p where p.legacy_id = 'columbus-sales-analyst');

insert into public.projects (legacy_id, company_id, role_title, role_short, role_description, sector, location, work_type, skills, window_label, is_published)
select 'aadi-ecom-listing', c.id, 'E-commerce Listing Analyst', 'Digital Audit',
       'Audits marketplace and search presence versus 5 competitors and drafts improved listings.',
       'Polymers / plastics manufacturing', 'NCR (TBC)', 'Remote',
       array['Amazon/Flipkart familiarity','Copywriting','Sheets'], '7–18 Dec 2026', true
from public.companies c where c.name = 'Aadi Polymers Pvt Ltd'
and not exists (select 1 from public.projects p where p.legacy_id = 'aadi-ecom-listing');

insert into public.projects (legacy_id, company_id, role_title, role_short, role_description, sector, location, work_type, skills, window_label, is_published)
select 'aadi-dealer-research', c.id, 'Dealer Research Intern', 'Channel Research',
       'Runs the 10 dealer interviews and builds the dealer-support kit.',
       'Polymers / plastics manufacturing', 'NCR (TBC)', 'Remote',
       array['Hindi','Phone/field confidence','Slides'], '7–18 Dec 2026', true
from public.companies c where c.name = 'Aadi Polymers Pvt Ltd'
and not exists (select 1 from public.projects p where p.legacy_id = 'aadi-dealer-research');

select p.role_title, c.name, p.work_type, p.is_published
from public.projects p join public.companies c on c.id = p.company_id
order by c.name, p.role_title;
