import Link from "next/link";
import type { Metadata } from "next";
import { Sparkles, ArrowRight, SearchX } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { PortalShell } from "@/components/portal/shell";
import { travellerNav } from "@/components/portal/navs";
import { SearchWidget } from "@/components/marketing/search-widget";
import { SpaceCard } from "@/components/portal/space-card";
import { ResultsMap } from "@/components/portal/results-map";
import { SearchMap } from "@/components/portal/search-map";
import { requireRole } from "@/lib/auth";
import { formatMoneyShort } from "@/lib/utils";

const MAPBOX = !!process.env.NEXT_PUBLIC_MAPBOX_TOKEN;
import { getAirport, getAirports } from "@/lib/data/store";
import { searchLiveSpaces } from "@/lib/data/hosts";
import { optimiseJourney } from "@/lib/services/ai";
import { getI18n } from "@/lib/i18n";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({ title: "Search", path: "/app/search", noindex: true });

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{
    airport?: string;
    q?: string;
    near?: string;
    lat?: string;
    lng?: string;
    from?: string;
    to?: string;
    ev?: string;
    transfer?: string;
    cctv?: string;
    covered?: string;
    accessible?: string;
    maxprice?: string;
    vehicle?: string;
    sort?: string;
  }>;
}) {
  const user = await requireRole("traveller");
  const { t } = await getI18n();
  const sp = await searchParams;
  const airports = getAirports().map((a) => ({ slug: a.slug, name: a.name, code: a.code, kind: a.kind, lat: a.lat, lng: a.lng }));

  // Free-text destination: "Gatwick", "LGW", an area, or a postcode. Only
  // consulted when no explicit airport was picked.
  const rawQ = (sp.q ?? "").trim();
  let airportSlug = sp.airport || "";
  let matchedSpaceIds: Set<string> | null = null;
  let noMatch = false;
  // A geocoded point ("near me" spot): results sort by distance to it.
  let nearPoint: { lat: number; lng: number; label: string } | null = null;
  if (
    airportSlug &&
    sp.near &&
    Number.isFinite(Number(sp.lat)) &&
    Number.isFinite(Number(sp.lng))
  ) {
    nearPoint = { lat: Number(sp.lat), lng: Number(sp.lng), label: sp.near };
  }
  if (!airportSlug && rawQ) {
    const { listAllSpaces } = await import("@/lib/data/hosts");
    const { geocodeUk, nearestDestination, resolveSearchQuery } = await import(
      "@/lib/geo-search"
    );
    const resolution = resolveSearchQuery(rawQ, airports, await listAllSpaces());
    if (resolution.kind === "destination") {
      airportSlug = resolution.slug;
    } else if (resolution.kind === "spaces") {
      airportSlug = resolution.slug;
      matchedSpaceIds = new Set(resolution.spaceIds);
    } else {
      // Nothing of ours matches — geocode it (Mapbox, UK/IE) and show the
      // nearest destination we serve, closest spaces first.
      const [hit] = await geocodeUk(rawQ);
      const nearest = hit ? nearestDestination(hit.lat, hit.lng, airports) : null;
      if (hit && nearest) {
        airportSlug = nearest.slug;
        nearPoint = { lat: hit.lat, lng: hit.lng, label: rawQ };
      } else {
        noMatch = true;
      }
    }
  }
  if (!airportSlug) airportSlug = "heathrow";
  const airport = getAirport(airportSlug);

  const maxPrice = Number(sp.maxprice) > 0 ? Number(sp.maxprice) : undefined;
  const unsorted = await searchLiveSpaces({
    airportSlug,
    startAt: sp.from ? new Date(sp.from).toISOString() : undefined,
    endAt: sp.to ? new Date(sp.to).toISOString() : undefined,
    needsEv: sp.ev === "1",
    needsTransfer: sp.transfer === "1",
    needsCctv: sp.cctv === "1",
    needsCovered: sp.covered === "1",
    needsAccessible: sp.accessible === "1",
    maxPricePerDay: maxPrice,
    vehicleSize: (sp.vehicle as "small" | "medium" | "large" | "van" | undefined) || undefined,
  });

  // A postcode/area query narrows the airport's results to the exact matches.
  const scoped = matchedSpaceIds
    ? unsorted.filter((r) => matchedSpaceIds.has(r.space.id))
    : unsorted;

  // Sorting: recommended keeps the data-layer order.
  const sort = ["price", "rating", "closest"].includes(sp.sort ?? "")
    ? (sp.sort as "price" | "rating" | "closest")
    : "recommended";
  const results = [...scoped];
  // Which of these the traveller has already kept, so the heart renders filled.
  const { listSavedSpaceIds } = await import("@/lib/data/saved");
  const savedIds = new Set(await listSavedSpaceIds(user.id).catch(() => []));
  // Demand analytics (fire-and-forget; zero-result searches = supply gaps).
  const { logSearchEvent } = await import("@/lib/data/search-events");
  await logSearchEvent({
    airportSlug,
    destName: airport?.name ?? airportSlug,
    results: results.length,
  });
  if (sort === "price") results.sort((a, b) => a.estimatedTotal - b.estimatedTotal);
  if (sort === "rating") results.sort((a, b) => b.space.rating - a.space.rating);
  if (sort === "closest") results.sort((a, b) => a.space.driveMinutes - b.space.driveMinutes);
  if (nearPoint && sort === "recommended") {
    const { distanceKm } = await import("@/lib/geo-search");
    const point = nearPoint;
    results.sort(
      (a, b) =>
        distanceKm(point.lat, point.lng, a.space.lat, a.space.lng) -
        distanceKm(point.lat, point.lng, b.space.lat, b.space.lng)
    );
  }

  const sortHref = (key: string) => {
    const params = new URLSearchParams();
    for (const [k, v] of Object.entries(sp)) if (v && k !== "sort") params.set(k, v);
    // A free-text query re-resolves on every visit — only pin the airport
    // when there is no query, or the postcode narrowing would be lost.
    if (!params.get("airport") && !params.get("q")) params.set("airport", airportSlug);
    if (key !== "recommended") params.set("sort", key);
    return `/app/search?${params.toString()}`;
  };
  const clearFiltersHref = (() => {
    const params = new URLSearchParams(
      rawQ && !sp.airport ? { q: rawQ } : { airport: airportSlug }
    );
    if (sp.from) params.set("from", sp.from);
    if (sp.to) params.set("to", sp.to);
    return `/app/search?${params.toString()}`;
  })();

  const spaceHref = (id: string) => {
    const params = new URLSearchParams();
    if (sp.from) params.set("from", sp.from);
    if (sp.to) params.set("to", sp.to);
    if (sp.ev) params.set("ev", sp.ev);
    if (sp.transfer) params.set("transfer", sp.transfer);
    const qs = params.toString();
    return `/app/space/${id}${qs ? `?${qs}` : ""}`;
  };
  const hourlySearch = !!sp.from?.includes("T");

  const suggestion = optimiseJourney(results, {
    needsEv: sp.ev === "1",
    needsTransfer: sp.transfer === "1",
    priority: "convenience",
  });

  return (
    <PortalShell user={user} nav={travellerNav} title="nav.findParking">
      <div className="mx-auto max-w-6xl space-y-6">
        <SearchWidget
          airports={airports}
          initial={{
            airport: airportSlug,
            q: rawQ || undefined,
            from: sp.from,
            to: sp.to,
            vehicle: sp.vehicle,
            ev: sp.ev === "1",
            transfer: sp.transfer === "1",
            cctv: sp.cctv === "1",
            covered: sp.covered === "1",
            accessible: sp.accessible === "1",
            maxPrice,
          }}
        />

        {noMatch && (
          <div
            className="flex items-center gap-2 rounded-2xl border border-accent-200 bg-accent-50 px-4 py-3 text-sm font-semibold text-accent-700"
            data-q-nomatch
          >
            <SearchX className="h-5 w-5 shrink-0" />
            {t("search.noMatch").replace("{q}", rawQ)}
          </div>
        )}

        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-bold text-navy-900">
              {results.length} {t("app.search.spacesNear")} {airport?.name ?? t("app.search.yourAirport")}
            </h2>
            <div className="mt-1 flex flex-wrap gap-2">
              {matchedSpaceIds && (
                <Badge tone="brand" data-q-badge>
                  {t("search.matchNote").replace("{q}", rawQ)}
                </Badge>
              )}
              {nearPoint && (
                <Badge tone="brand" data-near-badge>
                  {t("search.nearNote").replace("{q}", nearPoint.label)}
                </Badge>
              )}
              {hourlySearch && <Badge tone="brand">{t("search.mode.hourly")}</Badge>}
              {sp.cctv === "1" && <Badge tone="go">{t("app.search.cctvCamera")}</Badge>}
              {sp.transfer === "1" && <Badge tone="brand">{t("app.search.plusTransfer")}</Badge>}
              {sp.ev === "1" && <Badge tone="brand">{t("search.evCharging")}</Badge>}
              {sp.covered === "1" && <Badge tone="navy">{t("search.covered")}</Badge>}
              {sp.accessible === "1" && <Badge tone="navy">{t("search.accessible")}</Badge>}
              {maxPrice && (
                <Badge tone="neutral">≤ £{Math.round(maxPrice / 100)}/{t("common.day")}</Badge>
              )}
              {sp.vehicle && <Badge tone="neutral">{t(`search.${sp.vehicle}`)}</Badge>}
            </div>
          </div>
          <div className="no-scrollbar -mx-1 flex w-full items-center gap-1.5 overflow-x-auto px-1 sm:w-auto sm:flex-wrap">
            <span className="mr-1 shrink-0 text-xs font-semibold uppercase tracking-wide text-navy-400">
              {t("app.search.sort.label")}
            </span>
            {(
              [
                ["recommended", t("app.search.sort.recommended")],
                ["price", t("app.search.sort.price")],
                ["rating", t("app.search.sort.rating")],
                ["closest", t("app.search.sort.closest")],
              ] as const
            ).map(([key, label]) => (
              <Link
                key={key}
                href={sortHref(key)}
                className={`shrink-0 whitespace-nowrap rounded-full border px-3 py-1.5 text-xs font-semibold transition-colors ${
                  sort === key
                    ? "border-brand-400 bg-brand-50 text-brand-700"
                    : "border-navy-200 text-navy-600 hover:bg-navy-50"
                }`}
              >
                {label}
              </Link>
            ))}
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          <div className="space-y-4 lg:col-span-2">
            {suggestion && (
              <Card className="border-go-200 bg-gradient-to-br from-go-50 to-white p-5">
                <div className="flex items-start gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-go-500 text-navy-900">
                    <Sparkles className="h-5 w-5" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-navy-900">{suggestion.headline}</h3>
                      <Badge tone="go">
                        {t("app.search.aiPick")} · {Math.round(suggestion.confidence * 100)}%
                      </Badge>
                    </div>
                    <ul className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-sm text-navy-600">
                      {suggestion.reasons.map((r) => (
                        <li key={r} className="flex items-center gap-1">
                          <span className="h-1.5 w-1.5 rounded-full bg-go-500" /> {r}
                        </li>
                      ))}
                    </ul>
                    <Link
                      href={spaceHref(suggestion.spaceId)}
                      className={buttonVariants({ size: "sm", className: "mt-3" })}
                    >
                      {t("app.search.viewRecommended")} <ArrowRight className="h-4 w-4" />
                    </Link>
                  </div>
                </div>
              </Card>
            )}

            {results.length === 0 ? (
              <Card className="p-10 text-center">
                <SearchX className="mx-auto h-10 w-10 text-navy-400" />
                <p className="mt-3 font-bold text-navy-900">{t("app.search.emptyTitle")}</p>
                <p className="mx-auto mt-1 max-w-sm text-sm text-navy-500">
                  {t("app.search.empty")}
                </p>
                <Link
                  href={clearFiltersHref}
                  className={buttonVariants({ variant: "outline", size: "sm", className: "mt-4" })}
                >
                  {t("app.search.clearFilters")}
                </Link>
              </Card>
            ) : (
              results.map((r) => (
                <SpaceCard
                  key={r.space.id}
                  result={r}
                  href={spaceHref(r.space.id)}
                  saved={savedIds.has(r.space.id)}
                />
              ))
            )}
          </div>

          <div className="hidden lg:block">
            {airport && (
              <div className="sticky top-20">
                {MAPBOX ? (
                  <SearchMap
                    airport={{ lat: airport.lat, lng: airport.lng, name: airport.name, kind: airport.kind }}
                    spaces={results.map((r) => ({
                      id: r.space.id,
                      lat: r.space.lat,
                      lng: r.space.lng,
                      price: formatMoneyShort(
                        r.estimatedTotal,
                        r.airport.country === "IE" ? "EUR" : "GBP"
                      ),
                      title: r.space.title,
                      href: spaceHref(r.space.id),
                    }))}
                    className="h-[28rem]"
                  />
                ) : (
                  <ResultsMap
                    airport={{ lat: airport.lat, lng: airport.lng, name: airport.name, kind: airport.kind }}
                    spaces={results.map((r) => ({
                      id: r.space.id,
                      lat: r.space.lat,
                      lng: r.space.lng,
                    }))}
                    className="h-[28rem]"
                  />
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </PortalShell>
  );
}
