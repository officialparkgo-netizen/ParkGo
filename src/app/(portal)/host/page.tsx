import Link from "next/link";
import type { Metadata } from "next";
import {
  BadgeCheck,
  Banknote,
  Camera,
  CalendarCheck,
  PlusCircle,
  Star,
  Warehouse,
  Zap,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { Photo } from "@/components/common/photo";
import { PortalShell } from "@/components/portal/shell";
import { StatusBadge } from "@/components/portal/status";
import { StatCard } from "@/components/portal/stat-card";
import { hostNav } from "@/components/portal/navs";
import { trustBand } from "@/lib/trust";
import { requireRole } from "@/lib/auth";
import {
  getAirport,
  getBookingsForHost,
  getHostByUserId,
  getPaymentsForHost,
  getSpacesByHost,
  getUser,
  trustScoreFor,
} from "@/lib/data/store";
import { formatDate, formatMoney, initials } from "@/lib/utils";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({ title: "Host dashboard", path: "/host", noindex: true });

export default async function HostDashboard() {
  const user = await requireRole("host");
  const host = getHostByUserId(user.id)!;
  const spaces = getSpacesByHost(host.id);
  const bookings = getBookingsForHost(host.id);
  const payments = getPaymentsForHost(host.id);
  const trust = trustScoreFor(host.id, "host");
  const band = trustBand(trust.score);

  const lifetimeEarnings = payments.reduce((s, p) => s + p.split.hostPayout, 0);
  const pendingPayouts = payments
    .filter((p) => p.payoutStatus !== "paid")
    .reduce((s, p) => s + p.split.hostPayout, 0);
  const liveCount = spaces.filter((s) => s.status === "live").length;

  return (
    <PortalShell user={user} nav={hostNav} title="Host dashboard">
      <div className="space-y-8">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-2xl font-extrabold text-navy-900">{host.displayName}</h2>
            <p className="text-navy-500">Manage your spaces, bookings and payouts.</p>
          </div>
          <Link href="/host/new" className={buttonVariants()}>
            <PlusCircle className="h-4 w-4" /> List a new space
          </Link>
        </div>

        {/* Stats */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard label="Lifetime earnings" value={formatMoney(lifetimeEarnings)} sub="after commission" icon={Banknote} tone="go" />
          <StatCard label="Pending payouts" value={formatMoney(pendingPayouts)} sub="next 2 working days" icon={CalendarCheck} tone="accent" />
          <StatCard label="Live listings" value={String(liveCount)} sub={`${spaces.length} total`} icon={Warehouse} tone="brand" />
          <StatCard label="Trust score" value={`${trust.score}`} sub={`${band.label} · ${host.rating.toFixed(1)}★`} icon={Star} tone="navy" />
        </div>

        {/* Listings */}
        <section id="listings" className="scroll-mt-20">
          <h3 className="mb-3 text-lg font-bold text-navy-900">Listings</h3>
          <div className="grid gap-4 md:grid-cols-2">
            {spaces.map((s) => {
              const airport = getAirport(s.airportSlug);
              return (
                <Card key={s.id} className="flex gap-4 p-4">
                  <Photo token={s.photos[0] ?? "drive-1"} className="h-24 w-32 shrink-0" />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-2">
                      <h4 className="font-bold text-navy-900">{s.title}</h4>
                      <StatusBadge status={s.status} />
                    </div>
                    <p className="text-sm text-navy-500">{airport?.name}</p>
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      {s.evCharger && (
                        <Badge tone="brand">
                          <Zap className="h-3 w-3" /> EV
                        </Badge>
                      )}
                      {s.liveCamera && (
                        <Badge tone="go">
                          <Camera className="h-3 w-3" /> Live cam
                        </Badge>
                      )}
                      <Badge tone="neutral">{formatMoney(s.pricePerDay)}/day</Badge>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        </section>

        {/* Bookings */}
        <section id="bookings" className="scroll-mt-20">
          <h3 className="mb-3 text-lg font-bold text-navy-900">Recent bookings</h3>
          <Card className="divide-y divide-navy-100">
            {bookings.length === 0 && (
              <div className="p-6 text-center text-navy-500">No bookings yet.</div>
            )}
            {bookings.map((b) => {
              const traveller = getUser(b.travellerId);
              return (
                <div key={b.id} className="flex flex-wrap items-center justify-between gap-3 p-4">
                  <div className="flex items-center gap-3">
                    <span
                      className="flex h-9 w-9 items-center justify-center rounded-full text-xs font-bold text-white"
                      style={{ backgroundColor: traveller?.avatarColor ?? "#1B6CB3" }}
                    >
                      {initials(traveller?.name ?? "PG")}
                    </span>
                    <div>
                      <div className="font-mono text-sm font-bold text-navy-900">{b.reference}</div>
                      <div className="text-sm text-navy-500">
                        {formatDate(b.startAt)} → {formatDate(b.endAt)}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <StatusBadge status={b.status} />
                    <span className="font-bold text-navy-900">
                      +{formatMoney(b.price.split.hostPayout, b.price.currency)}
                    </span>
                  </div>
                </div>
              );
            })}
          </Card>
        </section>

        <div className="grid gap-6 lg:grid-cols-2">
          {/* Earnings / payouts */}
          <section id="earnings" className="scroll-mt-20">
            <h3 className="mb-3 text-lg font-bold text-navy-900">Payouts</h3>
            <Card className="divide-y divide-navy-100">
              {payments.map((p) => (
                <div key={p.id} className="flex items-center justify-between p-4">
                  <div>
                    <div className="text-sm font-semibold text-navy-900">
                      {formatMoney(p.split.hostPayout, p.currency)}
                    </div>
                    <div className="text-xs text-navy-400">{formatDate(p.createdAt)}</div>
                  </div>
                  <StatusBadge status={p.payoutStatus} />
                </div>
              ))}
            </Card>
            <p className="mt-2 text-xs text-navy-400">
              Payouts run via Stripe Connect in live mode (commission deducted
              automatically at the source).
            </p>
          </section>

          {/* Verification */}
          <section id="verification" className="scroll-mt-20">
            <h3 className="mb-3 text-lg font-bold text-navy-900">Verification</h3>
            <Card className="p-5">
              <div className="flex items-center gap-2">
                <BadgeCheck className="h-5 w-5 text-go-600" />
                <span className="font-bold text-navy-900">Status</span>
                <span className="ml-auto">
                  <StatusBadge status={host.verificationStatus} />
                </span>
              </div>
              <ul className="mt-4 space-y-2 text-sm">
                {[
                  ["ID verified", true],
                  ["Address verified", true],
                  ["Right-to-list declaration", true],
                  ["Bank / payout details", !!host.payoutAccountRef],
                ].map(([label, done]) => (
                  <li key={String(label)} className="flex items-center gap-2 text-navy-700">
                    <span
                      className={`flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-bold ${
                        done ? "bg-go-100 text-go-700" : "bg-navy-100 text-navy-400"
                      }`}
                    >
                      {done ? "✓" : "–"}
                    </span>
                    {label}
                  </li>
                ))}
              </ul>
            </Card>
          </section>
        </div>
      </div>
    </PortalShell>
  );
}
