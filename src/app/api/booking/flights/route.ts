import { IS_LIVE } from "@/lib/config";

export const dynamic = "force-dynamic";

/**
 * Flight-delay sweep: check every watched flight and hold the space longer for
 * the ones running late.
 *
 * This has to run on a schedule rather than on a page load. The person whose
 * flight is delayed is on an aeroplane and is not refreshing anything — if the
 * extension depended on them looking, it would arrive after they had already
 * overrun. Twice an hour is enough: the sweep only looks at stays ending
 * within a day and a half, and it rounds the new pick-up up to the quarter hour.
 *
 * Same auth as the other crons: the secret in live mode, open in mock.
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

  try {
    const { runFlightSweep } = await import("@/lib/flight-sweep");
    const result = await runFlightSweep();
    return Response.json({ ok: true, ...result });
  } catch {
    // A provider outage is not an outage here.
    return Response.json({ ok: false, checked: 0, extended: 0 });
  }
}
