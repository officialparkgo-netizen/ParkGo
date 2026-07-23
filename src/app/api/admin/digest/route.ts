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

  const summary = await composeAndSendDigest();
  return Response.json({
    ok: true,
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
