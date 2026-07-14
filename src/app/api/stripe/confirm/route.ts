import { NextResponse } from "next/server";
import { getStripe } from "@/lib/stripe";
import { getBookingById, markBookingPaid } from "@/lib/data/bookings";

export const dynamic = "force-dynamic";

/**
 * Stripe Checkout success return. Verifies the session was paid, marks the
 * booking paid + records the payment, then sends the traveller to their booking.
 * (A webhook can be added later for extra robustness; this covers the return
 * flow and is idempotent.)
 */
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const sessionId = searchParams.get("session_id");
  const bookingId = searchParams.get("booking");

  if (!sessionId || !bookingId) {
    return NextResponse.redirect(`${origin}/app`);
  }

  try {
    const session = await getStripe().checkout.sessions.retrieve(sessionId);
    if (session.payment_status === "paid") {
      const booking = await getBookingById(bookingId);
      if (booking) {
        await markBookingPaid(bookingId, {
          amount: booking.price.total,
          currency: booking.price.currency,
          split: booking.price.split,
          method: "card",
          provider: "stripe",
        });
      }
      return NextResponse.redirect(`${origin}/app/booking/${bookingId}?new=1`);
    }
  } catch {
    // fall through to the un-paid redirect
  }
  return NextResponse.redirect(`${origin}/app/booking/${bookingId}`);
}
