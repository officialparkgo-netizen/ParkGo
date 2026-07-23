"use server";

import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { verifyAdminCode, currentAdminCode } from "@/lib/admin-2fa-core";
import { grantAdmin2faSession } from "@/lib/admin-2fa";
import { sendEmail, emailShell } from "@/lib/email";

function safeNext(raw: FormDataEntryValue | null): string {
  const next = String(raw || "/admin");
  return next.startsWith("/") && !next.startsWith("//") ? next : "/admin";
}

/** Second factor for admins: check the 6-digit code, then set the signed cookie. */
export async function verifyAdmin2faAction(formData: FormData) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  if (user.role !== "admin") redirect("/login");

  const next = safeNext(formData.get("next"));
  const code = String(formData.get("code") || "");
  if (!verifyAdminCode(user.id, code)) {
    redirect(`/admin-2fa?error=1&next=${encodeURIComponent(next)}`);
  }
  await grantAdmin2faSession(user.id);
  redirect(next);
}

/** Email the current window's code to the signed-in admin (live mode). */
export async function sendAdmin2faCodeAction(formData: FormData) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  if (user.role !== "admin") redirect("/login");

  const next = safeNext(formData.get("next"));
  const code = currentAdminCode(user.id);
  await sendEmail(
    user.email,
    "Your ParkGo admin verification code",
    emailShell(
      `<p>Your admin verification code is</p>
       <p style="font-family:monospace;font-size:30px;font-weight:800;letter-spacing:6px;margin:12px 0">${code}</p>
       <p style="font-size:12px;color:#878D96">It expires in about 5 minutes. If you didn't try to sign in, change your password immediately.</p>`
    )
  );
  redirect(`/admin-2fa?sent=1&next=${encodeURIComponent(next)}`);
}
