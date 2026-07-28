"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { requireUser } from "@/lib/auth";
import { isStripeConfigured } from "@/lib/stripe";
import { GIFT_CARD_AMOUNTS, passOffers } from "@/lib/rewards";
import {
  createGiftCard,
  createTripPass,
  findGiftCard,
  normaliseCode,
} from "@/lib/data/rewards";
import { getPaymentGateway } from "@/lib/services/payments";

/**
 * Buying rewards, as opposed to spending them (which happens inside checkout).
 *
 * A gift card and a trip pass are both money taken now for parking later, so
 * both charge before the balance exists. If the charge fails there is simply
 * no card and no pass — the opposite order would hand out free credit whenever
 * a payment bounced.
 */

export interface RewardState {
  ok?: boolean;
  error?: string;
  code?: string;
  balancePence?: number;
}

export async function buyGiftCardAction(
  _prev: RewardState,
  formData: FormData
): Promise<RewardState> {
  const user = await requireUser();
  const amount = Number(formData.get("amount") || 0);
  if (!GIFT_CARD_AMOUNTS.includes(amount)) return { error: "Pick one of the listed amounts." };

  const recipientEmail = String(formData.get("recipientEmail") || "").trim().toLowerCase();
  if (recipientEmail && !recipientEmail.includes("@")) {
    return { error: "That email address does not look right." };
  }
  const message = String(formData.get("message") || "").trim();

  // With Stripe live the money is taken on the hosted page, and the card is
  // created by the confirm route once the payment actually clears.
  if (isStripeConfigured()) {
    const { createRewardCheckoutSession } = await import("@/lib/stripe");
    const url = await createRewardCheckoutSession({
      kind: "gift",
      amount,
      userId: user.id,
      label: `ParkGo gift card · ${(amount / 100).toFixed(0)}`,
      description: "Airport parking, transfer and EV charging",
      metadata: {
        amount: String(amount),
        recipientEmail,
        message: message.slice(0, 300),
        buyerName: user.name,
      },
    });
    redirect(url);
  }

  const charge = await getPaymentGateway().charge({
    bookingRef: `GIFT-${user.id.slice(0, 8)}`,
    amount,
    currency: "GBP",
    method: "card",
    // A gift card is not a stay, so nobody is owed a payout from it yet. The
    // money is held until the card is spent, when the split is worked out on
    // the booking it pays for.
    split: { platform: amount, hostPayout: 0, driverPayout: 0 },
  });
  if (!charge.ok) return { error: "That payment did not go through." };

  const card = await createGiftCard({
    amountPence: amount,
    purchasedBy: user.id,
    recipientEmail: recipientEmail || undefined,
    message: message || undefined,
  });
  if (!card) return { error: "We could not create the card. Nothing was charged." };

  if (recipientEmail) {
    const { sendGiftCardEmail } = await import("@/lib/booking-emails");
    await sendGiftCardEmail(card, user.name);
  }
  revalidatePath("/app/rewards");
  return { ok: true, code: card.code };
}

/** Check a code before checkout, so the balance is visible before committing. */
export async function checkGiftCardAction(
  _prev: RewardState,
  formData: FormData
): Promise<RewardState> {
  await requireUser();
  const code = normaliseCode(String(formData.get("code") || ""));
  if (!code) return { error: "Enter a gift card code." };
  const card = await findGiftCard(code);
  if (!card) return { error: "We do not recognise that code." };
  if (card.balancePence <= 0) return { error: "That card has already been spent." };
  return { ok: true, code: card.code, balancePence: card.balancePence };
}

export async function buyTripPassAction(
  _prev: RewardState,
  formData: FormData
): Promise<RewardState> {
  const user = await requireUser();
  const days = Number(formData.get("days") || 0);
  const dayValue = Number(formData.get("dayValue") || 0);

  // Price the offer here rather than trusting the form: a posted price is a
  // number the buyer chose.
  const offer = passOffers(dayValue).find((o) => o.days === days);
  if (!offer || dayValue <= 0) return { error: "Pick one of the listed passes." };

  if (isStripeConfigured()) {
    const { createRewardCheckoutSession } = await import("@/lib/stripe");
    const url = await createRewardCheckoutSession({
      kind: "pass",
      amount: offer.price,
      userId: user.id,
      label: `ParkGo trip pass · ${offer.days} days`,
      description: `${offer.days} parking days, valid 12 months`,
      metadata: {
        amount: String(offer.price),
        days: String(offer.days),
        dayValue: String(offer.dayValue),
      },
    });
    redirect(url);
  }

  const charge = await getPaymentGateway().charge({
    bookingRef: `PASS-${user.id.slice(0, 8)}`,
    amount: offer.price,
    currency: "GBP",
    method: "card",
    split: { platform: offer.price, hostPayout: 0, driverPayout: 0 },
  });
  if (!charge.ok) return { error: "That payment did not go through." };

  const pass = await createTripPass({
    userId: user.id,
    days: offer.days,
    pricePence: offer.price,
    dayValuePence: offer.dayValue,
  });
  if (!pass) return { error: "We could not create the pass. Nothing was charged." };

  revalidatePath("/app/rewards");
  return { ok: true };
}
