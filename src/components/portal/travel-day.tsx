"use client";

import { useActionState } from "react";
import Image from "next/image";
import { Camera, Check, Plane, RefreshCw, Smartphone, Timer } from "lucide-react";
import type { ConditionPhoto, FlightLink } from "@/types";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  addConditionPhotoAction,
  checkFlightAction,
  pingArrivingAction,
  type TravelDayState,
} from "@/lib/travel-day-actions";
import { useT } from "@/lib/i18n/client";

/**
 * The three things that only matter on the day itself: telling the host you're
 * close, photographing the car, and knowing what the flight is doing.
 */

const ETA_CHOICES = [5, 10, 20, 30, 45] as const;

export function ArrivingPing({
  bookingId,
  etaMin,
  pingedAt,
}: {
  bookingId: string;
  etaMin?: number;
  pingedAt?: string;
}) {
  const t = useT();
  const [state, action, pending] = useActionState<TravelDayState, FormData>(
    pingArrivingAction,
    {}
  );
  const sent = state.etaMin ?? (pingedAt ? etaMin : undefined);

  return (
    <Card className="p-5" data-arriving>
      <h3 className="flex items-center gap-2 font-bold text-navy-900">
        <Timer className="h-5 w-5 text-brand-700" /> {t("guest.arriving.title")}
      </h3>
      <p className="mt-1 text-sm text-navy-500">{t("guest.arriving.sub")}</p>

      {sent ? (
        <p
          className="mt-3 flex items-center gap-2 rounded-xl bg-go-50 px-3 py-2.5 text-sm font-semibold text-go-700"
          data-arriving-sent
        >
          <Check className="h-4 w-4 shrink-0" /> {t("guest.arriving.sent")} {sent}{" "}
          {t("guest.arriving.away")}
        </p>
      ) : (
        <div className="mt-3 flex flex-wrap gap-2">
          {ETA_CHOICES.map((m) => (
            <form key={m} action={action}>
              <input type="hidden" name="bookingId" value={bookingId} />
              <input type="hidden" name="etaMin" value={m} />
              <Button type="submit" variant="outline" size="sm" disabled={pending}>
                {m} {t("guest.arriving.min")}
              </Button>
            </form>
          ))}
        </div>
      )}
      {state.error && (
        <p className="mt-2 text-xs font-semibold text-red-600">{state.error}</p>
      )}
    </Card>
  );
}

export function ConditionPhotos({
  bookingId,
  photos,
  max,
}: {
  bookingId: string;
  photos: ConditionPhoto[];
  max: number;
}) {
  const t = useT();
  const [state, action, pending] = useActionState<TravelDayState, FormData>(
    addConditionPhotoAction,
    {}
  );

  return (
    <Card className="p-5" data-condition-photos>
      <h3 className="flex items-center gap-2 font-bold text-navy-900">
        <Camera className="h-5 w-5 text-brand-700" /> {t("guest.photos.title")}
      </h3>
      <p className="mt-1 text-sm text-navy-500">{t("guest.photos.sub")}</p>

      {(["dropoff", "pickup"] as const).map((phase) => {
        const mine = photos.filter((p) => p.phase === phase);
        return (
          <div key={phase} className="mt-4">
            <div className="flex items-center gap-2">
              <h4 className="text-sm font-bold text-navy-700">
                {t(phase === "dropoff" ? "guest.photos.dropoff" : "guest.photos.pickup")}
              </h4>
              <Badge tone="neutral">
                {mine.length}/{max}
              </Badge>
            </div>

            {mine.length > 0 ? (
              <ul className="mt-2 grid grid-cols-3 gap-2 sm:grid-cols-6">
                {mine.map((p) => (
                  <li key={p.id} className="relative aspect-square overflow-hidden rounded-lg border border-navy-100">
                    <Image
                      src={p.url}
                      alt={`${phase} condition photo`}
                      fill
                      sizes="(min-width: 640px) 96px, 30vw"
                      className="object-cover"
                    />
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mt-1 text-xs text-navy-400">{t("guest.photos.none")}</p>
            )}

            {mine.length < max && (
              <form action={action} className="mt-2 flex items-center gap-2">
                <input type="hidden" name="bookingId" value={bookingId} />
                <input type="hidden" name="phase" value={phase} />
                <input
                  type="file"
                  name="photo"
                  accept="image/*"
                  // On a phone this opens the camera straight away, which is
                  // where these photos are actually taken.
                  capture="environment"
                  required
                  aria-label={t("guest.photos.add")}
                  className="min-w-0 flex-1 text-xs text-navy-600 file:mr-2 file:rounded-lg file:border-0 file:bg-navy-100 file:px-2.5 file:py-1.5 file:text-xs file:font-bold file:text-navy-800"
                />
                <Button type="submit" variant="outline" size="sm" disabled={pending}>
                  {t("guest.photos.add")}
                </Button>
              </form>
            )}
          </div>
        );
      })}

      {state.error && <p className="mt-2 text-xs font-semibold text-red-600">{state.error}</p>}
    </Card>
  );
}

const FLIGHT_TONE: Record<FlightLink["status"], { key: string; className: string }> = {
  scheduled: { key: "guest.flightcard.onTime", className: "bg-go-50 text-go-700" },
  delayed: { key: "guest.flightcard.delayed", className: "bg-accent-50 text-accent-700" },
  landed: { key: "guest.flightcard.landed", className: "bg-navy-100 text-navy-700" },
  cancelled: { key: "guest.flightcard.cancelled", className: "bg-red-50 text-red-700" },
  unknown: { key: "guest.flightcard.watching", className: "bg-navy-50 text-navy-600" },
};

export function FlightCard({
  bookingId,
  flight,
  tracking,
}: {
  bookingId: string;
  flight: FlightLink;
  /** False when no provider key is set: the number is stored but not watched. */
  tracking: boolean;
}) {
  const t = useT();
  const [state, action, pending] = useActionState<TravelDayState, FormData>(
    checkFlightAction,
    {}
  );
  const status = (state.flight?.status as FlightLink["status"]) ?? flight.status;
  const tone = FLIGHT_TONE[status] ?? FLIGHT_TONE.unknown;

  return (
    <Card className="p-5" data-flight-card>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h3 className="flex items-center gap-2 font-bold text-navy-900">
          <Plane className="h-5 w-5 text-brand-700" /> {t("guest.flightcard.title")}{" "}
          <span className="font-mono">{flight.number}</span>
        </h3>
        <span className={`rounded-full px-2.5 py-1 text-[11px] font-bold ${tone.className}`}>
          {status === "unknown" ? t("guest.flightcard.watching") : t(tone.key)}
        </span>
      </div>

      <p className="mt-2 text-sm text-navy-600">
        {flight.extendedAt
          ? t("guest.flightcard.extended")
          : tracking
            ? t("guest.flightcard.watching")
            : t("guest.flight.note")}
      </p>

      {tracking && (
        <form action={action} className="mt-3">
          <input type="hidden" name="bookingId" value={bookingId} />
          <Button type="submit" variant="outline" size="sm" disabled={pending}>
            <RefreshCw className={`h-4 w-4 ${pending ? "animate-spin" : ""}`} /> {flight.number}
          </Button>
        </form>
      )}
      {state.error && <p className="mt-2 text-xs font-semibold text-red-600">{state.error}</p>}
    </Card>
  );
}

/**
 * Wallet buttons. Google is a signed link; Apple needs a certificate, so its
 * button only appears once one exists rather than failing when tapped.
 */
export function WalletButtons({
  bookingId,
  available,
}: {
  bookingId: string;
  available: { google: boolean; apple: boolean };
}) {
  const t = useT();
  if (!available.google && !available.apple) return null;

  return (
    <div className="w-full space-y-2 border-t border-navy-100 pt-4" data-wallet>
      <p className="flex items-center justify-center gap-1.5 text-xs font-bold text-navy-600">
        <Smartphone className="h-3.5 w-3.5" /> {t("guest.wallet.title")}
      </p>
      {available.google && (
        <a
          href={`/api/booking/${bookingId}/wallet?p=google`}
          className="flex h-9 w-full items-center justify-center gap-2 rounded-xl bg-navy-900 px-3 text-sm font-semibold text-white hover:bg-navy-800"
        >
          {t("guest.wallet.google")}
        </a>
      )}
      {available.apple && (
        <a
          href={`/api/booking/${bookingId}/wallet?p=apple`}
          className="flex h-9 w-full items-center justify-center gap-2 rounded-xl bg-navy-900 px-3 text-sm font-semibold text-white hover:bg-navy-800"
        >
          {t("guest.wallet.apple")}
        </a>
      )}
      <p className="text-center text-[11px] leading-snug text-navy-400">
        {t("guest.wallet.sub")}
      </p>
    </div>
  );
}
