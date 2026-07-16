import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import {
  CalendarPlus,
  CheckCircle2,
  KeyRound,
  MapPin,
  Phone,
  Radio,
  Star,
  XCircle,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { PortalShell } from "@/components/portal/shell";
import { StatusBadge } from "@/components/portal/status";
import { QrCode } from "@/components/portal/qr";
import { travellerNav } from "@/components/portal/navs";
import { requireRole } from "@/lib/auth";
import { getAirport } from "@/lib/data/store";
import {
  CANCEL_FEE_BPS,
  CANCEL_FREE_WINDOW_MS,
  getBookingById,
} from "@/lib/data/bookings";
import { getHostById, getSpaceById } from "@/lib/data/hosts";
import { getUserProfile } from "@/lib/data/users";
import { cancelBookingAction, extendBookingAction } from "@/lib/booking-actions";
import { formatDateTime, formatMoney, formatMoneyShort } from "@/lib/utils";
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
  const lateCancel = cancellable && msToStart < CANCEL_FREE_WINDOW_MS;
  const previewRefund = lateCancel
    ? booking.price.total - Math.round((booking.price.total * CANCEL_FEE_BPS) / 10_000)
    : booking.price.total;

  return (
    <PortalShell user={user} nav={travellerNav} title={`${t("app.booking.title")} ${booking.reference}`}>
      <div className="mx-auto max-w-4xl space-y-5">
        {isNew && (
          <div className="flex items-center gap-2 rounded-2xl border border-go-200 bg-go-50 px-4 py-3 font-semibold text-go-700">
            <CheckCircle2 className="h-5 w-5" /> {t("app.booking.confirmed")}
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

        <div className="grid gap-5 lg:grid-cols-3">
          {/* QR / access */}
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

          {/* Details */}
          <Card className="p-6 lg:col-span-2">
            <h2 className="text-lg font-bold text-navy-900">{space.title}</h2>
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
                    <Phone className="h-4 w-4 text-navy-400" />
                    {hostUser?.name ?? host?.displayName}
                    {hostUser?.phone ? ` · ${hostUser.phone}` : ""}
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
                <Row label={t("app.booking.licensedTransfer")} value={formatMoney(booking.price.transfer, currency)} />
              )}
              {booking.bundle.ev && (
                <Row label={t("app.booking.evCharging")} value={formatMoney(booking.price.ev, currency)} />
              )}
              <Row label={t("app.booking.serviceFee")} value={formatMoney(booking.price.serviceFee, currency)} />
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
