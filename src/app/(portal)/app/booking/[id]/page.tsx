import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import {
  CalendarPlus,
  CheckCircle2,
  FileText,
  Clock,
  Hourglass,
  KeyRound,
  MapPin,
  Navigation,
  Phone,
  Radio,
  ShieldAlert,
  Star,
  UserRound,
  XCircle,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { PortalShell } from "@/components/portal/shell";
import { StatusBadge } from "@/components/portal/status";
import { QrCode } from "@/components/portal/qr";
import { BookingThread } from "@/components/portal/booking-thread";
import { travellerNav } from "@/components/portal/navs";
import { requireRole } from "@/lib/auth";
import { getAirport } from "@/lib/data/store";
import { getBookingById } from "@/lib/data/bookings";
import { listMessagesForBooking } from "@/lib/data/booking-messages";
import { getPlatformSettings } from "@/lib/data/settings";
import { getHostById, getSpaceById } from "@/lib/data/hosts";
import { getUserProfile } from "@/lib/data/users";
import { cancelBookingAction, extendBookingAction } from "@/lib/booking-actions";
import {
  adminChangeBookingDatesAction,
  adminPartialRefundAction,
  fileClaimAction,
} from "@/lib/admin-suite-actions";
import { daysBetween, formatDate, formatDateTime, formatMoney, formatMoneyShort, hoursBetween } from "@/lib/utils";
import { getI18n } from "@/lib/i18n";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({ title: "Booking", path: "/app/booking", noindex: true });

export default async function BookingPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{
    new?: string;
    cancelled?: string;
    refund?: string;
    cancelError?: string;
    extended?: string;
    extendError?: string;
    claim?: string;
    adminedit?: string;
    refunded?: string;
  }>;
}) {
  const user = await requireRole("traveller");
  const { t } = await getI18n();
  const { id } = await params;
  const {
    new: isNew,
    cancelled,
    refund,
    cancelError,
    extended,
    extendError,
    claim,
    adminedit,
    refunded,
  } = await searchParams;
  const booking = await getBookingById(id);
  const canView = booking && (booking.travellerId === user.id || user.role === "admin");
  if (!booking || !canView) notFound();

  const space = await getSpaceById(booking.spaceId);
  if (!space) notFound();
  const airport = getAirport(space.airportSlug);
  const host = await getHostById(space.hostId);
  const hostUser = host ? await getUserProfile(host.userId) : null;
  const currency = booking.price.currency;
  const paid = booking.status !== "requested" && booking.status !== "cancelled";
  const { listClaimsForBooking } = await import("@/lib/data/claims");
  const claims = await listClaimsForBooking(booking.id);
  // Claims make sense once the car is (or was) on site: any active/finished
  // stay, or a paid one whose drop-off time has passed.
  const stayStarted =
    booking.status === "active" ||
    booking.status === "completed" ||
    booking.status === "reviewed" ||
    (booking.status === "paid" && new Date(booking.startAt).getTime() < Date.now());
  const canClaim =
    booking.travellerId === user.id &&
    stayStarted &&
    !claims.some((c) => c.status === "open" || c.status === "in_review");

  // Cancellation: allowed while paid and before drop-off. Free until 24h
  // before; within 24h the late fee is kept and the rest refunded. Only the
  // booking owner can cancel — admins get a read-only view.
  const msToStart = new Date(booking.startAt).getTime() - Date.now();
  const cancellable =
    booking.status === "paid" && msToStart > 0 && booking.travellerId === user.id;

  // Extension: owner can push the pick-up later while the booking is live.
  const extendable =
    (booking.status === "paid" || booking.status === "active") &&
    new Date(booking.endAt).getTime() > Date.now() &&
    booking.travellerId === user.id;
  const minExtendDate = new Date(new Date(booking.endAt).getTime() + 86_400_000)
    .toISOString()
    .slice(0, 10);
  const policy = await getPlatformSettings();
  const lateCancel = cancellable && msToStart < policy.cancelWindowHours * 3_600_000;
  const previewRefund = lateCancel
    ? booking.price.total -
      Math.round((booking.price.total * policy.cancelFeeBps) / 10_000)
    : booking.price.total;

  return (
    <PortalShell user={user} nav={travellerNav} title={`${t("app.booking.title")} ${booking.reference}`}>
      <div className="mx-auto max-w-4xl space-y-5 pb-24">
        {isNew && booking.approval !== "pending" && (
          <div className="flex items-center gap-2 rounded-2xl border border-go-200 bg-go-50 px-4 py-3 font-semibold text-go-700">
            <CheckCircle2 className="h-5 w-5" /> {t("app.booking.confirmed")}
          </div>
        )}
        {booking.approval === "pending" && booking.status === "paid" && (
          <div
            className="flex items-center gap-2 rounded-2xl border border-accent-200 bg-accent-50 px-4 py-3 font-semibold text-accent-700"
            data-approval-pending
          >
            <Hourglass className="h-5 w-5" /> {t("app.booking.rtb.pending")}
          </div>
        )}
        {booking.approval === "declined" && (
          <div className="flex items-center gap-2 rounded-2xl border border-navy-200 bg-navy-50 px-4 py-3 font-semibold text-navy-700">
            <XCircle className="h-5 w-5" /> {t("app.booking.rtb.declined")}
          </div>
        )}
        {booking.approval === "approved" && booking.status === "paid" && (
          <div className="flex items-center gap-2 rounded-2xl border border-go-200 bg-go-50 px-4 py-3 font-semibold text-go-700">
            <CheckCircle2 className="h-5 w-5" /> {t("app.booking.rtb.approved")}
          </div>
        )}
        {cancelled && (
          <div className="flex items-center gap-2 rounded-2xl border border-go-200 bg-go-50 px-4 py-3 font-semibold text-go-700">
            <CheckCircle2 className="h-5 w-5" /> {t("app.booking.cancel.done")}
            {refund && Number(refund) > 0 && (
              <span className="ml-1">
                · {t("app.booking.cancel.refundLabel")} {formatMoney(Number(refund), currency)}
              </span>
            )}
          </div>
        )}
        {cancelError && (
          <div className="flex items-center gap-2 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 font-semibold text-red-700">
            <XCircle className="h-5 w-5" /> {t("app.booking.cancel.error")}
          </div>
        )}
        {extended && (
          <div className="flex items-center gap-2 rounded-2xl border border-go-200 bg-go-50 px-4 py-3 font-semibold text-go-700">
            <CheckCircle2 className="h-5 w-5" /> {t("app.booking.extend.done")}
          </div>
        )}
        {extendError && (
          <div className="flex items-center gap-2 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 font-semibold text-red-700">
            <XCircle className="h-5 w-5" />{" "}
            {extendError === "full"
              ? t("app.booking.extend.errorFull")
              : t("app.booking.extend.error")}
          </div>
        )}
        {claim === "filed" && (
          <div className="flex items-center gap-2 rounded-2xl border border-go-200 bg-go-50 px-4 py-3 font-semibold text-go-700">
            <CheckCircle2 className="h-5 w-5" /> {t("app.booking.claim.filed")}
          </div>
        )}
        {adminedit === "done" && (
          <div className="flex items-center gap-2 rounded-2xl border border-go-200 bg-go-50 px-4 py-3 font-semibold text-go-700">
            <CheckCircle2 className="h-5 w-5" /> {t("admin.tools.dateDone")}
          </div>
        )}
        {adminedit === "error" && (
          <div className="flex items-center gap-2 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 font-semibold text-red-700">
            <XCircle className="h-5 w-5" /> {t("admin.tools.dateError")}
          </div>
        )}
        {refunded && refunded !== "error" && (
          <div className="flex items-center gap-2 rounded-2xl border border-go-200 bg-go-50 px-4 py-3 font-semibold text-go-700">
            <CheckCircle2 className="h-5 w-5" /> {t("admin.tools.refundDone")} £{refunded}
          </div>
        )}
        {refunded === "error" && (
          <div className="flex items-center gap-2 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 font-semibold text-red-700">
            <XCircle className="h-5 w-5" /> {t("admin.tools.refundError")}
          </div>
        )}
        {claim === "error" && (
          <div className="flex items-center gap-2 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 font-semibold text-red-700">
            <XCircle className="h-5 w-5" /> {t("app.booking.claim.error")}
          </div>
        )}

        <div className="grid gap-5 lg:grid-cols-3">
          {/* QR / access + quick actions */}
          <div className="space-y-5 self-start">
            <Card className="flex flex-col items-center p-6 text-center">
              <Badge tone="brand">{t("app.booking.accessCode")}</Badge>
              <div className="mt-4">
                {/* async server component */}
                <QrCode value={booking.qrToken} size={190} />
              </div>
              <div className="mt-3 font-mono text-lg font-bold tracking-widest text-navy-900">
                {booking.reference}
              </div>
              <StatusBadge status={booking.status} />
              <p className="mt-3 text-xs text-navy-400">
                {t("app.booking.showQr")}
              </p>
            </Card>

            {booking.status !== "cancelled" && (
              <Card className="space-y-2 p-4">
                <Link
                  href={`/app/booking/${booking.id}/track`}
                  className={buttonVariants({ size: "sm", className: "w-full" })}
                >
                  <Radio className="h-4 w-4" /> {t("app.booking.trackLive")}
                </Link>
                <a
                  href={`https://www.google.com/maps/dir/?api=1&destination=${space.lat},${space.lng}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={buttonVariants({ variant: "outline", size: "sm", className: "w-full" })}
                >
                  <Navigation className="h-4 w-4" /> {t("app.track.directions")}
                </a>
              </Card>
            )}
          </div>

          {/* Details */}
          <Card className="p-6 lg:col-span-2">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h2 className="text-lg font-bold text-navy-900">{space.title}</h2>
              <Badge tone="navy">
                <Clock className="h-3 w-3" />{" "}
                {booking.startAt.slice(0, 10) === booking.endAt.slice(0, 10)
                  ? `${hoursBetween(booking.startAt, booking.endAt)} ${
                      hoursBetween(booking.startAt, booking.endAt) === 1
                        ? t("common.hour")
                        : t("common.hours")
                    }`
                  : `${daysBetween(booking.startAt, booking.endAt)} ${
                      daysBetween(booking.startAt, booking.endAt) === 1
                        ? t("common.day")
                        : t("common.days")
                    }`}
              </Badge>
            </div>
            <p className="text-sm text-navy-500">{airport?.name}</p>

            <dl className="mt-4 grid gap-4 sm:grid-cols-2">
              <Detail label={t("app.booking.dropOff")} value={formatDateTime(booking.startAt)} />
              <Detail label={t("app.booking.pickUp")} value={formatDateTime(booking.endAt)} />
            </dl>

            {/* Released after payment */}
            <div className="mt-4 rounded-xl border border-go-200 bg-go-50/60 p-4">
              <h3 className="flex items-center gap-2 text-sm font-bold text-navy-900">
                <KeyRound className="h-4 w-4 text-go-600" /> {t("app.booking.releasedAfterPayment")}
              </h3>
              {paid ? (
                <div className="mt-2 space-y-1.5 text-sm text-navy-700">
                  <p className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-navy-400" /> {space.exactAddress}
                  </p>
                  <p className="flex items-center gap-2">
                    <UserRound className="h-4 w-4 text-navy-400" />
                    {hostUser?.name ?? host?.displayName}
                    {hostUser?.phone && (
                      <a
                        href={`tel:${hostUser.phone}`}
                        className="inline-flex items-center gap-1 font-semibold text-brand-600"
                      >
                        <Phone className="h-3.5 w-3.5" /> {hostUser.phone}
                      </a>
                    )}
                  </p>
                  <p className="text-navy-500">{space.accessRules}</p>
                </div>
              ) : (
                <p className="mt-1 text-sm text-navy-500">{t("app.booking.completeToReveal")}</p>
              )}
            </div>

            {/* Price */}
            <dl className="mt-4 space-y-1.5 text-sm">
              <Row label={t("app.booking.parking")} value={formatMoney(booking.price.parking, currency)} />
              {booking.bundle.transfer && (
                <Row
                  label={`${t("app.booking.licensedTransfer")}${
                    booking.bundle.transferReturn === undefined
                      ? ""
                      : ` · ${booking.bundle.transferReturn ? t("app.checkout.returnTrip") : t("app.checkout.oneWay")}`
                  }${booking.bundle.transferTime ? ` · ${booking.bundle.transferTime}` : ""}`}
                  value={formatMoney(booking.price.transfer, currency)}
                />
              )}
              {booking.bundle.ev && (
                <Row label={t("app.booking.evCharging")} value={formatMoney(booking.price.ev, currency)} />
              )}
              <Row label={t("app.booking.serviceFee")} value={formatMoney(booking.price.serviceFee, currency)} />
              {(booking.price.discount ?? 0) > 0 && (
                <div className="flex items-center justify-between text-go-700">
                  <dt>
                    {t("app.booking.discount")}
                    {booking.price.promoCode ? ` (${booking.price.promoCode})` : ""}
                  </dt>
                  <dd className="font-semibold">
                    −{formatMoney(booking.price.discount ?? 0, currency)}
                  </dd>
                </div>
              )}
              <div className="my-1.5 border-t border-navy-100" />
              <div className="flex items-center justify-between text-base font-bold text-navy-900">
                <dt>{t("app.booking.totalPaid")}</dt>
                <dd>{formatMoney(booking.price.total, currency)}</dd>
              </div>
            </dl>

            {extendable && (
              <div className="mt-5 rounded-xl border border-brand-100 bg-brand-50/40 p-4">
                <h3 className="flex items-center gap-2 text-sm font-bold text-navy-900">
                  <CalendarPlus className="h-4 w-4 text-brand-600" />{" "}
                  {t("app.booking.extend.title")}
                </h3>
                <p className="mt-1 text-xs text-navy-500">
                  {t("app.booking.extend.body")} ·{" "}
                  {formatMoneyShort(space.pricePerDay, currency)}/{t("common.day")}
                </p>
                <form
                  action={extendBookingAction}
                  className="mt-3 flex flex-wrap items-center gap-2"
                >
                  <input type="hidden" name="bookingId" value={booking.id} />
                  <input
                    type="date"
                    name="newEnd"
                    min={minExtendDate}
                    defaultValue={minExtendDate}
                    required
                    className="h-10 rounded-xl border border-navy-200 px-3 text-sm focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-100"
                  />
                  <button
                    type="submit"
                    className="inline-flex h-10 items-center gap-1.5 rounded-xl bg-brand-500 px-4 text-sm font-semibold text-white hover:bg-brand-600"
                  >
                    <CalendarPlus className="h-4 w-4" /> {t("app.booking.extend.btn")}
                  </button>
                </form>
              </div>
            )}

            {cancellable && (
              <div className="mt-5 rounded-xl border border-navy-100 bg-navy-50/50 p-4">
                <h3 className="text-sm font-bold text-navy-900">
                  {t("app.booking.cancel.title")}
                </h3>
                <p className="mt-1 text-xs text-navy-500">{t("app.booking.cancel.policy")}</p>
                <p className="mt-2 text-sm font-semibold text-navy-800">
                  {t("app.booking.cancel.refundLabel")}:{" "}
                  {formatMoney(previewRefund, currency)}
                  {lateCancel && (
                    <span className="ml-1 font-normal text-accent-500">
                      ({t("app.booking.cancel.lateFeeNote")})
                    </span>
                  )}
                </p>
                <form action={cancelBookingAction} className="mt-3">
                  <input type="hidden" name="bookingId" value={booking.id} />
                  <button
                    type="submit"
                    className="inline-flex items-center gap-1.5 rounded-xl border border-red-200 bg-white px-4 py-2 text-sm font-semibold text-red-600 hover:bg-red-50"
                  >
                    <XCircle className="h-4 w-4" /> {t("app.booking.cancel.btn")}
                  </button>
                </form>
              </div>
            )}

            {(canClaim || claims.length > 0) && (
              <div className="mt-5 rounded-xl border border-navy-100 bg-navy-50/50 p-4">
                <h3 className="flex items-center gap-2 text-sm font-bold text-navy-900">
                  <ShieldAlert className="h-4 w-4 text-navy-500" /> {t("app.booking.claim.title")}
                </h3>
                {claims.length > 0 && (
                  <ul className="mt-2 space-y-2">
                    {claims.map((c) => (
                      <li key={c.id} className="rounded-lg bg-white px-3 py-2 text-sm">
                        <div className="flex items-center justify-between gap-2">
                          <span className="font-semibold text-navy-800">
                            {t("app.booking.claim.existing")} · {formatDate(c.createdAt)}
                          </span>
                          <StatusBadge status={c.status} />
                        </div>
                        {c.resolution && (
                          <p className="mt-1 text-xs text-navy-600">{c.resolution}</p>
                        )}
                      </li>
                    ))}
                  </ul>
                )}
                {canClaim && (
                  <>
                    <p className="mt-1 text-xs text-navy-500">{t("app.booking.claim.desc")}</p>
                    <form action={fileClaimAction} className="mt-3 space-y-2">
                      <input type="hidden" name="bookingId" value={booking.id} />
                      <textarea
                        name="description"
                        required
                        rows={3}
                        maxLength={2000}
                        placeholder={t("app.booking.claim.ph")}
                        className="w-full rounded-xl border border-navy-200 bg-white px-3.5 py-2.5 text-sm text-navy-900 placeholder:text-navy-300 focus:border-brand-400 focus:outline-none"
                      />
                      <button
                        type="submit"
                        className="inline-flex items-center gap-1.5 rounded-xl border border-navy-200 bg-white px-4 py-2 text-sm font-semibold text-navy-700 hover:bg-navy-50"
                      >
                        <ShieldAlert className="h-4 w-4" /> {t("app.booking.claim.submit")}
                      </button>
                    </form>
                  </>
                )}
              </div>
            )}

            {/* Message the host (arrival coordination, gate codes…) */}
            {paid && booking.travellerId === user.id && (
              <div className="mt-5">
                <BookingThread
                  bookingId={booking.id}
                  viewer="traveller"
                  initial={await listMessagesForBooking(booking.id)}
                  labels={{
                    title: t("thread.titleHost"),
                    empty: t("thread.empty"),
                    placeholder: t("thread.ph"),
                    send: t("thread.send"),
                    you: t("thread.you"),
                    other: t("thread.host"),
                    error: t("thread.error"),
                  }}
                />
              </div>
            )}

            {/* Admin support tools — full admins only, never while impersonating */}
            {user.role === "admin" && user.adminScope !== "support" && !user.impersonatedBy && (
              <div className="mt-5 rounded-xl border border-navy-200 bg-navy-50/60 p-4">
                <h3 className="text-sm font-bold text-navy-900">
                  {t("admin.tools.title")}
                </h3>
                {["requested", "paid", "active"].includes(booking.status) && (
                  <form
                    action={adminChangeBookingDatesAction}
                    className="mt-3 flex flex-wrap items-end gap-2"
                  >
                    <input type="hidden" name="bookingId" value={booking.id} />
                    <label className="text-xs font-semibold text-navy-600">
                      {t("admin.tools.newStart")}
                      <input
                        type="date"
                        name="newStart"
                        required
                        defaultValue={booking.startAt.slice(0, 10)}
                        className="mt-1 block h-9 rounded-lg border border-navy-200 bg-white px-2 text-xs"
                      />
                    </label>
                    <label className="text-xs font-semibold text-navy-600">
                      {t("admin.tools.newEnd")}
                      <input
                        type="date"
                        name="newEnd"
                        required
                        defaultValue={booking.endAt.slice(0, 10)}
                        className="mt-1 block h-9 rounded-lg border border-navy-200 bg-white px-2 text-xs"
                      />
                    </label>
                    <button
                      type="submit"
                      className="inline-flex h-9 items-center gap-1 rounded-lg bg-navy-900 px-3 text-xs font-semibold text-white hover:bg-navy-700"
                    >
                      {t("admin.tools.changeDates")}
                    </button>
                  </form>
                )}
                {paid && (
                  <form
                    action={adminPartialRefundAction}
                    className="mt-3 flex flex-wrap items-end gap-2"
                  >
                    <input type="hidden" name="bookingId" value={booking.id} />
                    <label className="text-xs font-semibold text-navy-600">
                      {t("admin.tools.refundAmount")}
                      <input
                        type="number"
                        name="amount"
                        step="0.01"
                        min="0.01"
                        max={(booking.price.total / 100).toFixed(2)}
                        required
                        placeholder="10.00"
                        className="mt-1 block h-9 w-28 rounded-lg border border-navy-200 bg-white px-2 text-xs"
                      />
                    </label>
                    <button
                      type="submit"
                      className="inline-flex h-9 items-center gap-1 rounded-lg border border-red-200 bg-white px-3 text-xs font-semibold text-red-600 hover:bg-red-50"
                    >
                      {t("admin.tools.refundBtn")}
                    </button>
                  </form>
                )}
                <p className="mt-2 text-[11px] text-navy-400">{t("admin.tools.note")}</p>
              </div>
            )}

            <div className="mt-5 flex flex-wrap gap-2">
              {(booking.status === "active" || booking.status === "paid") && (
                <Link href={`/app/booking/${booking.id}/track`} className={buttonVariants()}>
                  <Radio className="h-4 w-4" /> {t("app.booking.trackLive")}
                </Link>
              )}
              {booking.status === "completed" && (
                <Link
                  href={`/app/booking/${booking.id}/track`}
                  className={buttonVariants({ variant: "outline" })}
                >
                  <Star className="h-4 w-4" /> {t("app.booking.viewReview")}
                </Link>
              )}
              {paid && (
                <Link
                  href={`/app/booking/${booking.id}/receipt`}
                  className={buttonVariants({ variant: "outline" })}
                >
                  <FileText className="h-4 w-4" /> {t("receipt.title")}
                </Link>
              )}
              <Link href="/app" className={buttonVariants({ variant: "ghost" })}>
                {t("common.backToDash")}
              </Link>
            </div>
          </Card>
        </div>
      </div>
    </PortalShell>
  );
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-xs font-semibold uppercase tracking-wide text-navy-400">{label}</dt>
      <dd className="mt-0.5 font-semibold text-navy-900">{value}</dd>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between text-navy-600">
      <dt>{label}</dt>
      <dd className="font-semibold text-navy-800">{value}</dd>
    </div>
  );
}
