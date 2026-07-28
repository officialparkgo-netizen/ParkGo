"use server";

import { revalidatePath } from "next/cache";
import { requireRole } from "@/lib/auth";
import {
  joinDateWaitlist,
  leaveDateWaitlist,
  listOpenDateWatches,
  markDateWatchNotified,
} from "@/lib/data/travel-day";

/**
 * The date waitlist: what happens when a search comes back empty.
 *
 * Distinct from the price/availability alerts in 0025. Those watch a listing
 * someone already likes; this watches a set of dates at a destination, which
 * is the case where they have not found anything to like yet.
 */

export interface WaitlistState {
  ok?: boolean;
  error?: string;
}

export async function joinDateWaitlistAction(
  _prev: WaitlistState,
  formData: FormData
): Promise<WaitlistState> {
  const user = await requireRole("traveller");
  const airportSlug = String(formData.get("airportSlug") || "");
  const startAt = String(formData.get("startAt") || "");
  const endAt = String(formData.get("endAt") || "");
  const spaceId = String(formData.get("spaceId") || "") || undefined;

  if (!airportSlug || !startAt || !endAt) return { error: "Pick a destination and dates first." };

  const watch = await joinDateWaitlist({ userId: user.id, airportSlug, spaceId, startAt, endAt });
  if (!watch) return { error: "We could not add you to the list." };
  revalidatePath("/app/saved");
  return { ok: true };
}

export async function leaveDateWaitlistAction(
  _prev: WaitlistState,
  formData: FormData
): Promise<WaitlistState> {
  const user = await requireRole("traveller");
  const id = String(formData.get("id") || "");
  const ok = await leaveDateWaitlist(id, user.id);
  revalidatePath("/app/saved");
  return ok ? { ok: true } : { error: "That watch is already gone." };
}

/**
 * Check every open watch against what is actually bookable now, and tell the
 * first person waiting.
 *
 * Deliberately notifies rather than holds. A space nobody has paid for is
 * still available to everyone, and quietly reserving it for whoever joined a
 * list first would take inventory off the market on a maybe.
 */
export async function sweepDateWaitlist(): Promise<number> {
  const watches = await listOpenDateWatches(200);
  if (watches.length === 0) return 0;

  const { searchLiveSpaces } = await import("@/lib/data/hosts");
  const { getUserProfile } = await import("@/lib/data/users");
  const { sendWaitlistOpenEmail } = await import("@/lib/booking-emails");

  let notified = 0;
  for (const w of watches) {
    try {
      const results = await searchLiveSpaces({
        airportSlug: w.airportSlug,
        startAt: w.startAt,
        endAt: w.endAt,
      });
      const hits = w.spaceId
        ? results.filter((r) => r.space.id === w.spaceId)
        : results;
      if (hits.length === 0) continue;

      const user = await getUserProfile(w.userId);
      if (user) {
        await sendWaitlistOpenEmail(user, w, hits.length);
        const { addNotification } = await import("@/lib/data/store");
        const { IS_LIVE } = await import("@/lib/config");
        if (!IS_LIVE) {
          addNotification({
            userId: w.userId,
            title: "A space opened up",
            body: `${hits.length} now free at ${w.airportSlug} on your dates.`,
            kind: "booking",
          });
        } else {
          const { supabaseAdmin } = await import("@/lib/supabase/server");
          await supabaseAdmin().from("notifications").insert({
            user_id: w.userId,
            title: "A space opened up",
            body: `${hits.length} now free at ${w.airportSlug} on your dates.`,
            kind: "booking",
          });
        }
      }
      // Marked whether or not the email landed: the watch has fired, and a
      // retry loop here would email the same person on every sweep.
      await markDateWatchNotified(w.id);
      notified += 1;
    } catch {
      // One bad watch must not stop the batch.
    }
  }
  return notified;
}
