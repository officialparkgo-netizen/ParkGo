import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { Logo } from "@/components/brand/logo";
import { PrintButton } from "@/components/common/print-button";
import { requireUser } from "@/lib/auth";
import { getAirport } from "@/lib/data/store";
import { getBookingById, listAllPayments } from "@/lib/data/bookings";
import { getSpaceById } from "@/lib/data/hosts";
import { getUserProfile } from "@/lib/data/users";
import { getPlatformSettings } from "@/lib/data/settings";
import { formatDate, formatDateTime, formatMoney } from "@/lib/utils";
import { getI18n } from "@/lib/i18n";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Receipt",
  path: "/app/booking",
  noindex: true,
});

/**
 * Print-friendly booking receipt (traveller + admin) — and, once the platform
 * VAT number is set in /admin/settings, a proper VAT invoice: numbered, with
 * the traveller's company details and the VAT share broken out. Until then it
 * stays honestly a receipt, because an invoice claiming VAT without a
 * registration number would be a document nobody can file.
 */
export default async function BookingReceiptPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const user = await requireUser();
  const { t } = await getI18n();
  const { id } = await params;

  const booking = await getBookingById(id);
  const canView = booking && (booking.travellerId === user.id || user.role === "admin");
  if (!booking || !canView) notFound();
  if (booking.status === "requested") notFound(); // unpaid — nothing to receipt

  const space = await getSpaceById(booking.spaceId);
  const airport = space ? getAirport(space.airportSlug) : undefined;
  const currency = booking.price.currency;
  const payment = (await listAllPayments()).find((p) => p.bookingId === booking.id);

  // Billed to the traveller — not whoever is looking at the page.
  const traveller =
    booking.travellerId === user.id
      ? user
      : ((await getUserProfile(booking.travellerId)) ?? user);
  const business = traveller.business;

  // A VAT invoice needs a registration number; UK VAT is priced-in at 20%.
  const settings = await getPlatformSettings().catch(() => null);
  const vatNumber = settings?.vatNumber;
  const isVatInvoice = !!vatNumber && currency === "GBP";
  const vatRate = 20;
  const net = isVatInvoice
    ? Math.round((booking.price.total * 100) / (100 + vatRate))
    : booking.price.total;
  const vatAmount = booking.price.total - net;

  const rows: [string, number][] = [
    [t("app.checkout.parking"), booking.price.parking],
    ...(booking.bundle.transfer
      ? ([[t("search.transfer"), booking.price.transfer]] as [string, number][])
      : []),
    ...(booking.bundle.ev
      ? ([[t("app.booking.evCharging"), booking.price.ev]] as [string, number][])
      : []),
    [t("app.booking.serviceFee"), booking.price.serviceFee],
  ];

  return (
    <div className="mx-auto max-w-2xl px-6 py-10 print:max-w-none print:p-0">
      <div className="mb-6 flex items-center justify-between gap-3 print:hidden">
        <Link
          href={`/app/booking/${booking.id}`}
          className="text-sm font-semibold text-brand-700"
        >
          ← {t("app.booking.title")} {booking.reference}
        </Link>
        <PrintButton label={t("receipt.print")} />
      </div>

      <div className="rounded-2xl border border-navy-100 bg-white p-8 shadow-card print:border-0 print:shadow-none">
        <div className="flex flex-wrap items-start justify-between gap-4 border-b border-navy-100 pb-6">
          <div>
            <Logo />
            <p className="mt-2 text-xs leading-relaxed text-navy-500">
              PARKGO LIMITED
              <br />
              www.parkgo.ai · info@parkgo.ai
              {isVatInvoice && (
                <>
                  <br />
                  <span data-platform-vat>
                    {t("receipt.vatReg")}: {vatNumber}
                  </span>
                </>
              )}
            </p>
          </div>
          <div className="text-end">
            <h1 className="text-xl font-extrabold text-navy-900">
              {isVatInvoice ? t("receipt.vatInvoice") : t("receipt.title")}
            </h1>
            {isVatInvoice && (
              <p className="font-mono text-xs font-bold text-navy-500" data-invoice-no>
                {t("receipt.invoiceNo")} INV-{booking.reference}
              </p>
            )}
            <p className="mt-1 font-mono text-sm font-bold text-navy-700">
              {booking.reference}
            </p>
            <p className="text-xs text-navy-400">
              {formatDateTime(payment?.createdAt ?? booking.createdAt)}
            </p>
          </div>
        </div>

        <dl className="mt-6 grid gap-x-8 gap-y-2 text-sm sm:grid-cols-2">
          <div>
            <dt className="text-xs font-semibold uppercase tracking-wide text-navy-400">
              {t("receipt.billedTo")}
            </dt>
            <dd className="mt-0.5 font-semibold text-navy-900">{traveller.name}</dd>
            <dd className="text-navy-500">{traveller.email}</dd>
            {business?.company && (
              <div data-invoice-business>
                <dd className="mt-1.5 font-semibold text-navy-800">{business.company}</dd>
                {business.vatNumber && (
                  <dd className="text-xs text-navy-500">
                    {t("receipt.vatReg")}: {business.vatNumber}
                  </dd>
                )}
                {business.costCentre && (
                  <dd className="text-xs text-navy-500">
                    {t("account.business.costCentre")}: {business.costCentre}
                  </dd>
                )}
              </div>
            )}
          </div>
          <div>
            <dt className="text-xs font-semibold uppercase tracking-wide text-navy-400">
              {t("receipt.stay")}
            </dt>
            <dd className="mt-0.5 font-semibold text-navy-900">
              {space?.title} · {airport?.name}
            </dd>
            <dd className="text-navy-500">
              {formatDate(booking.startAt)} → {formatDate(booking.endAt)}
            </dd>
          </div>
        </dl>

        <table className="mt-6 w-full text-sm">
          <tbody>
            {rows.map(([label, amount]) => (
              <tr key={label} className="border-b border-navy-50">
                <td className="py-2.5 text-navy-600">{label}</td>
                <td className="py-2.5 text-end font-semibold text-navy-800">
                  {formatMoney(amount, currency)}
                </td>
              </tr>
            ))}
            {(booking.price.discount ?? 0) > 0 && (
              <tr className="border-b border-navy-50 text-go-700">
                <td className="py-2.5">
                  {t("app.booking.discount")}
                  {booking.price.promoCode ? ` (${booking.price.promoCode})` : ""}
                </td>
                <td className="py-2.5 text-end font-semibold">
                  −{formatMoney(booking.price.discount ?? 0, currency)}
                </td>
              </tr>
            )}
            {isVatInvoice && (
              <>
                <tr className="border-b border-navy-50 text-navy-500">
                  <td className="py-2">{t("receipt.net")}</td>
                  <td className="py-2 text-end font-semibold">{formatMoney(net, currency)}</td>
                </tr>
                <tr className="border-b border-navy-50 text-navy-500" data-vat-line>
                  <td className="py-2">
                    {t("receipt.vat")} ({vatRate}%)
                  </td>
                  <td className="py-2 text-end font-semibold">
                    {formatMoney(vatAmount, currency)}
                  </td>
                </tr>
              </>
            )}
            <tr>
              <td className="pt-3 text-base font-extrabold text-navy-900">
                {t("app.booking.totalPaid")}
              </td>
              <td className="pt-3 text-end text-base font-extrabold text-navy-900">
                {formatMoney(booking.price.total, currency)}
              </td>
            </tr>
          </tbody>
        </table>

        <p className="mt-6 text-xs text-navy-500">
          {t("receipt.method")}: {payment?.method ?? "card"}
          {booking.status === "cancelled" ? ` · ${t("status.refunded")}` : ""}
        </p>
        <p className="mt-4 border-t border-navy-100 pt-4 text-[11px] leading-relaxed text-navy-400">
          {isVatInvoice ? t("receipt.vatNote") : t("receipt.note")}
        </p>
      </div>
    </div>
  );
}
