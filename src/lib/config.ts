/**
 * Runtime mode + feature switches.
 *
 * `mock` -> in-memory seed data + simulated providers (default; needs no keys).
 * `live` -> read/write the real Supabase database + configured providers.
 *
 * IS_LIVE is only true when the mode is "live" AND the Supabase server keys are
 * present, so a half-configured environment safely falls back to mock data
 * instead of crashing at runtime.
 */
export const PARKGO_MODE = process.env.PARKGO_MODE === "live" ? "live" : "mock";

export const IS_LIVE =
  PARKGO_MODE === "live" &&
  !!process.env.NEXT_PUBLIC_SUPABASE_URL &&
  !!process.env.SUPABASE_SERVICE_ROLE_KEY;
