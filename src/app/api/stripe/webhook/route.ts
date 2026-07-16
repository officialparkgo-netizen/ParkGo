import { NextResponse } from "next/server";
import type Stripe from "stripe";
import { getStripe } from "@/lib/stripe";
import {
  applyBookingExtension,
  getBookingById,
  markBookingPaid,
} from "@/lib/data/bookings";

export const dynamic = "force-dynamic";

/**
 * Stripe webhook: authoritative payment confirmation. Fires even when the
 * buyer closes the tab before returning to the site, so no paid booking is
 * ever left in "requested". markBookingPaid is idempotent, so this coexists
 * safely with the /api/stripe/confirm browser-return path.
 *
 * Configure in Stripe: Developers -> Webhooks -> endpoint
 *   https://www.parkgo.ai/api/stripe/webhook
 * listening to checkout.session.completed (+ async_payment_succeeded), and put
 * the signing secret in STRIPE_WEBHOOK_SECRET.
 */
export async function POST(request: Request) {
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!secret) {
    return NextResponse.json({ error: "webhook not configured" }, { status: 503 });
  }

  const signature = request.headers.get("stripe-signature");
  if (!signature) {
    return NextResponse.json({ error: "missing signature" }, { status: 400 });
  }

  let event: Stripe.Event;
  try {
    const payload = await request.text();
    event = await getStripe().webhooks.constructEventAsync(payload, signature, secret);
  } catch {
    return NextResponse.json({ error: "invalid signature" }, { status: 400 });
  }

  if (
    event.type === "checkout.session.completed" ||
    event.type === "checkout.session.async_payment_succeeded"
  ) {
    const session = event.data.object as Stripe.Checkout.Session;
    const bookingId =
      session.metadata?.bookingId || session.client_reference_id || undefined;

    if (bookingId && session.payment_status === "paid") {
      const externalRef =
        typeof session.payment_intent === "string"
          ? session.payment_intent
          : session.payment_intent?.id ?? null;

      if (session.metadata?.kind === "extend" && session.metadata.newEndAt) {
        // Extension payment — apply the later pick-up (idempotent).
        await applyBookingExtension(bookingId, session.metadata.newEndAt, {
          provider: "stripe",
          externalRef,
        });
      } else {
        const booking = await getBookingById(bookingId);
        if (booking) {
          await markBookingPaid(bookingId, {
            amount: booking.price.total,
            currency: booking.price.currency,
            split: booking.price.split,
            method: "card",
            provider: "stripe",
            externalRef,
          });
        }
      }
    }
  }

  return NextResponse.json({ received: true });
}
