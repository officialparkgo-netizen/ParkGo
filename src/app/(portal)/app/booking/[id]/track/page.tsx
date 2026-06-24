import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { Car, Phone, Star, Camera as CameraIcon } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { Stars } from "@/components/common/stars";
import { PortalShell } from "@/components/portal/shell";
import { StatusBadge } from "@/components/portal/status";
import { travellerNav } from "@/components/portal/navs";
import { LiveMap } from "@/components/portal/live-map";
import { CameraView } from "@/components/portal/camera-view";
import { HandoverPanel } from "@/components/portal/handover-panel";
import { ReviewForm } from "@/components/portal/review-form";
import { requireRole } from "@/lib/auth";
import {
  getAirport,
  getBooking,
  getCamerasForSpace,
  getDriver,
  getSpace,
  getTransfer,
  getTransferByBooking,
  getTransferProvider,
  getVehicle,
} from "@/lib/data/store";
import { resolveStream } from "@/lib/services/camera";
import { projectToViewport } from "@/lib/services/maps";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({ title: "Live", path: "/app/booking", noindex: true });

export default async function TrackPage({ params }: { params: Promise<{ id: string }> }) {
  const user = await requireRole("traveller");
  const { id } = await params;
  const booking = getBooking(id);
  if (!booking || booking.travellerId !== user.id) notFound();

  const space = getSpace(booking.spaceId)!;
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

  return (
    <PortalShell user={user} nav={travellerNav} title="Live travel day">
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
            Booking &amp; QR
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
                Live location
              </h3>
              <LiveMap
                showDriver={driverActive}
                space={{ x: sPos.x * 100, y: sPos.y * 100, label: "Your car" }}
                terminal={{ x: aPos.x * 100, y: aPos.y * 100, label: airport?.name ?? "Terminal" }}
                className="h-72"
              />
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
                        {driver?.name ?? "Driver assigning…"}
                      </div>
                      <div className="text-sm text-navy-500">
                        {provider?.companyName}
                        {vehicle ? ` · ${vehicle.colour} ${vehicle.make} ${vehicle.model} · ${vehicle.reg}` : ""}
                      </div>
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
                  <Phone className="h-4 w-4" /> Call driver
                </a>
              </Card>
            ) : (
              <Card className="p-4 text-sm text-navy-500">
                No transfer on this booking. Add one next time at checkout for
                door-to-terminal pickup.
              </Card>
            )}
          </div>

          {/* Camera + handover */}
          <div className="space-y-4">
            <div>
              <h3 className="mb-2 flex items-center gap-2 font-bold text-navy-900">
                <CameraIcon className="h-4 w-4 text-brand-600" /> Live camera
              </h3>
              {space.liveCamera && stream ? (
                <CameraView label={stream.label} protocol={stream.protocol} className="aspect-video" />
              ) : (
                <Card className="flex aspect-video items-center justify-center text-center text-sm text-navy-500">
                  This space has CCTV but no in-app live camera.
                </Card>
              )}
            </div>

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
            <Star className="h-5 w-5 fill-current" /> Thanks — you&apos;ve reviewed this trip.
          </div>
        )}
      </div>
    </PortalShell>
  );
}
