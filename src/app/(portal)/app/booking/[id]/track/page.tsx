import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { Car, Phone, Star, Camera as CameraIcon, Zap } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { Stars } from "@/components/common/stars";
import { PortalShell } from "@/components/portal/shell";
import { StatusBadge } from "@/components/portal/status";
import { travellerNav } from "@/components/portal/navs";
import { LiveMap } from "@/components/portal/live-map";
import { MapboxMap } from "@/components/portal/mapbox-map";
import { CameraView } from "@/components/portal/camera-view";
import { HandoverPanel } from "@/components/portal/handover-panel";
import { ReviewForm } from "@/components/portal/review-form";
import { requireRole } from "@/lib/auth";
import {
  getAirport,
  getCamerasForSpace,
  getDriver,
  getTransfer,
  getTransferByBooking,
  getTransferProvider,
  getVehicle,
} from "@/lib/data/store";
import { getBookingById } from "@/lib/data/bookings";
import { getSpaceById } from "@/lib/data/hosts";

const MAPBOX = !!process.env.NEXT_PUBLIC_MAPBOX_TOKEN;
import { resolveStream } from "@/lib/services/camera";
import { getOperatorJob } from "@/lib/services/transfer-operator";
import { projectToViewport } from "@/lib/services/maps";
import { getI18n } from "@/lib/i18n";
import { pageMetadata } from "@/lib/seo";

/** Deterministic mock EV charge level for the demo. */
function evLevel(seed: string): number {
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) >>> 0;
  return 55 + (h % 41); // 55–95%
}

export const metadata: Metadata = pageMetadata({ title: "Live", path: "/app/booking", noindex: true });

export default async function TrackPage({ params }: { params: Promise<{ id: string }> }) {
  const user = await requireRole("traveller");
  const { t } = await getI18n();
  const { id } = await params;
  const booking = await getBookingById(id);
  if (!booking || booking.travellerId !== user.id) notFound();

  const space = await getSpaceById(booking.spaceId);
  if (!space) notFound();
  const airport = getAirport(space.airportSlug);
  const transfer = booking.transferId
    ? getTransfer(booking.transferId)
    : getTransferByBooking(booking.id);
  const driver = transfer?.driverId ? getDriver(transfer.driverId) : undefined;
  const vehicle = transfer?.vehicleId ? getVehicle(transfer.vehicleId) : undefined;
  const provider = transfer ? getTransferProvider(transfer.providerId) : undefined;
  const camera = getCamerasForSpace(space.id)[0];
  const stream = camera ? resolveStream(camera) : undefined;

  const project = projectToViewport([
    { lat: space.lat, lng: space.lng },
    { lat: airport?.lat ?? space.lat, lng: airport?.lng ?? space.lng },
  ]);
  const sPos = project({ lat: space.lat, lng: space.lng });
  const aPos = project({ lat: airport?.lat ?? space.lat, lng: airport?.lng ?? space.lng });

  const driverActive = !!transfer && transfer.status !== "completed";
  const opJob = transfer ? getOperatorJob(transfer.id) : undefined;
  const evPercent = booking.bundle.ev ? evLevel(booking.id) : null;

  return (
    <PortalShell user={user} nav={travellerNav} title="app.track.title">
      <div className="mx-auto max-w-5xl space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-mono text-lg font-bold text-navy-900">{booking.reference}</h2>
              <StatusBadge status={booking.status} />
            </div>
            <p className="text-sm text-navy-500">
              {space.title} · {airport?.name}
            </p>
          </div>
          <Link href={`/app/booking/${booking.id}`} className={buttonVariants({ variant: "outline", size: "sm" })}>
            {t("app.track.bookingQr")}
          </Link>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          {/* Live map + driver */}
          <div className="space-y-4">
            <div>
              <h3 className="mb-2 flex items-center gap-2 font-bold text-navy-900">
                <span className="relative flex h-2.5 w-2.5">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-go-500 opacity-75" />
                  <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-go-500" />
                </span>
                {t("app.track.liveLocation")}
              </h3>
              {MAPBOX ? (
                <MapboxMap
                  showDriver={driverActive}
                  space={{ lat: space.lat, lng: space.lng, label: t("app.track.yourCar") }}
                  terminal={{
                    lat: airport?.lat ?? space.lat,
                    lng: airport?.lng ?? space.lng,
                    label: airport?.name ?? t("app.track.terminal"),
                  }}
                  className="h-72"
                />
              ) : (
                <LiveMap
                  showDriver={driverActive}
                  space={{ x: sPos.x * 100, y: sPos.y * 100, label: t("app.track.yourCar") }}
                  terminal={{ x: aPos.x * 100, y: aPos.y * 100, label: airport?.name ?? t("app.track.terminal") }}
                  className="h-72"
                />
              )}
            </div>

            {transfer ? (
              <Card className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-50 text-brand-700">
                      <Car className="h-5 w-5" />
                    </div>
                    <div>
                      <div className="font-bold text-navy-900">
                        {driver?.name ?? t("app.track.driverAssigning")}
                      </div>
                      <div className="text-sm text-navy-500">
                        {t("app.track.licensedDriver")} · {provider?.companyName}
                        {vehicle ? ` · ${vehicle.colour} ${vehicle.make} ${vehicle.reg}` : ""}
                      </div>
                      {driverActive && opJob?.etaMinutes != null && (
                        <div className="mt-0.5 text-sm font-semibold text-go-600">
                          {opJob.etaMinutes} {t("app.track.minAway")}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    {driver && <Stars rating={driver.rating} />}
                    <div className="mt-1">
                      <StatusBadge status={transfer.status} />
                    </div>
                  </div>
                </div>
                <a
                  href="tel:+447700900789"
                  className={buttonVariants({ variant: "outline", size: "sm", className: "mt-3 w-full" })}
                >
                  <Phone className="h-4 w-4" /> {t("common.callDriver")}
                </a>
              </Card>
            ) : (
              <Card className="p-4 text-sm text-navy-500">
                {t("app.track.noTransfer")}
              </Card>
            )}
          </div>

          {/* Camera + handover */}
          <div className="space-y-4">
            <div>
              <h3 className="mb-2 flex items-center gap-2 font-bold text-navy-900">
                <CameraIcon className="h-4 w-4 text-brand-600" /> {t("app.track.liveCamera")}
              </h3>
              {space.liveCamera ? (
                <CameraView
                  label={stream?.label ?? space.title}
                  protocol={stream?.protocol ?? "hls"}
                  className="aspect-video"
                />
              ) : (
                <Card className="flex aspect-video items-center justify-center text-center text-sm text-navy-500">
                  {t("app.track.noLiveCamera")}
                </Card>
              )}
            </div>

            {evPercent !== null && (
              <Card className="flex items-center justify-between p-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-go-50 text-go-600">
                    <Zap className="h-5 w-5" />
                  </div>
                  <div>
                    <div className="font-bold text-navy-900">{t("app.track.evCharging")} · {evPercent}%</div>
                    <div className="text-sm text-navy-500">{t("app.track.toppingUp")}</div>
                  </div>
                </div>
                <div className="hidden w-28 sm:block">
                  <div className="h-2 w-full overflow-hidden rounded-full bg-navy-100">
                    <div className="h-full rounded-full bg-go-500" style={{ width: `${evPercent}%` }} />
                  </div>
                </div>
              </Card>
            )}

            {transfer && (
              <HandoverPanel
                transferId={transfer.id}
                bookingId={booking.id}
                expectedCode={transfer.handoverCode}
                initialConfirmedAt={transfer.handoverConfirmedAt}
              />
            )}
          </div>
        </div>

        {/* Review after the trip */}
        {booking.status === "completed" && (
          <div className="mx-auto max-w-xl">
            <ReviewForm bookingId={booking.id} />
          </div>
        )}
        {booking.status === "reviewed" && (
          <div className="mx-auto flex max-w-xl items-center gap-2 rounded-2xl border border-go-200 bg-go-50 p-5 font-semibold text-go-700">
            <Star className="h-5 w-5 fill-current" /> {t("app.track.reviewedThanks")}
          </div>
        )}
      </div>
    </PortalShell>
  );
}
