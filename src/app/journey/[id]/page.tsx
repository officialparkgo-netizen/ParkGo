import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { CarTaxiFront, CheckCircle2, Clock, MapPin, Plane, ShieldCheck } from "lucide-react";
import { resolvePassAccess } from "@/lib/booking-access";
import { getAirport } from "@/lib/data/store";
import { formatDateTime } from "@/lib/utils";
import { getI18n } from "@/lib/i18n";

export const metadata: Metadata = {
  title: "Journey · ParkGo",
  // A live location, shared with named people. Never indexed.
  robots: { index: false, follow: false },
};

/**
 * A journey shared with someone who is not travelling.
 *
 * Deliberately thinner than the entry pass: this is for the person at home
 * who wants to know the car got there and the flight is on time. It carries
 * no gate code, no address and no QR — the same signed link cannot be turned
 * into a way in. Everything on it is the sort of thing you would say on the
 * phone anyway.
 */
export default async function JourneyPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ t?: string }>;
}) {
  const { id } = await params;
  const { t: token } = await searchParams;
  // Same guard as the pass, so a link that has expired stops working here too.
  const access = await resolvePassAccess(id, token);
  if (!access) notFound();

  const { booking, space } = access;
  const { t } = await getI18n();
  const airport = getAirport(space.airportSlug);

  const now = Date.now();
  const started = new Date(booking.startAt).getTime() <= now;
  const ended = new Date(booking.endAt).getTime() <= now;
  const steps = [
    { done: true, label: t("journey.booked") },
    { done: started || booking.status === "active", label: t("journey.dropped") },
    { done: booking.bundle.transfer ? started : false, label: t("journey.transfer") },
    { done: ended || booking.status === "completed", label: t("journey.back") },
  ];

  return (
    <main className="min-h-dvh bg-navy-50/40 px-4 py-10">
      <div className="mx-auto max-w-md space-y-5">
        <div className="text-center">
          <span className="text-xl font-extrabold tracking-tight text-navy-900">
            Park<span className="text-brand-700">Go</span>
          </span>
        </div>

        <div className="rounded-2xl border border-navy-100 bg-white p-6 shadow-card">
          <h1 className="text-lg font-bold text-navy-900">{t("journey.title")}</h1>
          <p className="mt-1 flex items-center gap-1.5 text-sm text-navy-500">
            <MapPin className="h-4 w-4 shrink-0 text-navy-400" />
            {/* The area, never the exact address — that is released to the
                traveller only, and only after payment. */}
            {space.approxArea} · {airport?.name ?? space.airportSlug}
          </p>

          <ol className="mt-5 space-y-3">
            {steps.map((s) => (
              <li key={s.label} className="flex items-center gap-3">
                <span
                  className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full ${
                    s.done ? "bg-go-500 text-navy-900" : "bg-navy-100 text-navy-400"
                  }`}
                >
                  {s.done ? <CheckCircle2 className="h-4 w-4" /> : <Clock className="h-4 w-4" />}
                </span>
                <span
                  className={`text-sm font-semibold ${s.done ? "text-navy-900" : "text-navy-400"}`}
                >
                  {s.label}
                </span>
              </li>
            ))}
          </ol>

          <dl className="mt-5 space-y-2 border-t border-navy-100 pt-4 text-sm">
            <div className="flex items-center justify-between">
              <dt className="text-navy-500">{t("app.booking.dropOff")}</dt>
              <dd className="font-semibold text-navy-800">{formatDateTime(booking.startAt)}</dd>
            </div>
            <div className="flex items-center justify-between">
              <dt className="text-navy-500">{t("app.booking.pickUp")}</dt>
              <dd className="font-semibold text-navy-800">{formatDateTime(booking.endAt)}</dd>
            </div>
            {booking.flight && (
              <div className="flex items-center justify-between">
                <dt className="flex items-center gap-1.5 text-navy-500">
                  <Plane className="h-3.5 w-3.5" /> {booking.flight.number}
                </dt>
                <dd className="font-semibold text-navy-800">
                  {t(
                    booking.flight.status === "delayed"
                      ? "guest.flightcard.delayed"
                      : booking.flight.status === "landed"
                        ? "guest.flightcard.landed"
                        : booking.flight.status === "cancelled"
                          ? "guest.flightcard.cancelled"
                          : "guest.flightcard.onTime"
                  )}
                </dd>
              </div>
            )}
            {booking.bundle.transfer && (
              <div className="flex items-center justify-between">
                <dt className="flex items-center gap-1.5 text-navy-500">
                  <CarTaxiFront className="h-3.5 w-3.5" /> {t("app.booking.licensedTransfer")}
                </dt>
                <dd className="font-semibold text-navy-800">
                  {booking.bundle.transferTime ?? "—"}
                </dd>
              </div>
            )}
          </dl>
        </div>

        <p className="flex items-center justify-center gap-1.5 text-center text-xs text-navy-400">
          <ShieldCheck className="h-3.5 w-3.5 shrink-0" /> {t("journey.privacy")}
        </p>
      </div>
    </main>
  );
}
