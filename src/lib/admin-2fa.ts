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
 * Who needs the email-code second factor. Admins and hosts opt in from
 * Account settings (default OFF). The ADMIN_2FA env overrides: "on" forces
 * it for every ADMIN (tests/demos; hosts stay purely opt-in), "off" is an
 * emergency kill switch for everyone.
 */
export function twofaRequiredFor(user: Pick<User, "role" | "twofaEnabled">): boolean {
  if (process.env.ADMIN_2FA === "off") return false;
  if (user.role === "admin") {
    return process.env.ADMIN_2FA === "on" || user.twofaEnabled === true;
  }
  if (user.role === "host") return user.twofaEnabled === true;
  return false;
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
