"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import type { Role } from "@/types";
import { DEMO_LOGINS, SESSION_COOKIE, rolePath } from "@/lib/auth";
import { IS_LIVE } from "@/lib/config";

const COOKIE_OPTS = {
  httpOnly: true,
  sameSite: "lax" as const,
  path: "/",
  maxAge: 60 * 60 * 24 * 7, // 1 week
};

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

/** Log in as the demo account for a role (mock mode). */
export async function loginAs(role: Role, next?: string) {
  const demo = DEMO_LOGINS.find((d) => d.role === role);
  if (!demo) return;
  const store = await cookies();
  store.set(SESSION_COOKIE, demo.userId, COOKIE_OPTS);
  redirect(next || rolePath(role));
}

export async function logout() {
  if (IS_LIVE) {
    const { createServerSupabase } = await import("@/lib/supabase/auth-server");
    const supabase = await createServerSupabase();
    await supabase.auth.signOut();
    redirect("/");
  }
  const store = await cookies();
  store.delete(SESSION_COOKIE);
  redirect("/");
}

// -----------------------------------------------------------------------------
// Real Supabase Auth (live mode) — email/password + magic link.
// -----------------------------------------------------------------------------

export interface AuthState {
  error?: string;
  message?: string;
}

function normaliseRole(raw: string): Role {
  return (["traveller", "host"].includes(raw) ? raw : "traveller") as Role;
}

export async function signInWithPassword(
  _prev: AuthState,
  formData: FormData
): Promise<AuthState> {
  const email = String(formData.get("email") || "");
  const password = String(formData.get("password") || "");
  const next = String(formData.get("next") || "") || undefined;

  const { createServerSupabase } = await import("@/lib/supabase/auth-server");
  const supabase = await createServerSupabase();
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) return { error: error.message };

  const role = normaliseRole(String(data.user?.user_metadata?.role || "traveller"));
  redirect(next || rolePath(role));
}

export async function signUp(_prev: AuthState, formData: FormData): Promise<AuthState> {
  const name = String(formData.get("name") || "").trim();
  const email = String(formData.get("email") || "");
  const password = String(formData.get("password") || "");
  const role = normaliseRole(String(formData.get("role") || "traveller"));
  const next = String(formData.get("next") || "") || rolePath(role);

  if (name.length < 2) return { error: "Please enter your name." };
  if (password.length < 8) return { error: "Password must be at least 8 characters." };

  const { createServerSupabase } = await import("@/lib/supabase/auth-server");
  const supabase = await createServerSupabase();
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { name, role },
      emailRedirectTo: `${SITE_URL}/auth/callback?next=${encodeURIComponent(next)}`,
    },
  });
  if (error) return { error: error.message };

  // If email confirmation is disabled, a session is returned immediately.
  if (data.session) redirect(next);
  return { message: "Check your email to confirm your account, then sign in." };
}

export async function signInWithMagicLink(
  _prev: AuthState,
  formData: FormData
): Promise<AuthState> {
  const email = String(formData.get("email") || "");
  const next = String(formData.get("next") || "") || "/app";

  const { createServerSupabase } = await import("@/lib/supabase/auth-server");
  const supabase = await createServerSupabase();
  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: { emailRedirectTo: `${SITE_URL}/auth/callback?next=${encodeURIComponent(next)}` },
  });
  if (error) return { error: error.message };
  return { message: "Magic link sent — check your email to sign in." };
}
