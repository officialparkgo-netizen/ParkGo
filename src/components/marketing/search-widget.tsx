"use client";

import { useEffect, useId, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Accessibility,
  Banknote,
  Camera,
  Car,
  CarTaxiFront,
  MapPin,
  Plane,
  Search,
  Umbrella,
  Zap,
} from "lucide-react";
import type { Airport } from "@/types";
import { nearestDestination } from "@/lib/geo-search";
import { useT } from "@/lib/i18n/client";

interface DestSuggestion {
  label: string;
  /** Muted second line — never folded into `label`, which must round-trip. */
  sublabel?: string;
  type?: "destination" | "area" | "place";
  slug?: string;
  /** Free text to submit as `?q=` — set on area rows. */
  q?: string;
  lat?: number;
  lng?: number;
}

function isoDay(offsetDays: number) {
  const d = new Date();
  d.setDate(d.getDate() + offsetDays);
  return d.toISOString().slice(0, 10);
}

/** "2026-07-21T09:00" → hourly search; plain dates are daily searches. */
const hasTime = (v?: string) => !!v && v.includes("T");

export interface SearchWidgetInitial {
  airport?: string;
  /** Free-text destination query (name / code / area / postcode). */
  q?: string;
  from?: string;
  to?: string;
  vehicle?: string;
  ev?: boolean;
  transfer?: boolean;
  cctv?: boolean;
  covered?: boolean;
  accessible?: boolean;
  /** Max daily rate in pence (e.g. 1000 = £10/day). */
  maxPrice?: number;
}

export function SearchWidget({
  airports,
  compact = false,
  initial,
}: {
  airports: Pick<Airport, "slug" | "name" | "code" | "kind" | "lat" | "lng">[];
  compact?: boolean;
  /** Pre-fill from the current query so refining a search keeps its state. */
  initial?: SearchWidgetInitial;
}) {
  const router = useRouter();
  const t = useT();
  const initialHourly = hasTime(initial?.from);

  // Free-text destination: shows "Name (CODE)" for known places but accepts
  // anything — an unknown string is sent as ?q= and resolved server-side
  // (area names and postcodes match against real listings).
  const display = (a: (typeof airports)[number]) =>
    !a.kind || a.kind === "airport" ? `${a.name} (${a.code})` : a.name;
  // Empty unless the current search actually names a destination. It used to
  // default to Heathrow, which put a real search term in the box that nobody
  // typed — easy to submit by accident, and it hid the placeholder that tells
  // you an area or a postcode works here too.
  const initialAirport = initial?.airport
    ? airports.find((a) => a.slug === initial.airport)
    : undefined;
  const initialDest = initial?.q ?? (initialAirport ? display(initialAirport) : "");
  const [dest, setDest] = useState(initialDest);
  // A geocoded pick (postcode / town / street) — search runs at the nearest
  // destination we serve, sorted by distance to this point.
  const [geoSel, setGeoSel] = useState<{ label: string; lat: number; lng: number } | null>(null);
  const listId = useId();
  const [sugs, setSugs] = useState<DestSuggestion[]>([]);
  const [openSugs, setOpenSugs] = useState(false);
  const [sugState, setSugState] = useState<"idle" | "loading" | "done">("idle");
  const [active, setActive] = useState(-1);
  // The row the user actually chose. Kept whole so submit can use its `q` or
  // `slug` instead of re-deriving intent from the label text.
  const [picked, setPicked] = useState<DestSuggestion | null>(null);
  const mountedRef = useRef(false);
  // Compared against the current text rather than consumed once: the old
  // boolean latch could stay true after a pick, swallowing the next keystroke's
  // suggestions entirely.
  const pickedLabelRef = useRef<string | null>(null);

  // Live suggestions: our destinations + areas + Mapbox UK/IE places, debounced.
  useEffect(() => {
    // Don't fetch for the value the field was born with — /app/search?q=… would
    // otherwise pop a dropdown open over the results on load.
    if (!mountedRef.current) {
      mountedRef.current = true;
      return;
    }
    const q = dest.trim();
    if (q === pickedLabelRef.current) return;
    if (q.length < 2) {
      setSugs([]);
      setSugState("idle");
      setActive(-1);
      return;
    }
    const ctl = new AbortController();
    const timer = setTimeout(async () => {
      setSugState("loading");
      try {
        const res = await fetch(`/api/geo/suggest?q=${encodeURIComponent(q)}`, {
          signal: ctl.signal,
        });
        const data = res.ok
          ? ((await res.json()) as { suggestions?: DestSuggestion[] })
          : { suggestions: [] };
        setSugs(data.suggestions ?? []);
        setActive(-1);
        setSugState("done");
        setOpenSugs(true);
      } catch (err) {
        // An abort just means a newer keystroke won; leave state to that one.
        if ((err as Error)?.name === "AbortError") return;
        setSugs([]);
        setSugState("done");
      }
    }, 250);
    // Aborting is what stops an older, slower response from overwriting a
    // newer one — type "lon", then "man", and the London rows could land last.
    return () => {
      clearTimeout(timer);
      ctl.abort();
    };
  }, [dest]);

  const pickSuggestion = (s: DestSuggestion) => {
    pickedLabelRef.current = s.label;
    setPicked(s);
    setDest(s.label);
    setGeoSel(
      s.type === "place" && s.lat !== undefined ? { label: s.label, lat: s.lat, lng: s.lng! } : null
    );
    setOpenSugs(false);
    setActive(-1);
    if (s.slug && !airportDests.some((a) => a.slug === s.slug)) setNeedsTransfer(false);
  };

  // Open once a fetch has settled, even with nothing to show — see the empty
  // row below.
  const showSugs = openSugs && (sugs.length > 0 || sugState === "done");

  // Arrow keys / Enter / Escape — role="combobox" promises these exist.
  const onDestKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Escape") {
      setOpenSugs(false);
      setActive(-1);
      return;
    }
    if (!openSugs || sugs.length === 0) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActive((i) => (i + 1) % sugs.length);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive((i) => (i <= 0 ? sugs.length - 1 : i - 1));
    } else if (e.key === "Enter" && active >= 0) {
      // Only swallow Enter when a row is highlighted; otherwise submit.
      e.preventDefault();
      pickSuggestion(sugs[active]);
    }
  };

  const resolveDest = (text: string): string | null => {
    const q = text.trim().toLowerCase();
    if (!q) return null;
    const inParens = q.match(/\(([a-z0-9]{2,4})\)\s*$/)?.[1];
    for (const a of airports) {
      if (
        a.slug === q ||
        a.code.toLowerCase() === q ||
        (inParens && a.code.toLowerCase() === inParens) ||
        a.name.toLowerCase() === q ||
        display(a).toLowerCase() === q
      ) {
        return a.slug;
      }
    }
    if (q.length >= 3) {
      const byName = airports.find((a) => a.name.toLowerCase().includes(q));
      if (byName) return byName.slug;
    }
    return null;
  };
  const airport = resolveDest(dest) ?? "";
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
  const [needsAccessible, setNeedsAccessible] = useState(initial?.accessible ?? false);
  const [maxPrice, setMaxPrice] = useState(initial?.maxPrice ? String(initial.maxPrice) : "");

  // Terminal transfer only exists at airports.
  const airportDests = airports.filter((a) => !a.kind || a.kind === "airport");
  const placeDests = airports.filter((a) => a.kind && a.kind !== "airport");
  const isAirport = airportDests.some((a) => a.slug === airport);
  // Before anything is typed we cannot know whether the destination has a
  // terminal transfer, and most do — so keep offering it, and drop it only once
  // a place that definitely has none is chosen.
  const canTransfer = isAirport || !dest.trim();

  function submit(e: React.FormEvent) {
    e.preventDefault();
    // A picked row carries its own intent. Re-deriving it from the label would
    // lose the narrowing: "Lowfield Heath" resolved by text alone widens to the
    // whole of Gatwick, which is the opposite of what the user just chose.
    const stillPicked = picked && picked.label === dest ? picked : null;
    // Geocoded pick → nearest served destination, results sorted by distance.
    let destParams: Record<string, string> = stillPicked?.q
      ? { q: stillPicked.q }
      : stillPicked?.slug
        ? { airport: stillPicked.slug }
        : airport
          ? { airport }
          : { q: dest.trim() };
    if (!airport && geoSel) {
      // Haversine, not squared degrees: at UK latitudes a degree of longitude
      // is about 0.62 of a degree of latitude on the ground, so comparing raw
      // degrees picks the wrong airport for anywhere east or west of one.
      const best = nearestDestination(geoSel.lat, geoSel.lng, airports);
      if (best) {
        destParams = {
          airport: best.slug,
          near: geoSel.label,
          lat: String(geoSel.lat),
          lng: String(geoSel.lng),
        };
      }
    }
    const params = new URLSearchParams({
      ...destParams,
      from: mode === "hourly" ? `${from}T${fromTime}` : from,
      to: mode === "hourly" ? `${from}T${toTime}` : to,
      ...(vehicle ? { vehicle } : {}),
      ...(needsEv ? { ev: "1" } : {}),
      ...(needsTransfer ? { transfer: "1" } : {}),
      ...(needsCctv ? { cctv: "1" } : {}),
      ...(needsCovered ? { covered: "1" } : {}),
      ...(needsAccessible ? { accessible: "1" } : {}),
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

      {/* Segmented search bar (Airbnb-style pill on large screens).
          No `overflow-hidden` here: it used to clip the suggestions list to the
          height of the pill, so on desktop a dropdown 158px tall rendered as an
          8px sliver — the suggestions were arriving and were simply invisible.
          The rounding the clip used to provide is now on the cells themselves. */}
      <div className="flex flex-col rounded-3xl border border-navy-200 bg-white shadow-card-lg lg:flex-row lg:items-stretch lg:rounded-full">
        <label className="flex min-w-0 flex-col justify-center gap-0.5 rounded-t-3xl border-b border-navy-100 px-6 py-3.5 transition-colors focus-within:bg-navy-50/70 hover:bg-navy-50/70 lg:flex-[1.5] lg:rounded-s-full lg:rounded-t-none lg:border-b-0 lg:px-5">
          <span className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wide text-navy-500">
            <Plane className="h-3.5 w-3.5 text-brand-600" aria-hidden /> {t("search.destination")}
          </span>
          <div className="relative">
            <input
              type="text"
              data-dest-input
              role="combobox"
              aria-expanded={showSugs}
              aria-controls={listId}
              aria-activedescendant={active >= 0 ? `${listId}-opt-${active}` : undefined}
              aria-autocomplete="list"
              autoComplete="off"
              required
              value={dest}
              onChange={(e) => {
                setDest(e.target.value);
                setGeoSel(null);
                setPicked(null);
                const slug = resolveDest(e.target.value);
                if (!slug || !airportDests.some((a) => a.slug === slug)) setNeedsTransfer(false);
              }}
              onKeyDown={onDestKeyDown}
              onFocus={(e) => {
                e.target.select();
                if (sugs.length > 0 || sugState === "done") setOpenSugs(true);
              }}
              onBlur={() => setTimeout(() => setOpenSugs(false), 150)}
              placeholder={t("search.destPh")}
              className="w-full bg-transparent text-sm font-semibold text-navy-900 placeholder:font-normal placeholder:text-navy-400 focus:outline-none"
            />
            {showSugs && (
              <ul
                role="listbox"
                id={listId}
                data-dest-suggestions
                // max-h is 17rem, not 18: the marketing hero still clips at
                // its own overflow-hidden and leaves 279px below the field, so
                // a full seven rows at 18rem would lose their last few pixels.
                className="absolute start-0 top-full z-40 mt-2 max-h-[17rem] w-full min-w-64 overflow-y-auto rounded-2xl border border-navy-100 bg-white py-1.5 shadow-card-lg"
              >
                {sugs.length === 0 ? (
                  // Saying "nothing matched" is the difference between a search
                  // box that looks broken and one that just has no answer.
                  <li
                    data-dest-empty
                    role="option"
                    aria-selected="false"
                    aria-disabled="true"
                    className="px-3.5 py-2.5 text-sm text-navy-500"
                  >
                    {t("search.sug.none").replace("{q}", dest.trim())}
                  </li>
                ) : (
                  sugs.map((s, i) => (
                    <li
                      key={`${s.type ?? "x"}:${s.slug ?? s.q ?? s.label}:${i}`}
                      id={`${listId}-opt-${i}`}
                      role="option"
                      aria-selected={i === active}
                    >
                      <button
                        type="button"
                        tabIndex={-1}
                        // mousedown only prevents the blur that would close the
                        // list; the actual pick is on click, so touch and
                        // assistive-tech activation work too.
                        onMouseDown={(e) => e.preventDefault()}
                        onClick={() => pickSuggestion(s)}
                        onMouseEnter={() => setActive(i)}
                        className={`flex w-full items-start gap-2 px-3.5 py-2 text-start text-sm text-navy-800 ${
                          i === active ? "bg-navy-50" : ""
                        }`}
                      >
                        {s.type === "destination" ? (
                          <Plane className="mt-0.5 h-4 w-4 shrink-0 text-brand-600" aria-hidden />
                        ) : (
                          <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-navy-500" aria-hidden />
                        )}
                        <span className="min-w-0">
                          <span className="block truncate font-semibold">{s.label}</span>
                          {s.sublabel && (
                            <span className="block truncate text-xs font-normal text-navy-500">
                              {t("search.sug.nearDest").replace("{dest}", s.sublabel)}
                            </span>
                          )}
                        </span>
                      </button>
                    </li>
                  ))
                )}
              </ul>
            )}
          </div>
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
          {canTransfer && (
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
          <Chip
            active={needsAccessible}
            onClick={() => setNeedsAccessible((v) => !v)}
            icon={Accessibility}
          >
            {t("search.accessible")}
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
      <Icon className={`h-4 w-4 ${active ? "text-brand-700" : "text-navy-400"}`} aria-hidden />
      {children}
    </button>
  );
}
