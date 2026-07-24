import Link from "next/link";
import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { Logo } from "@/components/brand/logo";
import { PrintButton } from "@/components/common/print-button";
import { requireRole } from "@/lib/auth";
import { ensureHostForUser, getSpacesForHost } from "@/lib/data/hosts";
import { listBookingsForHost } from "@/lib/data/bookings";
import { formatDate, formatMoney } from "@/lib/utils";
import { getI18n } from "@/lib/i18n";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Monthly statement",
  path: "/host/statement",
  noindex: true,
});

const EARNING_STATUSES = new Set(["paid", "active", "completed", "reviewed"]);

/**
 * Print-friendly monthly self-billing statement (use the browser's
 * "Save as PDF"). Bookings by drop-off date; amounts are the host share.
 */
export default async function HostStatementPage({
  searchParams,
}: {
  searchParams: Promise<{ month?: string }>;
}) {
  const user = await requireRole("host");
  if (user.cohostHostId) redirect("/host/today");
  const { t, locale } = await getI18n();
  const localeTag =
    { en: "en-GB", ur: "ur-PK", hi: "hi-IN", de: "de-DE", zh: "zh-CN" }[locale] ?? "en-GB";
  const host = await ensureHostForUser(user);

  const { month: rawMonth } = await searchParams;
  const month =
    rawMonth && /^\d{4}-\d{2}$/.test(rawMonth)
      ? rawMonth
      : new Date().toISOString().slice(0, 7);
  const monthLabel = new Date(`${month}-01T00:00:00Z`).toLocaleDateString(localeTag, {
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  });

  const [bookings, spaces] = await Promise.all([
    listBookingsForHost(host.id),
    getSpacesForHost(host.id),
  ]);
  const spaceMap = new Map(spaces.map((s) => [s.id, s]));
  const rows = bookings
    .filter(
      (b) =>
        b.startAt.slice(0, 7) === month &&
        EARNING_STATUSES.has(b.status) &&
        b.approval !== "pending"
    )
    .sort((a, b) => a.startAt.localeCompare(b.startAt));

  // Totals per currency (GBP and EUR listings can coexist).
  const totals = new Map<string, number>();
  for (const b of rows) {
    totals.set(
      b.price.currency,
      (totals.get(b.price.currency) ?? 0) + b.price.split.hostPayout
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-6 py-10 print:max-w-none print:p-0">
      <div className="mb-6 flex items-center justify-between gap-3 print:hidden">
        <Link href="/host/payouts" className="text-sm font-semibold text-brand-600">
          ← {t("host.statement.back")}
        </Link>
        <PrintButton label={t("host.statement.print")} />
      </div>

      <div className="rounded-3xl border border-navy-100 bg-white p-8 print:rounded-none print:border-0 print:p-0">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <Logo />
            <p className="mt-2 text-xs text-navy-400">
              PARKGO LIMITED · www.parkgo.ai
            </p>
          </div>
          <div className="text-right">
            <h1 className="text-lg font-extrabold text-navy-900">
              {t("host.statement.title")}
            </h1>
            <p className="text-sm text-navy-500" data-statement-month>
              {monthLabel}
            </p>
          </div>
        </div>

        <div className="mt-6 grid gap-1 text-sm text-navy-700">
          <p className="font-bold text-navy-900">{host.displayName}</p>
          {host.bankSort && host.bankAccount && (
            <p className="text-xs text-navy-400">
              {t("host.statement.paidTo")} ··{host.bankSort.slice(-2)} / ····
              {host.bankAccount.slice(-4)}
            </p>
          )}
        </div>

        {rows.length === 0 ? (
          <p className="mt-8 text-sm text-navy-400">{t("host.statement.empty")}</p>
        ) : (
          <table className="mt-6 w-full text-left text-sm">
            <thead>
              <tr className="border-b border-navy-100 text-xs uppercase tracking-wide text-navy-400">
                <th className="py-2 pr-3">{t("host.statement.col.ref")}</th>
                <th className="py-2 pr-3">{t("host.statement.col.space")}</th>
                <th className="py-2 pr-3">{t("host.statement.col.dates")}</th>
                <th className="py-2 text-right">{t("host.statement.col.amount")}</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((b) => (
                <tr key={b.id} className="border-b border-navy-50">
                  <td className="py-2.5 pr-3 font-mono text-xs">{b.reference}</td>
                  <td className="max-w-[200px] truncate py-2.5 pr-3">
                    {spaceMap.get(b.spaceId)?.title ?? "—"}
                  </td>
                  <td className="py-2.5 pr-3 text-xs text-navy-500">
                    {formatDate(b.startAt)} → {formatDate(b.endAt)}
                  </td>
                  <td className="py-2.5 text-right font-semibold">
                    {formatMoney(b.price.split.hostPayout, b.price.currency)}
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              {[...totals.entries()].map(([currency, total]) => (
                <tr key={currency}>
                  <td colSpan={3} className="py-3 pr-3 text-right font-bold text-navy-900">
                    {t("host.statement.total")} ({currency})
                  </td>
                  <td className="py-3 text-right text-base font-extrabold text-navy-900">
                    {formatMoney(total, currency as "GBP" | "EUR")}
                  </td>
                </tr>
              ))}
            </tfoot>
          </table>
        )}

        <p className="mt-8 text-xs text-navy-400">{t("host.statement.note")}</p>
      </div>
    </div>
  );
}
