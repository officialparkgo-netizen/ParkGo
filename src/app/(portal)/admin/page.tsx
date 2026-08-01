import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import {
  ArrowUpRight,
  Banknote,
  CalendarCheck,
  ChevronRight,
  Globe,
  History,
  LayoutGrid,
  Search,
  ShieldAlert,
  TrendingUp,
  Users,
  Warehouse,
  XCircle,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { PortalShell } from "@/components/portal/shell";
import { StatusBadge } from "@/components/portal/status";
import { StatCard } from "@/components/portal/stat-card";
import { EarningsChart } from "@/components/portal/earnings-chart";
import { adminNav } from "@/components/portal/navs";
import { requireRole, requireOpsAdmin } from "@/lib/auth";
import { getAirport } from "@/lib/data/store";
import { getHostsByIds, listAllSpaces } from "@/lib/data/hosts";
import { listPendingVerificationsLive } from "@/lib/data/verifications";
import {
  listAllBookings,
  listAllPayments,
  listBookingsByReferences,
} from "@/lib/data/bookings";
import { notificationRefs, notificationTarget } from "@/lib/notification-target";
import { listNotificationsForUser } from "@/lib/data/notifications";
import { getUsersByIds, listAllUsers } from "@/lib/data/users";
import { listSupportTickets } from "@/lib/data/support";
import { formatDate, formatDateTime, formatMoney } from "@/lib/utils";
import { getI18n } from "@/lib/i18n";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({ title: "Admin", path: "/admin", noindex: true });

export default async function AdminDashboard({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; range?: string }>;
}) {
  const user = await requireOpsAdmin();
  // Support agents live on the ticket queue — nothing else here is theirs.
  if (user.adminScope === "support") redirect("/admin/support");
  const { t, locale } = await getI18n();
  const { q: qRaw, range: rangeRaw } = await searchParams;

  // Time window for the money/booking metrics (?range=7d|30d|90d, default all).
  const RANGES = ["7d", "30d", "90d"] as const;
  const range = (RANGES as readonly string[]).includes(rangeRaw ?? "")
    ? (rangeRaw as (typeof RANGES)[number])
    : null;
  const rangeCutoff = range
    ? Date.now() - Number(range.replace("d", "")) * 86_400_000
    : null;
  const inRange = (iso: string) => rangeCutoff === null || +new Date(iso) >= rangeCutoff;
  const pending = await listPendingVerificationsLive();
  const spaces = await listAllSpaces();
  const spaceHostMap = await getHostsByIds(spaces.map((s) => s.hostId));
  const payments = await listAllPayments();
  const bookings = await listAllBookings();

  // Refunded payments (cancelled bookings) are excluded from GMV/payouts.
  const cancelledBookingIds = new Set(
    bookings.filter((b) => b.status === "cancelled").map((b) => b.id)
  );
  const isRefunded = (p: (typeof payments)[number]) =>
    p.payoutStatus === "refunded" || cancelledBookingIds.has(p.bookingId);
  const earnedPayments = payments.filter((p) => !isRefunded(p));
  // Range-scoped money view; payouts due stays all-time (outstanding balance).
  const rangeEarned = earnedPayments.filter((p) => inRange(p.createdAt));
  const refundedTotal = payments
    .filter((p) => isRefunded(p) && inRange(p.createdAt))
    .reduce((s, p) => s + p.amount, 0);

  const gmv = rangeEarned.reduce((s, p) => s + p.amount, 0);
  const platformRevenue = rangeEarned.reduce((s, p) => s + p.split.platform, 0);
  const payoutsDue = earnedPayments
    .filter((p) => p.payoutStatus !== "paid")
    .reduce((s, p) => s + p.split.hostPayout + p.split.driverPayout, 0);
  const liveCount = spaces.filter((s) => s.status === "live").length;
  const pendingListings = spaces.filter(
    (s) => s.status === "pending_review" || s.status === "draft"
  ).length;

  // People & bookings overview.
  const allUsers = await listAllUsers();
  const travellerCount = allUsers.filter((u) => u.role === "traveller").length;
  const hostCount = allUsers.filter((u) => u.role === "host").length;
  const rangeBookings = bookings.filter((b) => inRange(b.createdAt));
  const activeBookings = rangeBookings.filter(
    (b) => b.status === "paid" || b.status === "active"
  ).length;

  const rangeHref = (r?: string) => {
    const p = new URLSearchParams();
    if (qRaw) p.set("q", qRaw);
    if (r) p.set("range", r);
    const qs = p.toString();
    return `/admin${qs ? `?${qs}` : ""}`;
  };
  const travellerMap = await getUsersByIds(bookings.map((b) => b.travellerId));
  const spaceMap = new Map(spaces.map((s) => [s.id, s]));
  const supportTickets = await listSupportTickets().catch(() => []);

  // Global admin search (?q=): bookings, listings, users and tickets.
  const q = (qRaw ?? "").trim().toLowerCase();
  const contains = (s?: string | null) => !!s && s.toLowerCase().includes(q);
  const searchResults =
    q.length >= 2
      ? {
          bookings: bookings
            .filter(
              (b) =>
                contains(b.reference) ||
                contains(travellerMap.get(b.travellerId)?.name) ||
                contains(travellerMap.get(b.travellerId)?.email) ||
                contains(spaceMap.get(b.spaceId)?.title)
            )
            .slice(0, 6),
          spaces: spaces
            .filter(
              (s) =>
                contains(s.title) ||
                contains(spaceHostMap.get(s.hostId)?.displayName) ||
                contains(getAirport(s.airportSlug)?.name)
            )
            .slice(0, 6),
          users: allUsers.filter((u) => contains(u.name) || contains(u.email)).slice(0, 6),
          tickets: supportTickets
            .filter((tk) => contains(tk.email) || contains(tk.name) || contains(tk.topic))
            .slice(0, 4),
        }
      : null;
  const searchTotal = searchResults
    ? searchResults.bookings.length +
      searchResults.spaces.length +
      searchResults.users.length +
      searchResults.tickets.length
    : 0;

  // Money KPIs beyond raw GMV (all range-scoped).
  const avgBookingValue = rangeEarned.length ? Math.round(gmv / rangeEarned.length) : 0;
  const rangeCancelled = rangeBookings.filter((b) => b.status === "cancelled").length;
  const cancelRate = rangeBookings.length
    ? Math.round((rangeCancelled / rangeBookings.length) * 100)
    : 0;

  // Monthly GMV (last six months) + booking revenue per destination.
  const localeTag =
    { en: "en-GB", ur: "ur-PK", hi: "hi-IN", de: "de-DE", zh: "zh-CN", ar: "ar-AE" }[locale] ?? "en-GB";
  const monthKey = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
  const nowDate = new Date();
  const revenueMonths = Array.from({ length: 6 }, (_, i) => {
    const d = new Date(nowDate.getFullYear(), nowDate.getMonth() - (5 - i), 1);
    return { key: monthKey(d), label: d.toLocaleDateString(localeTag, { month: "short" }), value: 0 };
  });
  for (const pay of earnedPayments) {
    const m = revenueMonths.find((x) => x.key === monthKey(new Date(pay.createdAt)));
    if (m) m.value += pay.amount;
  }
  const destAgg = new Map<string, { name: string; count: number; revenue: number }>();
  for (const b of rangeBookings) {
    if (b.status === "cancelled" || b.status === "requested") continue;
    const sp = spaceMap.get(b.spaceId);
    const dest = sp ? getAirport(sp.airportSlug) : undefined;
    const key = dest?.slug ?? "unknown";
    const row = destAgg.get(key) ?? { name: dest?.name ?? "—", count: 0, revenue: 0 };
    row.count += 1;
    row.revenue += b.price.total;
    destAgg.set(key, row);
  }
  const topDests = [...destAgg.values()].sort((a, b) => b.revenue - a.revenue).slice(0, 6);
  const maxDestRevenue = Math.max(...topDests.map((d) => d.revenue), 1);
  const thisMonthRevenue = revenueMonths[5].value;
  const lastMonthRevenue = revenueMonths[4].value;
  const momPct =
    lastMonthRevenue > 0
      ? Math.round(((thisMonthRevenue - lastMonthRevenue) / lastMonthRevenue) * 100)
      : null;

  const alerts = (await listNotificationsForUser(user.id)).slice(0, 6);
  // Booking references the alerts mention → each row links to its booking.
  const alertRefs = new Map(
    (await listBookingsByReferences(notificationRefs(alerts))).map((b) => [b.reference, b])
  );

  return (
    <PortalShell user={user} nav={adminNav} title="admin.pageTitle">
      <div className="space-y-8">
        {/* Time range for the metrics below */}
        <div className="flex flex-wrap items-center gap-1.5">
          <History className="h-4 w-4 text-navy-400" aria-hidden />
          {[null, ...RANGES].map((r) => {
            const active = r === null ? !range : range === r;
            return (
              <Link
                key={r ?? "all"}
                href={rangeHref(r ?? undefined)}
                className={`shrink-0 rounded-full border px-3 py-1.5 text-xs font-semibold transition-colors ${
                  active
                    ? "border-navy-900 bg-navy-900 text-white"
                    : "border-navy-200 bg-white text-navy-600 hover:bg-navy-50"
                }`}
              >
                {r ? t(`admin.range.${r}`) : t("admin.range.all")}
              </Link>
            );
          })}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
          <StatCard label={t("admin.stat.hostReview")} value={String(pending.length)} sub={t("admin.stat.hostReviewSub")} icon={ShieldAlert} tone="accent" />
          <StatCard label={t("admin.stat.liveListings")} value={String(liveCount)} sub={`${spaces.length} ${t("admin.total")}`} icon={Warehouse} tone="brand" />
          <StatCard
            label={t("admin.stat.users")}
            value={String(allUsers.length)}
            sub={`${travellerCount} ${t("admin.stat.travellers")} · ${hostCount} ${t("admin.stat.hosts")}`}
            icon={Users}
            tone="navy"
          />
          <StatCard
            label={t("admin.stat.bookings")}
            value={String(rangeBookings.length)}
            sub={`${activeBookings} ${t("admin.stat.bookingsActive")}`}
            icon={CalendarCheck}
            tone="brand"
          />
          <StatCard
            label={t("admin.stat.gmv")}
            value={formatMoney(gmv)}
            sub={`${formatMoney(platformRevenue)} ${t("admin.stat.gmvSub")}${
              refundedTotal > 0 ? ` · ${formatMoney(refundedTotal)} ${t("admin.stat.refundedSub")}` : ""
            }`}
            icon={Banknote}
            tone="go"
          />
          <StatCard label={t("admin.stat.payoutsDue")} value={formatMoney(payoutsDue)} sub={t("admin.stat.payoutsDueSub")} icon={Banknote} tone="navy" />
          <StatCard
            label={t("admin.stat.avgBooking")}
            value={formatMoney(avgBookingValue)}
            sub={t("admin.stat.avgBookingSub")}
            icon={TrendingUp}
            tone="go"
          />
          <StatCard
            label={t("admin.stat.cancelRate")}
            value={`${cancelRate}%`}
            sub={`${rangeCancelled} ${t("admin.stat.cancelledSub")}`}
            icon={XCircle}
            tone="accent"
          />
        </div>

        {/* Global search across the whole marketplace */}
        <form action="/admin" role="search" className="relative">
          <Search
            className="pointer-events-none absolute start-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-navy-400"
            aria-hidden
          />
          <input
            type="search"
            name="q"
            defaultValue={qRaw ?? ""}
            placeholder={t("admin.search.placeholder")}
            className="w-full rounded-2xl border border-navy-200 bg-white py-2.5 pe-28 ps-10 text-sm shadow-card focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-100"
          />
          <div className="absolute end-1.5 top-1/2 flex -translate-y-1/2 items-center gap-1">
            {q && (
              <Link
                href="/admin"
                className="rounded-lg px-2 py-1 text-xs font-semibold text-navy-400 hover:text-navy-700"
              >
                {t("admin.search.clear")}
              </Link>
            )}
            <button type="submit" className={buttonVariants({ size: "sm" })}>
              {t("admin.search.go")}
            </button>
          </div>
        </form>

        {/* Search results */}
        {searchResults && (
          <section id="search-results" className="scroll-mt-20">
            <div className="mb-3 flex items-center gap-2">
              <h3 className="text-lg font-bold text-navy-900">
                {t("admin.search.results")} “{qRaw}”
              </h3>
              <Badge tone={searchTotal > 0 ? "brand" : "neutral"}>{searchTotal}</Badge>
            </div>
            {searchTotal === 0 ? (
              <Card className="p-6 text-center text-navy-500">{t("admin.search.empty")}</Card>
            ) : (
              <div className="grid gap-4 lg:grid-cols-2">
                {searchResults.bookings.length > 0 && (
                  <Card className="p-4">
                    <h4 className="mb-1 text-xs font-bold uppercase tracking-wide text-navy-500">
                      {t("nav.bookings")} · {searchResults.bookings.length}
                    </h4>
                    <div className="divide-y divide-navy-100">
                      {searchResults.bookings.map((b) => (
                        <div key={b.id} className="flex items-center justify-between gap-3 py-2.5">
                          <div className="min-w-0">
                            <div className="flex flex-wrap items-center gap-2">
                              <span className="font-mono text-sm font-bold text-navy-900">{b.reference}</span>
                              <StatusBadge status={b.status} />
                            </div>
                            <div className="truncate text-xs text-navy-400">
                              {travellerMap.get(b.travellerId)?.name ?? "—"} ·{" "}
                              {spaceMap.get(b.spaceId)?.title ?? b.spaceId}
                            </div>
                          </div>
                          <Link
                            href={`/app/booking/${b.id}`}
                            className="inline-flex shrink-0 items-center gap-1 rounded-lg border border-navy-200 bg-white px-3 py-1.5 text-xs font-semibold text-navy-600 hover:bg-navy-50"
                          >
                            <ArrowUpRight className="h-3.5 w-3.5" /> {t("admin.view")}
                          </Link>
                        </div>
                      ))}
                    </div>
                  </Card>
                )}
                {searchResults.spaces.length > 0 && (
                  <Card className="p-4">
                    <h4 className="mb-1 text-xs font-bold uppercase tracking-wide text-navy-500">
                      {t("nav.listings")} · {searchResults.spaces.length}
                    </h4>
                    <div className="divide-y divide-navy-100">
                      {searchResults.spaces.map((s) => (
                        <div key={s.id} className="flex items-center justify-between gap-3 py-2.5">
                          <div className="min-w-0">
                            <div className="truncate font-semibold text-navy-900">{s.title}</div>
                            <div className="truncate text-xs text-navy-400">
                              {spaceHostMap.get(s.hostId)?.displayName} ·{" "}
                              {getAirport(s.airportSlug)?.name}
                            </div>
                          </div>
                          <div className="flex shrink-0 items-center gap-2">
                            <StatusBadge status={s.status} />
                            <Link
                              href={`/app/space/${s.id}`}
                              className="inline-flex items-center gap-1 rounded-lg border border-navy-200 bg-white px-3 py-1.5 text-xs font-semibold text-navy-600 hover:bg-navy-50"
                            >
                              <ArrowUpRight className="h-3.5 w-3.5" /> {t("admin.view")}
                            </Link>
                          </div>
                        </div>
                      ))}
                    </div>
                  </Card>
                )}
                {searchResults.users.length > 0 && (
                  <Card className="p-4">
                    <h4 className="mb-1 text-xs font-bold uppercase tracking-wide text-navy-500">
                      {t("nav.users")} · {searchResults.users.length}
                    </h4>
                    <div className="divide-y divide-navy-100">
                      {searchResults.users.map((u) => (
                        <div key={u.id} className="flex items-center justify-between gap-3 py-2.5">
                          <div className="min-w-0">
                            <div className="truncate font-semibold text-navy-900">{u.name}</div>
                            <div className="truncate text-xs text-navy-400">{u.email}</div>
                          </div>
                          <div className="flex shrink-0 items-center gap-2">
                            {u.suspended && (
                              <Badge tone="danger">{t("admin.users.suspended")}</Badge>
                            )}
                            <Badge tone={u.role === "admin" ? "accent" : u.role === "host" ? "brand" : "neutral"}>
                              {u.role}
                            </Badge>
                            <span className="text-xs text-navy-400">{formatDate(u.createdAt)}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </Card>
                )}
                {searchResults.tickets.length > 0 && (
                  <Card className="p-4">
                    <h4 className="mb-1 text-xs font-bold uppercase tracking-wide text-navy-500">
                      {t("admin.support.title")} · {searchResults.tickets.length}
                    </h4>
                    <div className="divide-y divide-navy-100">
                      {searchResults.tickets.map((tk) => (
                        <div key={tk.id} className="flex items-center justify-between gap-3 py-2.5">
                          <div className="min-w-0">
                            <div className="truncate font-semibold text-navy-900">
                              {tk.name || tk.email}
                            </div>
                            <div className="truncate text-xs text-navy-400">
                              {tk.topic} · {formatDateTime(tk.createdAt)}
                            </div>
                          </div>
                          <Badge tone={tk.status === "open" ? "accent" : "go"}>
                            {tk.status === "open"
                              ? t("admin.support.openBadge")
                              : t("admin.support.resolvedBadge")}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </Card>
                )}
              </div>
            )}
          </section>
        )}

        {/* Triage: what needs an admin right now */}
        {(pending.length > 0 ||
          pendingListings > 0 ||
          supportTickets.some((x) => x.status === "open")) && (
          <div className="flex flex-wrap items-center gap-2.5 rounded-2xl border border-accent-200 bg-accent-50 px-4 py-3">
            <ShieldAlert className="h-5 w-5 shrink-0 text-accent-700" aria-hidden />
            <span className="font-bold text-navy-900">{t("admin.attention.title")}</span>
            {pending.length > 0 && (
              <Link
                href="/admin/verification"
                className="rounded-full border border-accent-300 bg-white px-3 py-1 text-sm font-semibold text-navy-800 transition-colors hover:bg-accent-100"
              >
                {pending.length} {t("admin.attention.verifications")}
              </Link>
            )}
            {pendingListings > 0 && (
              <Link
                href="/admin/listings"
                className="rounded-full border border-accent-300 bg-white px-3 py-1 text-sm font-semibold text-navy-800 transition-colors hover:bg-accent-100"
              >
                {pendingListings} {t("admin.attention.listings")}
              </Link>
            )}
            {supportTickets.filter((x) => x.status === "open").length > 0 && (
              <Link
                href="/admin/support"
                className="rounded-full border border-accent-300 bg-white px-3 py-1 text-sm font-semibold text-navy-800 transition-colors hover:bg-accent-100"
              >
                {supportTickets.filter((x) => x.status === "open").length}{" "}
                {t("admin.attention.tickets")}
              </Link>
            )}
          </div>
        )}

        {/* Every admin area now lives on its own page */}
        <nav
          aria-label={t("admin.sectionsNav")}
          className="no-scrollbar -mx-1 flex gap-1.5 overflow-x-auto px-1"
        >
          {(
            [
              ["/admin/verification", t("nav.hostVerification")],
              ["/admin/listings", t("nav.listings")],
              ["/admin/bookings", t("nav.bookings")],
              ["/admin/users", t("nav.users")],
              ["/admin/payments", t("nav.payments")],
              ["/admin/support", t("admin.support.title")],
              ["/admin/users#waitlist", t("admin.section.waitlist")],
              ["/admin/audit", t("nav.audit")],
            ] as const
          ).map(([href, label]) => (
            <Link
              key={href}
              href={href}
              className="shrink-0 whitespace-nowrap rounded-full border border-navy-200 bg-white px-3 py-1.5 text-xs font-semibold text-navy-600 transition-colors hover:bg-navy-50"
            >
              {label}
            </Link>
          ))}
        </nav>

        {/* Insights: revenue trend + where bookings happen */}
        <div className="grid gap-5 lg:grid-cols-2">
          <Card className="p-5">
            <div className="mb-4 flex items-center justify-between gap-3">
              <h3 className="font-bold text-navy-900">{t("admin.insights.revenue")}</h3>
              <div className="text-end">
                <div className="text-xs text-navy-400">{t("admin.insights.sub")}</div>
                {momPct !== null && (
                  <div
                    className={`text-xs font-bold ${momPct >= 0 ? "text-go-600" : "text-red-600"}`}
                  >
                    {momPct >= 0 ? "+" : ""}
                    {momPct}% {t("admin.insights.vsLastMonth")}
                  </div>
                )}
              </div>
            </div>
            <EarningsChart
              months={revenueMonths}
              currency="GBP"
              title={t("admin.insights.revenue")}
            />
          </Card>
          <Card className="p-5">
            <div className="mb-4 flex items-center justify-between gap-3">
              <h3 className="font-bold text-navy-900">{t("admin.insights.destinations")}</h3>
              <span className="text-xs text-navy-400">{t("admin.insights.destinationsSub")}</span>
            </div>
            {topDests.length === 0 ? (
              <p className="py-8 text-center text-sm text-navy-500">{t("admin.insights.empty")}</p>
            ) : (
              <ul className="space-y-3">
                {topDests.map((d) => (
                  <li key={d.name}>
                    <div className="flex items-baseline justify-between gap-3 text-sm">
                      <span className="truncate font-semibold text-navy-900">{d.name}</span>
                      <span className="shrink-0 text-navy-500">
                        {d.count} · <span className="font-bold text-navy-900">{formatMoney(d.revenue)}</span>
                      </span>
                    </div>
                    <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-navy-100">
                      <div
                        className="h-full rounded-full bg-brand-500"
                        style={{ width: `${Math.max((d.revenue / maxDestRevenue) * 100, 3)}%` }}
                      />
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </Card>
        </div>

        {/* Quick access — the admin account passes every role guard */}
        <section id="portals" className="scroll-mt-20">
          <h3 className="mb-1 text-lg font-bold text-navy-900">{t("admin.section.portals")}</h3>
          <p className="mb-3 text-sm text-navy-500">{t("admin.portals.note")}</p>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <PortalLink
              href="/app"
              icon={<LayoutGrid className="h-5 w-5" />}
              title={t("admin.portal.traveller")}
              sub={t("admin.portal.travellerSub")}
            />
            <PortalLink
              href="/host"
              icon={<Warehouse className="h-5 w-5" />}
              title={t("admin.portal.host")}
              sub={t("admin.portal.hostSub")}
            />
            <PortalLink
              href="/app/search"
              icon={<Search className="h-5 w-5" />}
              title={t("admin.portal.search")}
              sub={t("admin.portal.searchSub")}
            />
            <PortalLink
              href="/"
              icon={<Globe className="h-5 w-5" />}
              title={t("admin.portal.site")}
              sub={t("admin.portal.siteSub")}
            />
          </div>
        </section>

        {/* Alerts (cancellations, refunds, new activity for the admin) —
            each one opens what it announces: a support alert lands on the
            ticket desk, a booking-shaped one on that booking. */}
        {alerts.length > 0 && (
          <section id="alerts" className="scroll-mt-20">
            <h3 className="mb-3 flex items-center gap-2 text-lg font-bold text-navy-900">
              <ShieldAlert className="h-5 w-5 text-navy-500" /> {t("admin.section.alerts")}
            </h3>
            <Card className="divide-y divide-navy-100">
              {alerts.map((n) => {
                const target = notificationTarget(n, user, alertRefs);
                const row = (
                  <>
                    <span
                      className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${
                        n.read ? "bg-navy-200" : "bg-go-500"
                      }`}
                    />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-semibold text-navy-900">{n.title}</span>
                        <span className="shrink-0 text-xs text-navy-400">
                          {formatDateTime(n.createdAt)}
                        </span>
                      </div>
                      <p className="text-sm text-navy-600">{n.body}</p>
                    </div>
                  </>
                );
                return target ? (
                  <Link
                    key={n.id}
                    href={target}
                    data-dash-alert
                    className="group flex items-start gap-3 p-4 transition-colors hover:bg-navy-50/60"
                  >
                    {row}
                    <ChevronRight className="mt-1 h-4 w-4 shrink-0 text-navy-400 transition-colors group-hover:text-brand-700 rtl:-scale-x-100" />
                  </Link>
                ) : (
                  <div key={n.id} className="flex items-start gap-3 p-4">
                    {row}
                  </div>
                );
              })}
            </Card>
          </section>
        )}
      </div>
    </PortalShell>
  );
}

function PortalLink({
  href,
  icon,
  title,
  sub,
}: {
  href: string;
  icon: React.ReactNode;
  title: string;
  sub: string;
}) {
  return (
    <Link
      href={href}
      className="group flex items-center gap-3 rounded-2xl border border-navy-100 bg-white p-4 shadow-card transition-all hover:-translate-y-0.5 hover:border-brand-200 hover:shadow-lg"
    >
      <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-brand-50 text-brand-700">
        {icon}
      </span>
      <span className="min-w-0 flex-1">
        <span className="flex items-center gap-1 font-bold text-navy-900">
          {title}
          <ArrowUpRight className="h-3.5 w-3.5 text-navy-400 transition-colors group-hover:text-brand-600" />
        </span>
        <span className="block truncate text-xs text-navy-500">{sub}</span>
      </span>
    </Link>
  );
}
