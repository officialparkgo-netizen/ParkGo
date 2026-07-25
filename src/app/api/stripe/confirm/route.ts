import { NextResponse } from "next/server";
import { getStripe } from "@/lib/stripe";
import {
  applyBookingExtension,
  getBookingById,
  markBookingPaid,
} from "@/lib/data/bookings";

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
      const externalRef =
        typeof session.payment_intent === "string"
          ? session.payment_intent
          : session.payment_intent?.id ?? null;

      // Extension payment: apply the new pick-up date instead of re-marking paid.
      if (session.metadata?.kind === "extend" && session.metadata.newEndAt) {
        await applyBookingExtension(bookingId, session.metadata.newEndAt, {
          provider: "stripe",
          externalRef,
        });
        return NextResponse.redirect(`${origin}/app/booking/${bookingId}?extended=1`);
      }

      // Stripe made (or reused) a customer for this payer — remember it so
      // their next checkout offers the card they just used.
      const customerId =
        typeof session.customer === "string" ? session.customer : session.customer?.id ?? null;

      const booking = await getBookingById(bookingId);
      if (booking) {
        if (customerId) {
          try {
            const { setStripeCustomerId } = await import("@/lib/data/users");
            await setStripeCustomerId(booking.travellerId, customerId);
          } catch {
            // Remembering the card is a convenience, never a payment blocker.
          }
        }
        await markBookingPaid(bookingId, {
          amount: booking.price.total,
          currency: booking.price.currency,
          split: booking.price.split,
          method: "card",
          provider: "stripe",
          externalRef,
        });
      }
      return NextResponse.redirect(`${origin}/app/booking/${bookingId}?new=1`);
    }
  } catch {
    // fall through to the un-paid redirect
  }
  return NextResponse.redirect(`${origin}/app/booking/${bookingId}`);
}
