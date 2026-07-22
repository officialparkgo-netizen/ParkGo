import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowUpRight,
  Banknote,
  CalendarCheck,
  Car,
  CheckCircle2,
  Clock,
  FileText,
  Download,
  Globe,
  Headset,
  LayoutGrid,
  Mail,
  PauseCircle,
  Radio,
  ScrollText,
  Search,
  ShieldAlert,
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
import { trustBand, computeTrustScore } from "@/lib/trust";
import { requireRole } from "@/lib/auth";
import {
  pauseSpaceAction,
  reviewSpaceAction,
  reviewVerificationAction,
} from "@/lib/booking-actions";
import { getOperatorJobs, getOperatorStatus } from "@/lib/services/transfer-operator";
import { getAirport } from "@/lib/data/store";
import { listAllReviews } from "@/lib/data/reviews";
import { getHostsByIds, listAllHosts, listAllSpaces } from "@/lib/data/hosts";
import {
  listAllVerificationsLive,
  listPendingVerificationsLive,
} from "@/lib/data/verifications";
import { listAllBookings, listAllPayments } from "@/lib/data/bookings";
import { listNotificationsForUser } from "@/lib/data/notifications";
import { getUsersByIds, listAllUsers } from "@/lib/data/users";
import { listWaitlist } from "@/lib/data/waitlist";
import { listSupportTickets } from "@/lib/data/support";
import { resolveSupportTicketAction } from "@/lib/support-actions";
import type { Host } from "@/types";

function hostTrustScore(h: Host) {
  return computeTrustScore({
    subjectId: h.id,
    subjectType: "host",
    verification: h.verificationStatus,
    reviews: [],
    reliability: 0.95,
    tenureDays: Math.max(
      0,
      Math.floor((Date.now() - new Date(h.joinedAt).getTime()) / 86_400_000)
    ),
    updatedAt: new Date().toISOString(),
  });
}
import { formatDate, formatDateTime, formatMoney } from "@/lib/utils";
import { getI18n } from "@/lib/i18n";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({ title: "Admin", path: "/admin", noindex: true });

export default async function AdminDashboard() {
  const user = await requireRole("admin");
  const { t, locale } = await getI18n();
  const pending = await listPendingVerificationsLive();
  const allVerifications = await listAllVerificationsLive();
  const spaces = await listAllSpaces();
  const spaceHostMap = await getHostsByIds([
    ...spaces.map((s) => s.hostId),
    ...pending.filter((v) => v.subjectType === "host").map((v) => v.subjectId),
  ]);
  const payments = await listAllPayments();
  const bookings = await listAllBookings();

  // Refunded payments (cancelled bookings) are excluded from GMV/payouts.
  const cancelledBookingIds = new Set(
    bookings.filter((b) => b.status === "cancelled").map((b) => b.id)
  );
  const isRefunded = (p: (typeof payments)[number]) =>
    p.payoutStatus === "refunded" || cancelledBookingIds.has(p.bookingId);
  const earnedPayments = payments.filter((p) => !isRefunded(p));
  const refundedTotal = payments.filter(isRefunded).reduce((s, p) => s + p.amount, 0);

  const gmv = earnedPayments.reduce((s, p) => s + p.amount, 0);
  const platformRevenue = earnedPayments.reduce((s, p) => s + p.split.platform, 0);
  const payoutsDue = earnedPayments
    .filter((p) => p.payoutStatus !== "paid")
    .reduce((s, p) => s + p.split.hostPayout + p.split.driverPayout, 0);
  const liveCount = spaces.filter((s) => s.status === "live").length;
  const pendingListings = spaces.filter(
    (s) => s.status === "pending_review" || s.status === "draft"
  ).length;
  const listingRank = (status: string) =>
    status === "pending_review" || status === "draft" ? 0 : status === "live" ? 1 : 2;
  const sortedSpaces = [...spaces].sort(
    (a, b) => listingRank(a.status) - listingRank(b.status)
  );

  const trustRows = (await listAllHosts())
    .map((h) => ({ name: h.displayName, type: "Host", score: hostTrustScore(h) }))
    .sort((a, b) => b.score.score - a.score.score);

  // People & bookings overview.
  const allUsers = await listAllUsers();
  const travellerCount = allUsers.filter((u) => u.role === "traveller").length;
  const hostCount = allUsers.filter((u) => u.role === "host").length;
  const activeBookings = bookings.filter(
    (b) => b.status === "paid" || b.status === "active"
  ).length;
  const recentBookings = [...bookings]
    .sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt))
    .slice(0, 8);
  const travellerMap = await getUsersByIds(recentBookings.map((b) => b.travellerId));
  const spaceMap = new Map(spaces.map((s) => [s.id, s]));
  const recentUsers = allUsers
    .slice()
    .sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt))
    .slice(0, 10);
  const waitlist = await listWaitlist().catch(() => []);
  const supportTickets = await listSupportTickets().catch(() => []);

  // Monthly GMV (last six months) + booking revenue per destination.
  const localeTag =
    { en: "en-GB", ur: "ur-PK", hi: "hi-IN", de: "de-DE", zh: "zh-CN" }[locale] ?? "en-GB";
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
  for (const b of bookings) {
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

  // Transfer is fulfilled by an independent licensed operator, integrated by API.
  const operator = getOperatorStatus();
  const operatorJobs = getOperatorJobs();

  const audit = buildAuditFeed({ bookings, verifications: allVerifications, reviews: await listAllReviews() });
  const alerts = (await listNotificationsForUser(user.id)).slice(0, 6);

  return (
    <PortalShell user={user} nav={adminNav} title="admin.pageTitle">
      <div className="space-y-8">
        {/* Stats */}
        <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-3">
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
            value={String(bookings.length)}
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
        </div>

        {/* Triage: what needs an admin right now */}
        {(pending.length > 0 ||
          pendingListings > 0 ||
          supportTickets.some((x) => x.status === "open")) && (
          <div className="flex flex-wrap items-center gap-2.5 rounded-2xl border border-accent-200 bg-accent-50 px-4 py-3">
            <ShieldAlert className="h-5 w-5 shrink-0 text-accent-500" aria-hidden />
            <span className="font-bold text-navy-900">{t("admin.attention.title")}</span>
            {pending.length > 0 && (
              <a
                href="#verification"
                className="rounded-full border border-accent-300 bg-white px-3 py-1 text-sm font-semibold text-navy-800 transition-colors hover:bg-accent-100"
              >
                {pending.length} {t("admin.attention.verifications")}
              </a>
            )}
            {pendingListings > 0 && (
              <a
                href="#listings"
                className="rounded-full border border-accent-300 bg-white px-3 py-1 text-sm font-semibold text-navy-800 transition-colors hover:bg-accent-100"
              >
                {pendingListings} {t("admin.attention.listings")}
              </a>
            )}
            {supportTickets.filter((x) => x.status === "open").length > 0 && (
              <a
                href="#support"
                className="rounded-full border border-accent-300 bg-white px-3 py-1 text-sm font-semibold text-navy-800 transition-colors hover:bg-accent-100"
              >
                {supportTickets.filter((x) => x.status === "open").length}{" "}
                {t("admin.attention.tickets")}
              </a>
            )}
          </div>
        )}

        {/* In-page section navigation for this long dashboard */}
        <nav
          aria-label={t("admin.sectionsNav")}
          className="no-scrollbar -mx-1 flex gap-1.5 overflow-x-auto px-1"
        >
          {(
            [
              ["#verification", t("nav.hostVerification")],
              ["#listings", t("nav.listings")],
              ["#bookings", t("nav.bookings")],
              ["#users", t("nav.users")],
              ["#payments", t("nav.payments")],
              ["#support", t("admin.support.title")],
              ["#waitlist", t("admin.section.waitlist")],
              ["#audit", t("nav.audit")],
            ] as const
          ).map(([href, label]) => (
            <a
              key={href}
              href={href}
              className="shrink-0 whitespace-nowrap rounded-full border border-navy-200 bg-white px-3 py-1.5 text-xs font-semibold text-navy-600 transition-colors hover:bg-navy-50"
            >
              {label}
            </a>
          ))}
        </nav>

        {/* Insights: revenue trend + where bookings happen */}
        <div className="grid gap-5 lg:grid-cols-2">
          <Card className="p-5">
            <div className="mb-4 flex items-center justify-between gap-3">
              <h3 className="font-bold text-navy-900">{t("admin.insights.revenue")}</h3>
              <span className="text-xs text-navy-400">{t("admin.insights.sub")}</span>
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

        {/* Host verification queue (driver/vehicle/insurance compliance sits with the operator) */}
        <section id="verification" className="scroll-mt-20">
          <h3 className="mb-3 text-lg font-bold text-navy-900">{t("admin.section.verificationQueue")}</h3>
          {pending.length === 0 ? (
            <Card className="p-6 text-center text-navy-500">{t("admin.queueClear")}</Card>
          ) : (
            <div className="space-y-4">
              {pending.map((v) => {
                const name = spaceHostMap.get(v.subjectId)?.displayName;
                return (
                  <Card key={v.id} className="p-5">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-navy-900">{name ?? v.subjectId}</span>
                          <Badge tone="neutral">{v.subjectType}</Badge>
                          <StatusBadge status={v.status} />
                        </div>
                        <p className="mt-0.5 text-sm text-navy-500">
                          {t("admin.submitted")} {v.submittedAt ? formatDate(v.submittedAt) : "—"}
                        </p>
                        <ul className="mt-3 flex flex-wrap gap-2">
                          {v.documents.map((d) => (
                            <li key={d.id}>
                              <Badge tone="brand">
                                <FileText className="h-3 w-3" /> {d.label}
                              </Badge>
                            </li>
                          ))}
                        </ul>
                      </div>
                      <form action={reviewVerificationAction} className="flex gap-2">
                        <input type="hidden" name="verificationId" value={v.id} />
                        <button
                          type="submit"
                          name="decision"
                          value="approved"
                          className="inline-flex items-center gap-1.5 rounded-xl bg-go-500 px-4 py-2 text-sm font-semibold text-white hover:bg-go-600"
                        >
                          <CheckCircle2 className="h-4 w-4" /> {t("admin.approve")}
                        </button>
                        <button
                          type="submit"
                          name="decision"
                          value="rejected"
                          className="inline-flex items-center gap-1.5 rounded-xl border border-red-200 bg-white px-4 py-2 text-sm font-semibold text-red-600 hover:bg-red-50"
                        >
                          <XCircle className="h-4 w-4" /> {t("admin.reject")}
                        </button>
                      </form>
                    </div>
                  </Card>
                );
              })}
            </div>
          )}
        </section>

        {/* Transfer operator — API integration & monitoring (replaces driver verification) */}
        <section id="operator" className="scroll-mt-20">
          <h3 className="mb-3 text-lg font-bold text-navy-900">{t("admin.section.operator")}</h3>
          <Card className="p-5">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-50 text-brand-600">
                  <Radio className="h-5 w-5" />
                </span>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-navy-900">{operator.name}</span>
                    <Badge tone={operator.connected ? "go" : "danger"}>
                      {operator.connected && (
                        <span className="relative flex h-2 w-2">
                          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-go-500 opacity-75" />
                          <span className="relative inline-flex h-2 w-2 rounded-full bg-go-500" />
                        </span>
                      )}
                      {operator.connected ? t("admin.connected") : t("admin.offline")}
                    </Badge>
                  </div>
                  <p className="text-sm text-navy-500">
                    {t("admin.operatorSubtitle")}
                  </p>
                </div>
              </div>
              <div className="flex gap-6 text-sm">
                <Metric value={String(operator.activeJobs)} label={t("admin.metric.activeJobs")} />
                <Metric value={`${operator.slaMinutes}m`} label={t("admin.metric.pickupSla")} />
                <Metric value={`${operator.rating.toFixed(1)}★`} label={t("admin.metric.rating")} />
                <Metric value={String(operator.handoversConfirmed)} label={t("admin.metric.handovers")} />
              </div>
            </div>
          </Card>

          <div className="mt-4">
            <h4 className="mb-2 text-sm font-bold text-navy-700">{t("admin.liveJobs")}</h4>
            <Card className="divide-y divide-navy-100">
              {operatorJobs.length === 0 && (
                <div className="p-6 text-center text-navy-500">{t("admin.noJobs")}</div>
              )}
              {operatorJobs.map((job) => (
                <div key={job.id} className="flex flex-wrap items-center justify-between gap-3 p-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-sm font-bold text-navy-900">{job.bookingRef}</span>
                      <StatusBadge status={job.status} />
                      {job.handoverConfirmed && (
                        <Badge tone="go">
                          <CheckCircle2 className="h-3 w-3" /> {t("admin.handover")}
                        </Badge>
                      )}
                    </div>
                    <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-0.5 text-sm text-navy-500">
                      <span className="inline-flex items-center gap-1">
                        <Car className="h-3.5 w-3.5" /> {job.driverName}
                      </span>
                      <span className="hidden text-navy-400 sm:inline">{job.vehicle}</span>
                    </div>
                  </div>
                  <div className="text-right text-sm">
                    {job.etaMinutes !== null ? (
                      <span className="inline-flex items-center gap-1 font-semibold text-navy-800">
                        <Clock className="h-3.5 w-3.5" /> {t("admin.eta")} {job.etaMinutes} {t("admin.min")}
                      </span>
                    ) : (
                      <span className="text-navy-400">—</span>
                    )}
                  </div>
                </div>
              ))}
            </Card>
            <p className="mt-2 text-xs text-navy-400">
              {t("admin.operatorNote")}
            </p>
          </div>
        </section>

        <div className="grid gap-6 lg:grid-cols-2">
          {/* Trust scores */}
          <section className="scroll-mt-20">
            <h3 className="mb-3 text-lg font-bold text-navy-900">{t("admin.section.trustScores")}</h3>
            <Card className="divide-y divide-navy-100">
              {trustRows.map((row) => {
                const band = trustBand(row.score.score);
                return (
                  <div key={row.type + row.name} className="flex items-center justify-between p-4">
                    <div>
                      <div className="font-semibold text-navy-900">{row.name}</div>
                      <div className="text-xs text-navy-400">{row.type === "Host" ? t("admin.hostType") : row.type}</div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="h-2 w-24 overflow-hidden rounded-full bg-navy-100">
                        <div
                          className="h-full rounded-full bg-go-500"
                          style={{ width: `${row.score.score}%` }}
                        />
                      </div>
                      <span className="w-8 text-right font-bold text-navy-900">{row.score.score}</span>
                      <Badge tone={band.tone}>{band.label}</Badge>
                    </div>
                  </div>
                );
              })}
            </Card>
          </section>

          {/* Payments */}
          <section id="payments" className="scroll-mt-20">
            <h3 className="mb-3 text-lg font-bold text-navy-900">{t("admin.section.payments")}</h3>
            <Card className="divide-y divide-navy-100">
              {payments.map((p) => (
                <div key={p.id} className="p-4">
                  <div className="flex items-center justify-between">
                    <span
                      className={
                        isRefunded(p)
                          ? "font-semibold text-navy-300 line-through"
                          : "font-semibold text-navy-900"
                      }
                    >
                      {formatMoney(p.amount, p.currency)}
                    </span>
                    <StatusBadge status={isRefunded(p) ? "refunded" : p.payoutStatus} />
                  </div>
                  <div className="mt-1 flex flex-wrap gap-x-3 text-xs text-navy-400">
                    <span>{t("admin.pay.platform")} {formatMoney(p.split.platform, p.currency)}</span>
                    <span>{t("admin.pay.host")} {formatMoney(p.split.hostPayout, p.currency)}</span>
                    <span>{t("admin.pay.driver")} {formatMoney(p.split.driverPayout, p.currency)}</span>
                    <span className="capitalize">· {p.method}</span>
                  </div>
                </div>
              ))}
            </Card>
          </section>
        </div>

        {/* Listings */}
        <section id="listings" className="scroll-mt-20">
          <div className="mb-3 flex items-center gap-2">
            <h3 className="text-lg font-bold text-navy-900">{t("admin.section.listingsUsers")}</h3>
            {pendingListings > 0 && (
              <Badge tone="accent">{pendingListings} {t("admin.awaitingReview")}</Badge>
            )}
          </div>
          <Card className="divide-y divide-navy-100">
            {sortedSpaces.map((s) => {
              const host = spaceHostMap.get(s.hostId);
              const airport = getAirport(s.airportSlug);
              const needsReview = s.status === "pending_review" || s.status === "draft";
              return (
                <div key={s.id} className="flex flex-wrap items-center justify-between gap-3 p-4">
                  <div>
                    <div className="font-semibold text-navy-900">{s.title}</div>
                    <div className="text-xs text-navy-400">
                      {host?.displayName} · {airport?.name} · {formatMoney(s.pricePerDay)}/day
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <StatusBadge status={s.status} />
                    <Link
                      href={`/app/space/${s.id}`}
                      className="inline-flex items-center gap-1 rounded-lg border border-navy-200 bg-white px-3 py-1.5 text-xs font-semibold text-navy-600 hover:bg-navy-50"
                    >
                      <ArrowUpRight className="h-3.5 w-3.5" /> {t("admin.view")}
                    </Link>
                    {(s.status === "live" || s.status === "paused") && (
                      <form action={pauseSpaceAction}>
                        <input type="hidden" name="spaceId" value={s.id} />
                        <input
                          type="hidden"
                          name="state"
                          value={s.status === "live" ? "pause" : "reactivate"}
                        />
                        {s.status === "live" ? (
                          <button
                            type="submit"
                            className="inline-flex items-center gap-1 rounded-lg border border-accent-200 bg-white px-3 py-1.5 text-xs font-semibold text-accent-500 hover:bg-accent-50"
                          >
                            <PauseCircle className="h-3.5 w-3.5" /> {t("admin.pause")}
                          </button>
                        ) : (
                          <button
                            type="submit"
                            className="inline-flex items-center gap-1 rounded-lg bg-go-500 px-3 py-1.5 text-xs font-semibold text-white hover:bg-go-600"
                          >
                            <CheckCircle2 className="h-3.5 w-3.5" /> {t("admin.reactivate")}
                          </button>
                        )}
                      </form>
                    )}
                    {needsReview && (
                      <form action={reviewSpaceAction} className="flex gap-2">
                        <input type="hidden" name="spaceId" value={s.id} />
                        <button
                          type="submit"
                          name="decision"
                          value="approved"
                          className="inline-flex items-center gap-1 rounded-lg bg-go-500 px-3 py-1.5 text-xs font-semibold text-white hover:bg-go-600"
                        >
                          <CheckCircle2 className="h-3.5 w-3.5" /> {t("admin.approve")}
                        </button>
                        <button
                          type="submit"
                          name="decision"
                          value="rejected"
                          className="inline-flex items-center gap-1 rounded-lg border border-red-200 bg-white px-3 py-1.5 text-xs font-semibold text-red-600 hover:bg-red-50"
                        >
                          <XCircle className="h-3.5 w-3.5" /> {t("admin.reject")}
                        </button>
                      </form>
                    )}
                  </div>
                </div>
              );
            })}
          </Card>
        </section>

        {/* Recent bookings — every booking is one click away for support */}
        <section id="bookings" className="scroll-mt-20">
          <div className="mb-3 flex items-center gap-2">
            <h3 className="flex items-center gap-2 text-lg font-bold text-navy-900">
              <CalendarCheck className="h-5 w-5 text-navy-500" /> {t("admin.section.recentBookings")}
            </h3>
            <a href="/admin/export?type=bookings" className={buttonVariants({ variant: "outline", size: "sm", className: "ms-auto" })}><Download className="h-4 w-4" /> {t("admin.exportCsv")}</a>
          </div>
          <Card className="divide-y divide-navy-100">
            {recentBookings.length === 0 && (
              <div className="p-6 text-center text-navy-500">{t("admin.bookings.empty")}</div>
            )}
            {recentBookings.map((b) => {
              const traveller = travellerMap.get(b.travellerId);
              const bSpace = spaceMap.get(b.spaceId);
              return (
                <div key={b.id} className="flex flex-wrap items-center justify-between gap-3 p-4">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-mono text-sm font-bold text-navy-900">{b.reference}</span>
                      <StatusBadge status={b.status} />
                    </div>
                    <div className="mt-1 text-xs text-navy-400">
                      {traveller?.name ?? "—"} · {bSpace?.title ?? b.spaceId} ·{" "}
                      {formatDate(b.startAt)} → {formatDate(b.endAt)}
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span
                      className={
                        b.status === "cancelled"
                          ? "text-sm font-semibold text-navy-300 line-through"
                          : "text-sm font-semibold text-navy-900"
                      }
                    >
                      {formatMoney(b.price.total, b.price.currency)}
                    </span>
                    <Link
                      href={`/app/booking/${b.id}`}
                      className="inline-flex items-center gap-1 rounded-lg border border-navy-200 bg-white px-3 py-1.5 text-xs font-semibold text-navy-600 hover:bg-navy-50"
                    >
                      <ArrowUpRight className="h-3.5 w-3.5" /> {t("admin.view")}
                    </Link>
                  </div>
                </div>
              );
            })}
          </Card>
        </section>

        {/* Users */}
        <section id="users" className="scroll-mt-20">
          <div className="mb-3 flex items-center gap-2">
            <h3 className="flex items-center gap-2 text-lg font-bold text-navy-900">
              <Users className="h-5 w-5 text-navy-500" /> {t("admin.section.users")}
            </h3>
            <Badge tone="neutral">{allUsers.length} {t("admin.total")}</Badge>
          <a href="/admin/export?type=users" className={buttonVariants({ variant: "outline", size: "sm", className: "ms-auto" })}><Download className="h-4 w-4" /> {t("admin.exportCsv")}</a>
          </div>
          <Card className="divide-y divide-navy-100">
            {recentUsers.length === 0 && (
              <div className="p-6 text-center text-navy-500">{t("admin.users.empty")}</div>
            )}
            {recentUsers.map((u) => (
              <div key={u.id} className="flex flex-wrap items-center justify-between gap-3 p-4">
                <div className="min-w-0">
                  <div className="font-semibold text-navy-900">{u.name}</div>
                  <div className="truncate text-xs text-navy-400">{u.email}</div>
                </div>
                <div className="flex items-center gap-3">
                  <Badge tone={u.role === "admin" ? "accent" : u.role === "host" ? "brand" : "neutral"}>
                    {u.role}
                  </Badge>
                  <span className="text-xs text-navy-400">
                    {t("admin.users.joined")} {formatDate(u.createdAt)}
                  </span>
                </div>
              </div>
            ))}
          </Card>
        </section>

        {/* Support tickets escalated from the chat assistant */}
        <section id="support" className="scroll-mt-20">
          <div className="mb-3 flex items-center gap-2">
            <h3 className="flex items-center gap-2 text-lg font-bold text-navy-900">
              <Headset className="h-5 w-5 text-navy-500" /> {t("admin.support.title")}
            </h3>
            <Badge tone={supportTickets.some((x) => x.status === "open") ? "accent" : "neutral"}>
              {supportTickets.filter((x) => x.status === "open").length} {t("admin.support.openBadge")}
            </Badge>
          </div>
          <p className="mb-3 text-sm text-navy-500">{t("admin.support.sub")}</p>
          <Card className="divide-y divide-navy-100">
            {supportTickets.length === 0 && (
              <div className="p-6 text-center text-navy-500">{t("admin.support.empty")}</div>
            )}
            {supportTickets.slice(0, 10).map((ticket) => (
              <div key={ticket.id} className="p-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="min-w-0">
                    <div className="truncate font-semibold text-navy-900">
                      {ticket.name || ticket.email}
                      <span className="ms-2 text-xs font-normal text-navy-400">{ticket.email}</span>
                    </div>
                    <div className="text-xs text-navy-400">
                      {ticket.topic} · {formatDateTime(ticket.createdAt)}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge tone={ticket.status === "open" ? "accent" : "go"}>
                      {ticket.status === "open"
                        ? t("admin.support.openBadge")
                        : t("admin.support.resolvedBadge")}
                    </Badge>
                    {ticket.status === "open" && (
                      <form action={resolveSupportTicketAction}>
                        <input type="hidden" name="ticketId" value={ticket.id} />
                        <button
                          type="submit"
                          className={buttonVariants({ variant: "outline", size: "sm" })}
                        >
                          {t("admin.support.resolve")}
                        </button>
                      </form>
                    )}
                  </div>
                </div>
                {ticket.transcript.length > 0 && (
                  <p className="mt-2 line-clamp-2 text-sm text-navy-600">
                    {ticket.transcript
                      .filter((m) => m.role === "user")
                      .map((m) => m.text)
                      .join(" · ") || ticket.transcript[ticket.transcript.length - 1]?.text}
                  </p>
                )}
              </div>
            ))}
          </Card>
        </section>

        {/* Waitlist signups from the marketing site */}
        <section id="waitlist" className="scroll-mt-20">
          <div className="mb-3 flex items-center gap-2">
            <h3 className="flex items-center gap-2 text-lg font-bold text-navy-900">
              <Mail className="h-5 w-5 text-navy-500" /> {t("admin.section.waitlist")}
            </h3>
            <Badge tone="neutral">{waitlist.length} {t("admin.total")}</Badge>
          <a href="/admin/export?type=waitlist" className={buttonVariants({ variant: "outline", size: "sm", className: "ms-auto" })}><Download className="h-4 w-4" /> {t("admin.exportCsv")}</a>
          </div>
          <Card className="divide-y divide-navy-100">
            {waitlist.length === 0 && (
              <div className="p-6 text-center text-navy-500">{t("admin.waitlist.empty")}</div>
            )}
            {waitlist.slice(0, 10).map((w) => (
              <div key={w.id} className="flex flex-wrap items-center justify-between gap-3 p-4">
                <div className="min-w-0">
                  <div className="truncate font-semibold text-navy-900">{w.email}</div>
                  {w.airport && <div className="text-xs text-navy-400">{w.airport}</div>}
                </div>
                <div className="flex items-center gap-3">
                  <Badge tone={w.role === "host" ? "brand" : "neutral"}>{w.role}</Badge>
                  <span className="text-xs text-navy-400">
                    {t("admin.waitlist.signedUp")} {formatDate(w.createdAt)}
                  </span>
                </div>
              </div>
            ))}
          </Card>
        </section>

        {/* Alerts (cancellations, refunds, new activity for the admin) */}
        {alerts.length > 0 && (
          <section id="alerts" className="scroll-mt-20">
            <h3 className="mb-3 flex items-center gap-2 text-lg font-bold text-navy-900">
              <ShieldAlert className="h-5 w-5 text-navy-500" /> {t("admin.section.alerts")}
            </h3>
            <Card className="divide-y divide-navy-100">
              {alerts.map((n) => (
                <div key={n.id} className="flex items-start gap-3 p-4">
                  <span
                    className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${
                      n.read ? "bg-navy-200" : "bg-go-500"
                    }`}
                  />
                  <div className="flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-semibold text-navy-900">{n.title}</span>
                      <span className="shrink-0 text-xs text-navy-400">
                        {formatDateTime(n.createdAt)}
                      </span>
                    </div>
                    <p className="text-sm text-navy-600">{n.body}</p>
                  </div>
                </div>
              ))}
            </Card>
          </section>
        )}

        {/* Audit log */}
        <section id="audit" className="scroll-mt-20">
          <h3 className="mb-3 flex items-center gap-2 text-lg font-bold text-navy-900">
            <ScrollText className="h-5 w-5 text-navy-500" /> {t("admin.section.audit")}
          </h3>
          <Card className="divide-y divide-navy-100">
            {audit.map((e, i) => (
              <div key={i} className="flex items-center justify-between p-3.5 text-sm">
                <span className="text-navy-700">{e.label}</span>
                <span className="text-xs text-navy-400">{formatDateTime(e.at)}</span>
              </div>
            ))}
          </Card>
          <p className="mt-2 text-xs text-navy-400">
            {t("admin.auditNote")}
          </p>
        </section>
      </div>
    </PortalShell>
  );
}

function Metric({ value, label }: { value: string; label: string }) {
  return (
    <div>
      <div className="font-bold text-navy-900">{value}</div>
      <div className="text-xs text-navy-400">{label}</div>
    </div>
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
      <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-brand-50 text-brand-600">
        {icon}
      </span>
      <span className="min-w-0 flex-1">
        <span className="flex items-center gap-1 font-bold text-navy-900">
          {title}
          <ArrowUpRight className="h-3.5 w-3.5 text-navy-300 transition-colors group-hover:text-brand-500" />
        </span>
        <span className="block truncate text-xs text-navy-500">{sub}</span>
      </span>
    </Link>
  );
}

interface AuditEntry {
  label: string;
  at: string;
}

function buildAuditFeed({
  bookings,
  verifications,
  reviews,
}: {
  bookings: Awaited<ReturnType<typeof listAllBookings>>;
  verifications: Awaited<ReturnType<typeof listAllVerificationsLive>>;
  reviews: Awaited<ReturnType<typeof listAllReviews>>;
}): AuditEntry[] {
  const entries: AuditEntry[] = [];
  bookings.forEach((b) =>
    entries.push({ label: `Booking ${b.reference} created (${b.status})`, at: b.createdAt })
  );
  verifications.forEach((v) => {
    if (v.submittedAt)
      entries.push({ label: `Verification submitted · ${v.subjectType}`, at: v.submittedAt });
    if (v.reviewedAt)
      entries.push({ label: `Verification ${v.status} · ${v.subjectType}`, at: v.reviewedAt });
  });
  reviews.forEach((r) =>
    entries.push({ label: `Review left (${r.rating}★) on ${r.subjectType}`, at: r.createdAt })
  );
  return entries.sort((a, b) => +new Date(b.at) - +new Date(a.at)).slice(0, 12);
}
