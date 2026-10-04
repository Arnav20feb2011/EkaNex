# EkaNex — Marketing Website

> Your first real project. Before you finish school.

The production marketing website for **EkaNex**, a student-to-organisation
experiential learning and micro-internship platform based in Delhi NCR, India.
EkaNex connects ambitious Grade 11–12 students with real businesses to solve
real problems through structured 5–7 week project sprints.

Built with **React + Vite + Tailwind CSS + Framer Motion**.

---

## Tech stack

| Concern         | Choice                                  |
| --------------- | --------------------------------------- |
| Framework       | React 18 (Vite)                         |
| Routing         | React Router v6                         |
| Styling         | Tailwind CSS 3 (custom brand theme)     |
| Animation       | Framer Motion (scroll reveals + page transitions) |
| Icons           | lucide-react                            |
| SEO / head      | react-helmet-async                      |
| Fonts           | Inter (Google Fonts)                    |

## Getting started

```bash
npm install      # install dependencies
npm run dev      # start the dev server (http://localhost:5173)
npm run build    # build the production bundle into /dist
npm run preview  # preview the production build locally
```

Requires Node 18+ (developed on Node 20).

## Project structure

```
EkaNex/
├── index.html                 # HTML shell + base SEO/meta + Inter font
├── tailwind.config.js         # Brand colours, fonts, shadows, radii
├── public/
│   ├── favicon.svg            # EkaNex letter mark
│   ├── robots.txt
│   └── _redirects             # SPA fallback (Netlify-style hosts)
└── src/
    ├── main.jsx               # Entry: Router + HelmetProvider
    ├── App.jsx                # Layout shell + animated routes
    ├── index.css              # Tailwind layers + global base styles
    ├── data/site.js           # Brand + contact details, nav links, roles
    ├── components/
    │   ├── Navbar.jsx         # Sticky nav + full-screen mobile overlay
    │   ├── Footer.jsx
    │   ├── FloatingApplyButton.jsx  # Mobile sticky CTA after hero
    │   ├── ScrollManager.jsx  # Scroll-to-top + smooth hash scrolling
    │   ├── PageTransition.jsx # Per-page fade/slide (<main> landmark)
    │   ├── PageHero.jsx       # Navy page intro
    │   ├── Section.jsx        # Background + vertical-rhythm wrapper
    │   ├── SectionHeading.jsx
    │   ├── Reveal.jsx         # Fade-and-rise on scroll
    │   ├── Card.jsx           # 12px radius + shadow + hover lift
    │   ├── CTAButton.jsx      # Link/anchor/button with brand variants
    │   ├── ArrowLink.jsx      # Inline animated arrow link
    │   ├── CheckList.jsx
    │   ├── BenefitTabs.jsx    # Tabs on mobile / 3 columns on desktop
    │   ├── HeroVisual.jsx     # Hero workspace composition (no images)
    │   ├── ContactForm.jsx    # Validated, frontend-only contact form
    │   └── SEO.jsx            # Per-page title + meta
    └── pages/
        ├── Home.jsx
        ├── About.jsx
        ├── HowItWorks.jsx
        ├── WhoWeHelp.jsx
        ├── Contact.jsx
        └── NotFound.jsx
```

## Pages

- **Home** (`/`) — hero, what/why EkaNex, process summary, who we help, outcomes, pricing, contact CTA.
- **About** (`/about`) — vision, founder story, the problem, approach, future vision.
- **How It Works** (`/how-it-works`) — the 5 detailed steps + the week-by-week sprint table.
- **Who We Help** (`/who-we-help`) — dedicated sections for students, organizations, schools.
- **Contact** (`/contact`) — validated contact form, partnership enquiries, socials.

## Notes

- **Contact form** is frontend-only (static site): it validates input and shows a
  success message. Wire `handleSubmit` in `src/components/ContactForm.jsx` to a
  backend / form service (e.g. Formspree, a serverless function) when ready.
- **Pricing** is intentionally shown as "Coming Soon" — the initial 2026 cohort is
  complimentary for all participants, and students are always free.
- **CTA prefill** — "Apply as a Student" / "Post a Project" / school CTAs pass a
  role via router state so the contact form's "I am a…" field is pre-selected.
- All imagery is rendered with CSS/SVG, so there are no external image requests to
  optimise or that can break.

## Deployment

Any static host works. Build with `npm run build` and serve `/dist`.
The included `public/_redirects` enables SPA deep-linking on Netlify; for other
hosts, configure a catch-all rewrite to `/index.html`.

---

© 2026 EkaNex. Delhi NCR, India. All rights reserved.
