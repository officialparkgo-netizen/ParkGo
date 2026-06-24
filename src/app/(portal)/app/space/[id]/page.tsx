import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import {
  BadgeCheck,
  Camera,
  Car,
  Clock,
  MapPin,
  Ruler,
  ShieldCheck,
  Zap,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { Photo } from "@/components/common/photo";
import { Stars } from "@/components/common/stars";
import { PortalShell } from "@/components/portal/shell";
import { travellerNav } from "@/components/portal/navs";
import { LiveMap } from "@/components/portal/live-map";
import { requireRole } from "@/lib/auth";
import { getAirport, getHost, getReviewsForSpace, getSpace, getUser } from "@/lib/data/store";
import { projectToViewport } from "@/lib/services/maps";
import { formatDate, formatMoneyShort } from "@/lib/utils";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({ title: "Space", path: "/app/space", noindex: true });

export default async function SpaceDetail({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ from?: string; to?: string; ev?: string; transfer?: string }>;
}) {
  const user = await requireRole("traveller");
  const { id } = await params;
  const sp = await searchParams;
  const space = getSpace(id);
  if (!space) notFound();

  const airport = getAirport(space.airportSlug);
  const host = getHost(space.hostId);
  const reviews = getReviewsForSpace(space.id);
  const currency = airport?.country === "IE" ? "EUR" : "GBP";

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

  return (
    <PortalShell user={user} nav={travellerNav} title={space.title}>
      <div className="mx-auto max-w-5xl space-y-6">
        <Link href="/app/search" className="text-sm font-semibold text-brand-600">
          ← Back to results
        </Link>

        {/* Gallery */}
        <div className="grid gap-3 sm:grid-cols-3">
          <Photo token={space.photos[0] ?? "drive-1"} className="h-64 sm:col-span-2 sm:h-80" />
          <div className="grid gap-3">
            <Photo token={space.photos[1] ?? "yard-1"} className="h-[7.75rem] sm:h-[9.5rem]" />
            <Photo token={space.photos[2] ?? "ev-1"} className="h-[7.75rem] sm:h-[9.5rem]" />
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          <div className="space-y-6 lg:col-span-2">
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-2xl font-extrabold text-navy-900">{space.title}</h2>
                {host?.verificationStatus === "approved" && (
                  <Badge tone="go">
                    <BadgeCheck className="h-3.5 w-3.5" /> Verified host
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
            </div>

            {/* Features */}
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              <Feature icon={Clock} label={`${space.driveMinutes} min`} sub="to terminal" />
              <Feature icon={Car} label={`Fits ${space.maxVehicleSize}`} sub={`${space.dimensions.lengthM}×${space.dimensions.widthM}m`} />
              <Feature
                icon={space.evCharger ? Zap : ShieldCheck}
                label={space.evCharger ? `${space.evCharger.kw}kW EV` : space.cctv ? "CCTV" : "Secure"}
                sub={space.evCharger ? space.evCharger.connector : "monitored"}
              />
              <Feature icon={Camera} label={space.liveCamera ? "Live camera" : "CCTV"} sub={space.liveCamera ? "in-app" : "on site"} />
            </div>

            <Card className="p-5">
              <h3 className="flex items-center gap-2 font-bold text-navy-900">
                <Ruler className="h-4 w-4 text-brand-600" /> Access &amp; rules
              </h3>
              <p className="mt-2 text-sm text-navy-600">{space.accessRules}</p>
              <p className="mt-3 rounded-lg bg-navy-50 px-3 py-2 text-xs text-navy-500">
                <ShieldCheck className="mr-1 inline h-3.5 w-3.5" />
                The exact address and host contact are shared only after payment.
              </p>
            </Card>

            {/* Map */}
            <div>
              <h3 className="mb-2 font-bold text-navy-900">Location</h3>
              <LiveMap
                showDriver={false}
                space={{ x: sPos.x * 100, y: sPos.y * 100, label: "Your space" }}
                terminal={{ x: aPos.x * 100, y: aPos.y * 100, label: airport?.name ?? "Terminal" }}
                className="h-64"
              />
            </div>

            {/* Reviews */}
            <div>
              <h3 className="mb-3 font-bold text-navy-900">
                Reviews ({reviews.length})
              </h3>
              {reviews.length === 0 ? (
                <p className="text-sm text-navy-500">No reviews yet — be the first.</p>
              ) : (
                <div className="space-y-3">
                  {reviews.map((r) => {
                    const author = getUser(r.authorId);
                    return (
                      <Card key={r.id} className="p-4">
                        <div className="flex items-center justify-between">
                          <span className="font-semibold text-navy-900">
                            {author?.name ?? "Traveller"}
                          </span>
                          <Stars rating={r.rating} />
                        </div>
                        <p className="mt-1.5 text-sm text-navy-600">{r.comment}</p>
                        <p className="mt-1 text-xs text-navy-400">{formatDate(r.createdAt)}</p>
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
              <div className="flex items-baseline gap-1">
                <span className="text-3xl font-extrabold text-navy-900">
                  {formatMoneyShort(space.pricePerDay, currency)}
                </span>
                <span className="text-navy-500">/ day</span>
              </div>
              <p className="mt-1 text-sm text-navy-500">
                Add a licensed transfer &amp; EV charging at checkout.
              </p>
              <Link href={bookHref} className={buttonVariants({ size: "lg", className: "mt-4 w-full" })}>
                Build your bundle
              </Link>
              <ul className="mt-4 space-y-2 text-sm text-navy-600">
                <li className="flex items-center gap-2">
                  <BadgeCheck className="h-4 w-4 text-go-500" /> Free cancellation window
                </li>
                <li className="flex items-center gap-2">
                  <ShieldCheck className="h-4 w-4 text-go-500" /> Verified &amp; insured host
                </li>
                <li className="flex items-center gap-2">
                  <Camera className="h-4 w-4 text-go-500" /> {space.liveCamera ? "Live camera in-app" : "CCTV monitored"}
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
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
      <Icon className="mx-auto h-5 w-5 text-brand-600" />
      <div className="mt-1 text-sm font-bold text-navy-900">{label}</div>
      <div className="text-xs text-navy-400">{sub}</div>
    </div>
  );
}
