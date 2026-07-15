import * as Sentry from "@sentry/nextjs";

/**
 * Server-side Sentry error monitoring (Node + Edge runtimes). Dormant unless
 * NEXT_PUBLIC_SENTRY_DSN is set, so unconfigured environments are unaffected.
 */
export async function register() {
  const dsn = process.env.NEXT_PUBLIC_SENTRY_DSN;
  if (!dsn) return;

  Sentry.init({
    dsn,
    // Keep performance tracing light; errors are the priority.
    tracesSampleRate: 0.1,
    environment: process.env.VERCEL_ENV || process.env.NODE_ENV,
  });
}

/** Captures errors from nested React Server Components / route handlers. */
export const onRequestError = Sentry.captureRequestError;
