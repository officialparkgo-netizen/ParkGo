import Link from "next/link";
import type { Metadata } from "next";
import { Sparkles, ArrowRight } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { PortalShell } from "@/components/portal/shell";
import { travellerNav } from "@/components/portal/navs";
import { SearchWidget } from "@/components/marketing/search-widget";
import { SpaceCard } from "@/components/portal/space-card";
import { ResultsMap } from "@/components/portal/results-map";
import { requireRole } from "@/lib/auth";
import { getAirport, getAirports, searchSpaces } from "@/lib/data/store";
import { optimiseJourney } from "@/lib/services/ai";
import { getI18n } from "@/lib/i18n";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({ title: "Search", path: "/app/search", noindex: true });

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{
    airport?: string;
    from?: string;
    to?: string;
    ev?: string;
    transfer?: string;
    cctv?: string;
    vehicle?: string;
  }>;
}) {
  const user = await requireRole("traveller");
  const { t } = await getI18n();
  const sp = await searchParams;
  const airports = getAirports().map((a) => ({ slug: a.slug, name: a.name, code: a.code }));
  const airportSlug = sp.airport || "heathrow";
  const airport = getAirport(airportSlug);

  const results = searchSpaces({
    airportSlug,
    startAt: sp.from ? new Date(sp.from).toISOString() : undefined,
    endAt: sp.to ? new Date(sp.to).toISOString() : undefined,
    needsEv: sp.ev === "1",
    needsTransfer: sp.transfer === "1",
    needsCctv: sp.cctv === "1",
    vehicleSize: (sp.vehicle as "small" | "medium" | "large" | "van" | undefined) || undefined,
  });

  const suggestion = optimiseJourney(results, {
    needsEv: sp.ev === "1",
    needsTransfer: sp.transfer === "1",
    priority: "convenience",
  });

  return (
    <PortalShell user={user} nav={travellerNav} title="nav.findParking">
      <div className="mx-auto max-w-6xl space-y-6">
        <SearchWidget airports={airports} />

        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-navy-900">
            {results.length} {t("app.search.spacesNear")} {airport?.name ?? t("app.search.yourAirport")}
          </h2>
          <div className="flex gap-2">
            {sp.cctv === "1" && <Badge tone="go">{t("app.search.cctvCamera")}</Badge>}
            {sp.transfer === "1" && <Badge tone="brand">{t("app.search.plusTransfer")}</Badge>}
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          <div className="space-y-4 lg:col-span-2">
            {suggestion && (
              <Card className="border-go-200 bg-gradient-to-br from-go-50 to-white p-5">
                <div className="flex items-start gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-go-500 text-white">
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
                      href={`/app/space/${suggestion.spaceId}`}
                      className={buttonVariants({ size: "sm", className: "mt-3" })}
                    >
                      {t("app.search.viewRecommended")} <ArrowRight className="h-4 w-4" />
                    </Link>
                  </div>
                </div>
              </Card>
            )}

            {results.length === 0 ? (
              <Card className="p-10 text-center text-navy-500">
                {t("app.search.empty")}
              </Card>
            ) : (
              results.map((r) => <SpaceCard key={r.space.id} result={r} />)
            )}
          </div>

          <div className="hidden lg:block">
            {airport && (
              <div className="sticky top-20">
                <ResultsMap
                  airport={{ lat: airport.lat, lng: airport.lng, name: airport.name }}
                  spaces={results.map((r) => ({
                    id: r.space.id,
                    lat: r.space.lat,
                    lng: r.space.lng,
                  }))}
                  className="h-[28rem]"
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </PortalShell>
  );
}
