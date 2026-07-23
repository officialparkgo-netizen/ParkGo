import Link from "next/link";
import type { Metadata } from "next";
import {
  CarTaxiFront,
  ChevronDown,
  MapPin,
  QrCode,
  Radio,
  Search,
  Star,
  Zap,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { Photo } from "@/components/common/photo";
import { PortalShell } from "@/components/portal/shell";
import { StatusBadge } from "@/components/portal/status";
import { travellerNav } from "@/components/portal/navs";
import { requireRole } from "@/lib/auth";
import { getAirport } from "@/lib/data/store";
import { getSpacesByIds } from "@/lib/data/hosts";
import { listBookingsForTraveller } from "@/lib/data/bookings";
import { formatDate, formatMoney } from "@/lib/utils";
import { getI18n } from "@/lib/i18n";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Your trips",
  path: "/app/trips",
  noindex: true,
});

export default async function TravellerTripsPage() {
  const user = await requireRole("traveller");
  const { t } = await getI18n();
  const bookings = await listBookingsForTraveller(user.id);
  const spaceMap = await getSpacesByIds(bookings.map((b) => b.spaceId));

  const now = Date.now();
  const isFinishedUnreviewed = (b: (typeof bookings)[number]) =>
    b.status === "completed" ||
    ((b.status === "paid" || b.status === "active") && new Date(b.endAt).getTime() < now);
  const isPastTrip = (b: (typeof bookings)[number]) =>
    b.status === "cancelled" ||
    b.status === "completed" ||
    b.status === "reviewed" ||
    new Date(b.endAt).getTime() < now;
  const upcomingTrips = bookings
    .filter((b) => !isPastTrip(b))
    .sort((a, b) => +new Date(a.startAt) - +new Date(b.startAt));
  const pastTrips = bookings
    .filter(isPastTrip)
    .sort((a, b) => +new Date(b.endAt) - +new Date(a.endAt));
  const pastNeedsReview = pastTrips.some(isFinishedUnreviewed);

  const renderTrip = (b: (typeof bookings)[number]) => {
    const space = spaceMap.get(b.spaceId);
    const airport = space ? getAirport(space.airportSlug) : undefined;
    const currency = airport?.country === "IE" ? "EUR" : "GBP";
    const canTrack = b.status === "active" || b.status === "paid";
    const needsReview = isFinishedUnreviewed(b);
    return (
      <Card key={b.id} className="card-hover p-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-4">
            <Photo
              token={space?.photos[0] ?? "drive-1"}
              className="hidden h-20 w-28 shrink-0 sm:block"
              rounded="rounded-xl"
            />
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
              {needsReview ? (
                <Link
                  href={`/app/booking/${b.id}/track`}
                  className={buttonVariants({ size: "sm" })}
                >
                  <Star className="h-4 w-4" /> {t("app.dash.review")}
                </Link>
              ) : (
                canTrack && (
                  <Link
                    href={`/app/booking/${b.id}/track`}
                    className={buttonVariants({ size: "sm" })}
                  >
                    <Radio className="h-4 w-4" /> {t("app.dash.track")}
                  </Link>
                )
              )}
            </div>
          </div>
        </div>
      </Card>
    );
  };

  return (
    <PortalShell user={user} nav={travellerNav} title="app.dash.yourTrips">
      <div className="mx-auto max-w-5xl space-y-6">
        <Link href="/app" className="text-sm font-semibold text-brand-600">
          ← {t("common.backToDash")}
        </Link>

        <section id="trips">
          <h3 className="mb-3 text-lg font-bold text-navy-900">{t("app.dash.yourTrips")}</h3>
          {bookings.length === 0 ? (
            <Card className="p-10 text-center">
              <span className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-50 text-brand-600">
                <MapPin className="h-7 w-7" />
              </span>
              <p className="font-bold text-navy-900">{t("app.dash.emptyTitle")}</p>
              <p className="mx-auto mt-1 max-w-sm text-sm text-navy-500">{t("app.dash.emptySub")}</p>
              <Link href="/app/search" className={buttonVariants({ className: "mt-5" })}>
                <Search className="h-4 w-4" /> {t("nav.findParking")}
              </Link>
            </Card>
          ) : (
            <div className="space-y-6">
              {upcomingTrips.length > 0 && (
                <div>
                  <div className="mb-2 flex items-center gap-2">
                    <h4 className="text-xs font-bold uppercase tracking-wide text-navy-500">
                      {t("app.dash.upcomingSection")}
                    </h4>
                    <Badge tone="brand">{upcomingTrips.length}</Badge>
                  </div>
                  <div className="space-y-3">{upcomingTrips.map(renderTrip)}</div>
                </div>
              )}
              {pastTrips.length > 0 && (
                <details className="group" open={pastNeedsReview || upcomingTrips.length === 0}>
                  <summary className="mb-2 flex cursor-pointer list-none items-center gap-2 [&::-webkit-details-marker]:hidden">
                    <h4 className="text-xs font-bold uppercase tracking-wide text-navy-500">
                      {t("app.dash.pastSection")}
                    </h4>
                    <Badge tone="neutral">{pastTrips.length}</Badge>
                    <ChevronDown className="h-4 w-4 text-navy-400 transition-transform group-open:rotate-180" aria-hidden />
                  </summary>
                  <div className="space-y-3">{pastTrips.map(renderTrip)}</div>
                </details>
              )}
            </div>
          )}
        </section>
      </div>
    </PortalShell>
  );
}
