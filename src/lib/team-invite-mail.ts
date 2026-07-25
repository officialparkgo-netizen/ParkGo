import "server-only";
import type { User } from "@/types";
import { emailButton, emailShell, isEmailConfigured, sendEmail } from "@/lib/email";
import { makeInviteToken, newInviteNonce } from "@/lib/team-invite";
import { setInviteNonce } from "@/lib/data/users";

const SITE = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

function escapeHtml(s: string): string {
  return s
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

/** The set-password URL for a pending invite nonce. */
export function inviteLinkFor(userId: string, nonce: string): string {
  return `${SITE}/team/accept?token=${encodeURIComponent(makeInviteToken(userId, nonce))}`;
}

/**
 * Mint a fresh invite for a teammate and email them the set-password link.
 * Rotating the nonce invalidates any previous link. Returns the link so the
 * admin UI can show/copy it — important while Resend isn't configured yet,
 * and handy when an email lands in spam.
 */
export async function sendTeamInvite(
  member: Pick<User, "id" | "name" | "email">,
  invitedBy: string
): Promise<{ link: string; emailed: boolean }> {
  const nonce = newInviteNonce();
  await setInviteNonce(member.id, nonce);
  const link = inviteLinkFor(member.id, nonce);

  let emailed = false;
  if (isEmailConfigured() && member.email) {
    emailed = await sendEmail(
      member.email,
      "You've been added to the ParkGo support team",
      emailShell(
        `<h2 style="margin:0 0 10px;font-size:19px;color:#15171A">Welcome to the ParkGo team</h2>
         <p style="margin:0">${escapeHtml(invitedBy)} has given you access to the ParkGo support desk.
         Choose a password to activate your account — it takes a few seconds.</p>
         ${emailButton(link, "Set your password")}
         <p style="margin:0;font-size:13px;color:#5B636B">Once it's set you'll sign in any time at
         <a href="${SITE}/team/login" style="color:#F26A1B">${SITE.replace(/^https?:\/\//, "")}/team/login</a>.</p>
         <p style="margin:12px 0 0;font-size:12px;color:#878F96">This link works once and expires in 7 days.
         If you weren't expecting it, you can ignore this email.</p>`
      )
    );
  }
  return { link, emailed };
}
