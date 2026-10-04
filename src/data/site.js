// Single source of truth for brand + contact details used across the site.
export const SITE = {
  name: 'EkaNex',
  tagline: 'Your first real project. Before you finish school.',
  location: 'Delhi NCR, India',
  launch: 'Launching 2026',
  email: 'arnavsinghalfeb@gmail.com',
  phone: '8527486694',
  phoneHref: 'tel:+918527486694',
  instagram: '@ekanex.in',
  instagramUrl: 'https://instagram.com/ekanex.in',
  linkedin: 'EkaNex Platform',
  linkedinUrl: 'https://www.linkedin.com/company/ekanex',
  responseTime: 'Within 2 working days',
};

// Primary navigation. The logo links home; Pricing lives on the Home page.
export const NAV_LINKS = [
  { label: 'About', to: '/about' },
  { label: 'How It Works', to: '/how-it-works' },
  { label: 'Who We Help', to: '/who-we-help' },
  { label: 'Contact', to: '/contact' },
];

// Footer navigation mirrors the primary nav wording.
export const FOOTER_LINKS = [
  { label: 'Home', to: '/' },
  { label: 'About Us', to: '/about' },
  { label: 'How It Works', to: '/how-it-works' },
  { label: 'Who We Help', to: '/who-we-help' },
  { label: 'Pricing', to: '/', hash: 'pricing' },
  { label: 'Contact Us', to: '/contact' },
];

// Dropdown options for the contact form. Also used to prefill from CTA buttons.
export const CONTACT_ROLES = ['Student', 'Parent', 'Organization', 'School', 'Other'];

// Enquiry categories for the split Contact page.
export const ORG_ENQUIRY_TYPES = [
  'School partnership',
  'SME collaboration',
  'Business enquiry',
  'Sponsorship',
  'General partnership request',
];

export const STUDENT_ENQUIRY_TYPES = [
  'Student registration',
  'Programme enquiry',
  'Support',
  'General question',
];
