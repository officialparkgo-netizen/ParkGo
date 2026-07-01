import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import {
  CheckCircle2,
  KeyRound,
  MapPin,
  Phone,
  Radio,
  Star,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { PortalShell } from "@/components/portal/shell";
import { StatusBadge } from "@/components/portal/status";
import { QrCode } from "@/components/portal/qr";
import { travellerNav } from "@/components/portal/navs";
import { requireRole } from "@/lib/auth";
import { getAirport, getBooking, getHost, getSpace, getUser } from "@/lib/data/store";
import { formatDateTime, formatMoney } from "@/lib/utils";
import { getI18n } from "@/lib/i18n";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({ title: "Booking", path: "/app/booking", noindex: true });

export default async function BookingPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ new?: string }>;
}) {
  const user = await requireRole("traveller");
  const { t } = await getI18n();
  const { id } = await params;
  const { new: isNew } = await searchParams;
  const booking = getBooking(id);
  if (!booking || booking.travellerId !== user.id) notFound();

  const space = getSpace(booking.spaceId)!;
  const airport = getAirport(space.airportSlug);
  const host = getHost(space.hostId);
  const hostUser = host ? getUser(host.userId) : undefined;
  const currency = booking.price.currency;
  const paid = booking.status !== "requested" && booking.status !== "cancelled";

  return (
    <PortalShell user={user} nav={travellerNav} title={`Booking ${booking.reference}`}>
      <div className="mx-auto max-w-4xl space-y-5">
        {isNew && (
          <div className="flex items-center gap-2 rounded-2xl border border-go-200 bg-go-50 px-4 py-3 font-semibold text-go-700">
            <CheckCircle2 className="h-5 w-5" /> {t("app.booking.confirmed")}
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
                    <Phone className="h-4 w-4 text-navy-400" /> {hostUser?.name} ·{" "}
                    {hostUser?.phone ?? "+44 7700 900000"}
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
