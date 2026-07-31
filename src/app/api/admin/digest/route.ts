import { composeAndSendDigest } from "@/lib/digest";
import { IS_LIVE } from "@/lib/config";

/**
 * Daily KPI digest, and the fallback home for every sweep.
 *
 * Called by the Vercel cron (see vercel.json) with
 * `Authorization: Bearer $CRON_SECRET`, or manually from /admin/settings.
 * In live mode the secret is required; mock mode is open for local testing.
 *
 * This is the **only** cron `vercel.json` declares, because a daily schedule is
 * the only kind the Hobby plan accepts and a sub-daily entry fails the whole
 * deployment rather than degrading. So every sweep runs from here as well as
 * from its own route: on Hobby that daily pass is the only pass, and on Pro the
 * frequent crons (see the README) simply get there first and leave nothing to
 * do. Each one is independently guarded — a sweep that throws must not take the
 * digest, or any of the others, down with it.
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
  let flightsChecked = 0;
  let flightsExtended = 0;
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

  // Flights running late. Once a day is thin cover for a delay — the traveller
  // may already be home before it fires — so on Pro this really wants the
  // half-hourly cron. It runs here so that a Hobby deployment still catches the
  // overnight delays rather than none at all.
  try {
    const { runFlightSweep } = await import("@/lib/flight-sweep");
    const result = await runFlightSweep();
    flightsChecked = result.checked;
    flightsExtended = result.extended;
  } catch {
    // best-effort
  }

  // Scheduled marketing campaigns whose moment has passed. On Hobby the
  // daily digest is the only sweep, so "scheduled for 3pm" means "that day".
  let campaignsSent = 0;
  try {
    const { sweepDueCampaigns } = await import("@/lib/campaign-send");
    campaignsSent = await sweepDueCampaigns();
  } catch {
    // best-effort
  }

  // Blog drafts scheduled for a moment that has now passed. The public
  // listing also publishes due drafts on read, but that needs a reader — this
  // covers a quiet night, and announces (newsletter + IndexNow) what it flips.
  let postsPublished = 0;
  try {
    const { publishDuePosts, listArticlesAdmin } = await import("@/lib/data/blog");
    const before = new Set(
      (await listArticlesAdmin()).filter((a) => a.status === "published").map((a) => a.id)
    );
    postsPublished = await publishDuePosts();
    if (postsPublished > 0) {
      const { announceNewPost } = await import("@/lib/blog-notify");
      const after = await listArticlesAdmin();
      for (const a of after) {
        if (a.status === "published" && !before.has(a.id)) await announceNewPost(a);
      }
    }
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
    flightsChecked,
    flightsExtended,
    postsPublished,
    campaignsSent,
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
