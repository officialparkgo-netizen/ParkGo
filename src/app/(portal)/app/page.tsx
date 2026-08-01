import Link from "next/link";
import type { Metadata } from "next";
import {
  ArrowRight,
  CalendarCheck,
  ChevronRight,
  MapPin,
  Radio,
  Search,
  Star,
  Ticket,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { Photo } from "@/components/common/photo";
import { PortalShell } from "@/components/portal/shell";
import { StatCard } from "@/components/portal/stat-card";
import { travellerNav } from "@/components/portal/navs";
import { SearchWidget } from "@/components/marketing/search-widget";
import { requireRole } from "@/lib/auth";
import { getAirport, getAirports } from "@/lib/data/store";
import { getSpacesByIds } from "@/lib/data/hosts";
import { listBookingsForTraveller } from "@/lib/data/bookings";
import { formatDate } from "@/lib/utils";
import { getI18n } from "@/lib/i18n";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({ title: "Dashboard", path: "/app", noindex: true });

export default async function TravellerDashboard() {
  const user = await requireRole("traveller");
  const { t } = await getI18n();
  const bookings = await listBookingsForTraveller(user.id);
  const spaceMap = await getSpacesByIds(bookings.map((b) => b.spaceId));
  const airports = getAirports().map((a) => ({ slug: a.slug, name: a.name, code: a.code, kind: a.kind, lat: a.lat, lng: a.lng }));
  const active = bookings.find((b) => b.status === "active");

  const now = Date.now();
  const isFinishedUnreviewed = (b: (typeof bookings)[number]) =>
    b.status === "completed" ||
    ((b.status === "paid" || b.status === "active") && new Date(b.endAt).getTime() < now);
  const upcomingCount = bookings.filter(
    (b) =>
      (b.status === "paid" || b.status === "active") && new Date(b.startAt).getTime() > now
  ).length;
  const toReviewCount = bookings.filter(isFinishedUnreviewed).length;
  const nextTrip = bookings
    .filter(
      (b) => (b.status === "paid" || b.status === "active") && new Date(b.startAt).getTime() > now
    )
    .sort((a, b) => +new Date(a.startAt) - +new Date(b.startAt))[0];
  const nextTripSpace = nextTrip ? spaceMap.get(nextTrip.spaceId) : undefined;
  const nextTripDest = nextTripSpace ? getAirport(nextTripSpace.airportSlug) : undefined;
  const isPastTrip = (b: (typeof bookings)[number]) =>
    b.status === "cancelled" ||
    b.status === "completed" ||
    b.status === "reviewed" ||
    new Date(b.endAt).getTime() < now;
  const upcomingTrips = bookings.filter((b) => !isPastTrip(b));
  const pastTrips = bookings.filter(isPastTrip);
  const daysToGo = nextTrip
    ? Math.max(0, Math.ceil((new Date(nextTrip.startAt).getTime() - now) / 86_400_000))
    : 0;

  return (
    <PortalShell user={user} nav={travellerNav} title="nav.dashboard">
      <div className="mx-auto max-w-5xl space-y-8">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-2xl font-extrabold text-navy-900">
              {t("app.dash.welcome")} {user.name.split(" ")[0]} 👋
            </h2>
            <p className="text-navy-500">{t("app.dash.sub")}</p>
          </div>
          <Link href="/app/search" className={buttonVariants({ size: "sm" })}>
            <Search className="h-4 w-4" /> {t("nav.findParking")}
          </Link>
        </div>

        {/* Stats */}
        {bookings.length > 0 && (
          <div className="grid grid-cols-3 gap-3 sm:gap-4">
            <StatCard
              label={t("app.dash.stat.upcoming")}
              value={String(upcomingCount)}
              sub={t("app.dash.stat.upcomingSub")}
              icon={CalendarCheck}
              tone="brand"
              href="/app/trips"
            />
            <StatCard
              label={t("app.dash.stat.trips")}
              value={String(bookings.length)}
              sub={t("app.dash.stat.tripsSub")}
              icon={Ticket}
              tone="navy"
              href="/app/trips"
            />
            <StatCard
              label={t("app.dash.stat.toReview")}
              value={String(toReviewCount)}
              sub={t("app.dash.stat.toReviewSub")}
              icon={Star}
              tone="go"
              href="/app/trips"
            />
          </div>
        )}

        {/* Next trip */}
        {nextTrip && (
          <Card className="flex flex-wrap items-center justify-between gap-4 border-brand-200 bg-gradient-to-br from-brand-50/60 to-white p-5">
            <div className="flex items-center gap-4">
              <Photo
                token={nextTripSpace?.photos[0] ?? "drive-1"}
                className="hidden h-16 w-24 shrink-0 sm:block"
                rounded="rounded-xl"
              />
              <div>
                <div className="text-xs font-bold uppercase tracking-wide text-brand-700">
                  {t("app.dash.nextTrip")}
                </div>
                <div className="mt-0.5 font-bold text-navy-900">
                  {nextTripSpace?.title} · {nextTripDest?.name}
                </div>
                <div className="text-sm text-navy-500">
                  {formatDate(nextTrip.startAt)} → {formatDate(nextTrip.endAt)}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="text-center">
                <div className="text-2xl font-extrabold leading-none text-navy-900">
                  {daysToGo === 0 ? t("app.dash.today") : daysToGo}
                </div>
                {daysToGo > 0 && (
                  <div className="mt-0.5 text-[11px] text-navy-400">
                    {daysToGo === 1 ? t("common.day") : t("common.days")} ·{" "}
                    {t("app.dash.untilDropOff")}
                  </div>
                )}
              </div>
              <Link
                href={`/app/booking/${nextTrip.id}`}
                className={buttonVariants({ size: "sm" })}
              >
                {t("app.dash.booking")} <ArrowRight className="h-4 w-4 rtl:-scale-x-100" />
              </Link>
            </div>
          </Card>
        )}

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

        {/* Trips live on their own page */}
        <section id="trips" className="scroll-mt-20">
          {bookings.length === 0 ? (
            <Card className="p-10 text-center">
              <span className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-50 text-brand-700">
                <MapPin className="h-7 w-7" />
              </span>
              <p className="font-bold text-navy-900">{t("app.dash.emptyTitle")}</p>
              <p className="mx-auto mt-1 max-w-sm text-sm text-navy-500">{t("app.dash.emptySub")}</p>
              <Link href="/app/search" className={buttonVariants({ className: "mt-5" })}>
                <Search className="h-4 w-4" /> {t("nav.findParking")}
              </Link>
            </Card>
          ) : (
            <Link href="/app/trips" className="group block">
              <Card className="flex items-center justify-between gap-3 p-5 transition-colors group-hover:border-brand-300">
                <div className="flex items-center gap-3">
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-brand-50 text-brand-700">
                    <Ticket className="h-5 w-5" />
                  </span>
                  <div>
                    <div className="font-bold text-navy-900">{t("app.dash.yourTrips")}</div>
                    <div className="text-sm text-navy-500">
                      {upcomingTrips.length} {t("app.dash.upcomingSection")} ·{" "}
                      {pastTrips.length} {t("app.dash.pastSection")}
                    </div>
                  </div>
                </div>
                <ChevronRight className="h-5 w-5 shrink-0 text-navy-400 transition-transform group-hover:translate-x-0.5" />
              </Card>
            </Link>
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
