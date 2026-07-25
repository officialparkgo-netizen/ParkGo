import "server-only";
import type { SpaceAlert } from "@/types";

/**
 * Fire the watches whose space has become bookable (or cheap enough).
 *
 * Runs from the daily cron alongside the digest. Each watch fires once and is
 * then stamped, so a traveller gets one email about a space, not a drip feed.
 * Never throws: a failed sweep must not take the cron down with it.
 */
export async function sweepSpaceAlerts(now: number = Date.now()): Promise<number> {
  const [{ listPendingAlerts, markAlertNotified }, { liveAlerts, alertMatches }] =
    await Promise.all([import("@/lib/data/saved"), import("@/lib/space-alerts")]);

  const pending = liveAlerts(await listPendingAlerts(), now);
  if (pending.length === 0) return 0;

  const { getSpaceById, listAllSpaces } = await import("@/lib/data/hosts");
  const { isSpaceAvailable } = await import("@/lib/data/bookings");

  // Airport watches need the whole listing set; space watches need one row.
  const wantsAirport = pending.some((a) => !a.spaceId);
  const allSpaces = wantsAirport ? await listAllSpaces() : [];

  let fired = 0;
  for (const alert of pending) {
    try {
      const candidates = alert.spaceId
        ? [await getSpaceById(alert.spaceId)].filter((s) => !!s)
        : allSpaces.filter((s) => s.airportSlug === alert.airportSlug);

      for (const space of candidates) {
        // Undated watches just want the listing bookable at all; dated ones
        // ask the real availability question for those days.
        const available = alert.startAt && alert.endAt
          ? await isSpaceAvailable(space.id, alert.startAt, alert.endAt, space.capacity ?? 1)
          : space.status === "live";
        if (!alertMatches(alert, space, { available })) continue;

        await notify(alert, space.id, space.title);
        await markAlertNotified(alert.id);
        fired += 1;
        break;
      }
    } catch {
      // One bad watch must not stop the rest of the sweep.
    }
  }
  return fired;
}

async function notify(alert: SpaceAlert, spaceId: string, title: string) {
  const url = `/app/space/${spaceId}`;
  const body = `${title} is available again — tap to book before someone else does.`;

  try {
    const { IS_LIVE } = await import("@/lib/config");
    const note = { title: "A space you're watching is free", body, kind: "system" as const };
    if (!IS_LIVE) {
      const { addNotification } = await import("@/lib/data/store");
      addNotification({ userId: alert.userId, ...note });
    } else {
      const { supabaseAdmin } = await import("@/lib/supabase/server");
      await supabaseAdmin().from("notifications").insert({
        user_id: alert.userId,
        title: note.title,
        body: note.body,
        kind: note.kind,
      });
    }
  } catch {
    // in-app notification is best-effort
  }

  try {
    const { getUserProfile } = await import("@/lib/data/users");
    const { isEmailConfigured, sendEmail, emailShell } = await import("@/lib/email");
    const user = await getUserProfile(alert.userId);
    if (!user?.email || !isEmailConfigured()) return;
    const base = process.env.NEXT_PUBLIC_SITE_URL || "https://www.parkgo.ai";
    await sendEmail(
      user.email,
      `${title} is free again`,
      emailShell(
        `<h2 style="margin:0 0 10px;font-size:19px;color:#15171A">Good news</h2>
         <p style="margin:0">${body.replace(/&/g, "&amp;").replace(/</g, "&lt;")}</p>
         <p style="margin:16px 0 0"><a href="${base}${url}" style="background:#F26A1B;color:#fff;padding:10px 18px;border-radius:10px;text-decoration:none;font-weight:700">See the space</a></p>
         <p style="margin:14px 0 0;font-size:12px;color:#878F96">You asked us to watch this one. We only send this once.</p>`
      )
    ).catch(() => {});
  } catch {
    // email is best-effort
  }
}
