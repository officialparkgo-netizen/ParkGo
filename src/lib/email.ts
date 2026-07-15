import "server-only";
import { IS_LIVE } from "@/lib/config";
import { COMPANY } from "@/lib/seo";

/**
 * Transactional email via the Resend API (plain fetch — no SDK needed).
 * Active only in live mode with RESEND_API_KEY set; otherwise a silent no-op,
 * so mock mode and un-configured environments never break.
 */

const FROM = process.env.EMAIL_FROM || "ParkGo <no-reply@parkgo.ai>";
const SITE = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

export function isEmailConfigured(): boolean {
  return IS_LIVE && !!process.env.RESEND_API_KEY;
}

export async function sendEmail(to: string, subject: string, html: string): Promise<boolean> {
  if (!isEmailConfigured() || !to) return false;
  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ from: FROM, to: [to], subject, html }),
    });
    return res.ok;
  } catch {
    return false;
  }
}

/** Branded wrapper: dark header with the wordmark, white card, legal footer. */
export function emailShell(body: string): string {
  return `<div style="background:#F6F7F8;padding:24px 12px">
  <div style="max-width:560px;margin:0 auto;background:#ffffff;border-radius:14px;overflow:hidden;font-family:Arial,Helvetica,sans-serif">
    <div style="background:#15171A;padding:16px 24px">
      <img src="${SITE}/email-logo.png" width="30" height="30" alt="" style="vertical-align:middle;margin-right:10px" />
      <span style="font-size:20px;font-weight:800;color:#ffffff;vertical-align:middle">Park<span style="color:#F26A1B">Go</span></span>
    </div>
    <div style="padding:24px;color:#2A2E34;font-size:15px;line-height:1.55">${body}</div>
    <div style="padding:14px 24px;border-top:1px solid #ececec;font-size:11px;color:#878D96">
      ${COMPANY.legalName} · ${COMPANY.registeredOffice} · ICO ${COMPANY.icoRef}
    </div>
  </div>
</div>`;
}

export function emailButton(href: string, label: string): string {
  return `<p style="margin:22px 0"><a href="${href}" style="display:inline-block;background:#F26A1B;color:#ffffff;padding:12px 22px;border-radius:10px;text-decoration:none;font-weight:bold">${label}</a></p>`;
}

export function emailRows(rows: [string, string][]): string {
  const tr = rows
    .map(
      ([k, v]) =>
        `<tr><td style="padding:6px 0;color:#878D96;font-size:13px">${k}</td><td style="padding:6px 0;text-align:right;font-weight:bold;color:#15171A;font-size:13px">${v}</td></tr>`
    )
    .join("");
  return `<table width="100%" cellpadding="0" cellspacing="0" style="margin:14px 0;border-top:1px solid #ececec;border-bottom:1px solid #ececec">${tr}</table>`;
}
