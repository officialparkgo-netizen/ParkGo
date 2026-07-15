import * as Sentry from "@sentry/nextjs";

/**
 * Browser-side Sentry error monitoring. Dormant unless NEXT_PUBLIC_SENTRY_DSN
 * is set (add it in Vercel env vars to activate — no code change needed).
 */
const dsn = process.env.NEXT_PUBLIC_SENTRY_DSN;

if (dsn) {
  Sentry.init({
    dsn,
    tracesSampleRate: 0.1,
    environment: process.env.NEXT_PUBLIC_VERCEL_ENV || process.env.NODE_ENV,
  });
}
