import type { Metadata } from "next";
import {
  Banknote,
  CheckCircle2,
  FileText,
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
import {
  getAirport,
  getAllBookings,
  getAllDrivers,
  getAllHosts,
  getAllPayments,
  getAllReviews,
  getAllSpaces,
  getHost,
  getPendingVerifications,
  getTransferProvider,
  getVerifications,
  trustScoreFor,
} from "@/lib/data/store";
import { formatDate, formatDateTime, formatMoney } from "@/lib/utils";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({ title: "Admin", path: "/admin", noindex: true });

export default async function AdminDashboard() {
  const user = await requireRole("admin");
  const pending = getPendingVerifications();
  const allVerifications = getVerifications();
  const spaces = getAllSpaces();
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

  const trustRows = [
    ...getAllHosts().map((h) => ({
      name: h.displayName,
      type: "Host",
      score: trustScoreFor(h.id, "host"),
    })),
    ...getAllDrivers().map((d) => ({
      name: d.name,
      type: "Driver",
      score: trustScoreFor(d.id, "driver"),
    })),
  ].sort((a, b) => b.score.score - a.score.score);

  const audit = buildAuditFeed({ bookings, verifications: allVerifications, reviews: getAllReviews() });

  return (
    <PortalShell user={user} nav={adminNav} title="Admin & compliance">
      <div className="space-y-8">
        {/* Stats */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard label="Pending review" value={String(pending.length)} sub="verification queue" icon={ShieldAlert} tone="accent" />
          <StatCard label="Live listings" value={String(liveCount)} sub={`${spaces.length} total`} icon={Warehouse} tone="brand" />
          <StatCard label="GMV" value={formatMoney(gmv)} sub={`${formatMoney(platformRevenue)} platform`} icon={Banknote} tone="go" />
          <StatCard label="Payouts due" value={formatMoney(payoutsDue)} sub="to hosts & drivers" icon={Banknote} tone="navy" />
        </div>

        {/* Verification queue */}
        <section id="verification" className="scroll-mt-20">
          <h3 className="mb-3 text-lg font-bold text-navy-900">Verification queue</h3>
          {pending.length === 0 ? (
            <Card className="p-6 text-center text-navy-500">Queue clear — nothing awaiting review.</Card>
          ) : (
            <div className="space-y-4">
              {pending.map((v) => {
                const name =
                  v.subjectType === "host"
                    ? getHost(v.subjectId)?.displayName
                    : getTransferProvider(v.subjectId)?.companyName;
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
                          Submitted {v.submittedAt ? formatDate(v.submittedAt) : "—"}
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
                          <CheckCircle2 className="h-4 w-4" /> Approve
                        </button>
                        <button
                          type="submit"
                          name="decision"
                          value="rejected"
                          className="inline-flex items-center gap-1.5 rounded-xl border border-red-200 bg-white px-4 py-2 text-sm font-semibold text-red-600 hover:bg-red-50"
                        >
                          <XCircle className="h-4 w-4" /> Reject
                        </button>
                      </form>
                    </div>
                  </Card>
                );
              })}
            </div>
          )}
        </section>

        <div className="grid gap-6 lg:grid-cols-2">
          {/* Trust scores */}
          <section className="scroll-mt-20">
            <h3 className="mb-3 text-lg font-bold text-navy-900">Trust &amp; quality scores</h3>
            <Card className="divide-y divide-navy-100">
              {trustRows.map((row) => {
                const band = trustBand(row.score.score);
                return (
                  <div key={row.type + row.name} className="flex items-center justify-between p-4">
                    <div>
                      <div className="font-semibold text-navy-900">{row.name}</div>
                      <div className="text-xs text-navy-400">{row.type}</div>
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
            <h3 className="mb-3 text-lg font-bold text-navy-900">Payments &amp; payouts</h3>
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
                    <span>Platform {formatMoney(p.split.platform, p.currency)}</span>
                    <span>Host {formatMoney(p.split.hostPayout, p.currency)}</span>
                    <span>Driver {formatMoney(p.split.driverPayout, p.currency)}</span>
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
            <h3 className="text-lg font-bold text-navy-900">Listings &amp; users</h3>
            {pendingListings > 0 && (
              <Badge tone="accent">{pendingListings} awaiting review</Badge>
            )}
          </div>
          <Card className="divide-y divide-navy-100">
            {sortedSpaces.map((s) => {
              const host = getHost(s.hostId);
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
                          <CheckCircle2 className="h-3.5 w-3.5" /> Approve
                        </button>
                        <button
                          type="submit"
                          name="decision"
                          value="rejected"
                          className="inline-flex items-center gap-1 rounded-lg border border-red-200 bg-white px-3 py-1.5 text-xs font-semibold text-red-600 hover:bg-red-50"
                        >
                          <XCircle className="h-3.5 w-3.5" /> Reject
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
            <ScrollText className="h-5 w-5 text-navy-500" /> Audit log
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
            Every state change is append-only and immutable in live mode (see the
            audit_log table + RLS).
          </p>
        </section>
      </div>
    </PortalShell>
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
