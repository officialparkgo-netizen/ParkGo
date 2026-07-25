import { IS_LIVE } from "@/lib/config";

export const dynamic = "force-dynamic";

/**
 * Support reply-target sweep.
 *
 * The queue page also sweeps whenever an admin loads it, but a reply target
 * measured in minutes cannot depend on somebody happening to look — the whole
 * point is the case where nobody is looking. This runs every 15 minutes from
 * the Vercel cron (see vercel.json).
 *
 * Same auth as the digest: the cron secret in live mode, open in mock so it
 * can be exercised locally.
 */
export async function GET(request: Request) {
  if (IS_LIVE) {
    const secret = process.env.CRON_SECRET;
    const auth = request.headers.get("authorization") ?? "";
    const key = new URL(request.url).searchParams.get("key") ?? "";
    if (!secret || (auth !== `Bearer ${secret}` && key !== secret)) {
      return new Response("Unauthorized", { status: 401 });
    }
  }

  let breaches = 0;
  try {
    const { listSupportTickets } = await import("@/lib/data/support");
    const { getPlatformSettings } = await import("@/lib/data/settings");
    const { sweepSlaBreaches } = await import("@/lib/support-escalate");
    const [tickets, settings] = await Promise.all([
      listSupportTickets(),
      getPlatformSettings(),
    ]);
    breaches = (await sweepSlaBreaches(tickets, settings.supportSlaMinutes)).length;
  } catch {
    // A failed sweep must never take the cron endpoint down.
  }

  return Response.json({ ok: true, breaches });
}
