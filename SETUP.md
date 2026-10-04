# EkaNex — Go-live setup

The app runs fully in **demo mode** with no setup. Follow these steps to switch on
the real backend, analytics and hosting. Do them in order; each is independent and safe.

> 🔐 **Never paste secret keys into chat or commit them.** They go in a local
> `.env.local` file (git-ignored) and in Vercel's Environment Variables.

---

## 1. Supabase (auth + database + email)  ~15 min

1. Create a free project at **supabase.com** → New project.
2. In the dashboard: **SQL Editor → New query**, paste the contents of
   `supabase/migrations/0001_init.sql`, and **Run**. This creates the tables,
   security policies and the auto-profile trigger.
3. **Project Settings → API** → copy the **Project URL** and the **anon public** key.
4. Locally: `cp .env.example .env.local` and fill in:
   ```
   VITE_SUPABASE_URL=... (Project URL)
   VITE_SUPABASE_ANON_KEY=... (anon public key)
   ```
5. Run `npm run dev` → sign-ups now create real users, applications and enquiries
   land in the `applications` / `enquiries` tables, and profiles auto-create.

**Email:** enable Supabase Auth email confirmations (Authentication → Providers →
Email), and for custom transactional email add **Resend** as the SMTP provider
(Authentication → Emails → SMTP) or a Supabase Edge Function.

## 2. Vercel (hosting + your domain)  ~10 min

1. Push this folder to a **GitHub** repo.
2. On **vercel.com** → **Add New → Project** → import the repo. Vercel auto-detects
   Vite (config is already in `vercel.json`).
3. **Settings → Environment Variables** → add the same keys from your `.env.local`
   (`VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`, and later Sentry/PostHog).
4. **Deploy.** You'll get a `*.vercel.app` URL immediately.
5. **Settings → Domains** → add your domain → follow the DNS instructions
   (add the records at your domain registrar). HTTPS is automatic.
6. Back in Supabase: **Authentication → URL Configuration** → set the **Site URL**
   to your live domain so auth emails link correctly.

## 3. Analytics — PostHog (optional)  ~5 min

1. Create a project at **posthog.com**, copy the **Project API Key**.
2. Add to env: `VITE_POSTHOG_KEY=...` (and `VITE_POSTHOG_HOST` if EU).
3. Load the PostHog snippet in `index.html` (or add `posthog-js`); the app already
   calls `track()` on sign-up, sign-in and application events — they'll start flowing.

## 4. Error monitoring — Sentry (optional)  ~5 min

1. Create a project at **sentry.io**, copy the **DSN**.
2. Add `VITE_SENTRY_DSN=...`, then initialise Sentry in `src/main.jsx`
   (guarded by `isSentryConfigured`).

---

## What's wired already

- **Auth** — student & organization sign-up / sign-in (`src/lib/api.js` → Supabase Auth).
- **Applications** — recorded on "Apply" (`applications` table).
- **Enquiries** — both Contact forms + the org "Post a project" form (`enquiries` table).
- **Row-Level Security** — students only see their own applications; enquiries are
  insert-only for the public and read via the service role / an admin view.
- **Demo fallback** — with no keys, every action simulates success so the UX is
  fully preview-able.

## Still to build (roadmap)

Legal/compliance pages (Privacy, Terms, Safeguarding) + cookie consent · DPDP
parental-consent flow · student/org/admin dashboards · TypeScript · tests (Vitest +
Playwright) + CI · JSON-LD `JobPosting` structured data + sitemap · Storybook.
