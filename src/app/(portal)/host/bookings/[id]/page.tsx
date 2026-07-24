import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import {
  CalendarCheck,
  Car,
  CheckCircle2,
  LogIn,
  LogOut,
  MapPin,
  Phone,
  XCircle,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Avatar } from "@/components/common/avatar";
import { PortalShell } from "@/components/portal/shell";
import { StatusBadge } from "@/components/portal/status";
import { BookingThread } from "@/components/portal/booking-thread";
import { hostNav } from "@/components/portal/navs";
import { requireRole } from "@/lib/auth";
import { getHostForUser, getSpaceById } from "@/lib/data/hosts";
import { getBookingById } from "@/lib/data/bookings";
import { getUserProfile } from "@/lib/data/users";
import { hostCheckInAction, hostCheckOutAction } from "@/lib/host-suite-actions";
import { formatDateTime, formatMoney } from "@/lib/utils";
import { getI18n } from "@/lib/i18n";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Booking",
  path: "/host/bookings",
  noindex: true,
});

/** Host's view of one booking: guest, vehicle, times, check-in/out, messages. */
export default async function HostBookingDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ mark?: string; sent?: string }>;
}) {
  const user = await requireRole("host");
  const { t } = await getI18n();
  const { id } = await params;
  const { mark } = await searchParams;

  const host = await getHostForUser(user);
  if (!host) notFound();
  const booking = await getBookingById(id);
  if (!booking) notFound();
  const space = await getSpaceById(booking.spaceId);
  // Ownership guard — hosts see only bookings on their own spaces (admins too).
  if (!space || (space.hostId !== host.id && user.role !== "admin")) notFound();

  const traveller = await getUserProfile(booking.travellerId);
  const vehicle = traveller?.vehicle;

  return (
    <PortalShell user={user} nav={hostNav} title={`${t("host.bkd.title")} ${booking.reference}`}>
      <div className="mx-auto max-w-3xl space-y-5">
        <Link href="/host/today" className="text-sm font-semibold text-brand-600">
          ← {t("host.today.title")}
        </Link>

        {mark === "in" && (
          <div className="flex items-center gap-2 rounded-2xl border border-go-200 bg-go-50 px-4 py-3 font-semibold text-go-700">
            <CheckCircle2 className="h-5 w-5" /> {t("host.bkd.checkedIn")}
          </div>
        )}
        {mark === "out" && (
          <div className="flex items-center gap-2 rounded-2xl border border-go-200 bg-go-50 px-4 py-3 font-semibold text-go-700">
            <CheckCircle2 className="h-5 w-5" /> {t("host.bkd.checkedOut")}
          </div>
        )}
        {mark === "error" && (
          <div className="flex items-center gap-2 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 font-semibold text-red-700">
            <XCircle className="h-5 w-5" /> {t("host.bkd.markError")}
          </div>
        )}

        {/* Booking summary */}
        <Card className="p-6">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-mono text-lg font-extrabold text-navy-900">
              {booking.reference}
            </span>
            <StatusBadge status={booking.status} />
            <span className="ms-auto text-lg font-extrabold text-navy-900">
              +{formatMoney(booking.price.split.hostPayout, booking.price.currency)}
            </span>
          </div>
          <dl className="mt-4 grid gap-x-8 gap-y-3 text-sm sm:grid-cols-2">
            <div>
              <dt className="text-xs font-semibold uppercase tracking-wide text-navy-400">
                {t("host.bkd.dropOff")}
              </dt>
              <dd className="mt-0.5 flex items-center gap-1.5 font-semibold text-navy-900">
                <LogIn className="h-4 w-4 text-go-600" /> {formatDateTime(booking.startAt)}
              </dd>
            </div>
            <div>
              <dt className="text-xs font-semibold uppercase tracking-wide text-navy-400">
                {t("host.bkd.pickUp")}
              </dt>
              <dd className="mt-0.5 flex items-center gap-1.5 font-semibold text-navy-900">
                <LogOut className="h-4 w-4 text-brand-600" /> {formatDateTime(booking.endAt)}
              </dd>
            </div>
            <div className="sm:col-span-2">
              <dt className="text-xs font-semibold uppercase tracking-wide text-navy-400">
                {t("host.bkd.space")}
              </dt>
              <dd className="mt-0.5 flex items-center gap-1.5 font-semibold text-navy-900">
                <MapPin className="h-4 w-4 text-navy-400" /> {space.title}
              </dd>
            </div>
          </dl>

          {/* One-tap check-in / check-out */}
          <div className="mt-5 flex flex-wrap gap-2 border-t border-navy-100 pt-4">
            {booking.status === "paid" && (
              <form action={hostCheckInAction}>
                <input type="hidden" name="bookingId" value={booking.id} />
                <button
                  type="submit"
                  className="inline-flex items-center gap-1.5 rounded-xl bg-go-500 px-4 py-2.5 text-sm font-semibold text-white hover:bg-go-600"
                >
                  <LogIn className="h-4 w-4" /> {t("host.today.arrived")}
                </button>
              </form>
            )}
            {(booking.status === "active" || booking.status === "paid") && (
              <form action={hostCheckOutAction}>
                <input type="hidden" name="bookingId" value={booking.id} />
                <button
                  type="submit"
                  className="inline-flex items-center gap-1.5 rounded-xl bg-navy-900 px-4 py-2.5 text-sm font-semibold text-white hover:bg-navy-700"
                >
                  <LogOut className="h-4 w-4" /> {t("host.today.collected")}
                </button>
              </form>
            )}
          </div>
        </Card>

        {/* Guest + vehicle */}
        <Card className="p-6">
          <h3 className="text-sm font-bold text-navy-900">{t("host.bkd.guest")}</h3>
          <div className="mt-3 flex flex-wrap items-center gap-4">
            <Avatar
              name={traveller?.name ?? "PG"}
              avatarUrl={traveller?.avatarUrl}
              color={traveller?.avatarColor ?? "#1B6CB3"}
              className="h-12 w-12 text-sm"
            />
            <div className="min-w-0">
              <div className="font-bold text-navy-900">{traveller?.name ?? "—"}</div>
              <div className="flex items-center gap-1.5 text-sm text-navy-500">
                <Phone className="h-3.5 w-3.5" /> {traveller?.phone ?? "—"}
              </div>
            </div>
            {vehicle && (
              <div className="ms-auto rounded-xl border border-navy-200 bg-navy-50/60 px-4 py-2.5 text-center">
                <div className="flex items-center gap-1.5 font-mono text-lg font-extrabold tracking-wider text-navy-900">
                  <Car className="h-4 w-4 text-navy-500" /> {vehicle.reg}
                </div>
                <div className="text-xs text-navy-500">
                  {vehicle.colour} {vehicle.make} {vehicle.model}
                  {vehicle.ev ? " · EV" : ""}
                </div>
              </div>
            )}
          </div>
          {!vehicle && (
            <p className="mt-2 flex items-center gap-1.5 text-xs text-navy-400">
              <CalendarCheck className="h-3.5 w-3.5" /> {t("host.bkd.noVehicle")}
            </p>
          )}
        </Card>

        {/* Messages */}
        <BookingThread
          bookingId={booking.id}
          viewer="host"
          backHref={`/host/bookings/${booking.id}`}
          labels={{
            title: t("thread.title"),
            empty: t("thread.empty"),
            placeholder: t("thread.ph"),
            send: t("thread.send"),
            you: t("thread.you"),
            other: t("thread.traveller"),
          }}
        />
      </div>
    </PortalShell>
  );
}
