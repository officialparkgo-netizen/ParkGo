"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plane, Search, Zap, CarTaxiFront, Camera, Car } from "lucide-react";
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
  const [vehicle, setVehicle] = useState("");
  const [needsEv, setNeedsEv] = useState(false);
  const [needsTransfer, setNeedsTransfer] = useState(false);
  const [needsCctv, setNeedsCctv] = useState(false);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const params = new URLSearchParams({
      airport,
      from,
      to,
      ...(vehicle ? { vehicle } : {}),
      ...(needsEv ? { ev: "1" } : {}),
      ...(needsTransfer ? { transfer: "1" } : {}),
      ...(needsCctv ? { cctv: "1" } : {}),
    });
    router.push(`/app/search?${params.toString()}`);
  }

  return (
    <form
      onSubmit={submit}
      className="rounded-2xl border border-navy-100 bg-white p-3 shadow-card-lg sm:p-4"
    >
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
        <label className="flex flex-col gap-1 lg:col-span-2">
          <span className="px-1 text-xs font-semibold text-navy-500">Destination</span>
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
            Search spaces
          </Button>
        </div>
      </div>

      {!compact && (
        <div className="mt-3 flex flex-wrap items-center gap-3 px-1">
          <label className="flex items-center gap-1.5 text-sm font-medium text-navy-700">
            <Car className="h-4 w-4 text-navy-400" />
            <span className="sr-only">Vehicle size</span>
            <select
              value={vehicle}
              onChange={(e) => setVehicle(e.target.value)}
              className="rounded-lg border border-navy-200 bg-white px-2 py-1 text-sm font-medium focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-100"
            >
              <option value="">Any vehicle</option>
              <option value="small">Small</option>
              <option value="medium">Medium</option>
              <option value="large">Large / SUV</option>
              <option value="van">Van</option>
            </select>
          </label>

          <Chip active={needsCctv} onClick={() => setNeedsCctv((v) => !v)} icon={Camera} color="go">
            CCTV
          </Chip>
          <Chip active={needsTransfer} onClick={() => setNeedsTransfer((v) => !v)} icon={CarTaxiFront} color="brand">
            Transfer
          </Chip>
          <Chip active={needsEv} onClick={() => setNeedsEv((v) => !v)} icon={Zap} color="go">
            EV charging
          </Chip>
        </div>
      )}
    </form>
  );
}

function Chip({
  active,
  onClick,
  icon: Icon,
  color,
  children,
}: {
  active: boolean;
  onClick: () => void;
  icon: React.ComponentType<{ className?: string }>;
  color: "go" | "brand";
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm font-semibold transition-colors ${
        active
          ? "border-brand-400 bg-brand-50 text-brand-700"
          : "border-navy-200 text-navy-600 hover:bg-navy-50"
      }`}
    >
      <Icon className={`h-4 w-4 ${active ? "text-brand-600" : "text-navy-400"}`} />
      {children}
    </button>
  );
}
