"use client";

import { useState } from "react";
import { Banknote } from "lucide-react";
import { formatMoney } from "@/lib/utils";

interface Labels {
  price: string;
  days: string;
  monthly: string;
  yearly: string;
  afterCommission: string;
  note: string;
}

/**
 * Interactive host earnings estimate: price/day × booked days, minus the
 * platform commission (keepPct is what the host keeps). Pure client maths —
 * clearly labelled as an estimate.
 */
export function EarningsEstimator({ keepPct, labels }: { keepPct: number; labels: Labels }) {
  const [price, setPrice] = useState(10);
  const [days, setDays] = useState(18);
  const monthlyPence = Math.round(price * days * keepPct) ; // price(£)*days*pct → pence
  const yearlyPence = monthlyPence * 12;

  return (
    <div className="mx-auto max-w-3xl rounded-3xl border border-navy-100 bg-white p-6 shadow-card-lg sm:p-8">
      <div className="grid gap-8 sm:grid-cols-2">
        <div className="space-y-7">
          <div>
            <div className="mb-2 flex items-baseline justify-between gap-3">
              <label htmlFor="est-price" className="text-sm font-semibold text-navy-700">
                {labels.price}
              </label>
              <span className="rounded-lg bg-brand-50 px-2.5 py-1 text-sm font-bold text-brand-700">
                £{price}
              </span>
            </div>
            <input
              id="est-price"
              type="range"
              min={4}
              max={30}
              step={1}
              value={price}
              onChange={(e) => setPrice(Number(e.target.value))}
              className="w-full accent-brand-500"
            />
          </div>
          <div>
            <div className="mb-2 flex items-baseline justify-between gap-3">
              <label htmlFor="est-days" className="text-sm font-semibold text-navy-700">
                {labels.days}
              </label>
              <span className="rounded-lg bg-brand-50 px-2.5 py-1 text-sm font-bold text-brand-700">
                {days}
              </span>
            </div>
            <input
              id="est-days"
              type="range"
              min={2}
              max={30}
              step={1}
              value={days}
              onChange={(e) => setDays(Number(e.target.value))}
              className="w-full accent-brand-500"
            />
          </div>
        </div>

        <div className="flex flex-col items-center justify-center rounded-2xl bg-navy-900 p-6 text-center">
          <span className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-navy-200">
            <Banknote className="h-4 w-4 text-brand-400" aria-hidden /> {labels.monthly}
          </span>
          <div data-estimator-monthly className="mt-2 text-4xl font-extrabold text-white">
            {formatMoney(monthlyPence)}
          </div>
          <div className="mt-1 text-sm text-navy-200">
            {formatMoney(yearlyPence)} {labels.yearly}
          </div>
          <div className="mt-3 rounded-full bg-white/10 px-3 py-1 text-xs font-semibold text-white">
            {labels.afterCommission}
          </div>
        </div>
      </div>
      <p className="mt-5 text-center text-xs text-navy-400">{labels.note}</p>
    </div>
  );
}
