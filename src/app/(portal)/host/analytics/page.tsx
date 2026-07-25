import Link from "next/link";
import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { ChartSpline, Eye, Trophy } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PortalShell } from "@/components/portal/shell";
import { hostNav } from "@/components/portal/navs";
import { requireRole } from "@/lib/auth";
import { ensureHostForUser, getSpacesForHost } from "@/lib/data/hosts";
import { listBookingsForHost } from "@/lib/data/bookings";
import { countViewsSince } from "@/lib/data/space-views";
import { formatMoney } from "@/lib/utils";
import { getI18n } from "@/lib/i18n";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Host analytics",
  path: "/host/analytics",
  noindex: true,
});

const EARNING_STATUSES = new Set(["paid", "active", "completed", "reviewed"]);

/** Earnings history, best month, and per-listing conversion for the host. */
export default async function HostAnalyticsPage() {
  const user = await requireRole("host");
  if (user.cohostHostId) redirect("/host/today");
  const { t, locale } = await getI18n();
  const localeTag =
    { en: "en-GB", ur: "ur-PK", hi: "hi-IN", de: "de-DE", zh: "zh-CN" }[locale] ?? "en-GB";
  const host = await ensureHostForUser(user);
  const [bookings, spaces] = await Promise.all([
    listBookingsForHost(host.id),
    getSpacesForHost(host.id),
  ]);

  const counted = bookings.filter(
    (b) => EARNING_STATUSES.has(b.status) && b.approval !== "pending"
  );

  // Last six months of host-share earnings, oldest first.
  const now = new Date();
  const months: { key: string; label: string; total: number; count: number }[] = [];
  for (let i = 5; i >= 0; i--) {
    const d = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - i, 1));
    months.push({
      key: d.toISOString().slice(0, 7),
      label: d.toLocaleDateString(localeTag, { month: "short", timeZone: "UTC" }),
      total: 0,
      count: 0,
    });
  }
  const monthMap = new Map(months.map((m) => [m.key, m]));
  for (const b of counted) {
    const m = monthMap.get(b.startAt.slice(0, 7));
    if (m) {
      m.total += b.price.split.hostPayout;
      m.count += 1;
    }
  }
  const maxTotal = Math.max(1, ...months.map((m) => m.total));
  const best = months.reduce((a, b) => (b.total > a.total ? b : a), months[0]);

  // Views → bookings conversion, last 30 days.
  const since30 = new Date(Date.now() - 30 * 86_400_000).toISOString();
  const views = await countViewsSince(spaces.map((s) => s.id), since30);
  const bookings30 = new Map<string, number>();
  for (const b of counted) {
    if (b.createdAt >= since30) {
      bookings30.set(b.spaceId, (bookings30.get(b.spaceId) ?? 0) + 1);
    }
  }

  // Occupancy this month: days with at least one confirmed booking.
  const monthStart = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1));
  const daysInMonth = new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 1, 0)
  ).getUTCDate();
  const occupancyPct = (spaceId: string): number => {
    const covered = new Set<number>();
    for (const b of counted) {
      if (b.spaceId !== spaceId) continue;
      const start = new Date(b.startAt);
      const end = new Date(b.endAt);
      for (let d = 1; d <= daysInMonth; d++) {
        const day = new Date(Date.UTC(monthStart.getUTCFullYear(), monthStart.getUTCMonth(), d));
        if (start <= new Date(day.getTime() + 86_399_000) && end >= day) covered.add(d);
      }
    }
    return Math.round((covered.size / daysInMonth) * 100);
  };

  return (
    <PortalShell user={user} nav={hostNav} title="host.analytics.title">
      <div className="mx-auto max-w-4xl space-y-5">
        <Link href="/host" className="text-sm font-semibold text-brand-700">
          ← {t("common.backToDash")}
        </Link>

        <div className="flex items-center gap-2">
          <h2 className="flex items-center gap-2 text-xl font-extrabold text-navy-900">
            <ChartSpline className="h-5 w-5 text-brand-700" /> {t("host.analytics.title")}
          </h2>
        </div>
        <p className="text-sm text-navy-500">{t("host.analytics.sub")}</p>

        {/* Six-month earnings bar chart */}
        <Card className="p-6" data-earnings-chart>
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h3 className="text-sm font-bold text-navy-900">{t("host.analytics.chartTitle")}</h3>
            {best.total > 0 && (
              <Badge tone="go">
                <Trophy className="mr-1 inline h-3.5 w-3.5" />
                {t("host.analytics.bestMonth")}: {best.label} · {formatMoney(best.total)}
              </Badge>
            )}
          </div>
          <div className="mt-4 flex items-end gap-3">
            {months.map((m) => (
              <div key={m.key} className="flex flex-1 flex-col items-center gap-1.5">
                <span className="text-[11px] font-semibold text-navy-600">
                  {m.total > 0 ? formatMoney(m.total) : ""}
                </span>
                <div
                  className={`w-full rounded-t-lg ${m.total > 0 ? "bg-brand-500" : "bg-navy-100"}`}
                  style={{ height: `${Math.max(6, Math.round((m.total / maxTotal) * 120))}px` }}
                  title={`${m.label} · ${formatMoney(m.total)}`}
                />
                <span className="text-xs text-navy-500">{m.label}</span>
              </div>
            ))}
          </div>
        </Card>

        {/* Per-listing performance */}
        <Card className="p-6">
          <h3 className="text-sm font-bold text-navy-900">{t("host.analytics.perListing")}</h3>
          {spaces.length === 0 ? (
            <p className="mt-3 text-sm text-navy-400">{t("host.analytics.noListings")}</p>
          ) : (
            <div className="mt-3 overflow-x-auto">
              <table className="w-full min-w-[560px] text-left text-sm">
                <thead>
                  <tr className="border-b border-navy-100 text-xs uppercase tracking-wide text-navy-400">
                    <th className="py-2 pr-3">{t("host.analytics.col.listing")}</th>
                    <th className="py-2 pr-3">{t("host.analytics.col.bookings")}</th>
                    <th className="py-2 pr-3">{t("host.analytics.col.earnings")}</th>
                    <th className="py-2 pr-3">{t("host.analytics.col.occupancy")}</th>
                    <th className="py-2 pr-3">
                      <Eye className="mr-1 inline h-3.5 w-3.5" />
                      {t("host.analytics.col.views")}
                    </th>
                    <th className="py-2">{t("host.analytics.col.conversion")}</th>
                  </tr>
                </thead>
                <tbody>
                  {spaces.map((s) => {
                    const mine = counted.filter((b) => b.spaceId === s.id);
                    const earned = mine.reduce((sum, b) => sum + b.price.split.hostPayout, 0);
                    const v = views.get(s.id) ?? 0;
                    const b30 = bookings30.get(s.id) ?? 0;
                    const conv = v > 0 ? Math.round((b30 / v) * 100) : null;
                    return (
                      <tr key={s.id} className="border-b border-navy-50">
                        <td className="max-w-[220px] truncate py-2.5 pr-3 font-semibold text-navy-800">
                          {s.title}
                        </td>
                        <td className="py-2.5 pr-3">{mine.length}</td>
                        <td className="py-2.5 pr-3 font-semibold">{formatMoney(earned)}</td>
                        <td className="py-2.5 pr-3">{occupancyPct(s.id)}%</td>
                        <td className="py-2.5 pr-3">{v}</td>
                        <td className="py-2.5">
                          {conv === null ? (
                            <span className="text-navy-400">—</span>
                          ) : (
                            <Badge tone={conv >= 10 ? "go" : "neutral"}>{conv}%</Badge>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
          <p className="mt-2 text-xs text-navy-400">{t("host.analytics.note")}</p>
        </Card>
      </div>
    </PortalShell>
  );
}
