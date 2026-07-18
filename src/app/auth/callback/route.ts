import { NextResponse } from "next/server";
import { createServerSupabase } from "@/lib/supabase/auth-server";
import { roleHomeFor, resolveNext } from "@/lib/auth";

/**
 * Auth callback: exchanges the one-time code from a magic link or email
 * confirmation for a session, then redirects into the app. With no explicit
 * ?next= target, each role lands on its own portal (admins on /admin).
 */
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next");

  if (code) {
    const supabase = await createServerSupabase();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      const home = user ? await roleHomeFor(user) : "/app";
      return NextResponse.redirect(`${origin}${resolveNext(next, home)}`);
    }
  }
  return NextResponse.redirect(`${origin}/login?error=auth`);
}
