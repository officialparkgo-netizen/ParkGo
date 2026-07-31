import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import {
  BadgeCheck,
  BellRing,
  Camera,
  Car,
  CarTaxiFront,
  Clock,
  MapPin,
  Ruler,
  ShieldCheck,
  Umbrella,
  Zap,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { Stars } from "@/components/common/stars";
import { PortalShell } from "@/components/portal/shell";
import { PhotoCarousel } from "@/components/portal/photo-carousel";
import { travellerNav } from "@/components/portal/navs";
import { LiveMap } from "@/components/portal/live-map";
import { MapboxMap } from "@/components/portal/mapbox-map";
import { requireRole } from "@/lib/auth";
import { isSpaceSaved } from "@/lib/data/saved";
import { SaveSpaceButton } from "@/components/portal/save-space-button";
import { createAlertAction } from "@/lib/guest-actions";

const MAPBOX = !!process.env.NEXT_PUBLIC_MAPBOX_TOKEN;
import { getAirport } from "@/lib/data/store";
import { getHostById, getSpaceById } from "@/lib/data/hosts";
import { logSpaceView } from "@/lib/data/space-views";
import { listReviewsForSpace } from "@/lib/data/reviews";
import { getUserProfile, getUsersByIds } from "@/lib/data/users";
import { isHourlyStay, priceBundle } from "@/lib/pricing";
import { getPlatformSettings } from "@/lib/data/settings";
import { projectToViewport } from "@/lib/services/maps";
import { daysBetween, formatDate, formatMoneyShort, hoursBetween, initials } from "@/lib/utils";
import { getI18n } from "@/lib/i18n";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({ title: "Space", path: "/app/space", noindex: true });

export default async function SpaceDetail({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{
    from?: string;
    to?: string;
    ev?: string;
    transfer?: string;
    soldout?: string;
    dates?: string;
    blocked?: string;
    watch?: string;
  }>;
}) {
  const user = await requireRole("traveller");
  const { t } = await getI18n();
  const { id } = await params;
  const sp = await searchParams;
  const space = await getSpaceById(id);
  if (!space) notFound();

  // Conversion denominator for the host's analytics — fire and forget.
  void logSpaceView(space.id);

  const airport = getAirport(space.airportSlug);
  const host = await getHostById(space.hostId);
  const hostUser = host ? await getUserProfile(host.userId) : null;
  const reviews = await listReviewsForSpace(space.id);
  const reviewAuthors = await getUsersByIds(reviews.map((r) => r.authorId));
  const currency = airport?.country === "IE" ? "EUR" : "GBP";

  // Total for the selected (or default 7-day) window — shown Airbnb-style,
  // with the full breakdown in the booking rail.
  const start = sp.from ? new Date(sp.from).toISOString() : new Date(Date.now() + 2 * 86_400_000).toISOString();
  const end = sp.to ? new Date(sp.to).toISOString() : new Date(Date.now() + 9 * 86_400_000).toISOString();
  const nights = daysBetween(start, end);
  const hourly = isHourlyStay(space, start, end);
  const hours = hoursBetween(start, end);
  const durationText = hourly
    ? `${hours} ${hours === 1 ? t("common.hour") : t("common.hours")}`
    : `${nights} ${nights === 1 ? t("common.day") : t("common.days")}`;
  const withTransfer = sp.transfer === "1";
  const withEv = sp.ev === "1" && !!space.evCharger;
  const feeCfg = await getPlatformSettings();
  const price = priceBundle(
    space,
    { parking: true, transfer: withTransfer, ev: withEv },
    start,
    end,
    currency,
    {
      serviceFee: feeCfg.serviceFee,
      parkingCommissionBps: feeCfg.parkingCommissionBps,
      transferCommissionBps: feeCfg.transferCommissionBps,
    }
  );
  const priceTotal = price.total;

  // Gallery: real photos only — placeholders appear only when there are none.
  const photos = space.photos.length > 0 ? space.photos : ["drive-1", "yard-1", "ev-1"];

  // project space + terminal into the schematic map's 0–100 space
  const project = projectToViewport([
    { lat: space.lat, lng: space.lng },
    { lat: airport?.lat ?? space.lat, lng: airport?.lng ?? space.lng },
  ]);
  const sPos = project({ lat: space.lat, lng: space.lng });
  const aPos = project({ lat: airport?.lat ?? space.lat, lng: airport?.lng ?? space.lng });

  const bookHref =
    `/app/book/${space.id}?` +
    new URLSearchParams({
      ...(sp.from ? { from: sp.from } : {}),
      ...(sp.to ? { to: sp.to } : {}),
      ...(sp.ev ? { ev: sp.ev } : {}),
      ...(sp.transfer ? { transfer: sp.transfer } : {}),
    }).toString();

  const saved = await isSpaceSaved(user.id, space.id).catch(() => false);

  return (
    <PortalShell user={user} nav={travellerNav} title={space.title}>
      <div className="mx-auto max-w-5xl space-y-6 pb-24 lg:pb-0">
        <div className="flex items-center justify-between gap-3">
          <Link href="/app/search" className="text-sm font-semibold text-brand-700">
            ← {t("common.backToResults")}
          </Link>
          <SaveSpaceButton
            spaceId={space.id}
            saved={saved}
            labels={{ save: t("app.saved.save"), saved: t("app.saved.saved") }}
          />
        </div>

        {sp.watch === "on" && (
          <div className="rounded-2xl border border-go-200 bg-go-50 px-4 py-3 font-semibold text-go-700">
            {t("app.saved.watchOn")}
          </div>
        )}

        {sp.soldout && (
          <div
            className="space-y-2 rounded-2xl border border-accent-200 bg-accent-50 px-4 py-3 text-accent-700"
            data-soldout-watch
          >
            <p className="font-semibold">{t("app.space.soldout")}</p>
            <form action={createAlertAction} className="flex flex-wrap items-center gap-2">
              <input type="hidden" name="spaceId" value={space.id} />
              {sp.from && <input type="hidden" name="from" value={sp.from} />}
              {sp.to && <input type="hidden" name="to" value={sp.to} />}
              <button
                type="submit"
                className="inline-flex items-center gap-1.5 rounded-full bg-navy-900 px-3.5 py-1.5 text-xs font-semibold text-white hover:bg-navy-700"
              >
                <BellRing className="h-3.5 w-3.5" /> {t("app.space.watchThis")}
              </button>
              <span className="text-xs">{t("app.space.watchHint")}</span>
            </form>
          </div>
        )}
        {sp.dates && (
          <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 font-semibold text-red-700">
            {t("app.space.datesInvalid")}
          </div>
        )}
        {sp.blocked && (
          <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 font-semibold text-red-700">
            {t("app.space.blocked")}
          </div>
        )}
        {space.requestToBook && (
          <div className="rounded-2xl border border-navy-200 bg-navy-50 px-4 py-3 text-sm font-semibold text-navy-700" data-rtb-note>
            {t("app.space.rtbNote")}
          </div>
        )}

        {/* Gallery — swipeable carousel on every screen size */}
        <PhotoCarousel
          tokens={photos}
          label={space.title}
          prevLabel={t("app.space.prevPhoto")}
          nextLabel={t("app.space.nextPhoto")}
        />

        {/* Host profile — shown to guests before booking (Airbnb-style) */}
        <Card className="flex items-start gap-4 p-5">
          <span
            className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full text-lg font-bold text-white"
            style={{ backgroundColor: hostUser?.avatarColor ?? "#F26A1B" }}
          >
            {initials(hostUser?.name ?? host?.displayName ?? "PG")}
          </span>
          <div className="flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-bold text-navy-900">
                {t("app.space.hostedBy")} {hostUser?.name ?? host?.displayName}
              </span>
              {host?.verificationStatus === "approved" && (
                <Badge tone="go">
                  <BadgeCheck className="h-3.5 w-3.5" /> {t("app.space.verifiedHost")}
                </Badge>
              )}
            </div>
            <p className="text-sm text-navy-500">
              {host?.displayName}
              {host ? ` · ${t("app.space.hostSince")} ${formatDate(host.joinedAt)}` : ""}
            </p>
            {host?.bio && <p className="mt-2 text-sm text-navy-600">{host.bio}</p>}
          </div>
        </Card>

        <div className="grid gap-6 lg:grid-cols-3">
          <div className="space-y-6 lg:col-span-2">
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-2xl font-extrabold text-navy-900">{space.title}</h2>
                {host?.verificationStatus === "approved" && (
                  <Badge tone="go">
                    <BadgeCheck className="h-3.5 w-3.5" /> {t("app.space.verifiedHost")}
                  </Badge>
                )}
              </div>
              <p className="mt-1 flex items-center gap-1.5 text-navy-500">
                <MapPin className="h-4 w-4" /> {space.approxArea} ·{" "}
                {airport?.name}
              </p>
              <div className="mt-2">
                <Stars rating={space.rating} count={space.reviewCount} size="md" />
              </div>
              <div className="mt-3 flex flex-wrap gap-2">
                <Badge tone="navy">
                  <Clock className="h-3 w-3" /> {space.driveMinutes}{" "}
                  {t(!airport?.kind || airport.kind === "airport" ? "app.space.minToTerminal" : "app.space.minAway")}
                </Badge>
                <Badge tone="navy">
                  <Car className="h-3 w-3" /> {space.capacity ?? 1} {t("app.space.carSpaces")}
                </Badge>
                {(space.cctv || space.liveCamera) && (
                  <Badge tone="go">
                    <ShieldCheck className="h-3 w-3" /> {t("app.space.cctvMonitored")}
                  </Badge>
                )}
                {space.evCharger && (
                  <Badge tone="brand">
                    <Zap className="h-3 w-3" /> {t("app.space.evCharging")}
                  </Badge>
                )}
                {space.covered && (
                  <Badge tone="navy">
                    <Umbrella className="h-3 w-3" /> {t("search.covered")}
                  </Badge>
                )}
                <Badge tone="accent">
                  <CarTaxiFront className="h-3 w-3" /> {t("app.space.transferAvailable")}
                </Badge>
              </div>
            </div>

            {/* Features */}
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              <Feature icon={Clock} label={`${space.driveMinutes} ${t("app.space.min")}`} sub={t("app.space.toTerminal")} />
              <Feature icon={Car} label={`${t("app.space.fits")} ${space.maxVehicleSize}`} sub={`${space.dimensions.lengthM}×${space.dimensions.widthM}m`} />
              <Feature
                icon={space.evCharger ? Zap : ShieldCheck}
                label={space.evCharger ? `${space.evCharger.kw}${t("app.space.evKw")}` : space.cctv ? t("app.space.cctv") : t("app.space.secure")}
                sub={space.evCharger ? space.evCharger.connector : t("app.space.monitored")}
              />
              <Feature icon={Camera} label={space.liveCamera ? t("app.space.liveCamera") : t("app.space.cctv")} sub={space.liveCamera ? t("app.space.inApp") : t("app.space.onSite")} />
            </div>

            <Card className="p-5">
              <h3 className="flex items-center gap-2 font-bold text-navy-900">
                <Ruler className="h-4 w-4 text-brand-700" /> {t("app.space.accessRules")}
              </h3>
              <p className="mt-2 text-sm text-navy-600">{space.accessRules}</p>
              <p className="mt-3 rounded-lg bg-navy-50 px-3 py-2 text-xs text-navy-500">
                <ShieldCheck className="mr-1 inline h-3.5 w-3.5" />
                {t("app.space.releasedNote")}
              </p>
            </Card>

            {/* Map */}
            <div>
              <h3 className="mb-2 font-bold text-navy-900">{t("app.space.location")}</h3>
              {MAPBOX ? (
                <MapboxMap
                  showDriver={false}
                  space={{ lat: space.lat, lng: space.lng, label: t("app.space.yourSpace") }}
                  terminal={{
                    lat: airport?.lat ?? space.lat,
                    lng: airport?.lng ?? space.lng,
                    label: airport?.name ?? t("app.space.terminal"),
                  }}
                  className="h-64"
                />
              ) : (
                <LiveMap
                  showDriver={false}
                  space={{ x: sPos.x * 100, y: sPos.y * 100, label: t("app.space.yourSpace") }}
                  terminal={{ x: aPos.x * 100, y: aPos.y * 100, label: airport?.name ?? t("app.space.terminal") }}
                  className="h-64"
                />
              )}
            </div>

            {/* Reviews */}
            <div>
              <h3 className="mb-3 font-bold text-navy-900">
                {t("app.space.reviews")} ({reviews.length})
              </h3>
              {reviews.length === 0 ? (
                <p className="text-sm text-navy-500">{t("app.space.noReviews")}</p>
              ) : (
                <div className="space-y-3">
                  {reviews.map((r) => {
                    const author = reviewAuthors.get(r.authorId);
                    return (
                      <Card key={r.id} className="p-4">
                        <div className="flex items-center justify-between">
                          <span className="font-semibold text-navy-900">
                            {author?.name ?? t("app.space.traveller")}
                          </span>
                          <Stars rating={r.rating} />
                        </div>
                        <p className="mt-1.5 text-sm text-navy-600">{r.comment}</p>
                        {(r.photos?.length ?? 0) > 0 && (
                          <div className="mt-2 flex flex-wrap gap-2" data-review-photos>
                            {r.photos!.slice(0, 3).map((url) => (
                              <a key={url} href={url} target="_blank" rel="noopener noreferrer">
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img
                                  src={url}
                                  alt={t("app.review.photoAlt")}
                                  className="h-20 w-20 rounded-lg object-cover ring-1 ring-navy-100"
                                  loading="lazy"
                                />
                              </a>
                            ))}
                          </div>
                        )}
                        <p className="mt-1 text-xs text-navy-400">{formatDate(r.createdAt)}</p>
                        {r.reply && (
                          <div className="mt-2 rounded-lg bg-navy-50 px-3 py-2">
                            <p className="text-xs font-bold text-navy-700">
                              {t("app.space.hostReply")}
                            </p>
                            <p className="text-sm text-navy-600">{r.reply}</p>
                          </div>
                        )}
                      </Card>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Booking rail */}
          <div>
            <div className="sticky top-20 rounded-2xl border border-navy-100 bg-white p-5 shadow-card">
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-extrabold text-navy-900">
                  {formatMoneyShort(priceTotal, currency)}
                </span>
                <span className="text-navy-500">
                  {t("common.total")} · {durationText}
                </span>
              </div>
              <div className="mt-1 flex items-center justify-between">
                <span className="text-sm text-navy-500">
                  {formatMoneyShort(space.pricePerDay, currency)} {t("common.perDay")}
                </span>
                <Stars rating={space.rating} count={space.reviewCount} />
              </div>

              {/* Transparent breakdown — same maths as checkout */}
              <dl className="mt-4 space-y-1.5 border-t border-navy-100 pt-3 text-sm">
                <div className="flex items-center justify-between text-navy-600">
                  <dt>
                    {hourly && space.pricePerHour && hours * space.pricePerHour < space.pricePerDay
                      ? `${formatMoneyShort(space.pricePerHour, currency)} × ${hours} ${
                          hours === 1 ? t("common.hour") : t("common.hours")
                        }`
                      : `${formatMoneyShort(space.pricePerDay, currency)} × ${nights} ${
                          nights === 1 ? t("common.day") : t("common.days")
                        }`}
                  </dt>
                  <dd className="font-semibold text-navy-800">
                    {formatMoneyShort(price.parking, currency)}
                  </dd>
                </div>
                {withTransfer && (
                  <div className="flex items-center justify-between text-navy-600">
                    <dt>{t("app.booking.licensedTransfer")}</dt>
                    <dd className="font-semibold text-navy-800">
                      {formatMoneyShort(price.transfer, currency)}
                    </dd>
                  </div>
                )}
                {withEv && (
                  <div className="flex items-center justify-between text-navy-600">
                    <dt>{t("app.booking.evCharging")}</dt>
                    <dd className="font-semibold text-navy-800">
                      {formatMoneyShort(price.ev, currency)}
                    </dd>
                  </div>
                )}
                <div className="flex items-center justify-between text-navy-600">
                  <dt>{t("app.booking.serviceFee")}</dt>
                  <dd className="font-semibold text-navy-800">
                    {formatMoneyShort(price.serviceFee, currency)}
                  </dd>
                </div>
              </dl>

              {space.status === "live" ? (
                <Link href={bookHref} className={buttonVariants({ size: "lg", className: "mt-4 w-full" })}>
                  {t("common.bookSpace")}
                </Link>
              ) : (
                <div className="mt-4 rounded-xl bg-navy-50 px-4 py-3 text-center text-sm font-semibold text-navy-500">
                  {t("app.space.notBookable")}
                </div>
              )}
              <ul className="mt-4 space-y-2 text-sm text-navy-600">
                <li className="flex items-center gap-2">
                  <BadgeCheck className="h-4 w-4 text-go-600" /> {t("app.space.freeCancellation")}
                </li>
                <li className="flex items-center gap-2">
                  <ShieldCheck className="h-4 w-4 text-go-600" /> {t("app.space.verifiedInsured")}
                </li>
                <li className="flex items-center gap-2">
                  <Camera className="h-4 w-4 text-go-600" /> {space.liveCamera ? t("app.space.liveCameraInApp") : t("app.space.cctvMonitoredShort")}
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile: sticky book bar so the price + CTA are always in reach */}
      {space.status === "live" && (
        <div className="fixed inset-x-0 bottom-0 z-40 border-t border-navy-100 bg-white/95 px-4 py-3 backdrop-blur lg:hidden">
          <div className="mx-auto flex max-w-5xl items-center justify-between gap-3">
            <div>
              <div className="text-lg font-extrabold leading-tight text-navy-900">
                {formatMoneyShort(priceTotal, currency)}
              </div>
              <div className="text-xs text-navy-500">
                {t("common.total")} · {durationText}
              </div>
            </div>
            <Link href={bookHref} className={buttonVariants({ size: "lg", className: "shrink-0" })}>
              {t("common.bookSpace")}
            </Link>
          </div>
        </div>
      )}
    </PortalShell>
  );
}

function Feature({
  icon: Icon,
  label,
  sub,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  sub: string;
}) {
  return (
    <div className="rounded-xl border border-navy-100 bg-white p-3 text-center">
      <Icon className="mx-auto h-5 w-5 text-brand-700" />
      <div className="mt-1 text-sm font-bold text-navy-900">{label}</div>
      <div className="text-xs text-navy-400">{sub}</div>
    </div>
  );
}
