import Link from "next/link";
import type { Metadata } from "next";
import {
  BadgeCheck,
  Banknote,
  Bell,
  Camera,
  CalendarCheck,
  CheckCircle2,
  Image as ImageIcon,
  Pencil,
  PlusCircle,
  ShieldCheck,
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
  getNotifications,
  getPaymentsForHost,
  getUser,
  trustScoreFor,
} from "@/lib/data/store";
import { getHostForUser, getSpacesForHost } from "@/lib/data/hosts";
import { formatDate, formatDateTime, formatMoney, initials } from "@/lib/utils";
import { connectPayoutsAction, updateHostProfileAction } from "@/lib/host-actions";
import { isStripeConfigured, getConnectStatus } from "@/lib/stripe";
import { getI18n } from "@/lib/i18n";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({ title: "Host dashboard", path: "/host", noindex: true });

export default async function HostDashboard({
  searchParams,
}: {
  searchParams: Promise<{ listed?: string; updated?: string; verify?: string }>;
}) {
  const user = await requireRole("host");
  const { t } = await getI18n();
  const { listed, updated, verify } = await searchParams;
  const host = await getHostForUser(user);

  // A brand-new host has no host record / listings yet — show onboarding
  // instead of assuming data exists (which would crash on a real account).
  if (!host) {
    return (
      <PortalShell user={user} nav={hostNav} title="host.pageTitle">
        <div className="mx-auto max-w-xl py-12 text-center">
          <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-brand-50 text-brand-600">
            <Warehouse className="h-8 w-8" />
          </div>
          <h2 className="text-2xl font-extrabold text-navy-900">{t("host.onboard.title")}</h2>
          <p className="mx-auto mt-2 max-w-md text-navy-600">{t("host.onboard.body")}</p>
          <Link href="/host/new" className={buttonVariants({ size: "lg", className: "mt-6" })}>
            <PlusCircle className="h-4 w-4" /> {t("host.listNewSpace")}
          </Link>
        </div>
      </PortalShell>
    );
  }

  const spaces = await getSpacesForHost(host.id);
  const bookings = getBookingsForHost(host.id);
  const payments = getPaymentsForHost(host.id);
  const notifications = getNotifications(user.id).slice(0, 5);
  const trust = trustScoreFor(host.id, "host");
  const band = trustBand(trust.score);

  const lifetimeEarnings = payments.reduce((s, p) => s + p.split.hostPayout, 0);
  const pendingPayouts = payments
    .filter((p) => p.payoutStatus !== "paid")
    .reduce((s, p) => s + p.split.hostPayout, 0);
  const liveCount = spaces.filter((s) => s.status === "live").length;

  // Stripe Connect payout status (only when Stripe is configured).
  const stripeOn = isStripeConfigured();
  const payoutStatus =
    stripeOn && host.payoutAccountRef ? await getConnectStatus(host.payoutAccountRef) : null;
  const payoutsReady = !!payoutStatus?.chargesEnabled;

  return (
    <PortalShell user={user} nav={hostNav} title="host.pageTitle">
      <div className="space-y-8">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-2xl font-extrabold text-navy-900">{host.displayName}</h2>
            <p className="text-navy-500">{t("host.subtitle")}</p>
          </div>
          {host.verificationStatus === "approved" ? (
            <Link href="/host/new" className={buttonVariants()}>
              <PlusCircle className="h-4 w-4" /> {t("host.listNewSpace")}
            </Link>
          ) : (
            <Link href="/host/verify" className={buttonVariants()}>
              <ShieldCheck className="h-4 w-4" /> {t("host.verify.cta")}
            </Link>
          )}
        </div>

        {listed && (
          <div className="flex items-center gap-2 rounded-2xl border border-go-200 bg-go-50 px-4 py-3 font-semibold text-go-700">
            <CheckCircle2 className="h-5 w-5" /> {t("host.listedBanner")}
          </div>
        )}
        {updated && (
          <div className="flex items-center gap-2 rounded-2xl border border-go-200 bg-go-50 px-4 py-3 font-semibold text-go-700">
            <CheckCircle2 className="h-5 w-5" /> {t("host.updatedBanner")}
          </div>
        )}
        {verify === "submitted" && (
          <div className="flex items-center gap-2 rounded-2xl border border-accent-200 bg-accent-50 px-4 py-3 font-semibold text-accent-500">
            <ShieldCheck className="h-5 w-5" /> {t("host.verify.submittedBanner")}
          </div>
        )}

        {/* Stats */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard label={t("host.stat.lifetimeEarnings")} value={formatMoney(lifetimeEarnings)} sub={t("host.stat.lifetimeEarningsSub")} icon={Banknote} tone="go" />
          <StatCard label={t("host.stat.pendingPayouts")} value={formatMoney(pendingPayouts)} sub={t("host.stat.pendingPayoutsSub")} icon={CalendarCheck} tone="accent" />
          <StatCard label={t("host.stat.liveListings")} value={String(liveCount)} sub={`${spaces.length} ${t("host.total")}`} icon={Warehouse} tone="brand" />
          <StatCard label={t("host.stat.trustScore")} value={`${trust.score}`} sub={`${band.label} · ${host.rating.toFixed(1)}★`} icon={Star} tone="navy" />
        </div>

        {/* Payouts (Stripe Connect) */}
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

        {/* Notifications */}
        {notifications.length > 0 && (
          <section>
            <h3 className="mb-3 flex items-center gap-2 text-lg font-bold text-navy-900">
              <Bell className="h-5 w-5 text-navy-500" /> {t("portal.notifications")}
            </h3>
            <Card className="divide-y divide-navy-100">
              {notifications.map((n) => (
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

        {/* Listings */}
        <section id="listings" className="scroll-mt-20">
          <h3 className="mb-3 text-lg font-bold text-navy-900">{t("host.section.listings")}</h3>
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
                      {s.status === "live" && (
                        <Badge tone="go">
                          <span className="h-1.5 w-1.5 rounded-full bg-go-500" /> {t("host.badge.live")}
                        </Badge>
                      )}
                      {s.cctv && (
                        <Badge tone="go">
                          <ShieldCheck className="h-3 w-3" /> {t("host.badge.cctv")}
                        </Badge>
                      )}
                      {s.evCharger && (
                        <Badge tone="brand">
                          <Zap className="h-3 w-3" /> {t("host.badge.ev")}
                        </Badge>
                      )}
                      {s.photos.length > 0 && (
                        <Badge tone="neutral">
                          <ImageIcon className="h-3 w-3" /> {t("host.badge.photosLive")}
                        </Badge>
                      )}
                      <Badge tone="neutral">{formatMoney(s.pricePerDay)}/day</Badge>
                    </div>
                    <div className="mt-3">
                      <Link
                        href={`/host/spaces/${s.id}/edit`}
                        className={buttonVariants({ variant: "outline", size: "sm" })}
                      >
                        <Pencil className="h-3.5 w-3.5" /> {t("host.editListing")}
                      </Link>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        </section>

        {/* Profile shown to guests (Airbnb-style) */}
        <section id="profile" className="scroll-mt-20">
          <h3 className="mb-3 text-lg font-bold text-navy-900">{t("host.section.yourProfile")}</h3>
          <Card className="p-5">
            <div className="flex items-start gap-4">
              <span
                className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full text-lg font-bold text-white"
                style={{ backgroundColor: user.avatarColor ?? "#F26A1B" }}
              >
                {initials(user.name)}
              </span>
              <div className="flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-bold text-navy-900">{user.name}</span>
                  <Badge tone="go">
                    <CheckCircle2 className="h-3.5 w-3.5" /> {t("host.profileShownToGuests")}
                  </Badge>
                </div>
                <p className="text-sm text-navy-500">
                  {t("host.profileBlurb")}
                </p>
              </div>
            </div>
            <form action={updateHostProfileAction} className="mt-4">
              <label htmlFor="bio" className="mb-1.5 block text-sm font-semibold text-navy-700">
                {t("host.bioLabel")}
              </label>
              <textarea
                id="bio"
                name="bio"
                rows={3}
                defaultValue={host.bio ?? ""}
                placeholder={t("host.bioPlaceholder")}
                className="w-full rounded-xl border border-navy-200 px-3.5 py-2.5 text-sm focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-100"
              />
              <button
                type="submit"
                className={buttonVariants({ variant: "outline", size: "sm", className: "mt-2" })}
              >
                {t("host.saveProfile")}
              </button>
            </form>
          </Card>
        </section>

        {/* Bookings */}
        <section id="bookings" className="scroll-mt-20">
          <h3 className="mb-3 text-lg font-bold text-navy-900">{t("host.section.recentBookings")}</h3>
          <Card className="divide-y divide-navy-100">
            {bookings.length === 0 && (
              <div className="p-6 text-center text-navy-500">{t("host.noBookings")}</div>
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
            <h3 className="mb-3 text-lg font-bold text-navy-900">{t("host.section.payouts")}</h3>
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
              {t("host.payoutsNote")}
            </p>
          </section>

          {/* Verification */}
          <section id="verification" className="scroll-mt-20">
            <h3 className="mb-3 text-lg font-bold text-navy-900">{t("host.section.verification")}</h3>
            <Card className="p-5">
              <div className="flex items-center gap-2">
                <BadgeCheck className="h-5 w-5 text-go-600" />
                <span className="font-bold text-navy-900">{t("host.verifStatus")}</span>
                <span className="ml-auto">
                  <StatusBadge status={host.verificationStatus} />
                </span>
              </div>
              <ul className="mt-4 space-y-2 text-sm">
                {[
                  [t("host.verif.id"), true],
                  [t("host.verif.address"), true],
                  [t("host.verif.rightToList"), true],
                  [t("host.verif.bank"), !!host.payoutAccountRef],
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
