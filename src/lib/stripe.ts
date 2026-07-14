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
 * If the host has a payouts-ready Stripe Connect account, the payment is split
 * (destination charge): the host's share is transferred to their account and
 * the rest (platform commission + driver settlement) is kept as the application
 * fee. Otherwise everything is collected into the platform account.
 */
export async function createBookingCheckoutSession(
  booking: Booking,
  space: Space,
  hostAccountId?: string | null
): Promise<string> {
  const stripe = getStripe();
  const params: Stripe.Checkout.SessionCreateParams = {
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
  };

  if (hostAccountId) {
    const acct = await stripe.accounts.retrieve(hostAccountId).catch(() => null);
    if (acct?.charges_enabled) {
      const hostShare = booking.price.split.hostPayout;
      const applicationFee = Math.max(0, booking.price.total - hostShare);
      params.payment_intent_data = {
        application_fee_amount: applicationFee,
        transfer_data: { destination: hostAccountId },
      };
    }
  }

  const session = await stripe.checkout.sessions.create(params);
  if (!session.url) throw new Error("Stripe did not return a checkout URL");
  return session.url;
}

// -----------------------------------------------------------------------------
// Stripe Connect — host payout onboarding
// -----------------------------------------------------------------------------

/**
 * Create (if needed) an Express connected account for the host and return an
 * onboarding link. Returns the account id so the caller can persist it.
 */
export async function createHostOnboardingLink(host: {
  id: string;
  displayName?: string;
  payoutAccountRef?: string;
}): Promise<{ url: string; accountId: string }> {
  const stripe = getStripe();
  let accountId = host.payoutAccountRef;

  if (!accountId) {
    const account = await stripe.accounts.create({
      type: "express",
      metadata: { hostId: host.id },
      capabilities: { transfers: { requested: true } },
      business_profile: { name: host.displayName || "ParkGo host" },
    });
    accountId = account.id;
  }

  const link = await stripe.accountLinks.create({
    account: accountId,
    refresh_url: `${SITE}/api/stripe/connect/refresh`,
    return_url: `${SITE}/host?payouts=connected`,
    type: "account_onboarding",
  });
  return { url: link.url, accountId };
}

/** Whether a connected account can receive payouts yet. */
export async function getConnectStatus(
  accountId: string
): Promise<{ chargesEnabled: boolean; detailsSubmitted: boolean }> {
  try {
    const acct = await getStripe().accounts.retrieve(accountId);
    return {
      chargesEnabled: !!acct.charges_enabled,
      detailsSubmitted: !!acct.details_submitted,
    };
  } catch {
    return { chargesEnabled: false, detailsSubmitted: false };
  }
}
