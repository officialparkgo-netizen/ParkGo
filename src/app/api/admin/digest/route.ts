import { composeAndSendDigest } from "@/lib/digest";
import { IS_LIVE } from "@/lib/config";

/**
 * Daily KPI digest. Called by the Vercel cron (see vercel.json) with
 * `Authorization: Bearer $CRON_SECRET`, or manually from /admin/settings.
 * In live mode the secret is required; mock mode is open for local testing.
 */
export async function GET(request: Request) {
  if (IS_LIVE) {
    const secret = process.env.CRON_SECRET;
    const auth = request.headers.get("authorization") ?? "";
    const key = new URL(request.url).searchParams.get("key") ?? "";
    const okAuth = !!secret && (auth === `Bearer ${secret}` || key === secret);
    if (!okAuth) return new Response("Unauthorized", { status: 401 });
  }

  // Daily housekeeping riding the same cron: expire stale booking requests
  // (full refund) and nudge travellers arriving tomorrow.
  let sweptRequests = 0;
  let arrivalReminders = 0;
  let alertsFired = 0;
  let slaBreaches = 0;
  try {
    const { sweepExpiredApprovals } = await import("@/lib/data/bookings");
    sweptRequests = await sweepExpiredApprovals();
  } catch {
    // best-effort
  }
  let waitlistFired = 0;
  try {
    const { sendArrivalReminders } = await import("@/lib/booking-emails");
    arrivalReminders = await sendArrivalReminders();
  } catch {
    // best-effort
  }

  // Watches on spaces that have freed up or dropped in price.
  try {
    const { sweepSpaceAlerts } = await import("@/lib/alert-sweep");
    alertsFired = await sweepSpaceAlerts();
  } catch {
    // best-effort
  }
  // People waiting on sold-out dates. Same cadence as the price watches: this
  // is a "something changed overnight" message, not a live feed.
  try {
    const { sweepDateWaitlist } = await import("@/lib/waitlist-actions");
    waitlistFired = await sweepDateWaitlist();
  } catch {
    // best-effort
  }

  // Support chats that blew past their reply target. The queue page also
  // sweeps on load, but that only helps if somebody is looking — this covers
  // the overnight case, which is exactly when a missed urgent chat hurts.
  try {
    const { listSupportTickets } = await import("@/lib/data/support");
    const { getPlatformSettings } = await import("@/lib/data/settings");
    const { sweepSlaBreaches } = await import("@/lib/support-escalate");
    const [tickets, settings] = await Promise.all([
      listSupportTickets(),
      getPlatformSettings(),
    ]);
    slaBreaches = (await sweepSlaBreaches(tickets, settings.supportSlaMinutes)).length;
  } catch {
    // best-effort
  }

  const summary = await composeAndSendDigest();
  return Response.json({
    ok: true,
    sweptRequests,
    arrivalReminders,
    alertsFired,
    waitlistFired,
    slaBreaches,
    emailed: summary.emailed,
    recipients: summary.sentTo.length,
    bookings24h: summary.bookings24h,
    gmv24h: summary.gmv24h,
    newUsers24h: summary.newUsers24h,
    pendingVerifications: summary.pendingVerifications,
    openTickets: summary.openTickets,
    openClaims: summary.openClaims,
    payoutsDue: summary.payoutsDue,
  });
}
