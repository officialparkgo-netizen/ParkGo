import "server-only";
import { cookies } from "next/headers";
import { IS_LIVE } from "@/lib/config";
import {
  ADMIN_2FA_SESSION_MS,
  isValidAdmin2faSession,
  makeAdmin2faSession,
} from "@/lib/admin-2fa-core";

export const ADMIN_2FA_COOKIE = "parkgo_admin_2fa";

/** On in live mode always; in mock only with ADMIN_2FA=on (demo/testing). */
export function admin2faEnabled(): boolean {
  return IS_LIVE || process.env.ADMIN_2FA === "on";
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
