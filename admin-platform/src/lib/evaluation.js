// EkaNex AI Application Evaluator (Rubric Engine v1)
// -----------------------------------------------------------------------------
// This module scores a submitted application across many *separate* evaluation
// modules (one per competency) rather than producing a single opaque number.
// Each module returns a 0–100 score AND a plain-English reason, so every score
// is explainable to the human reviewer.
//
// IMPORTANT — fairness:
//   The evaluator reads ONLY merit-relevant fields (skills, experience, written
//   answers, availability, portfolio, academic self-report). It never reads or
//   uses protected or irrelevant personal characteristics. The list of excluded
//   fields is exported as PROTECTED_EXCLUDED and surfaced in the UI.
//
// The output is advisory. It assists the human reviewer and never makes the
// final decision. In production the same contract can be fulfilled by an LLM
// edge function returning this shape — no UI changes required.

import { recommendationFor } from './status';

export const EVALUATOR_MODEL = 'EkaNex Rubric Evaluator v1';

// Fields the evaluator is forbidden from using to score or rank an applicant.
export const PROTECTED_EXCLUDED = [
  'Gender', 'Religion', 'Ethnicity / caste', 'Nationality', 'Disability',
  'Age / date of birth', 'Name', 'Address', 'Family / guardian identity', 'Photo',
];

/* ------------------------------- text helpers ------------------------------ */
const str = (v) => (typeof v === 'string' ? v : v == null ? '' : String(v));
const words = (s) => str(s).trim().split(/\s+/).filter(Boolean);
const wc = (s) => words(s).length;
const sentences = (s) => str(s).split(/[.!?]+/).map((x) => x.trim()).filter((x) => x.length > 2);
const lc = (s) => str(s).toLowerCase();
const hits = (s, arr) => { const t = lc(s); return arr.filter((k) => t.includes(k)); };
const clamp = (n, a = 0, b = 100) => Math.max(a, Math.min(b, Math.round(n)));
const arr = (v) => (Array.isArray(v) ? v : v ? [v] : []);
const pts = (cond, n) => (cond ? n : 0);

// A reusable "quality of written prose" signal: rewards length up to a ceiling,
// multi-sentence structure, and analytical connective words.
function proseQuality(text) {
  const n = wc(text);
  if (n === 0) return { score: 0, n, structure: 0 };
  const len = Math.min(45, (n / 120) * 45); // up to 45 for ~120+ words
  const s = sentences(text).length;
  const structure = Math.min(25, s * 6); // up to 25 for 4+ sentences
  const connectives = hits(text, ['because', 'however', 'therefore', 'although', 'so that', 'in order to', 'which means', 'this means', 'as a result', 'for example', 'specifically']);
  const analytical = Math.min(30, connectives.length * 8);
  return { score: clamp(len + structure + analytical), n, structure: s };
}

/* ------------------------------ scoring modules ---------------------------- */
// Each module: (f, opp) => { score, reason }

function mAcademic(f) {
  let s = 50;
  const perf = lc(f.performance);
  const gradeSignals = hits(perf, ['distinction', 'rank', 'top', 'honou', '90', '95', 'a*', 'a1', '9.', '8.', '7.', 'gpa', 'percentile', 'scholar', 'award']);
  s += Math.min(22, gradeSignals.length * 7);
  s += Math.min(12, arr(f.strongestSubjects || f.strongestSubjects).length ? 6 : (wc(f.strongestSubjects) ? 6 : 0));
  s += pts(wc(f.achievements) > 8, 10);
  s += pts(!!f.curriculum, 4);
  const detail = wc(f.performance) > 10 ? '' : ' Self-reported academic detail is thin, so this reflects limited information.';
  return {
    score: clamp(s),
    reason: `Based on self-reported performance${gradeSignals.length ? ` (signals: ${gradeSignals.slice(0, 3).join(', ')})` : ''}, stated strong subjects and listed achievements.${detail}`,
  };
}

function mSkills(f, opp) {
  const skills = arr(f.skills);
  let s = 40 + Math.min(30, skills.length * 6);
  s += pts(wc(f.topSkills) > 12, 10);
  s += pts(wc(f.certifications) > 3, 8);
  const conf = Number(f.confidence) || 0;
  s += Math.min(12, conf * 2.4);
  const need = arr(opp?.skills).map(lc);
  const matched = skills.filter((sk) => need.some((n) => n.includes(lc(sk)) || lc(sk).includes(n)));
  s += Math.min(10, matched.length * 5);
  return {
    score: clamp(s),
    reason: `${skills.length} skills selected${matched.length ? `, ${matched.length} directly matching this role's requirements (${matched.slice(0, 3).join(', ')})` : ''}. ${wc(f.topSkills) > 12 ? 'Skills are described with specifics.' : 'Skill description is brief.'}`,
  };
}

function mExperience(f) {
  const exps = arr(f.experiences);
  const described = exps.filter((e) => wc(typeof e === 'string' ? e : (e?.detail || e?.description || e?.role || JSON.stringify(e))) > 4);
  let s = 44 + Math.min(34, described.length * 17);
  s += pts(wc(f.achievements) > 20, 8);
  const first = exps.length === 0;
  return {
    score: clamp(first ? 48 : s),
    reason: first
      ? 'No prior experience listed. This is expected for a first real project and is not penalised heavily — it is scored on potential, not pedigree.'
      : `${exps.length} experience item(s) provided${described.length ? `, ${described.length} with meaningful detail` : ', with limited detail'}.`,
  };
}

function mLeadership(f) {
  const blob = [f.achievements, f.motivation, f.whyYou, JSON.stringify(f.experiences || '')].join(' ');
  const k = hits(blob, ['led', 'leader', 'captain', 'president', 'head of', 'founded', 'organis', 'organiz', 'coordinat', 'initiative', 'mentored', 'volunteer', 'managed', 'ran the', 'started a club', 'team lead']);
  const s = clamp(42 + k.length * 10);
  return { score: s, reason: k.length ? `Leadership signals found: ${[...new Set(k)].slice(0, 4).join(', ')}.` : 'No clear leadership examples surfaced in the written answers.' };
}

function mEntrepreneurship(f) {
  const blob = [f.achievements, f.motivation, f.whyYou, f.caseResponse, JSON.stringify(f.experiences || '')].join(' ');
  const k = hits(blob, ['started', 'launched', 'founded', 'business', 'venture', 'startup', 'sold', 'revenue', 'customers', 'profit', 'side project', 'built a', 'monetis', 'monetiz', 'market', 'pricing']);
  const s = clamp(40 + k.length * 9);
  return { score: s, reason: k.length ? `Entrepreneurial signals: ${[...new Set(k)].slice(0, 4).join(', ')}.` : 'Little evidence of building or commercial initiative in the answers.' };
}

function mCommunication(f) {
  const a = proseQuality(f.motivation);
  const b = proseQuality(f.whyYou);
  const c = proseQuality(f.caseResponse);
  const avg = (a.score + b.score + c.score) / 3;
  const s = clamp(avg * 0.85 + pts(!!f.linkedin, 8) + 7);
  return { score: s, reason: `Written answers average ${Math.round(avg)}/100 on clarity and structure across ${a.structure + b.structure + c.structure} sentences.${f.linkedin ? ' A LinkedIn profile was shared.' : ''}` };
}

function mProblemSolving(f) {
  const t = f.caseResponse;
  const q = proseQuality(t);
  const steps = hits(t, ['first', 'then', 'next', 'step', 'finally', 'after that', '1.', '2.', '3.']);
  const method = hits(t, ['data', 'research', 'survey', 'analyse', 'analyze', 'test', 'measure', 'metric', 'competitor', 'customer', 'segment', 'experiment', 'hypothes', 'root cause', 'compare']);
  const s = clamp(q.score * 0.45 + Math.min(25, steps.length * 6) + Math.min(30, method.length * 6));
  return {
    score: s,
    reason: `Case response ${wc(t) ? `(${wc(t)} words)` : 'is empty'}: ${steps.length ? 'shows a structured, step-wise approach' : 'lacks an explicit structure'}${method.length ? `; proposes concrete methods (${[...new Set(method)].slice(0, 4).join(', ')})` : '; few concrete methods proposed'}.`,
  };
}

function mCriticalThinking(f) {
  const blob = [f.caseResponse, f.motivation, f.whyYou].join(' ');
  const k = hits(blob, ['because', 'trade-off', 'tradeoff', 'however', 'assume', 'risk', 'alternative', 'compare', 'evaluate', 'depends', 'on the other hand', 'limitation', 'downside', 'prioritis', 'prioritiz', 'why']);
  const s = clamp(44 + k.length * 7);
  return { score: s, reason: k.length ? `Reasoning markers present: ${[...new Set(k)].slice(0, 4).join(', ')}, suggesting the applicant weighs options.` : 'Answers assert conclusions without visibly weighing alternatives or trade-offs.' };
}

function mTechnical(f) {
  const skills = arr(f.skills).map(lc).join(' ');
  const blob = [skills, lc(f.topSkills), lc(f.certifications)].join(' ');
  const k = hits(blob, ['sheet', 'excel', 'python', 'sql', 'data', 'analysis', 'analytics', 'research', 'seo', 'figma', 'design', 'code', 'coding', 'javascript', 'statistic', 'model', 'dashboard', 'canva', 'notion', 'automation']);
  let s = clamp(40 + k.length * 7 + pts(!!f.github, 10));
  return { score: s, reason: k.length ? `Technical tooling referenced: ${[...new Set(k)].slice(0, 5).join(', ')}${f.github ? '; GitHub shared' : ''}.` : 'Few technical tools or methods referenced in skills or certifications.' };
}

function mCreativity(f) {
  const blob = [f.motivation, f.whyYou, f.caseResponse, f.projectInterest].join(' ');
  const k = hits(blob, ['idea', 'creative', 'design', 'content', 'campaign', 'story', 'novel', 'imagine', 'brand', 'original', 'experiment', 'prototype']);
  const portfolio = (f.projectLinks ? 1 : 0) + (f.workSamples ? 1 : 0) + (f.website ? 1 : 0);
  const s = clamp(42 + k.length * 6 + portfolio * 7);
  return { score: s, reason: `${k.length ? `Creative language present (${[...new Set(k)].slice(0, 3).join(', ')})` : 'Limited creative framing in answers'}${portfolio ? `; ${portfolio} portfolio artefact(s) shared` : ''}.` };
}

function mProjectFit(f, opp) {
  const need = arr(opp?.skills).map(lc);
  const have = arr(f.skills).map(lc);
  const matched = have.filter((sk) => need.some((n) => n.includes(sk) || sk.includes(n)));
  const interest = lc([f.projectInterest, f.motivation, f.whyYou].join(' '));
  const mentionsDomain = opp ? hits(interest, [lc(opp.company), ...lc(opp.sector).split(/[^a-z]+/).filter((w) => w.length > 4)]).length : 0;
  const typeMatch = arr(f.projectTypes).length ? 6 : 0;
  const s = clamp(46 + Math.min(30, matched.length * 10) + Math.min(12, mentionsDomain * 6) + typeMatch);
  return {
    score: s,
    reason: opp
      ? `For ${opp.roleTitle} at ${opp.company}: ${matched.length}/${need.length || '—'} required skills matched${mentionsDomain ? '; answers reference the company or sector' : '; answers do not reference this specific company/sector'}.`
      : 'No specific role attached; scored on general readiness.',
  };
}

function mMotivation(f, opp) {
  const q = proseQuality([f.motivation, f.whyYou, f.learn].join('. '));
  const specific = opp ? hits([f.motivation, f.whyYou].join(' '), [lc(opp.company), lc(opp.roleTitle)]).length : 0;
  const s = clamp(q.score * 0.8 + specific * 10 + pts(wc(f.learn) > 8, 8));
  return { score: s, reason: `Motivation answers total ${wc([f.motivation, f.whyYou, f.learn].join(' '))} words${specific ? ' and name this specific role/company' : ' but stay generic about this specific role'}.` };
}

function mAvailability(f) {
  const hoursMap = { 'Under 5 hours': 55, '5–6 hours': 72, '6–8 hours': 85, '8–10 hours': 92, '10+ hours': 96 };
  let s = hoursMap[f.hoursWeek] ?? 60;
  const days = arr(f.workingDays).length;
  s += Math.min(8, days * 1.5);
  if (lc(f.holidays).includes('yes') || lc(f.holidays).includes('available')) s += 4;
  s = clamp(s);
  return { score: s, reason: `Offers ${f.hoursWeek || 'an unspecified weekly commitment'} across ${days || 'no selected'} day(s)${f.duration ? `, for ${f.duration}` : ''}.` };
}

function mPortfolio(f) {
  const parts = [
    ['Resume', f.resume], ['LinkedIn', f.linkedin], ['GitHub', f.github],
    ['Website', f.website], ['Project links', f.projectLinks], ['Work samples', f.workSamples],
  ].filter(([, v]) => !!v);
  const s = clamp(35 + parts.length * 12);
  return { score: s, reason: parts.length ? `Shared: ${parts.map(([k]) => k).join(', ')}.` : 'No resume, portfolio links or profiles attached.' };
}

function mCaseQuality(f) {
  const t = f.caseResponse;
  const q = proseQuality(t);
  const specific = hits(t, ['customer', 'acqui', 'retention', 'competitor', 'price', 'pricing', 'cost', 'margin', 'funnel', 'audience', 'engagement', 'conversion', 'data', 'test', 'segment', 'brand']);
  const s = clamp(q.score * 0.55 + Math.min(45, specific.length * 7));
  return {
    score: s,
    reason: `${wc(t) ? `${wc(t)}-word response` : 'No response'}: ${specific.length ? `identifies concrete business levers (${[...new Set(specific)].slice(0, 4).join(', ')})` : 'stays abstract with few concrete business levers'}.`,
  };
}

/* ------------------------- module registry + weights ----------------------- */
const MODULES = [
  { key: 'academic',        label: 'Academic Performance',   fn: mAcademic,        weight: 1.0 },
  { key: 'skills',          label: 'Relevant Skills',        fn: mSkills,          weight: 1.4 },
  { key: 'experience',      label: 'Previous Experience',    fn: mExperience,      weight: 0.8 },
  { key: 'leadership',      label: 'Leadership',             fn: mLeadership,      weight: 0.8 },
  { key: 'entrepreneurship',label: 'Entrepreneurship',       fn: mEntrepreneurship,weight: 0.6 },
  { key: 'communication',   label: 'Communication',          fn: mCommunication,   weight: 1.2 },
  { key: 'problemSolving',  label: 'Problem Solving',        fn: mProblemSolving,  weight: 1.5 },
  { key: 'criticalThinking',label: 'Critical Thinking',      fn: mCriticalThinking,weight: 1.2 },
  { key: 'technical',       label: 'Technical Ability',      fn: mTechnical,       weight: 1.1 },
  { key: 'creativity',      label: 'Creativity',             fn: mCreativity,      weight: 0.8 },
  { key: 'projectFit',      label: 'Project Relevance',      fn: mProjectFit,      weight: 1.5 },
  { key: 'motivation',      label: 'Motivation',             fn: mMotivation,      weight: 1.2 },
  { key: 'availability',    label: 'Availability',           fn: mAvailability,    weight: 0.9 },
  { key: 'portfolio',       label: 'Portfolio Quality',      fn: mPortfolio,       weight: 0.7 },
  { key: 'caseQuality',     label: 'Business Case Response', fn: mCaseQuality,     weight: 1.4 },
];

// A compact headline set (the 7 shown large in the example output).
export const HEADLINE_KEYS = ['academic', 'skills', 'experience', 'problemSolving', 'communication', 'motivation', 'projectFit'];

/* --------------------------- recommendation helpers ------------------------ */
const ROLE_ARCHETYPES = [
  { role: 'Research & Analysis Intern', keys: ['sheet', 'excel', 'data', 'research', 'analysis', 'analyst', 'statistic'] },
  { role: 'Content & Marketing Intern', keys: ['content', 'write', 'writing', 'linkedin', 'social', 'seo', 'brand', 'campaign', 'design', 'canva'] },
  { role: 'Operations & Process Intern', keys: ['process', 'operations', 'documentation', 'logistics', 'supply', 'sop', 'systems'] },
  { role: 'Product & Strategy Intern', keys: ['product', 'strategy', 'business', 'market', 'customer', 'pricing', 'competitor'] },
];

function recommendedRole(f) {
  const blob = lc([arr(f.skills).join(' '), f.topSkills, f.projectInterest, arr(f.projectTypes).join(' ')].join(' '));
  let best = ROLE_ARCHETYPES[0], bestN = -1;
  for (const a of ROLE_ARCHETYPES) {
    const n = hits(blob, a.keys).length;
    if (n > bestN) { best = a; bestN = n; }
  }
  return best.role;
}

function interviewQuestions(f, opp, scores) {
  const qs = [];
  if (opp) qs.push(`Walk me through, step by step, how you'd approach the ${opp.roleTitle} challenge at ${opp.company} in your first week.`);
  if (f.caseResponse) qs.push('In your business-case answer you suggested an approach — what data would you collect first, and how would you know it worked?');
  const weakest = [...scores].sort((a, b) => a.score - b.score)[0];
  if (weakest) qs.push(`Tell me about a time you had to improve on "${weakest.label.toLowerCase()}". What happened?`);
  qs.push('Describe a problem you solved on your own initiative, start to finish.');
  qs.push(`You said you can commit ${f.hoursWeek || 'some hours'} a week — how will you balance that with school during the project window?`);
  return qs.slice(0, 5);
}

function recommendedProjectTypes(f, opp) {
  const chosen = arr(f.projectTypes);
  const set = new Set(chosen);
  if (opp?.sector) set.add(opp.sector.split('·')[0].trim());
  const blob = lc([arr(f.skills).join(' '), f.topSkills].join(' '));
  if (hits(blob, ['content', 'write', 'social', 'seo']).length) set.add('Content & social');
  if (hits(blob, ['sheet', 'data', 'research']).length) set.add('Research & analysis');
  if (hits(blob, ['process', 'operations', 'sop']).length) set.add('Operations & process');
  return [...set].filter(Boolean).slice(0, 5);
}

/* ------------------------------- public API -------------------------------- */
/**
 * Evaluate a stored application. `application` has { details, opportunity }.
 * Returns a structured, explainable evaluation object (advisory only).
 */
export function evaluateApplication(application) {
  const f = application?.details || {};
  const opp = application?.opportunity || null;

  const scores = MODULES.map((m) => {
    const { score, reason } = m.fn(f, opp);
    return { key: m.key, label: m.label, score: clamp(score), reason, weight: m.weight };
  });

  const totalW = scores.reduce((s, c) => s + c.weight, 0);
  const overall = clamp(scores.reduce((s, c) => s + c.score * c.weight, 0) / totalW);

  const sorted = [...scores].sort((a, b) => b.score - a.score);
  const strengths = sorted.slice(0, 3).map((s) => ({ label: s.label, score: s.score, reason: s.reason }));
  const concerns = sorted.slice(-3).reverse().map((s) => ({ label: s.label, score: s.score, reason: s.reason }));

  const rec = recommendationFor(overall);

  return {
    model: EVALUATOR_MODEL,
    generatedAt: new Date().toISOString(),
    overall,
    scores,
    headline: HEADLINE_KEYS.map((k) => scores.find((s) => s.key === k)).filter(Boolean),
    strengths,
    concerns,
    recommendedProjectTypes: recommendedProjectTypes(f, opp),
    recommendedRole: recommendedRole(f),
    interviewQuestions: interviewQuestions(f, opp, scores),
    recommendation: rec.key,
    recommendationLabel: rec.label,
    summary: buildSummary(f, opp, overall, strengths, concerns),
    protectedExcluded: PROTECTED_EXCLUDED,
    fairnessNote: 'Scored only on merit-relevant evidence. Protected and personal characteristics were excluded. This is an AI aid — a human makes the final decision.',
  };
}

function buildSummary(f, opp, overall, strengths, concerns) {
  const name = f.preferredName || f.fullName || 'The applicant';
  return `${name} scores ${overall}/100 overall${opp ? ` for ${opp.roleTitle} at ${opp.company}` : ''}. Strongest in ${strengths.map((s) => s.label.toLowerCase()).slice(0, 2).join(' and ')}; watch ${concerns[0] ? concerns[0].label.toLowerCase() : 'nothing major'}.`;
}
