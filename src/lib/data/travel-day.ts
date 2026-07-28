import type { ConditionPhoto, DateWatch } from "@/types";
import { IS_LIVE } from "@/lib/config";

/**
 * Things that only matter on the day: photographs of the car at handover, and
 * the queue of people waiting for a sold-out date range to free up.
 *
 * The photos exist to settle arguments, so nothing here deletes one. A
 * traveller who could remove the drop-off shot after scraping a wall would
 * make the whole record worthless.
 */

const g = globalThis as unknown as {
  __parkgoConditionPhotos?: ConditionPhoto[];
  __parkgoDateWatches?: DateWatch[];
};
const photosMock = (g.__parkgoConditionPhotos ??= []);
const watchesMock = (g.__parkgoDateWatches ??= []);

/* eslint-disable @typescript-eslint/no-explicit-any */
function photoFromRow(r: any): ConditionPhoto {
  return {
    id: r.id,
    bookingId: r.booking_id,
    phase: r.phase,
    url: r.url,
    takenBy: r.taken_by,
    createdAt: r.created_at,
  };
}

function watchFromRow(r: any): DateWatch {
  return {
    id: r.id,
    userId: r.user_id,
    airportSlug: r.airport_slug,
    spaceId: r.space_id ?? undefined,
    startAt: r.start_at,
    endAt: r.end_at,
    notifiedAt: r.notified_at ?? undefined,
    createdAt: r.created_at,
  };
}
/* eslint-enable @typescript-eslint/no-explicit-any */

// ---------------------------------------------------- condition photos ------

/** Six each side is plenty for four corners, the roof and the dashboard. */
export const MAX_PHOTOS_PER_PHASE = 6;

export async function addConditionPhoto(input: {
  bookingId: string;
  phase: "dropoff" | "pickup";
  url: string;
  takenBy: string;
}): Promise<ConditionPhoto | null> {
  if (!input.url) return null;
  const existing = await listConditionPhotos(input.bookingId);
  if (existing.filter((p) => p.phase === input.phase).length >= MAX_PHOTOS_PER_PHASE) return null;

  if (!IS_LIVE) {
    const photo: ConditionPhoto = {
      id: `cp_${photosMock.length + 1}`,
      bookingId: input.bookingId,
      phase: input.phase,
      url: input.url,
      takenBy: input.takenBy,
      createdAt: new Date().toISOString(),
    };
    photosMock.push(photo);
    return photo;
  }

  try {
    const { supabaseAdmin } = await import("@/lib/supabase/server");
    const { data, error } = await supabaseAdmin()
      .from("condition_photos")
      .insert({
        booking_id: input.bookingId,
        phase: input.phase,
        url: input.url,
        taken_by: input.takenBy,
      })
      .select("*")
      .single();
    if (error || !data) return null;
    return photoFromRow(data);
  } catch {
    return null;
  }
}

export async function listConditionPhotos(bookingId: string): Promise<ConditionPhoto[]> {
  if (!IS_LIVE) {
    return photosMock
      .filter((p) => p.bookingId === bookingId)
      .sort((a, b) => a.createdAt.localeCompare(b.createdAt));
  }
  try {
    const { supabaseAdmin } = await import("@/lib/supabase/server");
    const { data } = await supabaseAdmin()
      .from("condition_photos")
      .select("*")
      .eq("booking_id", bookingId)
      .order("created_at", { ascending: true })
      .limit(MAX_PHOTOS_PER_PHASE * 2);
    return (data ?? []).map(photoFromRow);
  } catch {
    return [];
  }
}

// -------------------------------------------------------- date waitlist -----

export async function joinDateWaitlist(input: {
  userId: string;
  airportSlug: string;
  spaceId?: string;
  startAt: string;
  endAt: string;
}): Promise<DateWatch | null> {
  if (!input.airportSlug) return null;
  if (new Date(input.endAt).getTime() <= new Date(input.startAt).getTime()) return null;

  // Joining twice for the same dates would send the same person two emails.
  const mine = await listDateWatches(input.userId);
  const dup = mine.find(
    (w) =>
      w.airportSlug === input.airportSlug &&
      (w.spaceId ?? null) === (input.spaceId ?? null) &&
      w.startAt === input.startAt &&
      w.endAt === input.endAt &&
      !w.notifiedAt
  );
  if (dup) return dup;

  if (!IS_LIVE) {
    const watch: DateWatch = {
      id: `dw_${watchesMock.length + 1}`,
      userId: input.userId,
      airportSlug: input.airportSlug,
      spaceId: input.spaceId,
      startAt: input.startAt,
      endAt: input.endAt,
      createdAt: new Date().toISOString(),
    };
    watchesMock.push(watch);
    return watch;
  }

  try {
    const { supabaseAdmin } = await import("@/lib/supabase/server");
    const { data, error } = await supabaseAdmin()
      .from("date_waitlists")
      .insert({
        user_id: input.userId,
        airport_slug: input.airportSlug,
        space_id: input.spaceId ?? null,
        start_at: input.startAt,
        end_at: input.endAt,
      })
      .select("*")
      .single();
    if (error || !data) return null;
    return watchFromRow(data);
  } catch {
    return null;
  }
}

export async function listDateWatches(userId: string): Promise<DateWatch[]> {
  if (!IS_LIVE) {
    return watchesMock
      .filter((w) => w.userId === userId)
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  }
  try {
    const { supabaseAdmin } = await import("@/lib/supabase/server");
    const { data } = await supabaseAdmin()
      .from("date_waitlists")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(50);
    return (data ?? []).map(watchFromRow);
  } catch {
    return [];
  }
}

export async function leaveDateWaitlist(id: string, userId: string): Promise<boolean> {
  if (!IS_LIVE) {
    const i = watchesMock.findIndex((w) => w.id === id && w.userId === userId);
    if (i < 0) return false;
    watchesMock.splice(i, 1);
    return true;
  }
  try {
    const { supabaseAdmin } = await import("@/lib/supabase/server");
    const { error } = await supabaseAdmin()
      .from("date_waitlists")
      .delete()
      .eq("id", id)
      .eq("user_id", userId);
    return !error;
  } catch {
    return false;
  }
}

/** Open watches for the sweep to check against current availability. */
export async function listOpenDateWatches(limit = 200): Promise<DateWatch[]> {
  const now = Date.now();
  if (!IS_LIVE) {
    return watchesMock
      .filter((w) => !w.notifiedAt && new Date(w.startAt).getTime() > now)
      .slice(0, limit);
  }
  try {
    const { supabaseAdmin } = await import("@/lib/supabase/server");
    const { data } = await supabaseAdmin()
      .from("date_waitlists")
      .select("*")
      .is("notified_at", null)
      // A watch on dates that have already passed can never be satisfied.
      .gt("start_at", new Date(now).toISOString())
      .order("created_at", { ascending: true })
      .limit(limit);
    return (data ?? []).map(watchFromRow);
  } catch {
    return [];
  }
}

export async function markDateWatchNotified(id: string): Promise<void> {
  const at = new Date().toISOString();
  if (!IS_LIVE) {
    const w = watchesMock.find((x) => x.id === id);
    if (w) w.notifiedAt = at;
    return;
  }
  try {
    const { supabaseAdmin } = await import("@/lib/supabase/server");
    await supabaseAdmin().from("date_waitlists").update({ notified_at: at }).eq("id", id);
  } catch {
    /* the sweep runs again shortly */
  }
}
