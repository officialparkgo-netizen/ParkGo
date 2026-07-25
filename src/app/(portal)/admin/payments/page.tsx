import Link from "next/link";
import type { Metadata } from "next";
import { AlertTriangle, Banknote, CheckCircle2, Download, FileSpreadsheet, Zap } from "lucide-react";
import { Card } from "@/components/ui/card";
import { buttonVariants } from "@/components/ui/button";
import { PortalShell } from "@/components/portal/shell";
import { StatusBadge } from "@/components/portal/status";
import { adminNav } from "@/components/portal/navs";
import { requireFinanceAdmin } from "@/lib/auth";
import { markPayoutPaidAction, runStripePayoutsAction } from "@/lib/admin-suite-actions";
import { isStripeConfigured, listStripeDisputes } from "@/lib/stripe";
import { listAllBookings, listAllPayments } from "@/lib/data/bookings";
import { formatDate, formatMoney } from "@/lib/utils";
import { getI18n } from "@/lib/i18n";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Payments",
  path: "/admin/payments",
  noindex: true,
});

export default async function AdminPaymentsPage({
  searchParams,
}: {
  searchParams: Promise<{ stripepayouts?: string }>;
}) {
  const user = await requireFinanceAdmin();
  const { t, locale } = await getI18n();
  const { stripepayouts } = await searchParams;
  // GATED: both stay invisible until Stripe keys exist (per launch plan).
  const stripeOn = isStripeConfigured();
  const disputes = stripeOn ? await listStripeDisputes() : [];

  const payments = await listAllPayments();
  const bookings = await listAllBookings();

  // Refunded payments (cancelled bookings) are excluded from GMV/payouts.
  const cancelledBookingIds = new Set(
    bookings.filter((b) => b.status === "cancelled").map((b) => b.id)
  );
  const isRefunded = (p: (typeof payments)[number]) =>
    p.payoutStatus === "refunded" || cancelledBookingIds.has(p.bookingId);
  const earnedPayments = payments.filter((p) => !isRefunded(p));
  const gmv = earnedPayments.reduce((s, p) => s + p.amount, 0);
  const payoutsDue = earnedPayments
    .filter((p) => p.payoutStatus !== "paid")
    .reduce((s, p) => s + p.split.hostPayout + p.split.driverPayout, 0);
  const refundedTotal = payments
    .filter(isRefunded)
    .reduce((s, p) => s + p.amount, 0);
  const bookingRefMap = new Map(bookings.map((b) => [b.id, b.reference]));

  // Protection window: payouts unlock only holdDays after pick-up.
  const { getPlatformSettings } = await import("@/lib/data/settings");
  const { isPayoutReleasable, payoutAvailableAt } = await import("@/lib/payouts");
  const holdDays = (await getPlatformSettings()).payoutHoldDays;
  const bookingEndMap = new Map(bookings.map((b) => [b.id, b.endAt]));
  const releasable = (bookingId: string) => {
    const endAt = bookingEndMap.get(bookingId);
    return !endAt || isPayoutReleasable(endAt, holdDays);
  };
  const availableFrom = (bookingId: string) => {
    const endAt = bookingEndMap.get(bookingId);
    return endAt ? payoutAvailableAt(endAt, holdDays) : null;
  };

  // Full history, newest first, grouped by calendar month with a subtotal
  // (refunded payments don't count towards the month's total).
  const localeTag =
    { en: "en-GB", ur: "ur-PK", hi: "hi-IN", de: "de-DE", zh: "zh-CN" }[locale] ?? "en-GB";
  const sorted = [...payments].sort(
    (a, b) => +new Date(b.createdAt) - +new Date(a.createdAt)
  );
  type Group = { key: string; label: string; total: number; items: typeof payments };
  const groups: Group[] = [];
  for (const p of sorted) {
    const d = new Date(p.createdAt);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    let g = groups.find((x) => x.key === key);
    if (!g) {
      g = {
        key,
        label: d.toLocaleDateString(localeTag, { month: "long", year: "numeric" }),
        total: 0,
        items: [],
      };
      groups.push(g);
    }
    g.items.push(p);
    if (!isRefunded(p)) g.total += p.amount;
  }

  return (
    <PortalShell user={user} nav={adminNav} title="admin.section.payments">
      <div className="mx-auto max-w-4xl space-y-6">
        <Link href="/admin" className="text-sm font-semibold text-brand-700">
          ← {t("common.backToDash")}
        </Link>

        {stripepayouts !== undefined && (
          <div className="flex items-center gap-2 rounded-2xl border border-go-200 bg-go-50 px-4 py-3 font-semibold text-go-700">
            <CheckCircle2 className="h-5 w-5" /> {stripepayouts} {t("admin.stripe.ranBanner")}
          </div>
        )}

        <section id="payments">
          <div className="mb-3 flex flex-wrap items-center gap-2">
            <h3 className="text-lg font-bold text-navy-900">{t("admin.section.payments")}</h3>
            <div className="ms-auto flex flex-wrap gap-2">
              {stripeOn && (
                <form action={runStripePayoutsAction}>
                  <button type="submit" className={buttonVariants({ size: "sm" })}>
                    <Zap className="h-4 w-4" /> {t("admin.stripe.runPayouts")}
                  </button>
                </form>
              )}
              <a
                href="/admin/export?type=payouts"
                className={buttonVariants({ variant: "outline", size: "sm" })}
              >
                <Banknote className="h-4 w-4" /> {t("admin.pay.payoutRun")}
              </a>
              <a
                href="/admin/export?type=finance"
                className={buttonVariants({ variant: "outline", size: "sm" })}
              >
                <FileSpreadsheet className="h-4 w-4" /> {t("admin.pay.finance")}
              </a>
              <a
                href="/admin/export?type=payments"
                className={buttonVariants({ variant: "outline", size: "sm" })}
              >
                <Download className="h-4 w-4" /> {t("admin.exportCsv")}
              </a>
            </div>
          </div>

          {/* Money at a glance (all-time) */}
          <div className="mb-4 flex flex-wrap gap-2 text-sm">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-go-50 px-3 py-1 font-semibold text-go-700">
              {t("admin.stat.gmv")}{" "}
              <span className="font-bold">{formatMoney(gmv)}</span>
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-accent-50 px-3 py-1 font-semibold text-accent-500">
              {t("admin.stat.payoutsDue")}{" "}
              <span className="font-bold">{formatMoney(payoutsDue)}</span>
            </span>
            {refundedTotal > 0 && (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-navy-50 px-3 py-1 font-semibold text-navy-500">
                {t("status.refunded")}{" "}
                <span className="font-bold">{formatMoney(refundedTotal)}</span>
              </span>
            )}
          </div>

          {groups.length === 0 ? (
            <Card className="p-6 text-center text-navy-500">{t("admin.bookings.empty")}</Card>
          ) : (
            <div className="space-y-6">
              {groups.map((g) => (
                <div key={g.key}>
                  <div className="mb-2 flex items-baseline justify-between gap-2">
                    <h4 className="font-bold text-navy-900">{g.label}</h4>
                    <span className="text-sm font-bold text-navy-500">
                      {formatMoney(g.total)}
                    </span>
                  </div>
                  <Card className="divide-y divide-navy-100">
                    {g.items.map((p) => (
                      <div key={p.id} className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex flex-wrap items-baseline gap-x-2">
                            <span
                              className={
                                isRefunded(p)
                                  ? "font-semibold text-navy-300 line-through"
                                  : "font-semibold text-navy-900"
                              }
                            >
                              {formatMoney(p.amount, p.currency)}
                            </span>
                            {bookingRefMap.get(p.bookingId) && (
                              <span className="font-mono text-xs font-bold text-navy-500">
                                {bookingRefMap.get(p.bookingId)}
                              </span>
                            )}
                          </div>
                          <span className="flex items-center gap-2">
                            <StatusBadge status={isRefunded(p) ? "refunded" : p.payoutStatus} />
                            {!isRefunded(p) &&
                              p.payoutStatus !== "paid" &&
                              (releasable(p.bookingId) ? (
                                <form action={markPayoutPaidAction}>
                                  <input type="hidden" name="paymentId" value={p.id} />
                                  <button
                                    type="submit"
                                    className="inline-flex items-center gap-1 rounded-lg bg-go-500 px-2.5 py-1 text-xs font-semibold text-white hover:bg-go-600"
                                  >
                                    <CheckCircle2 className="h-3 w-3" /> {t("admin.pay.markPaid")}
                                  </button>
                                </form>
                              ) : (
                                <span
                                  className="inline-flex items-center gap-1 rounded-lg bg-navy-100 px-2.5 py-1 text-xs font-semibold text-navy-600"
                                  data-payout-hold
                                >
                                  {t("admin.pay.onHold")}{" "}
                                  {formatDate(availableFrom(p.bookingId)!.toISOString())}
                                </span>
                              ))}
                          </span>
                        </div>
                        <div className="mt-1 flex flex-wrap gap-x-3 text-xs text-navy-400">
                          <span>{formatDate(p.createdAt)}</span>
                          <span>{t("admin.pay.platform")} {formatMoney(p.split.platform, p.currency)}</span>
                          <span>{t("admin.pay.host")} {formatMoney(p.split.hostPayout, p.currency)}</span>
                          <span>{t("admin.pay.driver")} {formatMoney(p.split.driverPayout, p.currency)}</span>
                          <span className="capitalize">· {p.method}</span>
                        </div>
                      </div>
                    ))}
                  </Card>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Chargebacks/disputes — appears only once Stripe is connected */}
        {stripeOn && (
          <section id="disputes">
            <h3 className="mb-3 flex items-center gap-2 text-lg font-bold text-navy-900">
              <AlertTriangle className="h-5 w-5 text-navy-500" /> {t("admin.stripe.disputes")}
            </h3>
            <Card className="divide-y divide-navy-100">
              {disputes.length === 0 && (
                <div className="p-6 text-center text-sm text-navy-500">
                  {t("admin.stripe.disputesEmpty")}
                </div>
              )}
              {disputes.map((d) => (
                <div key={d.id} className="flex flex-wrap items-center justify-between gap-3 p-4">
                  <div>
                    <div className="font-semibold text-navy-900">
                      {formatMoney(d.amount, d.currency === "EUR" ? "EUR" : "GBP")}
                    </div>
                    <div className="text-xs text-navy-400">
                      {d.reason} · {formatDate(d.created)}
                    </div>
                  </div>
                  <StatusBadge status={d.status} />
                </div>
              ))}
            </Card>
          </section>
        )}
      </div>
    </PortalShell>
  );
}
