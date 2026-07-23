import Link from "next/link";
import type { Metadata } from "next";
import { Download } from "lucide-react";
import { Card } from "@/components/ui/card";
import { buttonVariants } from "@/components/ui/button";
import { PortalShell } from "@/components/portal/shell";
import { StatusBadge } from "@/components/portal/status";
import { adminNav } from "@/components/portal/navs";
import { requireRole } from "@/lib/auth";
import { listAllBookings, listAllPayments } from "@/lib/data/bookings";
import { formatDate, formatMoney } from "@/lib/utils";
import { getI18n } from "@/lib/i18n";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Payments",
  path: "/admin/payments",
  noindex: true,
});

export default async function AdminPaymentsPage() {
  const user = await requireRole("admin");
  const { t, locale } = await getI18n();

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
        <Link href="/admin" className="text-sm font-semibold text-brand-600">
          ← {t("common.backToDash")}
        </Link>

        <section id="payments">
          <div className="mb-3 flex items-center gap-2">
            <h3 className="text-lg font-bold text-navy-900">{t("admin.section.payments")}</h3>
            <a
              href="/admin/export?type=payments"
              className={buttonVariants({ variant: "outline", size: "sm", className: "ms-auto" })}
            >
              <Download className="h-4 w-4" /> {t("admin.exportCsv")}
            </a>
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
                          <StatusBadge status={isRefunded(p) ? "refunded" : p.payoutStatus} />
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
      </div>
    </PortalShell>
  );
}
