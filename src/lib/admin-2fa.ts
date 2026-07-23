import "server-only";
import { cookies } from "next/headers";
import { IS_LIVE } from "@/lib/config";
import type { User } from "@/types";
import {
  ADMIN_2FA_SESSION_MS,
  isValidAdmin2faSession,
  makeAdmin2faSession,
} from "@/lib/admin-2fa-core";

export const ADMIN_2FA_COOKIE = "parkgo_admin_2fa";

/**
 * Per-admin opt-in from Account settings (default OFF). The ADMIN_2FA env
 * overrides both ways: "on" forces it for every admin (used by tests),
 * "off" is an emergency kill switch if an admin ever locks themselves out.
 */
export function admin2faEnabledFor(user: Pick<User, "twofaEnabled">): boolean {
  if (process.env.ADMIN_2FA === "off") return false;
  if (process.env.ADMIN_2FA === "on") return true;
  return user.twofaEnabled === true;
}

export async function hasAdmin2faSession(userId: string): Promise<boolean> {
  const store = await cookies();
  return isValidAdmin2faSession(store.get(ADMIN_2FA_COOKIE)?.value, userId);
}

export async function grantAdmin2faSession(userId: string): Promise<void> {
  const store = await cookies();
  store.set(ADMIN_2FA_COOKIE, makeAdmin2faSession(userId), {
    httpOnly: true,
    sameSite: "lax",
    secure: IS_LIVE,
    path: "/",
    maxAge: Math.floor(ADMIN_2FA_SESSION_MS / 1000),
  });
}
