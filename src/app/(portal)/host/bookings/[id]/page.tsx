import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import {
  CalendarCheck,
  Car,
  CheckCircle2,
  Hourglass,
  LogIn,
  LogOut,
  MapPin,
  ParkingSquare,
  Phone,
  Repeat,
  ShieldAlert,
  ShieldOff,
  XCircle,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar } from "@/components/common/avatar";
import { PortalShell } from "@/components/portal/shell";
import { StatusBadge } from "@/components/portal/status";
import { BookingThread } from "@/components/portal/booking-thread";
import { cohostNav, hostNav } from "@/components/portal/navs";
import { requireRole } from "@/lib/auth";
import { getHostById, getHostForUser, getSpaceById } from "@/lib/data/hosts";
import { getBookingById, listBookingsForHost } from "@/lib/data/bookings";
import { listMessagesForBooking } from "@/lib/data/booking-messages";
import { getUserProfile } from "@/lib/data/users";
import { hostCheckInAction, hostCheckOutAction } from "@/lib/host-suite-actions";
import {
  approveBookingAction,
  assignBayAction,
  blockGuestAction,
  declineBookingAction,
  reportIncidentAction,
} from "@/lib/host-suite2-actions";
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
  searchParams: Promise<{
    mark?: string;
    sent?: string;
    request?: string;
    bay?: string;
    guest?: string;
    incident?: string;
  }>;
}) {
  const user = await requireRole("host");
  const { t } = await getI18n();
  const { id } = await params;
  const { mark, request, bay, guest, incident } = await searchParams;

  const host = user.cohostHostId
    ? await getHostById(user.cohostHostId)
    : await getHostForUser(user);
  if (!host || (user.cohostHostId && host.cohostUserId !== user.id)) notFound();
  const booking = await getBookingById(id);
  if (!booking) notFound();
  const space = await getSpaceById(booking.spaceId);
  // Ownership guard — hosts see only bookings on their own spaces (admins too).
  if (!space || (space.hostId !== host.id && user.role !== "admin")) notFound();

  const traveller = await getUserProfile(booking.travellerId);
  const vehicle = traveller?.vehicle;
  const isCohost = !!user.cohostHostId;

  // Repeat guest: confirmed stays this traveller has had with this host.
  const visits = (await listBookingsForHost(host.id)).filter(
    (b) => b.travellerId === booking.travellerId && b.status !== "cancelled"
  ).length;
  const isBlocked = (host.blockedGuests ?? []).includes(booking.travellerId);
  const pending = booking.approval === "pending" && booking.status === "paid";

  return (
    <PortalShell
      user={user}
      nav={isCohost ? cohostNav : hostNav}
      title={`${t("host.bkd.title")} ${booking.reference}`}
    >
      <div className="mx-auto max-w-3xl space-y-5">
        <Link href="/host/today" className="text-sm font-semibold text-brand-700">
          ← {t("host.today.title")}
        </Link>

        {request === "approved" && (
          <div className="flex items-center gap-2 rounded-2xl border border-go-200 bg-go-50 px-4 py-3 font-semibold text-go-700">
            <CheckCircle2 className="h-5 w-5" /> {t("host.rtb.approvedBanner")}
          </div>
        )}
        {request === "declined" && (
          <div className="flex items-center gap-2 rounded-2xl border border-navy-200 bg-navy-50 px-4 py-3 font-semibold text-navy-700">
            <CheckCircle2 className="h-5 w-5" /> {t("host.rtb.declinedBanner")}
          </div>
        )}
        {bay === "saved" && (
          <div className="flex items-center gap-2 rounded-2xl border border-go-200 bg-go-50 px-4 py-3 font-semibold text-go-700">
            <CheckCircle2 className="h-5 w-5" /> {t("host.bays.saved")}
          </div>
        )}
        {guest === "blocked" && (
          <div className="flex items-center gap-2 rounded-2xl border border-navy-200 bg-navy-50 px-4 py-3 font-semibold text-navy-700">
            <ShieldOff className="h-5 w-5" /> {t("host.block.banner")}
          </div>
        )}
        {incident === "filed" && (
          <div className="flex items-center gap-2 rounded-2xl border border-go-200 bg-go-50 px-4 py-3 font-semibold text-go-700">
            <CheckCircle2 className="h-5 w-5" /> {t("host.incident.filed")}
          </div>
        )}
        {(request === "error" || bay === "error" || guest === "error" || incident === "error") && (
          <div className="flex items-center gap-2 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 font-semibold text-red-700">
            <XCircle className="h-5 w-5" /> {t("host.bkd.markError")}
          </div>
        )}

        {pending && (
          <Card className="border-accent-200 bg-accent-50/60 p-5" data-request-card>
            <p className="flex items-center gap-2 font-bold text-navy-900">
              <Hourglass className="h-5 w-5 text-accent-500" /> {t("host.rtb.pendingTitle")}
            </p>
            <p className="mt-1 text-sm text-navy-600">{t("host.rtb.pendingSub")}</p>
            <div className="mt-3 flex flex-wrap gap-2">
              <form action={approveBookingAction}>
                <input type="hidden" name="bookingId" value={booking.id} />
                <button
                  type="submit"
                  className="rounded-xl bg-go-500 px-4 py-2.5 text-sm font-semibold text-white hover:bg-go-600"
                >
                  {t("host.rtb.approve")}
                </button>
              </form>
              <form action={declineBookingAction}>
                <input type="hidden" name="bookingId" value={booking.id} />
                <input type="hidden" name="back" value={`/host/bookings/${booking.id}`} />
                <button
                  type="submit"
                  className="rounded-xl border border-red-200 bg-red-50 px-4 py-2.5 text-sm font-semibold text-red-700 hover:bg-red-100"
                >
                  {t("host.rtb.decline")}
                </button>
              </form>
            </div>
          </Card>
        )}

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
                <LogOut className="h-4 w-4 text-brand-700" /> {formatDateTime(booking.endAt)}
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

          {/* One-tap check-in / check-out (never while awaiting approval) */}
          <div className="mt-5 flex flex-wrap gap-2 border-t border-navy-100 pt-4">
            {booking.status === "paid" && !pending && (
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
            {(booking.status === "active" || (booking.status === "paid" && !pending)) && (
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
              <div className="flex flex-wrap items-center gap-2 font-bold text-navy-900">
                {traveller?.name ?? "—"}
                {visits > 1 && (
                  <Badge tone="brand" data-repeat-guest>
                    <Repeat className="mr-1 inline h-3 w-3" />
                    {t("host.guest.visits").replace("{n}", String(visits))}
                  </Badge>
                )}
                {isBlocked && <Badge tone="danger">{t("host.block.badge")}</Badge>}
              </div>
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

        {/* Bay assignment (only for spaces with named bays) */}
        {(space.bayNames ?? []).length > 0 && (
          <Card className="p-6" data-bay-card>
            <h3 className="flex items-center gap-2 text-sm font-bold text-navy-900">
              <ParkingSquare className="h-4 w-4 text-brand-700" /> {t("host.bays.assign")}
            </h3>
            <form action={assignBayAction} className="mt-3 flex flex-wrap items-center gap-2">
              <input type="hidden" name="bookingId" value={booking.id} />
              <select
                name="bay"
                defaultValue={typeof booking.bayIndex === "number" ? String(booking.bayIndex) : ""}
                className="rounded-xl border border-navy-200 bg-white px-3.5 py-2.5 text-sm text-navy-900 focus:border-brand-400 focus:outline-none"
              >
                <option value="">{t("host.bays.none")}</option>
                {(space.bayNames ?? []).map((bay, i) => (
                  <option key={bay} value={i}>
                    {t("host.bays.bay")} {bay}
                  </option>
                ))}
              </select>
              <button
                type="submit"
                className="rounded-xl bg-navy-900 px-4 py-2.5 text-sm font-semibold text-white hover:bg-navy-700"
              >
                {t("host.bays.save")}
              </button>
            </form>
          </Card>
        )}

        {/* Messages */}
        <BookingThread
          bookingId={booking.id}
          viewer="host"
          initial={await listMessagesForBooking(booking.id)}
          labels={{
            title: t("thread.title"),
            empty: t("thread.empty"),
            placeholder: t("thread.ph"),
            send: t("thread.send"),
            you: t("thread.you"),
            other: t("thread.traveller"),
            error: t("thread.error"),
          }}
        />

        {/* Trouble tools — incidents go to the ParkGo team; blocking is host-only */}
        <Card className="p-6">
          <h3 className="flex items-center gap-2 text-sm font-bold text-navy-900">
            <ShieldAlert className="h-4 w-4 text-accent-500" /> {t("host.incident.title")}
          </h3>
          <p className="mt-1 text-xs text-navy-500">{t("host.incident.sub")}</p>
          <form action={reportIncidentAction} className="mt-3 flex flex-wrap items-center gap-2">
            <input type="hidden" name="bookingId" value={booking.id} />
            <input
              name="description"
              required
              maxLength={2000}
              placeholder={t("host.incident.ph")}
              className="min-w-0 flex-1 rounded-xl border border-navy-200 bg-white px-3.5 py-2.5 text-sm text-navy-900 placeholder:text-navy-300 focus:border-brand-400 focus:outline-none"
            />
            <button
              type="submit"
              className="rounded-xl bg-accent-500 px-4 py-2.5 text-sm font-semibold text-white hover:bg-accent-600"
            >
              {t("host.incident.send")}
            </button>
          </form>

          {!isCohost && !isBlocked && (
            <form action={blockGuestAction} className="mt-4 border-t border-navy-100 pt-3">
              <input type="hidden" name="bookingId" value={booking.id} />
              <button
                type="submit"
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-navy-500 hover:text-red-600"
              >
                <ShieldOff className="h-3.5 w-3.5" /> {t("host.block.cta")}
              </button>
            </form>
          )}
        </Card>
      </div>
    </PortalShell>
  );
}
