import type { Metadata } from "next";
import {
  Banknote,
  Car,
  CheckCircle2,
  Clock,
  FileText,
  Radio,
  ScrollText,
  ShieldAlert,
  Warehouse,
  XCircle,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PortalShell } from "@/components/portal/shell";
import { StatusBadge } from "@/components/portal/status";
import { StatCard } from "@/components/portal/stat-card";
import { adminNav } from "@/components/portal/navs";
import { trustBand } from "@/lib/trust";
import { requireRole } from "@/lib/auth";
import { reviewSpaceAction, reviewVerificationAction } from "@/lib/booking-actions";
import { getOperatorJobs, getOperatorStatus } from "@/lib/services/transfer-operator";
import {
  getAirport,
  getAllBookings,
  getAllHosts,
  getAllPayments,
  getAllReviews,
  getHost,
  getPendingVerifications,
  getVerifications,
  trustScoreFor,
} from "@/lib/data/store";
import { getHostsByIds, listAllSpaces } from "@/lib/data/hosts";
import { formatDate, formatDateTime, formatMoney } from "@/lib/utils";
import { getI18n } from "@/lib/i18n";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({ title: "Admin", path: "/admin", noindex: true });

export default async function AdminDashboard() {
  const user = await requireRole("admin");
  const { t } = await getI18n();
  const pending = getPendingVerifications();
  const allVerifications = getVerifications();
  const spaces = await listAllSpaces();
  const spaceHostMap = await getHostsByIds(spaces.map((s) => s.hostId));
  const payments = getAllPayments();
  const bookings = getAllBookings();

  const gmv = payments.reduce((s, p) => s + p.amount, 0);
  const platformRevenue = payments.reduce((s, p) => s + p.split.platform, 0);
  const payoutsDue = payments
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

  const trustRows = getAllHosts()
    .map((h) => ({ name: h.displayName, type: "Host", score: trustScoreFor(h.id, "host") }))
    .sort((a, b) => b.score.score - a.score.score);

  // Transfer is fulfilled by an independent licensed operator, integrated by API.
  const operator = getOperatorStatus();
  const operatorJobs = getOperatorJobs();

  const audit = buildAuditFeed({ bookings, verifications: allVerifications, reviews: getAllReviews() });

  return (
    <PortalShell user={user} nav={adminNav} title="admin.pageTitle">
      <div className="space-y-8">
        {/* Stats */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard label={t("admin.stat.hostReview")} value={String(pending.length)} sub={t("admin.stat.hostReviewSub")} icon={ShieldAlert} tone="accent" />
          <StatCard label={t("admin.stat.liveListings")} value={String(liveCount)} sub={`${spaces.length} ${t("admin.total")}`} icon={Warehouse} tone="brand" />
          <StatCard label={t("admin.stat.gmv")} value={formatMoney(gmv)} sub={`${formatMoney(platformRevenue)} ${t("admin.stat.gmvSub")}`} icon={Banknote} tone="go" />
          <StatCard label={t("admin.stat.payoutsDue")} value={formatMoney(payoutsDue)} sub={t("admin.stat.payoutsDueSub")} icon={Banknote} tone="navy" />
        </div>

        {/* Host verification queue (driver/vehicle/insurance compliance sits with the operator) */}
        <section id="verification" className="scroll-mt-20">
          <h3 className="mb-3 text-lg font-bold text-navy-900">{t("admin.section.verificationQueue")}</h3>
          {pending.length === 0 ? (
            <Card className="p-6 text-center text-navy-500">{t("admin.queueClear")}</Card>
          ) : (
            <div className="space-y-4">
              {pending.map((v) => {
                const name = getHost(v.subjectId)?.displayName;
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
                    <span className="font-semibold text-navy-900">
                      {formatMoney(p.amount, p.currency)}
                    </span>
                    <StatusBadge status={p.payoutStatus} />
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

interface AuditEntry {
  label: string;
  at: string;
}

function buildAuditFeed({
  bookings,
  verifications,
  reviews,
}: {
  bookings: ReturnType<typeof getAllBookings>;
  verifications: ReturnType<typeof getVerifications>;
  reviews: ReturnType<typeof getAllReviews>;
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
