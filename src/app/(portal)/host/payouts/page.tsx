import Link from "next/link";
import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { BadgeCheck, Banknote, Download } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { PortalShell } from "@/components/portal/shell";
import { StatusBadge } from "@/components/portal/status";
import { hostNav } from "@/components/portal/navs";
import { requireRole } from "@/lib/auth";
import { getHostForUser, getSpacesForHost } from "@/lib/data/hosts";
import { listBookingsForHost, listPaymentsForHost } from "@/lib/data/bookings";
import { formatDate, formatMoney } from "@/lib/utils";
import { connectPayoutsAction } from "@/lib/host-actions";
import { isStripeConfigured, getConnectStatus } from "@/lib/stripe";
import { getI18n } from "@/lib/i18n";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Payouts",
  path: "/host/payouts",
  noindex: true,
});

export default async function HostPayoutsPage() {
  const user = await requireRole("host");
  const { t, locale } = await getI18n();
  const host = await getHostForUser(user);
  if (!host) redirect("/host");

  const spaces = await getSpacesForHost(host.id);
  const bookings = await listBookingsForHost(host.id);
  const payments = await listPaymentsForHost(host.id);

  // Cancelled bookings are refunded — exclude their payments from earnings.
  const cancelledIds = new Set(
    bookings.filter((b) => b.status === "cancelled").map((b) => b.id)
  );
  const isRefunded = (p: (typeof payments)[number]) =>
    p.payoutStatus === "refunded" || cancelledIds.has(p.bookingId);
  const earnedPayments = payments.filter((p) => !isRefunded(p));
  const lifetimeEarnings = earnedPayments.reduce((s, p) => s + p.split.hostPayout, 0);
  const pendingPayouts = earnedPayments
    .filter((p) => p.payoutStatus !== "paid")
    .reduce((s, p) => s + p.split.hostPayout, 0);
  const refundedPayoutTotal = payments
    .filter(isRefunded)
    .reduce((s, p) => s + p.split.hostPayout, 0);

  const spaceMap = new Map(spaces.map((s) => [s.id, s]));
  const paymentMeta = new Map(
    bookings.map((b) => [
      b.id,
      { reference: b.reference, spaceTitle: spaceMap.get(b.spaceId)?.title },
    ])
  );

  // Full history, newest first, grouped by calendar month with a subtotal
  // (refunded payouts don't count towards the month's total).
  const localeTag =
    { en: "en-GB", ur: "ur-PK", hi: "hi-IN", de: "de-DE", zh: "zh-CN" }[locale] ?? "en-GB";
  const sorted = [...payments].sort(
    (a, b) => +new Date(b.createdAt) - +new Date(a.createdAt)
  );
  type Group = {
    key: string;
    label: string;
    total: number;
    items: typeof payments;
  };
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
    if (!isRefunded(p)) g.total += p.split.hostPayout;
  }

  // Stripe Connect payout status (only when Stripe is configured).
  const stripeOn = isStripeConfigured();
  const payoutStatus =
    stripeOn && host.payoutAccountRef ? await getConnectStatus(host.payoutAccountRef) : null;
  const payoutsReady = !!payoutStatus?.chargesEnabled;

  return (
    <PortalShell user={user} nav={hostNav} title="host.section.payouts">
      <div className="mx-auto max-w-3xl space-y-6">
        <Link href="/host" className="text-sm font-semibold text-brand-600">
          ← {t("common.backToDash")}
        </Link>

        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-2xl font-extrabold text-navy-900">
              {t("host.section.payouts")}
            </h2>
            <p className="text-sm text-navy-500">{t("host.pay.intro")}</p>
          </div>
          <a
            href="/host/export"
            className={buttonVariants({ variant: "outline", size: "sm" })}
          >
            <Download className="h-4 w-4" /> {t("host.export")}
          </a>
        </div>

        {/* Money at a glance */}
        <div className="flex flex-wrap gap-2 text-sm">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-accent-50 px-3 py-1 font-semibold text-accent-500">
            {t("host.pay.summary.pending")}{" "}
            <span className="font-bold">{formatMoney(pendingPayouts)}</span>
          </span>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-go-50 px-3 py-1 font-semibold text-go-700">
            {t("host.pay.summary.paid")}{" "}
            <span className="font-bold">{formatMoney(lifetimeEarnings - pendingPayouts)}</span>
          </span>
          {refundedPayoutTotal > 0 && (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-navy-50 px-3 py-1 font-semibold text-navy-500">
              {t("host.pay.summary.refunded")}{" "}
              <span className="font-bold">{formatMoney(refundedPayoutTotal)}</span>
            </span>
          )}
        </div>

        {/* Payout account (Stripe Connect) */}
        {stripeOn && (
          <Card className="flex flex-wrap items-center justify-between gap-3 p-5">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-go-50 text-go-600">
                <Banknote className="h-5 w-5" />
              </div>
              <div>
                <div className="font-bold text-navy-900">{t("host.payouts.title")}</div>
                <div className="text-sm text-navy-500">
                  {payoutsReady
                    ? t("host.payouts.connected")
                    : host.payoutAccountRef
                      ? t("host.payouts.finish")
                      : t("host.payouts.setup")}
                </div>
              </div>
            </div>
            {payoutsReady ? (
              <Badge tone="go">
                <BadgeCheck className="h-3.5 w-3.5" /> {t("host.payouts.badge")}
              </Badge>
            ) : (
              <form action={connectPayoutsAction}>
                <button type="submit" className={buttonVariants({ size: "sm" })}>
                  {host.payoutAccountRef ? t("host.payouts.finishBtn") : t("host.payouts.setupBtn")}
                </button>
              </form>
            )}
          </Card>
        )}

        {/* Full history, month by month */}
        {groups.length === 0 ? (
          <Card className="p-8 text-center text-sm text-navy-500">
            {t("host.pay.none")}
          </Card>
        ) : (
          groups.map((g) => (
            <section key={g.key}>
              <div className="mb-2 flex items-baseline justify-between gap-2">
                <h3 className="font-bold text-navy-900">{g.label}</h3>
                <span className="flex items-baseline gap-3">
                  <a
                    href={`/host/export?month=${g.key}`}
                    className="text-xs font-semibold text-brand-600 hover:underline"
                  >
                    {t("host.pay.statement")}
                  </a>
                  <span className="text-sm font-bold text-navy-500">
                    {formatMoney(g.total)}
                  </span>
                </span>
              </div>
              <Card className="divide-y divide-navy-100">
                {g.items.map((p) => {
                  const refunded = isRefunded(p);
                  const meta = paymentMeta.get(p.bookingId);
                  return (
                    <div key={p.id} className="flex items-center justify-between gap-3 p-4">
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-baseline gap-x-2">
                          <span
                            className={
                              refunded
                                ? "text-sm font-semibold text-navy-300 line-through"
                                : "text-sm font-semibold text-navy-900"
                            }
                          >
                            {formatMoney(p.split.hostPayout, p.currency)}
                          </span>
                          {meta?.reference && (
                            <span className="font-mono text-xs font-bold text-navy-500">
                              {meta.reference}
                            </span>
                          )}
                        </div>
                        <div className="truncate text-xs text-navy-400">
                          {formatDate(p.createdAt)}
                          {meta?.spaceTitle ? ` · ${meta.spaceTitle}` : ""}
                        </div>
                      </div>
                      <StatusBadge status={refunded ? "refunded" : p.payoutStatus} />
                    </div>
                  );
                })}
              </Card>
            </section>
          ))
        )}

        <p className="text-xs text-navy-400">{t("host.payoutsNote")}</p>
      </div>
    </PortalShell>
  );
}
