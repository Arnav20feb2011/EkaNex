// Centralised runtime config, read from Vite env vars (import.meta.env).
// Everything is optional: when a key is missing the app runs in "demo mode"
// so nothing breaks before the real services are connected.

const env = (typeof import.meta !== 'undefined' && import.meta.env) || {};

export const SUPABASE_URL = env.VITE_SUPABASE_URL || '';
export const SUPABASE_ANON_KEY = env.VITE_SUPABASE_ANON_KEY || '';
export const isSupabaseConfigured = Boolean(SUPABASE_URL && SUPABASE_ANON_KEY);

export const SENTRY_DSN = env.VITE_SENTRY_DSN || '';
export const isSentryConfigured = Boolean(SENTRY_DSN);

export const POSTHOG_KEY = env.VITE_POSTHOG_KEY || '';
export const POSTHOG_HOST = env.VITE_POSTHOG_HOST || 'https://us.i.posthog.com';
export const isAnalyticsConfigured = Boolean(POSTHOG_KEY);

export const SITE_URL = env.VITE_SITE_URL || 'https://ekanex.work';
