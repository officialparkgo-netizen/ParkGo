import "server-only";
import type { Booking } from "@/types";

/**
 * Pay the referrer once their friend actually books.
 *
 * The friend's credit is granted the moment they enter a code; the referrer's
 * waits for a paid stay, because that is the only signal that distinguishes a
 * real customer from a throwaway signup. Fires once — on the friend's *first*
 * booking — and never throws, because a booking must not fail over a bonus.
 */
export async function awardReferrerIfFirstBooking(booking: Booking): Promise<boolean> {
  try {
    const { getUserProfile, adjustCredit } = await import("@/lib/data/users");
    const traveller = await getUserProfile(booking.travellerId);
    if (!traveller?.referredBy) return false;

    const { listBookingsForTraveller } = await import("@/lib/data/bookings");
    const theirs = await listBookingsForTraveller(traveller.id);
    // "First" counts anything that got as far as being paid for, so a booking
    // that was later cancelled still consumes the bonus rather than allowing
    // a repeat. Ignore this one if they already had another.
    const earlier = theirs.filter((b) => b.id !== booking.id && b.status !== "requested");
    if (earlier.length > 0) return false;

    const { REFERRAL_REFERRER_CREDIT } = await import("@/lib/referrals");
    await adjustCredit(traveller.referredBy, REFERRAL_REFERRER_CREDIT);

    const { IS_LIVE } = await import("@/lib/config");
    const note = {
      title: "You've earned ParkGo credit",
      body: `${traveller.name || "A friend"} booked with your code — credit is on your account for your next stay.`,
      kind: "system" as const,
    };
    if (!IS_LIVE) {
      const { addNotification } = await import("@/lib/data/store");
      addNotification({ userId: traveller.referredBy, ...note });
    } else {
      const { supabaseAdmin } = await import("@/lib/supabase/server");
      await supabaseAdmin().from("notifications").insert({
        user_id: traveller.referredBy,
        title: note.title,
        body: note.body,
        kind: note.kind,
      });
    }
    return true;
  } catch {
    return false;
  }
}
