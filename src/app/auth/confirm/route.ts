import { NextResponse } from "next/server";
import type { EmailOtpType } from "@supabase/supabase-js";
import { createServerSupabase } from "@/lib/supabase/auth-server";
import { roleHomeFor, resolveNext } from "@/lib/auth";

export const dynamic = "force-dynamic";

/**
 * Email link verification (confirm signup / magic link) via token_hash.
 * Unlike the PKCE ?code= flow, this works even when the link is opened in a
 * different browser or device than the one that started sign-up. The Supabase
 * email templates must point here:
 *   {{ .SiteURL }}/auth/confirm?token_hash={{ .TokenHash }}&type=email
 */
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const token_hash = searchParams.get("token_hash");
  const type = (searchParams.get("type") as EmailOtpType | null) ?? "email";
  const next = searchParams.get("next");

  if (token_hash) {
    const supabase = await createServerSupabase();
    const { error } = await supabase.auth.verifyOtp({ type, token_hash });
    if (!error) {
      // Signed in — honor an explicit target (e.g. /account?reset=1), else
      // send each role to its own portal (admins land on /admin).
      const {
        data: { user },
      } = await supabase.auth.getUser();
      const home = user ? await roleHomeFor(user) : "/app";
      return NextResponse.redirect(`${origin}${resolveNext(next, home)}`);
    }
  }
  return NextResponse.redirect(`${origin}/login?error=confirm`);
}
