import Link from "next/link";
import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { Download } from "lucide-react";
import { Logo } from "@/components/brand/logo";
import { PrintButton } from "@/components/common/print-button";
import { requireRole } from "@/lib/auth";
import { ensureHostForUser, getSpacesForHost } from "@/lib/data/hosts";
import { listBookingsForHost } from "@/lib/data/bookings";
import {
  buildHostStatement,
  periodYearLabel,
  type StatementPeriod,
} from "@/lib/statement";
import { formatDate, formatMoney } from "@/lib/utils";
import { getI18n } from "@/lib/i18n";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Earnings statement",
  path: "/host/statement",
  noindex: true,
});

/**
 * Print-friendly self-billing statement (use the browser's "Save as PDF"),
 * with a CSV twin at /host/statement.csv. Three period shapes: a month (the
 * original), a calendar year, or a UK tax year (6 Apr → 5 Apr) — the one an
 * accountant asks for at self-assessment time.
 */
export default async function HostStatementPage({
  searchParams,
}: {
  searchParams: Promise<{ month?: string; year?: string; basis?: string }>;
}) {
  const user = await requireRole("host");
  if (user.cohostHostId) redirect("/host/today");
  const { t, locale } = await getI18n();
  const localeTag =
    { en: "en-GB", ur: "ur-PK", hi: "hi-IN", de: "de-DE", zh: "zh-CN" }[locale] ?? "en-GB";
  const host = await ensureHostForUser(user);

  const sp = await searchParams;
  const now = new Date();
  const thisYear = now.getUTCFullYear();

  // Which period: ?year=2026 (+ &basis=tax) beats ?month=YYYY-MM beats "this month".
  const yearRaw = Number.parseInt(sp.year ?? "", 10);
  const year = Number.isFinite(yearRaw) && yearRaw >= 2020 && yearRaw <= thisYear + 1 ? yearRaw : null;
  const period: StatementPeriod = year
    ? sp.basis === "tax"
      ? { kind: "tax", year }
      : { kind: "calendar", year }
    : {
        kind: "month",
        month:
          sp.month && /^\d{4}-\d{2}$/.test(sp.month) ? sp.month : now.toISOString().slice(0, 7),
      };

  const periodLabel =
    period.kind === "month"
      ? new Date(`${period.month}-01T00:00:00Z`).toLocaleDateString(localeTag, {
          month: "long",
          year: "numeric",
          timeZone: "UTC",
        })
      : `${period.kind === "tax" ? t("host.statement.taxYear") : t("host.statement.calendarYear")} ${periodYearLabel(period)}`;

  const [bookings, spaces] = await Promise.all([
    listBookingsForHost(host.id),
    getSpacesForHost(host.id),
  ]);
  const statement = buildHostStatement(bookings, spaces, period);

  const csvHref =
    period.kind === "month"
      ? `/host/statement.csv?month=${period.month}`
      : `/host/statement.csv?year=${period.year}&basis=${period.kind}`;

  // The period rail: this month, the last two calendar years, the last two
  // UK tax years. Links, so every statement has a shareable URL.
  const picks: { href: string; label: string; active: boolean }[] = [
    {
      href: "/host/statement",
      label: t("host.statement.thisMonth"),
      active: period.kind === "month",
    },
    ...[thisYear, thisYear - 1].map((y) => ({
      href: `/host/statement?year=${y}`,
      label: String(y),
      active: period.kind === "calendar" && period.year === y,
    })),
    ...[thisYear, thisYear - 1].map((y) => ({
      href: `/host/statement?year=${y}&basis=tax`,
      label: `${t("host.statement.taxShort")} ${periodYearLabel({ kind: "tax", year: y })}`,
      active: period.kind === "tax" && period.year === y,
    })),
  ];

  return (
    <div className="mx-auto max-w-3xl px-6 py-10 print:max-w-none print:p-0">
      <div className="mb-4 flex items-center justify-between gap-3 print:hidden">
        <Link href="/host/payouts" className="text-sm font-semibold text-brand-700">
          ← {t("host.statement.back")}
        </Link>
        <div className="flex items-center gap-2">
          <a
            href={csvHref}
            className="inline-flex items-center gap-1.5 rounded-xl border border-navy-200 bg-white px-3.5 py-2 text-sm font-semibold text-navy-700 hover:border-brand-400 hover:text-brand-700"
            data-statement-csv
          >
            <Download className="h-4 w-4" /> CSV
          </a>
          <PrintButton label={t("host.statement.print")} />
        </div>
      </div>

      <div className="mb-6 flex flex-wrap gap-1.5 print:hidden" data-statement-periods>
        {picks.map((p) => (
          <Link
            key={p.href}
            href={p.href}
            className={`rounded-full px-3 py-1.5 text-xs font-semibold transition ${
              p.active
                ? "bg-navy-900 text-white"
                : "bg-white text-navy-600 ring-1 ring-navy-200 hover:text-brand-700"
            }`}
          >
            {p.label}
          </Link>
        ))}
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
              {periodLabel}
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

        {statement.rows.length === 0 ? (
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
              {statement.rows.map((r) => (
                <tr key={r.reference} className="border-b border-navy-50">
                  <td className="py-2.5 pr-3 font-mono text-xs">{r.reference}</td>
                  <td className="max-w-[200px] truncate py-2.5 pr-3">{r.spaceTitle}</td>
                  <td className="py-2.5 pr-3 text-xs text-navy-500">
                    {formatDate(r.startAt)} → {formatDate(r.endAt)}
                  </td>
                  <td className="py-2.5 text-right font-semibold">
                    {formatMoney(r.amount, r.currency)}
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              {[...statement.totals.entries()].map(([currency, total]) => (
                <tr key={currency} data-statement-total>
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
