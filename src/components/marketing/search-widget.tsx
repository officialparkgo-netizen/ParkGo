"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plane, Search, Zap, CarTaxiFront } from "lucide-react";
import type { Airport } from "@/types";
import { Button } from "@/components/ui/button";

function isoDay(offsetDays: number) {
  const d = new Date();
  d.setDate(d.getDate() + offsetDays);
  return d.toISOString().slice(0, 10);
}

export function SearchWidget({
  airports,
  compact = false,
}: {
  airports: Pick<Airport, "slug" | "name" | "code">[];
  compact?: boolean;
}) {
  const router = useRouter();
  const [airport, setAirport] = useState(airports[0]?.slug ?? "heathrow");
  const [from, setFrom] = useState(isoDay(2));
  const [to, setTo] = useState(isoDay(7));
  const [needsEv, setNeedsEv] = useState(false);
  const [needsTransfer, setNeedsTransfer] = useState(false);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const params = new URLSearchParams({
      airport,
      from,
      to,
      ...(needsEv ? { ev: "1" } : {}),
      ...(needsTransfer ? { transfer: "1" } : {}),
    });
    router.push(`/app/search?${params.toString()}`);
  }

  return (
    <form
      onSubmit={submit}
      className="rounded-2xl border border-navy-100 bg-white p-3 shadow-card-lg sm:p-4"
    >
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <label className="flex flex-col gap-1">
          <span className="px-1 text-xs font-semibold text-navy-500">Airport</span>
          <div className="relative">
            <Plane className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-navy-400" />
            <select
              value={airport}
              onChange={(e) => setAirport(e.target.value)}
              className="h-11 w-full appearance-none rounded-xl border border-navy-200 bg-white pl-9 pr-3 text-sm font-medium text-navy-900 focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-100"
            >
              {airports.map((a) => (
                <option key={a.slug} value={a.slug}>
                  {a.name} ({a.code})
                </option>
              ))}
            </select>
          </div>
        </label>

        <label className="flex flex-col gap-1">
          <span className="px-1 text-xs font-semibold text-navy-500">Drop off</span>
          <input
            type="date"
            value={from}
            onChange={(e) => setFrom(e.target.value)}
            className="h-11 w-full rounded-xl border border-navy-200 bg-white px-3 text-sm text-navy-900 focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-100"
          />
        </label>

        <label className="flex flex-col gap-1">
          <span className="px-1 text-xs font-semibold text-navy-500">Pick up</span>
          <input
            type="date"
            value={to}
            min={from}
            onChange={(e) => setTo(e.target.value)}
            className="h-11 w-full rounded-xl border border-navy-200 bg-white px-3 text-sm text-navy-900 focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-100"
          />
        </label>

        <div className="flex items-end">
          <Button type="submit" size="lg" className="h-11 w-full">
            <Search className="h-4 w-4" />
            Find parking
          </Button>
        </div>
      </div>

      {!compact && (
        <div className="mt-3 flex flex-wrap items-center gap-4 px-1">
          <label className="inline-flex cursor-pointer items-center gap-2 text-sm font-medium text-navy-700">
            <input
              type="checkbox"
              checked={needsEv}
              onChange={(e) => setNeedsEv(e.target.checked)}
              className="h-4 w-4 rounded border-navy-300 text-go-500 focus:ring-go-400"
            />
            <Zap className="h-4 w-4 text-go-500" /> EV charging
          </label>
          <label className="inline-flex cursor-pointer items-center gap-2 text-sm font-medium text-navy-700">
            <input
              type="checkbox"
              checked={needsTransfer}
              onChange={(e) => setNeedsTransfer(e.target.checked)}
              className="h-4 w-4 rounded border-navy-300 text-brand-500 focus:ring-brand-400"
            />
            <CarTaxiFront className="h-4 w-4 text-brand-500" /> Add licensed transfer
          </label>
        </div>
      )}
    </form>
  );
}
