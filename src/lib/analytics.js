// Thin analytics wrapper. No-op until PostHog (or similar) is loaded on
// `window.posthog`, so calling track()/identify() anywhere is always safe.
export function track(event, props = {}) {
  try {
    if (typeof window !== 'undefined' && window.posthog?.capture) {
      window.posthog.capture(event, props);
    }
  } catch {
    /* analytics must never break the app */
  }
}

export function identify(id, props = {}) {
  try {
    if (typeof window !== 'undefined' && window.posthog?.identify) {
      window.posthog.identify(id, props);
    }
  } catch {
    /* ignore */
  }
}
