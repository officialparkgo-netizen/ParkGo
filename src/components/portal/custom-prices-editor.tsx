"use client";

import { useState } from "react";
import { Plus, X } from "lucide-react";

/**
 * Per-date price overrides on the listing edit form. State lives in a hidden
 * JSON input ({"YYYY-MM-DD": pence}) the server action parses — the page
 * stays a plain form post.
 */
export function CustomPricesEditor({
  initial,
  currencySymbol,
  labels,
}: {
  initial: Record<string, number>;
  currencySymbol: string;
  labels: { date: string; price: string; add: string; remove: string; empty: string };
}) {
  const [prices, setPrices] = useState<Record<string, number>>(initial);
  const [date, setDate] = useState("");
  const [amount, setAmount] = useState("");

  const entries = Object.entries(prices).sort(([a], [b]) => a.localeCompare(b));

  const add = () => {
    const pence = Math.round(Number(amount) * 100);
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || !Number.isFinite(pence) || pence <= 0) return;
    setPrices((p) => ({ ...p, [date]: pence }));
    setDate("");
    setAmount("");
  };

  return (
    <div className="space-y-3">
      <input type="hidden" name="customPrices" value={JSON.stringify(prices)} />
      <div className="flex flex-wrap items-end gap-2">
        <label className="block">
          <span className="mb-1 block text-xs font-semibold text-navy-500">{labels.date}</span>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="rounded-xl border border-navy-200 bg-white px-3 py-2 text-sm text-navy-900 focus:border-brand-400 focus:outline-none"
          />
        </label>
        <label className="block">
          <span className="mb-1 block text-xs font-semibold text-navy-500">{labels.price}</span>
          <input
            type="number"
            min={1}
            step="0.5"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="25"
            className="w-24 rounded-xl border border-navy-200 bg-white px-3 py-2 text-sm text-navy-900 focus:border-brand-400 focus:outline-none"
          />
        </label>
        <button
          type="button"
          onClick={add}
          data-testid="add-custom-price"
          className="inline-flex items-center gap-1 rounded-xl bg-navy-900 px-3.5 py-2.5 text-xs font-semibold text-white hover:bg-navy-700"
        >
          <Plus className="h-3.5 w-3.5" /> {labels.add}
        </button>
      </div>

      {entries.length === 0 ? (
        <p className="text-xs text-navy-400">{labels.empty}</p>
      ) : (
        <ul className="flex flex-wrap gap-2">
          {entries.map(([d, pence]) => (
            <li
              key={d}
              className="inline-flex items-center gap-2 rounded-xl bg-navy-50 px-3 py-1.5 text-xs font-semibold text-navy-700"
            >
              {d} · {currencySymbol}
              {(pence / 100).toFixed(2)}
              <button
                type="button"
                aria-label={`${labels.remove} ${d}`}
                onClick={() =>
                  setPrices((p) => {
                    const next = { ...p };
                    delete next[d];
                    return next;
                  })
                }
                className="text-navy-400 hover:text-red-600"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
