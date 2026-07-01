import Link from "next/link";
import type { Metadata } from "next";
import { ArrowRight, CarTaxiFront, MapPin, QrCode, Radio, Zap } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { PortalShell } from "@/components/portal/shell";
import { StatusBadge } from "@/components/portal/status";
import { travellerNav } from "@/components/portal/navs";
import { SearchWidget } from "@/components/marketing/search-widget";
import { requireRole } from "@/lib/auth";
import {
  getAirport,
  getAirports,
  getBookingsByTraveller,
  getSpace,
} from "@/lib/data/store";
import { formatDate, formatMoney } from "@/lib/utils";
import { getI18n } from "@/lib/i18n";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({ title: "Dashboard", path: "/app", noindex: true });

export default async function TravellerDashboard() {
  const user = await requireRole("traveller");
  const { t } = await getI18n();
  const bookings = getBookingsByTraveller(user.id);
  const airports = getAirports().map((a) => ({ slug: a.slug, name: a.name, code: a.code }));
  const active = bookings.find((b) => b.status === "active");

  return (
    <PortalShell user={user} nav={travellerNav} title="nav.dashboard">
      <div className="mx-auto max-w-5xl space-y-8">
        <div>
          <h2 className="text-2xl font-extrabold text-navy-900">
            {t("app.dash.welcome")} {user.name.split(" ")[0]} 👋
          </h2>
          <p className="text-navy-500">{t("app.dash.sub")}</p>
        </div>

        {/* Quick search */}
        <section>
          <SearchWidget airports={airports} compact />
        </section>

        {/* Active trip highlight */}
        {active && (
          <section>
            <ActiveTrip bookingId={active.id} t={t} />
          </section>
        )}

        {/* Trips */}
        <section id="trips" className="scroll-mt-20">
          <h3 className="mb-3 text-lg font-bold text-navy-900">{t("app.dash.yourTrips")}</h3>
          {bookings.length === 0 ? (
            <Card className="p-8 text-center text-navy-500">
              {t("app.dash.noTrips")}{" "}
              <Link href="/app/search" className="font-semibold text-brand-600">
                {t("nav.findParking")}
              </Link>{" "}
              {t("app.dash.toStart")}
            </Card>
          ) : (
            <div className="space-y-3">
              {bookings.map((b) => {
                const space = getSpace(b.spaceId);
                const airport = space ? getAirport(space.airportSlug) : undefined;
                const currency = airport?.country === "IE" ? "EUR" : "GBP";
                const canTrack = b.status === "active" || b.status === "paid";
                return (
                  <Card key={b.id} className="p-4">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-sm font-bold text-navy-900">
                            {b.reference}
                          </span>
                          <StatusBadge status={b.status} />
                        </div>
                        <div className="mt-1 flex items-center gap-1 text-sm text-navy-600">
                          <MapPin className="h-3.5 w-3.5" />
                          {space?.title} · {airport?.name}
                        </div>
                        <div className="mt-0.5 text-sm text-navy-400">
                          {formatDate(b.startAt)} → {formatDate(b.endAt)}
                        </div>
                        <div className="mt-2 flex gap-1.5">
                          {b.bundle.transfer && (
                            <Badge tone="brand">
                              <CarTaxiFront className="h-3 w-3" /> {t("search.transfer")}
                            </Badge>
                          )}
                          {b.bundle.ev && (
                            <Badge tone="go">
                              <Zap className="h-3 w-3" /> {t("app.ev")}
                            </Badge>
                          )}
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-2">
                        <div className="text-lg font-extrabold text-navy-900">
                          {formatMoney(b.price.total, currency)}
                        </div>
                        <div className="flex gap-2">
                          <Link
                            href={`/app/booking/${b.id}`}
                            className={buttonVariants({ variant: "outline", size: "sm" })}
                          >
                            <QrCode className="h-4 w-4" /> {t("app.dash.booking")}
                          </Link>
                          {canTrack && (
                            <Link
                              href={`/app/booking/${b.id}/track`}
                              className={buttonVariants({ size: "sm" })}
                            >
                              <Radio className="h-4 w-4" /> {t("app.dash.track")}
                            </Link>
                          )}
                        </div>
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>
          )}
        </section>
      </div>
    </PortalShell>
  );
}

function ActiveTrip({ bookingId, t }: { bookingId: string; t: (key: string) => string }) {
  return (
    <Card className="overflow-hidden border-go-200 bg-gradient-to-br from-go-50 to-white">
      <div className="flex flex-wrap items-center justify-between gap-4 p-5">
        <div>
          <Badge tone="go">
            <Radio className="h-3 w-3" /> {t("app.dash.tripInProgress")}
          </Badge>
          <h3 className="mt-2 text-lg font-bold text-navy-900">
            {t("app.dash.carLookedAfter")}
          </h3>
          <p className="text-sm text-navy-600">
            {t("app.dash.trackDesc")}
          </p>
        </div>
        <Link href={`/app/booking/${bookingId}/track`} className={buttonVariants()}>
          {t("app.dash.openLive")} <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </Card>
  );
}
