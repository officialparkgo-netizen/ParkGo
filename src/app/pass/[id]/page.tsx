import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { CalendarPlus, Car, Clock, KeyRound, MapPin, Navigation } from "lucide-react";
import { QrCode } from "@/components/portal/qr";
import { OfflinePass } from "@/components/portal/offline-pass";
import { resolvePassAccess } from "@/lib/booking-access";
import { getAirport } from "@/lib/data/store";
import { formatDateTime } from "@/lib/utils";
import { getI18n } from "@/lib/i18n";

export const metadata: Metadata = {
  title: "Entry pass · ParkGo",
  // A pass carries a gate code — it must never reach a search index.
  robots: { index: false, follow: false },
};

/**
 * The entry pass, on its own.
 *
 * Deliberately outside the portal: the person at the barrier is often not the
 * person who paid, and may have no account. A signed share link gets them in
 * here and nowhere else — no trips list, no payment details, no cancel button.
 *
 * Everything on the page is inline (the QR is a data URL), so once it has been
 * opened it keeps working in an underground car park with no signal.
 */
export default async function PassPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ t?: string }>;
}) {
  const { id } = await params;
  const { t: token } = await searchParams;
  const access = await resolvePassAccess(id, token);
  if (!access) notFound();

  const { booking, space, via } = access;
  const { t } = await getI18n();
  const airport = getAirport(space.airportSlug);
  const icsHref = `/api/booking/${booking.id}/ics${token ? `?t=${encodeURIComponent(token)}` : ""}`;

  return (
    <main className="mx-auto flex min-h-dvh max-w-md flex-col gap-4 p-4">
      <header className="flex items-center justify-between">
        <span className="text-lg font-extrabold tracking-tight text-navy-900">
          Park<span className="text-brand-600">Go</span>
        </span>
        <OfflinePass
          labels={{
            saving: t("pass.saving"),
            ready: t("pass.ready"),
            offline: t("pass.offline"),
          }}
        />
      </header>

      {/* The QR and the code — the only two things that matter at a barrier. */}
      <section className="rounded-2xl border border-navy-100 bg-white p-5 text-center shadow-card">
        <p className="text-xs font-bold uppercase tracking-wide text-navy-400">
          {t("pass.title")}
        </p>
        <p className="mt-1 text-2xl font-extrabold text-navy-900" data-pass-ref>
          {booking.reference}
        </p>
        <div className="mt-4 flex justify-center">
          <QrCode value={booking.qrToken} size={220} />
        </div>
        <p className="mt-4 inline-flex items-center gap-1.5 rounded-xl bg-navy-50 px-3 py-2 text-sm font-semibold text-navy-800">
          <KeyRound className="h-4 w-4 text-navy-400" aria-hidden /> {space.accessRules}
        </p>
      </section>

      <section className="space-y-3 rounded-2xl border border-navy-100 bg-white p-5 shadow-card">
        <h1 className="text-base font-bold text-navy-900">{space.title}</h1>
        <p className="flex items-start gap-2 text-sm text-navy-600">
          <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-navy-400" aria-hidden />
          {space.exactAddress || space.approxArea}
        </p>
        <p className="flex items-start gap-2 text-sm text-navy-600">
          <Clock className="mt-0.5 h-4 w-4 shrink-0 text-navy-400" aria-hidden />
          {formatDateTime(booking.startAt)} → {formatDateTime(booking.endAt)}
        </p>
        {airport && (
          <p className="flex items-start gap-2 text-sm text-navy-600">
            <Car className="mt-0.5 h-4 w-4 shrink-0 text-navy-400" aria-hidden />
            {space.driveMinutes} {t("app.card.minToTerminal")} · {airport.name}
          </p>
        )}

        <div className="flex flex-wrap gap-2 pt-1">
          <a
            href={`https://www.google.com/maps/dir/?api=1&destination=${space.lat},${space.lng}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 rounded-xl bg-navy-900 px-3.5 py-2 text-sm font-semibold text-white hover:bg-navy-700"
          >
            <Navigation className="h-4 w-4" aria-hidden /> {t("pass.directions")}
          </a>
          <a
            href={icsHref}
            data-pass-ics
            className="inline-flex items-center gap-1.5 rounded-xl border border-navy-200 bg-white px-3.5 py-2 text-sm font-semibold text-navy-700 hover:bg-navy-50"
          >
            <CalendarPlus className="h-4 w-4" aria-hidden /> {t("pass.addCalendar")}
          </a>
        </div>
      </section>

      {via === "owner" ? (
        <Link
          href={`/app/booking/${booking.id}`}
          className="text-center text-sm font-semibold text-brand-600"
        >
          {t("pass.fullBooking")} →
        </Link>
      ) : (
        <p className="text-center text-xs text-navy-400" data-pass-shared>
          {t("pass.sharedNote")}
        </p>
      )}
    </main>
  );
}
