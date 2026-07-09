import { NextResponse } from "next/server";
import { IS_LIVE, PARKGO_MODE } from "@/lib/config";

// Always run fresh so it reflects the current runtime env (never cached).
export const dynamic = "force-dynamic";

/**
 * Safe diagnostic: reports whether each required env var is PRESENT (booleans
 * only — never the secret values) plus the resolved mode. Visit /api/health to
 * confirm live mode is wired correctly in each Vercel environment.
 */
export async function GET() {
  return NextResponse.json({
    mode: PARKGO_MODE,
    isLive: IS_LIVE,
    present: {
      PARKGO_MODE: process.env.PARKGO_MODE ?? null,
      NEXT_PUBLIC_SUPABASE_URL: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
      NEXT_PUBLIC_SUPABASE_ANON_KEY: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      SUPABASE_SERVICE_ROLE_KEY: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
      NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL ?? null,
    },
  });
}
