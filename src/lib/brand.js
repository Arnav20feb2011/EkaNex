// Deterministic, distinct avatar branding for each partner company. We don't
// hold real brand logos, so every company gets a consistent, good-looking
// monogram tile — a unique gradient derived from its name + its initials.
// Same name always yields the same colours.

const PAIRS = [
  ['#1F3864', '#2563EB'], // navy → electric
  ['#0F766E', '#14B8A6'], // teal
  ['#B45309', '#F59E0B'], // amber
  ['#4338CA', '#6366F1'], // indigo
  ['#9D174D', '#EC4899'], // magenta
  ['#15803D', '#22C55E'], // green
  ['#334155', '#64748B'], // slate
  ['#7C2D12', '#EA580C'], // orange
  ['#6D28D9', '#A78BFA'], // violet
  ['#0E7490', '#06B6D4'], // cyan
];

export function initials(name) {
  const parts = (name || 'EK').split(/\s+/).filter(Boolean);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase(); // "OneNDF" → "ON"
  return (parts[0][0] + parts[1][0]).toUpperCase();                   // "Aadi Polymers …" → "AP"
}

function hash(s) {
  let h = 0;
  for (let i = 0; i < (s || '').length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0;
  return h;
}

// Fixed, distinct colours for the current partner roster (guaranteed unique +
// consistent across browse and detail). Unknown companies fall back to a hash.
const KNOWN = {
  'OneNDF': 0,
  'Balaji Aluminium': 3,
  'Today Footwear': 5,
  'Giriraj Coated': 1,
  'Columbus Footwear Ltd': 9,
  'Aadi Polymers Pvt Ltd': 2,
  'Paras Polycab Pvt Ltd': 4,
  'Kanodia Global Private Limited': 7,
  'Future Footwear': 8,
};

export function companyGradient(name) {
  const i = KNOWN[name] !== undefined ? KNOWN[name] : hash(name) % PAIRS.length;
  const [from, to] = PAIRS[i];
  return { from, to };
}
