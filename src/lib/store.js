// Local demo data store — the "backend" when Supabase isn't wired up.
// -----------------------------------------------------------------------------
// Everything persists to localStorage so the admin dashboard, student dashboard,
// AI evaluations, notes, status history and notifications all behave like a real
// multi-user system in the preview. The shape mirrors the Supabase tables in
// supabase/migrations/0002_platform.sql, so swapping to the live backend is a
// matter of changing src/lib/api.js — components never touch this file directly.

import { OPPORTUNITIES } from '../data/opportunities';
import { evaluateApplication } from './evaluation';
import { statusMeta, studentStatusKey } from './status';

const ROOT = 'ekanex.store.v1';
const EVT = 'ekanex:store';

const now = () => new Date().toISOString();
const uid = () => (crypto?.randomUUID ? crypto.randomUUID() : 'id-' + Math.random().toString(36).slice(2) + Date.now());

function blank() {
  return { seq: 0, applications: [], notifications: [], session: null, profiles: {} };
}

function load() {
  if (typeof localStorage === 'undefined') return blank();
  try {
    const raw = localStorage.getItem(ROOT);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

// No demo/seed data — the app shows only real data (from Supabase in live mode,
// or data created through real use of the app). Dashboards start empty.
let db = load() || blank();

function persist() {
  try {
    localStorage.setItem(ROOT, JSON.stringify(db));
  } catch { /* quota / SSR — ignore */ }
  if (typeof window !== 'undefined') window.dispatchEvent(new CustomEvent(EVT));
}

export function subscribe(cb) {
  if (typeof window === 'undefined') return () => {};
  const h = () => cb();
  window.addEventListener(EVT, h);
  window.addEventListener('storage', h);
  return () => {
    window.removeEventListener(EVT, h);
    window.removeEventListener('storage', h);
  };
}

function shortId() {
  db.seq += 1;
  return `EKX-26-${String(db.seq).padStart(4, '0')}`;
}

function oppSnapshot(opp) {
  if (!opp) return null;
  return {
    id: opp.id, company: opp.company, roleTitle: opp.roleTitle, sector: opp.sector,
    skills: opp.skills, workType: opp.workType, location: opp.location, initials: opp.initials,
    logoFrom: opp.logoFrom, logoTo: opp.logoTo,
  };
}

/* --------------------------------- session --------------------------------- */
export function getSession() { return db.session; }
export function setSession(s) { db.session = s; persist(); }
export function clearSession() { db.session = null; persist(); }

/* -------------------------------- profiles --------------------------------- */
export function getProfile(email) {
  if (!email) return null;
  return db.profiles[email.toLowerCase()] || null;
}
export function upsertProfile(email, patch) {
  if (!email) return;
  const k = email.toLowerCase();
  db.profiles[k] = { ...(db.profiles[k] || {}), ...patch, email, updatedAt: now() };
  persist();
  return db.profiles[k];
}

/* ------------------------------ applications -------------------------------- */
export function listApplications() {
  return [...db.applications].sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
}
export function getApplication(id) {
  return db.applications.find((a) => a.id === id || a.shortId === id) || null;
}
export function listApplicationsByEmail(email) {
  if (!email) return [];
  const e = email.toLowerCase();
  return listApplications().filter((a) => (a.applicantEmail || '').toLowerCase() === e);
}
export function hasApplied(email, opportunityId) {
  return listApplicationsByEmail(email).some((a) => a.opportunityId === opportunityId && a.status !== 'withdrawn');
}

// ---------------------------------------------------------------------------
// Student-safe projection. Mirrors the Supabase RLS: a student may read their
// OWN answers, application status and a clean progress timeline — but NEVER the
// AI evaluation, admin notes, or internal reviewer notes. These functions are
// what the student dashboard consumes; the raw records never reach the client.
// ---------------------------------------------------------------------------
function studentSafe(a) {
  if (!a) return null;
  // Build a clean timeline: collapse the AI stage into "Under Review", keep only
  // pipeline/terminal milestones, drop every internal note.
  const seen = new Set();
  const timeline = [];
  for (const h of a.history || []) {
    const key = studentStatusKey(h.status);
    if (seen.has(key)) continue;        // first time we hit each student-visible stage
    seen.add(key);
    timeline.push({ status: key, at: h.at });
  }
  return {
    id: a.id,
    shortId: a.shortId,
    applicantEmail: a.applicantEmail,
    applicantName: a.applicantName,
    opportunityId: a.opportunityId,
    opportunity: a.opportunity,
    details: a.details,                 // the student's own answers — theirs to see
    status: studentStatusKey(a.status), // never exposes 'ai_evaluated'
    assignment: a.assignment,
    createdAt: a.createdAt,
    updatedAt: a.updatedAt,
    timeline,
    // Intentionally omitted: aiEvaluation, notes, raw history notes.
  };
}

export function listStudentApplications(email) {
  return listApplicationsByEmail(email).map(studentSafe);
}
export function getStudentApplication(id, email) {
  const a = getApplication(id);
  if (!a) return null;
  if (email && (a.applicantEmail || '').toLowerCase() !== email.toLowerCase()) return null; // ownership guard
  return studentSafe(a);
}

export function createApplication({ opportunityId, opportunity, details, applicantEmail }) {
  const email = applicantEmail || details?.email || db.session?.email || null;
  const rec = {
    id: uid(),
    shortId: shortId(),
    applicantId: db.session?.id || null,
    applicantEmail: email,
    applicantName: details?.fullName || db.session?.name || 'Applicant',
    opportunityId,
    opportunity: oppSnapshot(opportunity),
    details: details || {},
    status: 'submitted',
    aiEvaluation: null,
    notes: [],
    history: [{ status: 'submitted', at: now(), by: 'student', note: 'Application submitted.' }],
    assignment: null,
    createdAt: now(),
    updatedAt: now(),
  };
  db.applications.push(rec);

  // Run AI evaluation immediately (advisory), advance status + log history.
  try {
    rec.aiEvaluation = evaluateApplication(rec);
    rec.status = 'ai_evaluated';
    rec.history.push({ status: 'under_review', at: now(), by: 'system', note: 'Entered review queue.' });
    rec.history.push({ status: 'ai_evaluated', at: now(), by: 'ai', note: `AI evaluation complete — overall ${rec.aiEvaluation.overall}/100 (${rec.aiEvaluation.recommendationLabel}).` });
  } catch (e) {
    rec.history.push({ status: 'under_review', at: now(), by: 'system', note: 'Entered review queue.' });
    rec.status = 'under_review';
  }

  // Student + admin notifications.
  notify({ scope: 'student', forEmail: email, type: 'received', title: 'Application received', body: `We've received your application for ${rec.opportunity?.roleTitle} at ${rec.opportunity?.company}.`, applicationId: rec.id });
  notify({ scope: 'admin', type: 'new_application', title: 'New application', body: `${rec.applicantName} applied for ${rec.opportunity?.roleTitle} at ${rec.opportunity?.company}.`, applicationId: rec.id });
  if (rec.aiEvaluation) {
    notify({ scope: 'admin', type: 'ai_done', title: 'AI evaluation complete', body: `${rec.applicantName}: ${rec.aiEvaluation.overall}/100 — ${rec.aiEvaluation.recommendationLabel}.`, applicationId: rec.id });
    if (rec.aiEvaluation.overall >= 82) notify({ scope: 'admin', type: 'high_scorer', title: 'High-scoring applicant', body: `${rec.applicantName} scored ${rec.aiEvaluation.overall}/100 for ${rec.opportunity?.roleTitle}.`, applicationId: rec.id });
  }

  persist();
  return rec;
}

export function setStatus(id, status, { by = 'admin', note } = {}) {
  const a = getApplication(id);
  if (!a) return null;
  a.status = status;
  a.updatedAt = now();
  a.history.push({ status, at: now(), by, note: note || `Status changed to ${statusMeta(status).label}.` });

  // Student notifications on meaningful milestones.
  const map = {
    shortlisted: { type: 'shortlisted', title: 'You have been shortlisted', body: `Great news — you've been shortlisted for ${a.opportunity?.roleTitle} at ${a.opportunity?.company}.` },
    interview:   { type: 'interview',   title: 'Interview invitation',     body: `You've been invited to interview for ${a.opportunity?.roleTitle} at ${a.opportunity?.company}.` },
    selected:    { type: 'selected',    title: 'You have been selected!',  body: `Congratulations — you've been selected for ${a.opportunity?.roleTitle} at ${a.opportunity?.company}.` },
    rejected:    { type: 'status',      title: 'Application update',        body: `Your application for ${a.opportunity?.roleTitle} at ${a.opportunity?.company} was not taken forward this time.` },
  };
  if (map[status]) notify({ scope: 'student', forEmail: a.applicantEmail, ...map[status], applicationId: a.id });
  if (status === 'selected') notify({ scope: 'admin', type: 'selected', title: 'Student selected', body: `${a.applicantName} reached Selected for ${a.opportunity?.roleTitle}.`, applicationId: a.id });

  persist();
  return a;
}

export function addNote(id, text, author = 'Admin') {
  const a = getApplication(id);
  if (!a || !text?.trim()) return null;
  const n = { id: uid(), text: text.trim(), author, at: now() };
  a.notes.push(n);
  a.updatedAt = now();
  persist();
  return n;
}

export function assignToProject(id, { projectId, company } = {}) {
  const a = getApplication(id);
  if (!a) return null;
  a.assignment = { projectId: projectId || a.opportunityId, company: company || a.opportunity?.company, at: now() };
  a.updatedAt = now();
  a.history.push({ status: a.status, at: now(), by: 'admin', note: `Assigned to ${a.assignment.company}.` });
  notify({ scope: 'student', forEmail: a.applicantEmail, type: 'assigned', title: 'Assigned to a project', body: `You've been assigned to ${a.assignment.company}.`, applicationId: a.id });
  persist();
  return a;
}

export function reEvaluate(id) {
  const a = getApplication(id);
  if (!a) return null;
  a.aiEvaluation = evaluateApplication(a);
  a.updatedAt = now();
  persist();
  return a;
}

/* ------------------------------ notifications ------------------------------- */
export function notify(n) {
  db.notifications.unshift({ id: uid(), read: false, at: now(), ...n });
}
export function listNotifications({ scope, forEmail } = {}) {
  return db.notifications.filter((n) => {
    if (scope && n.scope !== scope) return false;
    if (scope === 'student' && forEmail) return (n.forEmail || '').toLowerCase() === forEmail.toLowerCase();
    return true;
  });
}
export function markNotificationRead(id) {
  const n = db.notifications.find((x) => x.id === id);
  if (n) { n.read = true; persist(); }
}
export function markAllRead({ scope, forEmail } = {}) {
  listNotifications({ scope, forEmail }).forEach((n) => (n.read = true));
  persist();
}

/* -------------------------------- analytics -------------------------------- */
export function analytics() {
  const apps = db.applications;
  const total = apps.length;
  const weekAgo = Date.now() - 7 * 864e5;
  const thisWeek = apps.filter((a) => new Date(a.createdAt).getTime() >= weekAgo).length;

  const countBy = (fn) => apps.reduce((m, a) => { const k = fn(a) || '—'; m[k] = (m[k] || 0) + 1; return m; }, {});
  const bySchool = countBy((a) => a.details?.school);
  const byGrade = countBy((a) => a.details?.grade);
  const byProject = countBy((a) => a.opportunity?.company);
  const byStatus = countBy((a) => statusMeta(a.status).label);

  const scored = apps.filter((a) => a.aiEvaluation);
  const avgScore = scored.length ? Math.round(scored.reduce((s, a) => s + a.aiEvaluation.overall, 0) / scored.length) : 0;

  const shortlistedPlus = apps.filter((a) => ['shortlisted', 'interview', 'selected'].includes(a.status)).length;
  const selected = apps.filter((a) => a.status === 'selected').length;

  const skillCounts = {};
  apps.forEach((a) => (a.details?.skills || []).forEach((s) => (skillCounts[s] = (skillCounts[s] || 0) + 1)));
  const topSkills = Object.entries(skillCounts).sort((a, b) => b[1] - a[1]).slice(0, 8);

  return {
    total, thisWeek, avgScore,
    shortlistRate: total ? Math.round((shortlistedPlus / total) * 100) : 0,
    selectionRate: total ? Math.round((selected / total) * 100) : 0,
    bySchool, byGrade, byProject, byStatus, topSkills,
  };
}

/* ------------------------- cache replacement (live) ------------------------ */
// Replace the in-memory cache with data hydrated from Supabase. Used by api.js
// when running against the real backend; the UI reads this cache synchronously.
export function setData({ applications, notifications } = {}) {
  if (applications) db.applications = applications;
  if (notifications) db.notifications = notifications;
  persist();
}

/* --------------------------------- reset ----------------------------------- */
export function resetStore() {
  db = blank();
  persist();
}

/* ---------------------------------- seed ----------------------------------- */
// Clearly-labelled demo applicants so the admin + analytics views are alive on
// first run. Field keys match src/apply/ApplicationForm.jsx exactly.
function seed(d) {
  const find = (id) => OPPORTUNITIES.find((o) => o.id === id) || OPPORTUNITIES[0];
  const people = [
    {
      opp: 'balaji-analyst', email: 'aarav.demo@ekanex.work', daysAgo: 1,
      details: {
        fullName: 'Aarav Mehta (demo)', preferredName: 'Aarav', email: 'aarav.demo@ekanex.work', phone: '98xxxxxx01', city: 'Gurugram',
        school: 'Delhi Public School, R.K. Puram', curriculum: 'CBSE', grade: 'Grade 12', gradYear: '2026',
        performance: 'Consistent 94% average; ranked in the top 5 of my cohort; distinction in Mathematics and Economics.',
        strongestSubjects: 'Mathematics, Economics, Business Studies', interestSubjects: 'Data analysis, markets',
        achievements: 'Led the school Finance Club (president), organised an inter-school case competition for 120 students, and won first place at a regional economics olympiad.',
        skills: ['Google Sheets', 'Desk research', 'Data analysis', 'Clear business writing'],
        topSkills: 'I build competitor matrices in Google Sheets, read GST/MCA filings for company research, and turn messy data into a one-page summary with charts.',
        certifications: 'Google Data Analytics (in progress)', confidence: 5,
        experiences: [{ role: 'Research volunteer', org: 'Local NGO', detail: 'Built a spreadsheet model comparing vendor prices, saving ~8% on procurement.' }],
        resume: 'aarav-mehta-resume.pdf', linkedin: 'https://linkedin.com/in/demo-aarav', github: '', website: '', projectLinks: 'https://drive.example/competitor-study', workSamples: '',
        projectInterest: 'I want to work on Balaji Aluminium\'s competitor intelligence because manufacturing pricing is exactly the kind of real market analysis I enjoy.',
        projectTypes: ['Research & analysis', 'Operations & process'], learn: 'How industrial B2B firms actually position on price and lead time.',
        startDate: '2026-12-07', duration: '6 weeks', hoursWeek: '8–10 hours', workingDays: ['Mon', 'Wed', 'Fri', 'Sat'], workingHours: ['Afternoons', 'Weekends'], holidays: 'Yes, fully available over winter break',
        teamMode: 'Either works', teamRole: 'Analyst', teamSize: '3',
        motivation: 'I am applying to Balaji Aluminium because I want to test whether the market analysis I enjoy on paper holds up against a real factory\'s numbers. I have built competitor matrices before and I want to do it where the stakes are real, because that is how I\'ll learn fastest.',
        whyYou: 'I am quick with spreadsheets, comfortable cold-calling for data, and I write a tight summary. I finish what I start.',
        caseResponse: 'First, I would define the problem: the client does not know where it stands on price and lead time. Then I would collect data from GST/MCA filings, competitor websites and 3-4 buyer calls to build an 8x10 matrix. Next I would score each competitor on price, terms, lead time and scale, and compare Balaji against them. Finally I would test my positioning summary with one real customer to check it reflects how buyers actually choose. I would measure success by whether sales can use the one-pager in a live pitch.',
        pgName: 'Priya Mehta', pgRelation: 'Mother', pgEmail: 'priya.demo@ekanex.work', pgPhone: '98xxxxxx02', pgConsentParticipate: 'Yes', pgConsentContact: 'Yes',
        declAccurate: true, declCommitment: true, declConduct: true, declParent: true, hearAbout: 'School / teacher', anythingElse: '',
      },
    },
    {
      opp: 'onendf-content', email: 'diya.demo@ekanex.work', daysAgo: 2,
      details: {
        fullName: 'Diya Sharma (demo)', preferredName: 'Diya', email: 'diya.demo@ekanex.work', phone: '98xxxxxx11', city: 'New Delhi',
        school: 'Sanskriti School', curriculum: 'CBSE', grade: 'Grade 11', gradYear: '2027',
        performance: 'Around 88% average, strongest in English and Business Studies.',
        strongestSubjects: 'English, Business Studies', interestSubjects: 'Writing, social media',
        achievements: 'Run the school Instagram (grew it from 400 to 2,100 followers), edit the student newsletter, and started a small sticker shop online.',
        skills: ['LinkedIn literacy', 'Clear business writing', 'Basic research', 'Canva / design'],
        topSkills: 'I write content in a brand voice, plan a weekly posting calendar, and design simple carousels in Canva.',
        certifications: 'HubSpot Content Marketing (free cert)', confidence: 4,
        experiences: [{ role: 'Social media lead', org: 'School council', detail: 'Planned and posted content for events; grew engagement.' }],
        resume: 'diya-sharma-resume.pdf', linkedin: 'https://linkedin.com/in/demo-diya', github: '', website: 'https://diya.example', projectLinks: '', workSamples: 'https://drive.example/diya-portfolio',
        projectInterest: 'OneNDF\'s B2B content role fits what I already do — writing credible posts for a specific audience.',
        projectTypes: ['Content & social'], learn: 'How to write for a B2B / fintech audience rather than a school one.',
        startDate: '2026-12-07', duration: '6 weeks', hoursWeek: '6–8 hours', workingDays: ['Tue', 'Thu', 'Sat'], workingHours: ['Evenings', 'Weekends'], holidays: 'Mostly available',
        teamMode: 'In a team', teamRole: 'Content / writing', teamSize: '2',
        motivation: 'I love writing content and I want to see if I can do it for a serious business audience, not just my school. I think fintech is hard because you have to sound credible, and that challenge is exactly why I want it.',
        whyYou: 'I already run a real account and write in a brand voice, so I can start producing posts quickly.',
        caseResponse: 'I would start by reading OneNDF\'s existing posts and three competitor lenders to map their content themes. Then I would draft posts around the gaps — for example, explaining debt options simply for a CFO. I would test two different tones on a small audience and keep whichever gets more engagement.',
        pgName: 'Ravi Sharma', pgRelation: 'Father', pgEmail: 'ravi.demo@ekanex.work', pgPhone: '98xxxxxx12', pgConsentParticipate: 'Yes', pgConsentContact: 'Yes',
        declAccurate: true, declCommitment: true, declConduct: true, declParent: true, hearAbout: 'Instagram', anythingElse: '',
      },
    },
    {
      opp: 'giriraj-systems', email: 'kabir.demo@ekanex.work', daysAgo: 3,
      details: {
        fullName: 'Kabir Nair (demo)', preferredName: 'Kabir', email: 'kabir.demo@ekanex.work', phone: '98xxxxxx21', city: 'Bahadurgarh',
        school: 'St. Xavier\'s Senior Secondary', curriculum: 'CBSE', grade: 'Grade 12', gradYear: '2026',
        performance: 'About 79% overall.',
        strongestSubjects: 'Physics, Computer Science', interestSubjects: 'How systems and processes work',
        achievements: 'Organised the logistics for the school science fair.',
        skills: ['Process design', 'Documentation', 'Google Sheets'],
        topSkills: 'I like mapping how a process works and writing it down clearly so others can follow it.',
        certifications: '', confidence: 3,
        experiences: [],
        resume: 'kabir-nair-resume.pdf', linkedin: '', github: '', website: '', projectLinks: '', workSamples: '',
        projectInterest: 'The Giriraj systems role is interesting because I like fixing how information flows.',
        projectTypes: ['Operations & process'], learn: 'How a real factory floor communicates.',
        startDate: '2026-12-21', duration: '7 weeks', hoursWeek: '5–6 hours', workingDays: ['Mon', 'Tue', 'Wed'], workingHours: ['Afternoons'], holidays: 'Available',
        teamMode: 'Either works', teamRole: 'Operations', teamSize: '3',
        motivation: 'I want to understand how a factory really runs and whether a suggestion system can actually change behaviour.',
        whyYou: 'I am organised and I document things clearly.',
        caseResponse: 'I would map the current reporting structure, then design a suggestion box plus a weekly huddle with a named owner and a response time, then launch it and log what comes in.',
        pgName: 'Anil Nair', pgRelation: 'Father', pgEmail: 'anil.demo@ekanex.work', pgPhone: '98xxxxxx22', pgConsentParticipate: 'Yes', pgConsentContact: 'Yes',
        declAccurate: true, declCommitment: true, declConduct: true, declParent: true, hearAbout: 'Friend', anythingElse: '',
      },
    },
    {
      opp: 'today-recovery', email: 'ananya.demo@ekanex.work', daysAgo: 5,
      details: {
        fullName: 'Ananya Gupta (demo)', preferredName: 'Ananya', email: 'ananya.demo@ekanex.work', phone: '98xxxxxx31', city: 'Rohtak',
        school: 'The Shri Ram School', curriculum: 'IB', grade: 'Grade 12', gradYear: '2026',
        performance: 'IB predicted 41/45; HL Economics and Mathematics.',
        strongestSubjects: 'Economics, Mathematics, Chemistry', interestSubjects: 'Cost analysis, sustainability',
        achievements: 'Founded a recycling drive that diverted 300kg of waste; presented at a youth sustainability summit; led a team of 6.',
        skills: ['Google Sheets', 'Cost analysis', 'Vendor calling', 'Desk research'],
        topSkills: 'I build costing models, call vendors for quotes, and I am comfortable negotiating for data.',
        certifications: 'Coursera: Fundamentals of Cost Accounting', confidence: 5,
        experiences: [{ role: 'Project lead', org: 'EcoClub', detail: 'Ran a waste-segregation pilot; modelled the cost savings in a spreadsheet.' }],
        resume: 'ananya-gupta-resume.pdf', linkedin: 'https://linkedin.com/in/demo-ananya', github: '', website: '', projectLinks: 'https://drive.example/ananya-costing', workSamples: '',
        projectInterest: 'Today Footwear\'s material recovery role is a perfect fit — turning scrap into margin is exactly the sustainability-meets-cost work I already do.',
        projectTypes: ['Research & analysis', 'Operations & process'], learn: 'How a real manufacturer prices and recovers scrap.',
        startDate: '2026-12-21', duration: '6 weeks', hoursWeek: '10+ hours', workingDays: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'], workingHours: ['Mornings', 'Afternoons'], holidays: 'Fully available',
        teamMode: 'In a team', teamRole: 'Analyst', teamSize: '3',
        motivation: 'I have run a recycling project before and seen how much value gets thrown away, so pricing and recovering scrap for a real factory is work I genuinely care about. I want to prove the savings are real, because a model only matters if the business can act on it.',
        whyYou: 'I combine cost analysis with the persistence to call vendors until I get real numbers, and I lead teams well.',
        caseResponse: 'First I would categorise the scrap and price each category by calling three NCR buyers to get real quotes, not estimates. Then I would build a recovery model showing annual value per category. Next I would write a segregation-at-source SOP with 2-3 reuse or resale routes, because recovery only works if the scrap is separated cleanly at the line. Finally I would test the SOP on one line for a week and measure how much clean, sellable scrap it produces versus the current mixed waste.',
        pgName: 'Meera Gupta', pgRelation: 'Mother', pgEmail: 'meera.demo@ekanex.work', pgPhone: '98xxxxxx32', pgConsentParticipate: 'Yes', pgConsentContact: 'Yes',
        declAccurate: true, declCommitment: true, declConduct: true, declParent: true, hearAbout: 'A partner company', anythingElse: '',
      },
    },
    {
      opp: 'columbus-sales', email: 'rohan.demo@ekanex.work', daysAgo: 6,
      details: {
        fullName: 'Rohan Verma (demo)', preferredName: 'Rohan', email: 'rohan.demo@ekanex.work', phone: '98xxxxxx41', city: 'Noida',
        school: 'Amity International', curriculum: 'CBSE', grade: 'Grade 11', gradYear: '2027',
        performance: '75%.',
        strongestSubjects: 'PE', interestSubjects: 'Business',
        achievements: 'Play cricket for the school.',
        skills: ['Basic research'],
        topSkills: 'I can do research.', certifications: '', confidence: 3,
        experiences: [],
        resume: '', linkedin: '', github: '', website: '', projectLinks: '', workSamples: '',
        projectInterest: 'Looks interesting.',
        projectTypes: [], learn: 'New things.',
        startDate: '', duration: 'Flexible', hoursWeek: 'Under 5 hours', workingDays: ['Sat'], workingHours: ['Flexible'], holidays: 'Maybe',
        teamMode: 'Either works', teamRole: '', teamSize: '',
        motivation: 'I want to do an internship because it will look good.',
        whyYou: 'I am hardworking.',
        caseResponse: 'I would try to get more customers by advertising.',
        pgName: 'Sunil Verma', pgRelation: 'Father', pgEmail: 'sunil.demo@ekanex.work', pgPhone: '98xxxxxx42', pgConsentParticipate: 'Yes', pgConsentContact: 'No',
        declAccurate: true, declCommitment: true, declConduct: true, declParent: true, hearAbout: 'Other', anythingElse: '',
      },
    },
  ];

  people.forEach((p) => {
    const opp = find(p.opp);
    d.seq += 1;
    const createdAt = new Date(Date.now() - p.daysAgo * 864e5).toISOString();
    const rec = {
      id: uid(), shortId: `EKX-26-${String(d.seq).padStart(4, '0')}`,
      applicantId: null, applicantEmail: p.email, applicantName: p.details.fullName,
      opportunityId: opp.id, opportunity: oppSnapshot(opp), details: p.details,
      status: 'ai_evaluated', aiEvaluation: null, notes: [], assignment: null,
      createdAt, updatedAt: createdAt,
      history: [
        { status: 'submitted', at: createdAt, by: 'student', note: 'Application submitted.' },
        { status: 'under_review', at: createdAt, by: 'system', note: 'Entered review queue.' },
      ],
    };
    rec.aiEvaluation = evaluateApplication(rec);
    rec.history.push({ status: 'ai_evaluated', at: createdAt, by: 'ai', note: `AI evaluation complete — overall ${rec.aiEvaluation.overall}/100 (${rec.aiEvaluation.recommendationLabel}).` });
    d.applications.push(rec);
  });

  // A couple of seed notifications for the admin inbox.
  d.notifications.push(
    { id: uid(), scope: 'admin', type: 'ai_done', title: 'AI evaluation complete', body: '5 demo applications evaluated and ready for review.', read: false, at: now() },
  );
}
