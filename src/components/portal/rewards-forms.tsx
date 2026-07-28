"use client";

import { useActionState, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { buyGiftCardAction, buyTripPassAction, type RewardState } from "@/lib/rewards-actions";
import { GIFT_CARD_AMOUNTS, type PassOffer } from "@/lib/rewards";
import { formatMoney } from "@/lib/utils";
import { useT } from "@/lib/i18n/client";

/**
 * Buying a gift card. The amount is a radio group of fixed values rather than
 * a free number field — the server only accepts those four, and offering a box
 * that rejects most of what can be typed into it is a worse experience than
 * offering four buttons.
 */
export function BuyGiftCard() {
  const t = useT();
  const [amount, setAmount] = useState(GIFT_CARD_AMOUNTS[1]);
  const [state, action, pending] = useActionState<RewardState, FormData>(buyGiftCardAction, {});

  return (
    <Card className="mt-3 p-5">
      <form action={action} className="space-y-3">
        <div className="grid grid-cols-4 gap-2">
          {GIFT_CARD_AMOUNTS.map((a) => (
            <button
              key={a}
              type="button"
              aria-pressed={amount === a}
              onClick={() => setAmount(a)}
              className={`rounded-xl border px-2 py-2.5 text-sm font-bold transition-colors ${
                amount === a
                  ? "border-brand-400 bg-brand-50 text-brand-800"
                  : "border-navy-200 text-navy-700 hover:bg-navy-50"
              }`}
            >
              {formatMoney(a, "GBP")}
            </button>
          ))}
        </div>
        <input type="hidden" name="amount" value={amount} />

        <label className="block">
          <span className="mb-1 block text-xs font-bold text-navy-600">
            {t("guest.rewards.giftTo")}
          </span>
          <input
            name="recipientEmail"
            type="email"
            placeholder="name@example.com"
            className="w-full rounded-xl border border-navy-200 px-3.5 py-2.5 text-sm text-navy-900 placeholder:text-navy-400 focus:border-brand-400 focus:outline-none"
          />
          <span className="mt-1 block text-[11px] text-navy-400">
            {t("guest.rewards.giftToNote")}
          </span>
        </label>

        <label className="block">
          <span className="mb-1 block text-xs font-bold text-navy-600">
            {t("guest.rewards.giftMsg")}
          </span>
          <textarea
            name="message"
            rows={2}
            maxLength={400}
            className="w-full rounded-xl border border-navy-200 px-3.5 py-2.5 text-sm text-navy-900 focus:border-brand-400 focus:outline-none"
          />
        </label>

        {state.error && (
          <p className="rounded-lg bg-red-50 px-3 py-2 text-xs font-semibold text-red-700">
            {state.error}
          </p>
        )}
        {state.ok && state.code && (
          <p className="rounded-lg bg-go-50 px-3 py-2 text-xs font-semibold text-go-700">
            {t("guest.rewards.giftBought")} ·{" "}
            <span className="tracking-widest">{state.code}</span>
          </p>
        )}

        <Button type="submit" disabled={pending} className="w-full">
          {t("guest.rewards.giftBuy")} · {formatMoney(amount, "GBP")}
        </Button>
      </form>
    </Card>
  );
}

/** Trip passes. Priced off the destination's own cheapest day rate. */
export function BuyTripPass({ offers }: { offers: PassOffer[] }) {
  const t = useT();
  const [state, action, pending] = useActionState<RewardState, FormData>(buyTripPassAction, {});

  return (
    <>
      {state.error && (
        <p className="mt-3 rounded-lg bg-red-50 px-3 py-2 text-xs font-semibold text-red-700">
          {state.error}
        </p>
      )}
      <div className="mt-3 grid gap-3 sm:grid-cols-3">
        {offers.map((o) => (
          <Card key={o.days} className="flex flex-col p-4">
            <p className="text-2xl font-extrabold text-navy-900">
              {o.days}{" "}
              <span className="text-sm font-bold text-navy-500">
                {t("guest.rewards.passDays")}
              </span>
            </p>
            <p className="mt-1 text-sm font-bold text-navy-900">
              {formatMoney(o.price, "GBP")}
            </p>
            <p className="text-xs font-semibold text-emerald-700">
              {t("guest.rewards.passSave")} {(o.savingBps / 100).toFixed(0)}%
            </p>
            <form action={action} className="mt-3">
              <input type="hidden" name="days" value={o.days} />
              <input type="hidden" name="dayValue" value={o.dayValue} />
              <Button type="submit" variant="outline" size="sm" disabled={pending} className="w-full">
                {t("guest.rewards.passBuy")}
              </Button>
            </form>
          </Card>
        ))}
      </div>
    </>
  );
}
