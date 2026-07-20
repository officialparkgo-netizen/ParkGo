"use client";

import Link from "next/link";
import { BadgeCheck, Camera, Car, Clock, MapPin, ShieldCheck, Umbrella, Zap } from "lucide-react";
import type { SearchResult } from "@/types";
import { Badge } from "@/components/ui/badge";
import { Stars } from "@/components/common/stars";
import { Photo } from "@/components/common/photo";
import { buttonVariants } from "@/components/ui/button";
import { formatMoneyShort } from "@/lib/utils";
import { useT } from "@/lib/i18n/client";

export function SpaceCard({ result, href }: { result: SearchResult; href?: string }) {
  const t = useT();
  const { space, airport, estimatedTotal } = result;
  const spaceHref = href ?? `/app/space/${space.id}`;
  const currency = airport.country === "IE" ? "EUR" : "GBP";
  return (
    <div className="card-hover flex flex-col overflow-hidden rounded-2xl border border-navy-100 bg-white shadow-card sm:flex-row">
      <Link href={spaceHref} className="relative block sm:w-56">
        <Photo token={space.photos[0] ?? "drive-1"} rounded="rounded-none" className="h-44 w-full sm:h-full" />
        <div className="absolute left-2 top-2 flex flex-wrap gap-1">
          {space.liveCamera && (
            <Badge tone="go" className="bg-white/90">
              <Camera className="h-3 w-3" /> {t("app.card.liveCam")}
            </Badge>
          )}
          {!space.liveCamera && space.cctv && (
            <Badge tone="go" className="bg-white/90">
              <ShieldCheck className="h-3 w-3" /> {t("search.cctv")}
            </Badge>
          )}
          {space.evCharger && (
            <Badge tone="brand" className="bg-white/90">
              <Zap className="h-3 w-3" /> {t("app.ev")}
            </Badge>
          )}
        </div>
      </Link>

      <div className="flex flex-1 flex-col p-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <Link href={spaceHref}>
              <h3 className="font-bold text-navy-900 hover:text-brand-700">{space.title}</h3>
            </Link>
            <p className="mt-0.5 flex items-center gap-1 text-sm text-navy-500">
              <MapPin className="h-3.5 w-3.5" /> {space.approxArea}
            </p>
          </div>
          <Stars rating={space.rating} count={space.reviewCount} />
        </div>

        <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-xs font-medium text-navy-500">
          <span className="inline-flex items-center gap-1">
            <Clock className="h-3.5 w-3.5" /> {space.driveMinutes}{" "}
            {t(!airport.kind || airport.kind === "airport" ? "app.card.minToTerminal" : "app.space.minAway")}
          </span>
          <span className="inline-flex items-center gap-1">
            <Car className="h-3.5 w-3.5" /> {t("app.card.fits")} {space.maxVehicleSize}
          </span>
          {(space.capacity ?? 1) > 1 && (
            <span className="inline-flex items-center gap-1">
              <Car className="h-3.5 w-3.5" /> {space.capacity} {t("app.space.carSpaces")}
            </span>
          )}
          {space.cctv && (
            <span className="inline-flex items-center gap-1">
              <ShieldCheck className="h-3.5 w-3.5" /> {t("search.cctv")}
            </span>
          )}
          {space.covered && (
            <span className="inline-flex items-center gap-1">
              <Umbrella className="h-3.5 w-3.5" /> {t("search.covered")}
            </span>
          )}
        </div>

        <div className="mt-auto flex items-end justify-between pt-4">
          <div>
            <div className="text-xs text-navy-400">
              {formatMoneyShort(space.pricePerDay, currency)} {t("app.card.perDayBundle")}
            </div>
            <div className="text-xl font-extrabold text-navy-900">
              {formatMoneyShort(estimatedTotal, currency)}
            </div>
            <div className="mt-0.5 flex items-center gap-1 text-xs font-medium text-go-600">
              <BadgeCheck className="h-3.5 w-3.5" /> {t("app.space.freeCancellation")}
            </div>
          </div>
          <Link href={spaceHref} className={buttonVariants({ size: "sm" })}>
            {t("common.viewBook")}
          </Link>
        </div>
      </div>
    </div>
  );
}
