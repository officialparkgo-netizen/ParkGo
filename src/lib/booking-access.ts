import "server-only";
import type { Booking, Space, User } from "@/types";
import { getCurrentUser } from "@/lib/auth";
import { getBookingById } from "@/lib/data/bookings";
import { getSpaceById } from "@/lib/data/hosts";
import { parseShareToken } from "@/lib/booking-share";

/**
 * Who may see a booking's entry pass.
 *
 * The traveller who paid, obviously. Also whoever they handed a share link to
 * — usually a partner doing the 5am drop-off — and that person may have no
 * account at all, so the token has to stand on its own. Hosts and admins are
 * deliberately excluded here: they have their own views, and this one carries
 * the gate code.
 */
export interface PassAccess {
  booking: Booking;
  space: Space;
  /** Set when the viewer is signed in as the traveller rather than a guest. */
  viewer: User | null;
  via: "owner" | "share";
}

export async function resolvePassAccess(
  bookingId: string,
  shareToken?: string | null
): Promise<PassAccess | null> {
  const booking = await getBookingById(bookingId);
  if (!booking) return null;
  // A cancelled stay has no pass — the barrier should not open for it.
  if (booking.status === "cancelled") return null;

  const space = await getSpaceById(booking.spaceId);
  if (!space) return null;

  // Token first: it works for someone with no session at all, and it is the
  // narrower grant of the two.
  if (shareToken && parseShareToken(shareToken) === bookingId) {
    return { booking, space, viewer: null, via: "share" };
  }

  const user = await getCurrentUser().catch(() => null);
  if (user && booking.travellerId === user.id) {
    return { booking, space, viewer: user, via: "owner" };
  }
  return null;
}
