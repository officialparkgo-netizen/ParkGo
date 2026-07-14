import "server-only";
import Stripe from "stripe";
import type { Booking, Space } from "@/types";

/** True when live mode is on AND a Stripe secret key is configured. */
export function isStripeConfigured(): boolean {
  return process.env.PARKGO_MODE === "live" && !!process.env.STRIPE_SECRET_KEY;
}

let cached: Stripe | null = null;
export function getStripe(): Stripe {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) throw new Error("STRIPE_SECRET_KEY is not set");
  cached ??= new Stripe(key);
  return cached;
}

const SITE = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

/**
 * Create a Stripe Checkout Session for a booking and return the redirect URL.
 * Payment is collected into the platform account; automatic host payout splits
 * (Stripe Connect) are a later phase.
 */
export async function createBookingCheckoutSession(
  booking: Booking,
  space: Space
): Promise<string> {
  const session = await getStripe().checkout.sessions.create({
    mode: "payment",
    line_items: [
      {
        quantity: 1,
        price_data: {
          currency: booking.price.currency.toLowerCase(),
          unit_amount: booking.price.total, // pence/cent
          product_data: {
            name: `ParkGo · ${space.title}`,
            description: `Booking ${booking.reference}`,
          },
        },
      },
    ],
    success_url: `${SITE}/api/stripe/confirm?session_id={CHECKOUT_SESSION_ID}&booking=${booking.id}`,
    cancel_url: `${SITE}/app/book/${space.id}?canceled=1`,
    client_reference_id: booking.id,
    metadata: { bookingId: booking.id },
  });
  if (!session.url) throw new Error("Stripe did not return a checkout URL");
  return session.url;
}
