import { listAllBookings, listAllPayments } from "@/lib/data/bookings";
import { listAllUsers } from "@/lib/data/users";
import { listPendingVerificationsLive } from "@/lib/data/verifications";
import { listSupportTickets } from "@/lib/data/support";
import { listAllClaims } from "@/lib/data/claims";
import { getPlatformSettings } from "@/lib/data/settings";
import { isEmailConfigured, sendEmail, emailShell, emailRows } from "@/lib/email";
import { formatMoney } from "@/lib/utils";

export interface DigestSummary {
  bookings24h: number;
  gmv24h: number;
  newUsers24h: number;
  pendingVerifications: number;
  openTickets: number;
  openClaims: number;
  payoutsDue: number;
  sentTo: string[];
  emailed: boolean;
}

/** Compose the last-24h KPI summary and email it to the admin inbox(es). */
export async function composeAndSendDigest(): Promise<DigestSummary> {
  const since = Date.now() - 24 * 3_600_000;
  const [bookings, payments, users, pending, tickets, claims, settings] =
    await Promise.all([
      listAllBookings(),
      listAllPayments(),
      listAllUsers(),
      listPendingVerificationsLive(),
      listSupportTickets().catch(() => []),
      listAllClaims(),
      getPlatformSettings(),
    ]);

  const cancelled = new Set(
    bookings.filter((b) => b.status === "cancelled").map((b) => b.id)
  );
  const earned = payments.filter(
    (p) => p.payoutStatus !== "refunded" && !cancelled.has(p.bookingId)
  );
  const summary: DigestSummary = {
    bookings24h: bookings.filter((b) => +new Date(b.createdAt) >= since).length,
    gmv24h: earned
      .filter((p) => +new Date(p.createdAt) >= since)
      .reduce((s, p) => s + p.amount, 0),
    newUsers24h: users.filter((u) => +new Date(u.createdAt) >= since).length,
    pendingVerifications: pending.length,
    openTickets: tickets.filter((t) => t.status === "open").length,
    openClaims: claims.filter((c) => c.status === "open" || c.status === "in_review")
      .length,
    payoutsDue: earned
      .filter((p) => p.payoutStatus !== "paid")
      .reduce((s, p) => s + p.split.hostPayout + p.split.driverPayout, 0),
    sentTo: [],
    emailed: false,
  };

  const override = settings.adminAlertEmail || process.env.ADMIN_ALERT_EMAIL;
  const recipients = override
    ? [override]
    : users
        .filter((u) => u.role === "admin")
        .map((u) => u.email)
        .filter((e) => !e.endsWith("@parkgo.demo"))
        .slice(0, 5);
  summary.sentTo = recipients;

  if (isEmailConfigured() && recipients.length > 0) {
    const html = emailShell(
      `<h2 style="margin:0 0 12px">ParkGo daily digest</h2>` +
        emailRows([
          ["Bookings (24h)", String(summary.bookings24h)],
          ["GMV (24h)", formatMoney(summary.gmv24h)],
          ["New users (24h)", String(summary.newUsers24h)],
          ["Pending verifications", String(summary.pendingVerifications)],
          ["Open support tickets", String(summary.openTickets)],
          ["Open claims", String(summary.openClaims)],
          ["Payouts due", formatMoney(summary.payoutsDue)],
        ]) +
        `<p style="margin-top:14px"><a href="https://www.parkgo.ai/admin">Open the admin dashboard</a></p>`
    );
    for (const to of recipients) {
      try {
        await sendEmail(to, "ParkGo daily digest", html);
        summary.emailed = true;
      } catch {
        // keep going
      }
    }
  }
  return summary;
}
