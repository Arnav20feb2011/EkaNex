# EkaNex — Workspace

This folder (`~/Desktop/EkaNex`) is the single home for all EkaNex work. Everything
lives here.

## What's inside

```
EkaNex/
├── src/                      # React app source (pages, components, apply flow, data)
├── public/                   # favicon, robots.txt, SPA redirect
├── dist/                     # built site served by the preview
├── deliverables/             # non-website outputs
│   ├── EkaNex - Company & Role Directory.xlsx
│   └── EkaNex Winter 2026 Partner Sheet (with Directory).xlsx
├── index.html                # HTML shell + SEO/meta
├── serve.mjs                 # tiny static server used by the local preview
├── package.json              # scripts + dependencies
├── tailwind.config.cjs / postcss.config.cjs
├── vite.config.js
├── README.md                 # website-specific documentation
└── WORKSPACE.md              # this file
```

## The website

The marketing site + multi-step Apply journey. Built with React + Vite + Tailwind +
Framer Motion. See `README.md` for full detail.

```bash
npm install      # once
npm run dev      # http://localhost:5173
npm run build    # optimized production build -> dist/
```

Key source areas:
- `src/pages/` — Home, About, How It Works, Who We Help, Contact, NotFound
- `src/apply/ApplyFlow.jsx` — the full-screen Apply journey (Who are you → Auth → Discover → Role → Apply)
- `src/data/opportunities.js` — company + role data driving the Apply flow
- `src/data/site.js` — brand, nav and contact details
- `src/components/` — shared design-system components

## Deliverables

`deliverables/` holds the spreadsheet work built from the EkaNex Winter 2026
Micro-Internship Partner Sheet:
- **EkaNex - Company & Role Directory.xlsx** — the "Company & Role Directory" + "Company
  Verification" tabs (import into the live Google Sheet via File → Import → Insert new sheet).
- **EkaNex Winter 2026 Partner Sheet (with Directory).xlsx** — the full workbook (all
  original tabs preserved) with those two new tabs added.

---
© 2026 EkaNex. Delhi NCR, India.
