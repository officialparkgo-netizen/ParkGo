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
    payment_intent_data: { metadata: { bookingId: booking.id } },
  };

  if (hostAccountId) {
    const acct = await stripe.accounts.retrieve(hostAccountId).catch(() => null);
    if (acct?.charges_enabled) {
      const hostShare = booking.price.split.hostPayout;
      const applicationFee = Math.max(0, booking.price.total - hostShare);
      params.payment_intent_data = {
        metadata: { bookingId: booking.id },
        application_fee_amount: applicationFee,
        transfer_data: { destination: hostAccountId },
      };
    }
  }

  const session = await stripe.checkout.sessions.create(params);
  if (!session.url) throw new Error("Stripe did not return a checkout URL");
  return session.url;
}

/**
 * Checkout Session for a booking EXTENSION: charges only the price difference
 * for the later pick-up. The confirm route / webhook read `kind=extend` +
 * `newEndAt` from the metadata and apply the extension on payment.
 */
export async function createExtensionCheckoutSession(
  booking: Booking,
  space: Space,
  newEndAt: string,
  extra: { amount: number; hostShare: number },
  hostAccountId?: string | null
): Promise<string> {
  const stripe = getStripe();
  const metadata = { bookingId: booking.id, kind: "extend", newEndAt };
  const params: Stripe.Checkout.SessionCreateParams = {
    mode: "payment",
    line_items: [
      {
        quantity: 1,
        price_data: {
          currency: booking.price.currency.toLowerCase(),
          unit_amount: extra.amount,
          product_data: {
            name: `ParkGo · extend ${booking.reference}`,
            description: `${space.title} · new pick-up ${new Date(newEndAt).toDateString()}`,
          },
        },
      },
    ],
    success_url: `${SITE}/api/stripe/confirm?session_id={CHECKOUT_SESSION_ID}&booking=${booking.id}`,
    cancel_url: `${SITE}/app/booking/${booking.id}`,
    client_reference_id: booking.id,
    metadata,
    payment_intent_data: { metadata },
  };

  if (hostAccountId) {
    const acct = await stripe.accounts.retrieve(hostAccountId).catch(() => null);
    if (acct?.charges_enabled) {
      params.payment_intent_data = {
        metadata,
        application_fee_amount: Math.max(0, extra.amount - extra.hostShare),
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

/**
 * Run all due host payouts as Stripe Connect transfers. GATED: does nothing
 * unless Stripe is configured — shipped dark until live keys exist.
 */
export async function runStripePayoutsDue(): Promise<{
  transferred: number;
  skipped: number;
}> {
  if (!isStripeConfigured()) return { transferred: 0, skipped: 0 };
  const { listAllBookings, listAllPayments, markPayoutPaid } = await import(
    "@/lib/data/bookings"
  );
  const { listAllSpaces, listAllHosts } = await import("@/lib/data/hosts");
  const [payments, bookings, spaces, hosts] = await Promise.all([
    listAllPayments(),
    listAllBookings(),
    listAllSpaces(),
    listAllHosts(),
  ]);
  const bookingMap = new Map(bookings.map((b) => [b.id, b]));
  const spaceMap = new Map(spaces.map((sp) => [sp.id, sp]));
  const hostMap = new Map(hosts.map((h) => [h.id, h]));
  const stripe = getStripe();

  // Respect the protection window — nothing moves before endAt + holdDays.
  const { getPlatformSettings } = await import("@/lib/data/settings");
  const { isPayoutReleasable } = await import("@/lib/payouts");
  const holdDays = (await getPlatformSettings()).payoutHoldDays;

  let transferred = 0;
  let skipped = 0;
  for (const p of payments) {
    const b = bookingMap.get(p.bookingId);
    const refunded = p.payoutStatus === "refunded" || b?.status === "cancelled";
    if (refunded || p.payoutStatus === "paid" || p.split.hostPayout <= 0) continue;
    if (b && !isPayoutReleasable(b.endAt, holdDays)) {
      skipped += 1;
      continue;
    }
    const host = b ? hostMap.get(spaceMap.get(b.spaceId)?.hostId ?? "") : undefined;
    if (!host?.payoutAccountRef) {
      skipped += 1;
      continue;
    }
    try {
      await stripe.transfers.create({
        amount: p.split.hostPayout,
        currency: p.currency.toLowerCase(),
        destination: host.payoutAccountRef,
        transfer_group: b?.reference ?? p.bookingId,
      });
      await markPayoutPaid(p.id);
      transferred += 1;
    } catch {
      skipped += 1;
    }
  }
  return { transferred, skipped };
}

export interface StripeDisputeSummary {
  id: string;
  amount: number;
  currency: string;
  reason: string;
  status: string;
  created: string;
}

/** Open Stripe disputes/chargebacks. GATED: empty until Stripe is configured. */
export async function listStripeDisputes(): Promise<StripeDisputeSummary[]> {
  if (!isStripeConfigured()) return [];
  try {
    const res = await getStripe().disputes.list({ limit: 10 });
    return res.data.map((d) => ({
      id: d.id,
      amount: d.amount,
      currency: d.currency.toUpperCase(),
      reason: d.reason ?? "unknown",
      status: d.status ?? "unknown",
      created: new Date(d.created * 1000).toISOString(),
    }));
  } catch {
    return [];
  }
}
