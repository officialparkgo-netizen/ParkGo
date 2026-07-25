import Link from "next/link";
import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { BadgeCheck, Banknote, CheckCircle2, Download, FileSpreadsheet, Landmark, Users, XCircle } from "lucide-react";
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
import { saveHostBankAction } from "@/lib/host-suite-actions";
import { listWaitlist } from "@/lib/data/waitlist";
import { CopyLinkButton } from "@/components/common/copy-link-button";
import { isStripeConfigured, getConnectStatus } from "@/lib/stripe";
import { getI18n } from "@/lib/i18n";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Payouts",
  path: "/host/payouts",
  noindex: true,
});

export default async function HostPayoutsPage({
  searchParams,
}: {
  searchParams: Promise<{ bank?: string }>;
}) {
  const user = await requireRole("host");
  if (user.cohostHostId) redirect("/host/today"); // co-hosts never see money
  const { t, locale } = await getI18n();
  const { bank } = await searchParams;
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
      { reference: b.reference, spaceTitle: spaceMap.get(b.spaceId)?.title, endAt: b.endAt },
    ])
  );

  // Protection window: pending payouts show when the money unlocks.
  const { getPlatformSettings } = await import("@/lib/data/settings");
  const { isPayoutReleasable, payoutAvailableAt } = await import("@/lib/payouts");
  const holdDays = (await getPlatformSettings()).payoutHoldDays;

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

  // UK tax years (6 Apr – 5 Apr): current + previous, for self-assessment.
  const now = new Date();
  const taxYearStart =
    now.getMonth() > 3 || (now.getMonth() === 3 && now.getDate() >= 6)
      ? now.getFullYear()
      : now.getFullYear() - 1;
  const taxYears = [taxYearStart, taxYearStart - 1];

  // Host referrals: waitlist signups that arrived via this host's link.
  const referred = (await listWaitlist().catch(() => [])).filter(
    (w) => w.referredBy === user.id
  ).length;
  const referralLink = `https://www.parkgo.ai/hosts?ref=${user.id}`;

  return (
    <PortalShell user={user} nav={hostNav} title="host.section.payouts">
      <div className="mx-auto max-w-3xl space-y-6">
        <Link href="/host" className="text-sm font-semibold text-brand-700">
          ← {t("common.backToDash")}
        </Link>

        {bank === "saved" && (
          <div className="flex items-center gap-2 rounded-2xl border border-go-200 bg-go-50 px-4 py-3 font-semibold text-go-700">
            <CheckCircle2 className="h-5 w-5" /> {t("host.bank.saved")}
          </div>
        )}
        {bank === "invalid" && (
          <div className="flex items-center gap-2 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 font-semibold text-red-700">
            <XCircle className="h-5 w-5" /> {t("host.bank.invalid")}
          </div>
        )}

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
          <span className="inline-flex items-center gap-1.5 rounded-full bg-accent-50 px-3 py-1 font-semibold text-accent-700">
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

        {/* Manual payout bank details (pre-Stripe) */}
        {!payoutsReady && (
          <Card className="p-5">
            <h3 className="flex items-center gap-2 text-sm font-bold text-navy-900">
              <Landmark className="h-4 w-4 text-navy-500" /> {t("host.bank.title")}
            </h3>
            <p className="mt-0.5 text-sm text-navy-500">{t("host.bank.sub")}</p>
            {host.bankAccount && (
              <p className="mt-2 text-sm font-semibold text-go-700">
                {t("host.bank.onFile")} ····{host.bankAccount.slice(-4)}
              </p>
            )}
            <form
              action={saveHostBankAction}
              className="mt-3 flex flex-wrap items-end gap-2"
            >
              <label className="text-xs font-semibold text-navy-600">
                {t("host.bank.sort")}
                <input
                  name="bankSort"
                  inputMode="numeric"
                  placeholder="04-00-04"
                  required
                  className="mt-1 block h-10 w-28 rounded-xl border border-navy-200 bg-white px-3 font-mono text-sm"
                />
              </label>
              <label className="text-xs font-semibold text-navy-600">
                {t("host.bank.account")}
                <input
                  name="bankAccount"
                  inputMode="numeric"
                  placeholder="12345678"
                  required
                  className="mt-1 block h-10 w-36 rounded-xl border border-navy-200 bg-white px-3 font-mono text-sm"
                />
              </label>
              <button
                type="submit"
                className={buttonVariants({ size: "sm" })}
              >
                {t("host.bank.save")}
              </button>
            </form>
            <p className="mt-2 text-xs text-navy-400">{t("host.bank.note")}</p>
          </Card>
        )}

        {/* Tax-year statements (UK: 6 Apr – 5 Apr) */}
        <Card className="flex flex-wrap items-center justify-between gap-3 p-5">
          <div>
            <h3 className="flex items-center gap-2 text-sm font-bold text-navy-900">
              <FileSpreadsheet className="h-4 w-4 text-navy-500" /> {t("host.tax.title")}
            </h3>
            <p className="mt-0.5 text-sm text-navy-500">{t("host.tax.sub")}</p>
          </div>
          <div className="flex flex-wrap gap-2">
            {taxYears.map((y) => (
              <a
                key={y}
                href={`/host/export?taxyear=${y}`}
                className={buttonVariants({ variant: "outline", size: "sm" })}
              >
                <Download className="h-4 w-4" /> {y}/{String(y + 1).slice(-2)}
              </a>
            ))}
          </div>
        </Card>

        {/* Refer a host */}
        <Card className="p-5">
          <h3 className="flex items-center gap-2 text-sm font-bold text-navy-900">
            <Users className="h-4 w-4 text-navy-500" /> {t("host.ref.title")}
          </h3>
          <p className="mt-0.5 text-sm text-navy-500">
            {t("host.ref.sub")}
            {referred > 0 ? ` ${t("host.ref.count")} ${referred}.` : ""}
          </p>
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <code className="min-w-0 flex-1 truncate rounded-xl border border-navy-200 bg-navy-50/60 px-3 py-2.5 text-xs text-navy-700">
              {referralLink}
            </code>
            <CopyLinkButton
              value={referralLink}
              label={t("host.ref.copy")}
              copiedLabel={t("host.ref.copied")}
            />
          </div>
        </Card>

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
                    className="text-xs font-semibold text-brand-700 hover:underline"
                  >
                    {t("host.pay.statement")}
                  </a>
                  <a
                    href={`/host/statement?month=${g.key}`}
                    className="text-xs font-semibold text-brand-700 hover:underline"
                  >
                    {t("host.pay.pdf")}
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
                                ? "text-sm font-semibold text-navy-400 line-through"
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
                        {!refunded &&
                          p.payoutStatus !== "paid" &&
                          meta?.endAt &&
                          !isPayoutReleasable(meta.endAt, holdDays) && (
                            <div
                              className="mt-0.5 text-xs font-semibold text-accent-600"
                              data-payout-hold
                            >
                              {t("host.pay.availableFrom")}{" "}
                              {formatDate(payoutAvailableAt(meta.endAt, holdDays).toISOString())}
                            </div>
                          )}
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
