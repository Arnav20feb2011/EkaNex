// Single source of truth for the application lifecycle: statuses, the ordered
// pipeline used for timelines, colour tokens for badges, allowed transitions,
// next-step copy for students, and the AI recommendation vocabulary.

export const STATUS = {
  draft:        { key: 'draft',        label: 'Draft',          badge: 'bg-slate-100 text-slate-600',    dot: 'bg-slate-400',   next: 'Finish and submit your application.' },
  submitted:    { key: 'submitted',    label: 'Submitted',      badge: 'bg-sky-100 text-sky-700',        dot: 'bg-sky-500',     next: 'Our team will begin reviewing your application.' },
  under_review: { key: 'under_review', label: 'Under Review',   badge: 'bg-indigo-100 text-indigo-700',  dot: 'bg-indigo-500',  next: 'A reviewer is reading your application.' },
  ai_evaluated: { key: 'ai_evaluated', label: 'AI Evaluated',   badge: 'bg-violet-100 text-violet-700',  dot: 'bg-violet-500',  next: 'Your application has been scored and is awaiting a human decision.' },
  shortlisted:  { key: 'shortlisted',  label: 'Shortlisted',    badge: 'bg-amber-100 text-amber-700',    dot: 'bg-amber-500',   next: 'You have been shortlisted — expect an interview invitation soon.' },
  interview:    { key: 'interview',    label: 'Interview',      badge: 'bg-blue-100 text-blue-700',      dot: 'bg-blue-600',    next: 'Prepare for your screening call. Details will follow by email.' },
  selected:     { key: 'selected',     label: 'Selected',       badge: 'bg-emerald-100 text-emerald-700',dot: 'bg-emerald-500', next: 'Congratulations! You have been selected for this project.' },
  rejected:     { key: 'rejected',     label: 'Not selected',   badge: 'bg-rose-100 text-rose-600',      dot: 'bg-rose-400',    next: 'This application was not taken forward. Keep applying to other projects.' },
  withdrawn:    { key: 'withdrawn',    label: 'Withdrawn',      badge: 'bg-slate-100 text-slate-500',    dot: 'bg-slate-300',   next: 'You withdrew this application.' },
};

// The full internal pipeline (admin view).
export const PIPELINE = ['submitted', 'under_review', 'ai_evaluated', 'shortlisted', 'interview', 'selected'];

// Terminal statuses that sit off the happy path.
export const TERMINAL = ['rejected', 'withdrawn'];

export const ALL_STATUSES = [...PIPELINE, ...TERMINAL];

export function statusMeta(key) {
  return STATUS[key] || STATUS.submitted;
}

export function statusLabel(key) {
  return statusMeta(key).label;
}

// ---------------------------------------------------------------------------
// Student-facing projection. Students must NEVER see the AI step, scores, or
// any internal evaluation state. `ai_evaluated` is an internal status that is
// collapsed back to "Under Review" for the student. The student timeline uses
// STUDENT_PIPELINE only.
// ---------------------------------------------------------------------------
export const STUDENT_PIPELINE = ['submitted', 'under_review', 'shortlisted', 'interview', 'selected'];

// Map every internal status (incl. those driven by the separate admin platform)
// to a student-safe one. Students never see AI, admin-review, hold, or
// company-dispatch internals.
const STUDENT_MAP = {
  ai_evaluated: 'under_review',
  admin_reviewed: 'under_review',
  hold: 'under_review',
  approved: 'shortlisted',
  sent_to_company: 'shortlisted',
  company_reviewing: 'interview',
};
export function studentStatusKey(key) {
  return STUDENT_MAP[key] || key;
}

export function studentStatusMeta(key) {
  return statusMeta(studentStatusKey(key));
}

// What an admin is allowed to move an application to from its current state.
export function allowedTransitions(current) {
  const base = {
    submitted:    ['under_review', 'shortlisted', 'rejected'],
    under_review: ['ai_evaluated', 'shortlisted', 'interview', 'rejected'],
    ai_evaluated: ['shortlisted', 'interview', 'rejected'],
    shortlisted:  ['interview', 'selected', 'rejected'],
    interview:    ['selected', 'rejected', 'shortlisted'],
    selected:     ['interview', 'rejected'],
    rejected:     ['under_review', 'shortlisted'],
    withdrawn:    [],
    draft:        ['submitted'],
  };
  return base[current] || [];
}

// AI recommendation vocabulary — shown clearly as AI-generated, advisory only.
export const RECOMMENDATION = {
  strongly_shortlist: { key: 'strongly_shortlist', label: 'Strongly Shortlist', badge: 'bg-emerald-100 text-emerald-700', min: 82 },
  shortlist:          { key: 'shortlist',          label: 'Shortlist',          badge: 'bg-amber-100 text-amber-700',    min: 68 },
  review_manually:    { key: 'review_manually',    label: 'Review Manually',    badge: 'bg-sky-100 text-sky-700',        min: 52 },
  do_not_shortlist:   { key: 'do_not_shortlist',   label: 'Do Not Shortlist',   badge: 'bg-rose-100 text-rose-600',      min: 0 },
};

export function recommendationFor(score) {
  if (score >= RECOMMENDATION.strongly_shortlist.min) return RECOMMENDATION.strongly_shortlist;
  if (score >= RECOMMENDATION.shortlist.min) return RECOMMENDATION.shortlist;
  if (score >= RECOMMENDATION.review_manually.min) return RECOMMENDATION.review_manually;
  return RECOMMENDATION.do_not_shortlist;
}

// A colour band for a 0–100 score, used by rings and bars across dashboards.
export function scoreTone(score) {
  if (score >= 80) return { text: 'text-emerald-600', bar: 'bg-emerald-500', ring: '#10b981', soft: 'bg-emerald-50' };
  if (score >= 65) return { text: 'text-amber-600', bar: 'bg-amber-500', ring: '#f59e0b', soft: 'bg-amber-50' };
  if (score >= 50) return { text: 'text-sky-600', bar: 'bg-sky-500', ring: '#0ea5e9', soft: 'bg-sky-50' };
  return { text: 'text-rose-600', bar: 'bg-rose-500', ring: '#f43f5e', soft: 'bg-rose-50' };
}
