import Link from "next/link";
import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { ChartSpline, SearchX, TrendingUp } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PortalShell } from "@/components/portal/shell";
import { StatCard } from "@/components/portal/stat-card";
import { adminNav } from "@/components/portal/navs";
import { requireRole } from "@/lib/auth";
import { listSearchStats } from "@/lib/data/search-events";
import { listAllBookings } from "@/lib/data/bookings";
import { listAllSpaces } from "@/lib/data/hosts";
import { getAirport } from "@/lib/data/store";
import { getI18n } from "@/lib/i18n";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Analytics",
  path: "/admin/analytics",
  noindex: true,
});

/** Demand funnel: searches → zero-result gaps → bookings, per destination. */
export default async function AdminAnalyticsPage() {
  const user = await requireRole("admin");
  // Support agents live on the ticket queue — nothing else here is theirs.
  if (user.adminScope === "support") redirect("/admin/support");
  const { t } = await getI18n();

  const stats = await listSearchStats();
  const bookings = await listAllBookings();
  const spaces = await listAllSpaces();
  const spaceMap = new Map(spaces.map((s) => [s.id, s]));

  const bookingsByDest = new Map<string, number>();
  for (const b of bookings) {
    if (b.status === "cancelled" || b.status === "requested") continue;
    const slug = spaceMap.get(b.spaceId)?.airportSlug ?? "unknown";
    bookingsByDest.set(slug, (bookingsByDest.get(slug) ?? 0) + 1);
  }

  const totalSearches = stats.reduce((s, r) => s + r.searches, 0);
  const totalZero = stats.reduce((s, r) => s + r.zeroResults, 0);
  const totalBookings = [...bookingsByDest.values()].reduce((s, n) => s + n, 0);
  const conversion =
    totalSearches > 0 ? Math.round((totalBookings / totalSearches) * 100) : 0;

  // Destinations searched but never booked (or with zero-result searches) float up.
  const rows = stats.map((r) => {
    const booked = bookingsByDest.get(r.airportSlug) ?? 0;
    return {
      ...r,
      name: getAirport(r.airportSlug)?.name ?? r.destName,
      booked,
      conv: r.searches > 0 ? Math.round((booked / r.searches) * 100) : 0,
    };
  });

  return (
    <PortalShell user={user} nav={adminNav} title="admin.analytics.title">
      <div className="mx-auto max-w-4xl space-y-6">
        <Link href="/admin" className="text-sm font-semibold text-brand-600">
          ← {t("common.backToDash")}
        </Link>

        <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
          <StatCard
            label={t("admin.analytics.searches")}
            value={String(totalSearches)}
            sub={t("admin.analytics.searchesSub")}
            icon={ChartSpline}
            tone="brand"
          />
          <StatCard
            label={t("admin.analytics.zero")}
            value={
              totalSearches > 0
                ? `${Math.round((totalZero / totalSearches) * 100)}%`
                : "0%"
            }
            sub={`${totalZero} ${t("admin.analytics.zeroSub")}`}
            icon={SearchX}
            tone="accent"
          />
          <StatCard
            label={t("admin.stat.bookings")}
            value={String(totalBookings)}
            sub={t("admin.analytics.bookingsSub")}
            icon={TrendingUp}
            tone="go"
          />
          <StatCard
            label={t("admin.analytics.conversion")}
            value={`${conversion}%`}
            sub={t("admin.analytics.conversionSub")}
            icon={TrendingUp}
            tone="navy"
          />
        </div>

        <section id="funnel">
          <div className="mb-3 flex items-center gap-2">
            <h3 className="flex items-center gap-2 text-lg font-bold text-navy-900">
              <ChartSpline className="h-5 w-5 text-navy-500" />{" "}
              {t("admin.analytics.byDest")}
            </h3>
            <Badge tone="neutral">{rows.length}</Badge>
          </div>
          {rows.length === 0 ? (
            <Card className="p-8 text-center text-sm text-navy-500">
              {t("admin.analytics.empty")}
            </Card>
          ) : (
            <Card className="divide-y divide-navy-100">
              <div className="grid grid-cols-4 gap-2 px-4 py-2.5 text-xs font-bold uppercase tracking-wide text-navy-400">
                <span>{t("admin.analytics.dest")}</span>
                <span className="text-end">{t("admin.analytics.searches")}</span>
                <span className="text-end">{t("admin.analytics.zeroCol")}</span>
                <span className="text-end">{t("admin.analytics.bookedConv")}</span>
              </div>
              {rows.map((r) => (
                <div
                  key={r.airportSlug}
                  className="grid grid-cols-4 items-center gap-2 px-4 py-3 text-sm"
                >
                  <span className="truncate font-semibold text-navy-900">{r.name}</span>
                  <span className="text-end text-navy-700">{r.searches}</span>
                  <span
                    className={`text-end font-semibold ${
                      r.zeroResults > 0 ? "text-accent-500" : "text-navy-400"
                    }`}
                  >
                    {r.zeroResults}
                  </span>
                  <span className="text-end text-navy-700">
                    {r.booked} · {r.conv}%
                  </span>
                </div>
              ))}
            </Card>
          )}
          <p className="mt-2 text-xs text-navy-400">{t("admin.analytics.note")}</p>
        </section>
      </div>
    </PortalShell>
  );
}
