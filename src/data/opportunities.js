// Single source of truth for the company + role data shown in the Apply flow
// (discovery cards and role-detail pages read from here — nothing is hardcoded
// in the components). Grounded in the EkaNex Winter 2026 programme roles.
//
// workType is a normalised category used for filtering: 'Remote' | 'Hybrid' | 'On-site'.

export const OPPORTUNITIES = [
  {
    id: 'onendf-content',
    company: 'OneNDF',
    initials: 'ON',
    logoFrom: '#1F3864',
    logoTo: '#2563EB',
    verified: true,
    sector: 'Fintech · SME debt marketplace',
    companyDescription:
      'A New Delhi fintech running an API-enabled SME loan and debt marketplace that connects businesses with lenders and NBFCs.',
    roleTitle: 'B2B Content Intern',
    roleShort: 'Map competitor content and draft LinkedIn posts that build lender-grade credibility.',
    roleDescription:
      'You drive the content half of OneNDF’s fintech positioning project. You map competitor content themes across comparable lenders and draft 10 LinkedIn posts in the company’s voice to build the inbound credibility a CFO needs before the first call. The work uses LinkedIn literacy and clear business writing.',
    responsibilities: [
      'Map competitor LinkedIn and website content themes',
      'Draft 10 LinkedIn posts in OneNDF’s voice',
      'Support the 6-week content plan',
    ],
    skills: ['LinkedIn literacy', 'Clear business writing', 'Basic research'],
    location: 'Remote — Delhi office optional',
    workType: 'Remote',
    window: 'Cohort 1 · 7–18 Dec 2026',
    deadline: 'Rolling for Cohort 1, 2026',
    applicationProcess:
      'Apply via EkaNex → short screening call → matched to the project → parental consent + confidentiality undertaking → start.',
  },
  {
    id: 'balaji-analyst',
    company: 'Balaji Aluminium',
    initials: 'BA',
    logoFrom: '#334155',
    logoTo: '#64748B',
    verified: true,
    sector: 'Aluminium extrusion · B2B manufacturing',
    companyDescription:
      'Balaji Aluminium Extrusions — an aluminium extrusion manufacturer in Bahadurgarh (Delhi NCR) supplying profiles and sections to fabricators, builders and OEMs.',
    roleTitle: 'Competitor Intelligence Analyst',
    roleShort: 'Build an 8×10 competitor matrix and a positioning summary from public data and calls.',
    roleDescription:
      'You build the analytical core of Balaji Aluminium’s competitor study. You assemble an 8×10 competitor matrix from public data and interview notes, score Balaji against each rival on price, terms, lead time and scale, and write a short positioning summary. The work uses spreadsheets and desk research, including reading GST/MCA listings.',
    responsibilities: [
      'Compile an 8-firm × 10-parameter competitor matrix from public sources',
      'Score Balaji against each competitor',
      'Write a 5-slide positioning summary',
    ],
    skills: ['Google Sheets', 'Desk research', 'Reading a company (GST/MCA) listing'],
    location: 'NCR — plant/office',
    workType: 'Hybrid',
    window: 'Cohort 1 · 7–18 Dec 2026',
    deadline: 'Rolling for Cohort 1, 2026',
    applicationProcess:
      'Apply via EkaNex → short screening call → matched to the project → parental consent + confidentiality undertaking → start.',
  },
  {
    id: 'today-recovery',
    company: 'Today Footwear',
    initials: 'TF',
    logoFrom: '#B45309',
    logoTo: '#F59E0B',
    verified: true,
    sector: 'Footwear manufacturing',
    companyDescription:
      'Today Footwear — a footwear manufacturer in the Bahadurgarh footwear hub (Delhi NCR) producing ladies, gents and kids footwear.',
    roleTitle: 'Material Recovery Analyst',
    roleShort: 'Turn factory scrap data into recoverable margin with a costed segregation plan.',
    roleDescription:
      'You turn Today Footwear’s scrap data into recoverable margin. You price each scrap category with local NCR buyers, build a recovery model, and write a segregation-at-source SOP with 2–3 reuse/resale routes and an estimated annual value. The work uses spreadsheets, cost analysis and vendor calling.',
    responsibilities: [
      'Price scrap categories with NCR scrap buyers',
      'Build the recovery / costing model',
      'Draft a segregation SOP + costed recovery proposal',
    ],
    skills: ['Google Sheets', 'Cost analysis', 'Vendor calling'],
    location: 'NCR / Bahadurgarh belt',
    workType: 'On-site',
    window: 'Cohort 1 · 21–31 Dec 2026',
    deadline: 'Rolling for Cohort 1, 2026',
    applicationProcess:
      'Apply via EkaNex → screening → parental consent + on-site safety induction (under-18 factory access confirmed per site) → confidentiality undertaking → start.',
  },
  {
    id: 'giriraj-systems',
    company: 'Giriraj Coated',
    initials: 'GC',
    logoFrom: '#0F766E',
    logoTo: '#14B8A6',
    verified: true,
    sector: 'PVC coated fabric · process manufacturing',
    companyDescription:
      'Giriraj Coated — a PVC coated fabric and synthetic-leather manufacturer in Bahadurgarh (Delhi NCR), running shift-based production.',
    roleTitle: 'Org Structure & Systems Intern',
    roleShort: 'Design and launch a shop-floor suggestion system with a real response SLA.',
    roleDescription:
      'You design the reporting and suggestion system for Giriraj Coated. You map the current reporting structure and where information stops, design a suggestion mechanism (box plus a weekly huddle) with a response SLA and a named owner, and launch it — logging and categorising the first two weeks of suggestions. The work uses process design, documentation and spreadsheets.',
    responsibilities: [
      'Map the org and information flow (find where information stops)',
      'Design the suggestion mechanism + SLA and owner',
      'Launch it and log/categorise the first suggestions',
    ],
    skills: ['Process design', 'Documentation', 'Google Sheets'],
    location: 'NCR — plant',
    workType: 'On-site',
    window: 'Cohort 1 · 21–31 Dec 2026',
    deadline: 'Rolling for Cohort 1, 2026',
    applicationProcess:
      'Apply via EkaNex → screening → parental consent + on-site safety induction (under-18 factory access confirmed per site) → confidentiality undertaking → start.',
  },
  {
    id: 'columbus-sales',
    company: 'Columbus',
    initials: 'CO',
    logoFrom: '#4338CA',
    logoTo: '#6366F1',
    verified: false,
    sector: 'Consumer products · distribution',
    companyDescription:
      'A consumer-products / distribution business in Delhi NCR looking to understand where its sales are leaking across channels and outlets.',
    roleTitle: 'Sales Data Analyst',
    roleShort: 'Diagnose sales leakage by channel, region and SKU and build a coverage plan.',
    roleDescription:
      'You diagnose where the company’s sales are leaking. You cut 12 months of sales by channel, region and SKU, identify the top-performing and dormant outlets, and build a targeted coverage-expansion plan with 90-day targets. The work uses spreadsheets (pivots, VLOOKUP) and charting.',
    responsibilities: [
      'Break down 12 months of sales by channel/region/SKU',
      'Identify the top 20% and the dormant outlets',
      'Build a coverage-expansion plan with 90-day targets',
    ],
    skills: ['Google Sheets (pivots, VLOOKUP)', 'Charting', 'Analytical thinking'],
    location: 'NCR — office + market',
    workType: 'Hybrid',
    window: 'Cohort 1 · 21–31 Dec 2026',
    deadline: 'Rolling for Cohort 1, 2026',
    applicationProcess:
      'Apply via EkaNex → short screening call → matched to the project → parental consent + confidentiality undertaking → start.',
  },
  {
    id: 'adhi-ecom',
    company: 'Adhi Foam',
    initials: 'AF',
    logoFrom: '#9F1239',
    logoTo: '#F43F5E',
    verified: false,
    sector: 'Foam / mattress manufacturing',
    companyDescription:
      'A foam and mattress manufacturer (Delhi NCR) selling through dealers and increasingly through online marketplaces.',
    roleTitle: 'E-commerce Listing Analyst',
    roleShort: 'Audit marketplace + search presence vs 5 rivals and rewrite the listings.',
    roleDescription:
      'You fix the search-first shopfront for a mattress brand. You audit its Amazon, Flipkart and search presence against five competitors — listings, pricing, images, review volume and rating — and draft improved listings. The work needs Amazon/Flipkart familiarity, copywriting and spreadsheets.',
    responsibilities: [
      'Audit marketplace + search presence versus 5 competitors',
      'Draft improved product listings',
      'Feed the marketplace listing-improvement plan',
    ],
    skills: ['Amazon/Flipkart familiarity', 'Copywriting', 'Google Sheets'],
    location: 'Remote + dealer visits · NCR',
    workType: 'Remote',
    window: 'Cohort 1 · 7–18 Dec 2026',
    deadline: 'Rolling for Cohort 1, 2026',
    applicationProcess:
      'Apply via EkaNex → short screening call → matched to the project → parental consent + confidentiality undertaking → start.',
  },
  {
    id: 'kanodia-strategy',
    company: 'Kanodia',
    initials: 'KA',
    logoFrom: '#57534E',
    logoTo: '#A8A29E',
    verified: false,
    sector: 'Cement · building materials',
    companyDescription:
      'A cement and building-materials brand (Greater Noida / NCR) whose sales run through dealers who also stock competitors.',
    roleTitle: 'Competitive Strategy Intern',
    roleShort: 'Build a 5-brand matrix and two prioritised, low-cost recommendations.',
    roleDescription:
      'You build the strategy output for a building-materials brand. You construct a 5-brand competitor matrix (price, dealer margin, credit period, delivery time, promotional support), analyse a 20-dealer survey, and write two prioritised recommendations where the gap is widest and cheapest to close. The work uses spreadsheets, desk research and recommendation writing.',
    responsibilities: [
      'Build a 5-brand competitor matrix',
      'Analyse the dealer survey results',
      'Write two prioritised recommendations',
    ],
    skills: ['Google Sheets', 'Desk research', 'Recommendation writing'],
    location: 'Greater Noida / NCR',
    workType: 'Hybrid',
    window: 'Cohort 1 · 7–18 Dec 2026',
    deadline: 'Rolling for Cohort 1, 2026',
    applicationProcess:
      'Apply via EkaNex → short screening call → matched to the project → parental consent + confidentiality undertaking → start.',
  },
  {
    id: 'truefit-people',
    company: 'True Fit',
    initials: 'TR',
    logoFrom: '#6D28D9',
    logoTo: '#8B5CF6',
    verified: false,
    sector: 'Garment manufacturing',
    companyDescription:
      'A garment / apparel manufacturer (Delhi NCR) with a line-based floor workforce, tackling high attrition.',
    roleTitle: 'People Analytics & Policy Intern',
    roleShort: 'Cost real attrition and design four low-cost retention interventions.',
    roleDescription:
      'You convert a garment factory’s HR records and floor interviews into a costed retention case. You build an attrition dashboard by department, cost one worker replacement end to end, and draft four low-cost retention interventions with an owner and timeline for each. The work uses spreadsheets, basic cost modelling and policy writing.',
    responsibilities: [
      'Build a departmental attrition dashboard from HR records',
      'Model the full end-to-end cost of one replacement',
      'Draft 4 costed retention interventions with owners/timelines',
    ],
    skills: ['Google Sheets', 'Basic cost modelling', 'Policy writing'],
    location: 'NCR — factory',
    workType: 'On-site',
    window: 'Cohort 1 · 21–31 Dec 2026',
    deadline: 'Rolling for Cohort 1, 2026',
    applicationProcess:
      'Apply via EkaNex → screening → parental consent + on-site safety induction (under-18 factory access confirmed per site) → confidentiality undertaking → start.',
  },
];

export const WORK_TYPES = ['All', 'Remote', 'Hybrid', 'On-site'];

export const ORG_TYPES = [
  'Small / medium business (SME)',
  'School',
  'Startup',
  'NGO / Non-profit',
  'Sponsor / Supporter',
  'Other',
];

export const STUDENT_YEARS = ['Grade 11', 'Grade 12', 'First-year undergraduate', 'Other'];

export function getOpportunity(id) {
  return OPPORTUNITIES.find((o) => o.id === id) || null;
}
