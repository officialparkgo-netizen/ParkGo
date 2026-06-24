"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import type { Role } from "@/types";
import { DEMO_LOGINS, SESSION_COOKIE, rolePath } from "@/lib/auth";

const COOKIE_OPTS = {
  httpOnly: true,
  sameSite: "lax" as const,
  path: "/",
  maxAge: 60 * 60 * 24 * 7, // 1 week
};

/** Log in as the demo account for a role (mock mode). */
export async function loginAs(role: Role, next?: string) {
  const demo = DEMO_LOGINS.find((d) => d.role === role);
  if (!demo) return;
  const store = await cookies();
  store.set(SESSION_COOKIE, demo.userId, COOKIE_OPTS);
  redirect(next || rolePath(role));
}

export async function logout() {
  const store = await cookies();
  store.delete(SESSION_COOKIE);
  redirect("/");
}
