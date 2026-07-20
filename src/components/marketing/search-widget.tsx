"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plane, Search, Zap, CarTaxiFront, Camera, Car, Umbrella, Banknote } from "lucide-react";
import type { Airport } from "@/types";
import { useT } from "@/lib/i18n/client";

function isoDay(offsetDays: number) {
  const d = new Date();
  d.setDate(d.getDate() + offsetDays);
  return d.toISOString().slice(0, 10);
}

/** "2026-07-21T09:00" → hourly search; plain dates are daily searches. */
const hasTime = (v?: string) => !!v && v.includes("T");

export interface SearchWidgetInitial {
  airport?: string;
  from?: string;
  to?: string;
  vehicle?: string;
  ev?: boolean;
  transfer?: boolean;
  cctv?: boolean;
  covered?: boolean;
  /** Max daily rate in pence (e.g. 1000 = £10/day). */
  maxPrice?: number;
}

export function SearchWidget({
  airports,
  compact = false,
  initial,
}: {
  airports: Pick<Airport, "slug" | "name" | "code" | "kind">[];
  compact?: boolean;
  /** Pre-fill from the current query so refining a search keeps its state. */
  initial?: SearchWidgetInitial;
}) {
  const router = useRouter();
  const t = useT();
  const initialHourly = hasTime(initial?.from);
  const [airport, setAirport] = useState(initial?.airport ?? airports[0]?.slug ?? "heathrow");
  const [mode, setMode] = useState<"daily" | "hourly">(initialHourly ? "hourly" : "daily");
  const [from, setFrom] = useState(
    initialHourly ? initial!.from!.slice(0, 10) : (initial?.from ?? isoDay(2))
  );
  const [to, setTo] = useState(
    initialHourly ? initial!.from!.slice(0, 10) : (initial?.to ?? isoDay(7))
  );
  const [fromTime, setFromTime] = useState(
    initialHourly ? initial!.from!.slice(11, 16) : "09:00"
  );
  const [toTime, setToTime] = useState(
    initialHourly && hasTime(initial?.to) ? initial!.to!.slice(11, 16) : "17:00"
  );
  const [vehicle, setVehicle] = useState(initial?.vehicle ?? "");
  const [needsEv, setNeedsEv] = useState(initial?.ev ?? false);
  const [needsTransfer, setNeedsTransfer] = useState(initial?.transfer ?? false);
  const [needsCctv, setNeedsCctv] = useState(initial?.cctv ?? false);
  const [needsCovered, setNeedsCovered] = useState(initial?.covered ?? false);
  const [maxPrice, setMaxPrice] = useState(initial?.maxPrice ? String(initial.maxPrice) : "");

  // Terminal transfer only exists at airports.
  const airportDests = airports.filter((a) => !a.kind || a.kind === "airport");
  const placeDests = airports.filter((a) => a.kind && a.kind !== "airport");
  const isAirport = airportDests.some((a) => a.slug === airport);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const params = new URLSearchParams({
      airport,
      from: mode === "hourly" ? `${from}T${fromTime}` : from,
      to: mode === "hourly" ? `${from}T${toTime}` : to,
      ...(vehicle ? { vehicle } : {}),
      ...(needsEv ? { ev: "1" } : {}),
      ...(needsTransfer ? { transfer: "1" } : {}),
      ...(needsCctv ? { cctv: "1" } : {}),
      ...(needsCovered ? { covered: "1" } : {}),
      ...(maxPrice ? { maxprice: maxPrice } : {}),
    });
    router.push(`/app/search?${params.toString()}`);
  }

  return (
    <form onSubmit={submit} className="w-full">
      {/* Daily / hourly stay toggle */}
      <div
        role="group"
        aria-label={`${t("search.mode.daily")} / ${t("search.mode.hourly")}`}
        className="mb-3 inline-flex rounded-full border border-navy-200 bg-white p-1 shadow-card"
      >
        {(
          [
            ["daily", t("search.mode.daily")],
            ["hourly", t("search.mode.hourly")],
          ] as const
        ).map(([key, label]) => (
          <button
            key={key}
            type="button"
            aria-pressed={mode === key}
            onClick={() => setMode(key)}
            className={`rounded-full px-4 py-1.5 text-sm font-semibold transition-colors ${
              mode === key ? "bg-navy-900 text-white" : "text-navy-600 hover:bg-navy-50"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Segmented search bar (Airbnb-style pill on large screens) */}
      <div className="flex flex-col overflow-hidden rounded-3xl border border-navy-200 bg-white shadow-card-lg lg:flex-row lg:items-stretch lg:rounded-full">
        <label className="flex min-w-0 flex-col justify-center gap-0.5 border-b border-navy-100 px-6 py-3.5 transition-colors focus-within:bg-navy-50/70 hover:bg-navy-50/70 lg:flex-[1.5] lg:border-b-0 lg:px-5">
          <span className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wide text-navy-500">
            <Plane className="h-3.5 w-3.5 text-brand-500" aria-hidden /> {t("search.destination")}
          </span>
          <select
            value={airport}
            onChange={(e) => {
              const slug = e.target.value;
              setAirport(slug);
              if (!airportDests.some((a) => a.slug === slug)) setNeedsTransfer(false);
            }}
            className="w-full cursor-pointer appearance-none bg-transparent text-sm font-semibold text-navy-900 focus:outline-none"
          >
            <optgroup label={t("search.group.airports")}>
              {airportDests.map((a) => (
                <option key={a.slug} value={a.slug}>
                  {a.name} ({a.code})
                </option>
              ))}
            </optgroup>
            {placeDests.length > 0 && (
              <optgroup label={t("search.group.places")}>
                {placeDests.map((a) => (
                  <option key={a.slug} value={a.slug}>
                    {a.name}
                  </option>
                ))}
              </optgroup>
            )}
          </select>
        </label>

        <span className="hidden w-px self-stretch bg-navy-100 lg:my-3.5 lg:block" aria-hidden />

        <label className="flex min-w-0 flex-1 flex-col justify-center gap-0.5 border-b border-navy-100 px-6 py-3.5 transition-colors focus-within:bg-navy-50/70 hover:bg-navy-50/70 lg:border-b-0 lg:px-5">
          <span className="text-[11px] font-bold uppercase tracking-wide text-navy-500">
            {mode === "hourly" ? t("search.date") : t("search.dropOff")}
          </span>
          <input
            type="date"
            value={from}
            min={isoDay(0)}
            onChange={(e) => setFrom(e.target.value)}
            className="w-full bg-transparent text-sm font-semibold text-navy-900 focus:outline-none"
          />
        </label>

        <span className="hidden w-px self-stretch bg-navy-100 lg:my-3.5 lg:block" aria-hidden />

        {mode === "hourly" ? (
          <>
            <label className="flex min-w-0 flex-1 flex-col justify-center gap-0.5 border-b border-navy-100 px-6 py-3.5 transition-colors focus-within:bg-navy-50/70 hover:bg-navy-50/70 lg:border-b-0 lg:px-5">
              <span className="text-[11px] font-bold uppercase tracking-wide text-navy-500">
                {t("search.from")}
              </span>
              <input
                type="time"
                required
                value={fromTime}
                onChange={(e) => setFromTime(e.target.value)}
                className="w-full bg-transparent text-sm font-semibold text-navy-900 focus:outline-none"
              />
            </label>

            <span className="hidden w-px self-stretch bg-navy-100 lg:my-3.5 lg:block" aria-hidden />

            <label className="flex min-w-0 flex-1 flex-col justify-center gap-0.5 border-b border-navy-100 px-6 py-3.5 transition-colors focus-within:bg-navy-50/70 hover:bg-navy-50/70 lg:border-b-0 lg:px-5">
              <span className="text-[11px] font-bold uppercase tracking-wide text-navy-500">
                {t("search.until")}
              </span>
              <input
                type="time"
                required
                value={toTime}
                min={fromTime}
                onChange={(e) => setToTime(e.target.value)}
                className="w-full bg-transparent text-sm font-semibold text-navy-900 focus:outline-none"
              />
            </label>
          </>
        ) : (
          <label className="flex min-w-0 flex-1 flex-col justify-center gap-0.5 border-b border-navy-100 px-6 py-3.5 transition-colors focus-within:bg-navy-50/70 hover:bg-navy-50/70 lg:border-b-0 lg:px-5">
            <span className="text-[11px] font-bold uppercase tracking-wide text-navy-500">
              {t("search.pickUp")}
            </span>
            <input
              type="date"
              value={to}
              min={from}
              onChange={(e) => setTo(e.target.value)}
              className="w-full bg-transparent text-sm font-semibold text-navy-900 focus:outline-none"
            />
          </label>
        )}

        <div className="flex shrink-0 items-center p-3 lg:py-2.5 lg:pl-1 lg:pr-2.5">
          <button
            type="submit"
            aria-label={t("search.searchSpaces")}
            className="inline-flex h-12 w-full items-center justify-center gap-2 whitespace-nowrap rounded-2xl bg-go-500 px-7 text-sm font-semibold text-white shadow-sm transition-all duration-150 hover:bg-go-600 active:scale-[0.98] lg:h-[3.25rem] lg:w-[3.25rem] lg:shrink-0 lg:rounded-full lg:px-0"
          >
            <Search className="h-4 w-4 lg:h-5 lg:w-5" aria-hidden />
            <span className="lg:hidden">{t("search.searchSpaces")}</span>
          </button>
        </div>
      </div>

      {!compact && (
        <div className="mt-3 flex flex-wrap items-center gap-2 px-2">
          <label className="inline-flex items-center gap-1.5 rounded-full border border-navy-200 bg-white px-3 py-1.5 text-sm font-semibold text-navy-600">
            <Car className="h-4 w-4 text-navy-400" aria-hidden />
            <span className="sr-only">{t("host.new.maxVehicle")}</span>
            <select
              value={vehicle}
              onChange={(e) => setVehicle(e.target.value)}
              className="cursor-pointer appearance-none bg-transparent focus:outline-none"
            >
              <option value="">{t("search.anyVehicle")}</option>
              <option value="small">{t("search.small")}</option>
              <option value="medium">{t("search.medium")}</option>
              <option value="large">{t("search.large")}</option>
              <option value="van">{t("search.van")}</option>
            </select>
          </label>

          <label className="inline-flex items-center gap-1.5 rounded-full border border-navy-200 bg-white px-3 py-1.5 text-sm font-semibold text-navy-600">
            <Banknote className="h-4 w-4 text-navy-400" aria-hidden />
            <span className="sr-only">{t("search.maxPrice")}</span>
            <select
              value={maxPrice}
              onChange={(e) => setMaxPrice(e.target.value)}
              className="cursor-pointer appearance-none bg-transparent focus:outline-none"
            >
              <option value="">{t("search.anyPrice")}</option>
              <option value="800">≤ £8/{t("common.day")}</option>
              <option value="1000">≤ £10/{t("common.day")}</option>
              <option value="1200">≤ £12/{t("common.day")}</option>
              <option value="1500">≤ £15/{t("common.day")}</option>
            </select>
          </label>

          <Chip active={needsCctv} onClick={() => setNeedsCctv((v) => !v)} icon={Camera}>
            {t("search.cctv")}
          </Chip>
          {isAirport && (
            <Chip active={needsTransfer} onClick={() => setNeedsTransfer((v) => !v)} icon={CarTaxiFront}>
              {t("search.transfer")}
            </Chip>
          )}
          <Chip active={needsEv} onClick={() => setNeedsEv((v) => !v)} icon={Zap}>
            {t("search.evCharging")}
          </Chip>
          <Chip active={needsCovered} onClick={() => setNeedsCovered((v) => !v)} icon={Umbrella}>
            {t("search.covered")}
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
  children,
}: {
  active: boolean;
  onClick: () => void;
  icon: React.ComponentType<{ className?: string }>;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm font-semibold transition-colors ${
        active
          ? "border-brand-400 bg-brand-50 text-brand-700"
          : "border-navy-200 bg-white text-navy-600 hover:bg-navy-50"
      }`}
    >
      <Icon className={`h-4 w-4 ${active ? "text-brand-600" : "text-navy-400"}`} aria-hidden />
      {children}
    </button>
  );
}
