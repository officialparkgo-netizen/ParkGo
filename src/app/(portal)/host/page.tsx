import Link from "next/link";
import type { Metadata } from "next";
import {
  BadgeCheck,
  Banknote,
  Bell,
  Camera,
  CalendarCheck,
  Car,
  CheckCircle2,
  ChevronDown,
  Download,
  PauseCircle,
  PlayCircle,
  Image as ImageIcon,
  Pencil,
  PlusCircle,
  ShieldCheck,
  Star,
  Warehouse,
  Zap,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Avatar } from "@/components/common/avatar";
import { EarningsChart } from "@/components/portal/earnings-chart";
import { HostCalendar } from "@/components/portal/host-calendar";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { Photo } from "@/components/common/photo";
import { PortalShell } from "@/components/portal/shell";
import { StatusBadge } from "@/components/portal/status";
import { StatCard } from "@/components/portal/stat-card";
import { hostNav } from "@/components/portal/navs";
import { trustBand } from "@/lib/trust";
import { requireRole } from "@/lib/auth";
import { getAirport, trustScoreFor } from "@/lib/data/store";
import { getHostForUser, getSpacesForHost } from "@/lib/data/hosts";
import { listBookingsForHost, listPaymentsForHost } from "@/lib/data/bookings";
import { getUsersByIds } from "@/lib/data/users";
import { listNotificationsForUser } from "@/lib/data/notifications";
import { formatDate, formatDateTime, formatMoney } from "@/lib/utils";
import { connectPayoutsAction } from "@/lib/host-actions";
import { pauseOwnSpaceAction } from "@/lib/booking-actions";
import { isStripeConfigured, getConnectStatus } from "@/lib/stripe";
import { getI18n } from "@/lib/i18n";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({ title: "Host dashboard", path: "/host", noindex: true });

export default async function HostDashboard({
  searchParams,
}: {
  searchParams: Promise<{
    listed?: string;
    updated?: string;
    verify?: string;
    cal?: string;
  }>;
}) {
  const user = await requireRole("host");
  const { t, locale } = await getI18n();
  const { listed, updated, verify, cal } = await searchParams;
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
  const bookings = await listBookingsForHost(host.id);
  const payments = await listPaymentsForHost(host.id);
  const travellerMap = await getUsersByIds(bookings.map((b) => b.travellerId));
  const notifications = (await listNotificationsForUser(user.id)).slice(0, 5);
  const trust = trustScoreFor(host.id, "host");
  const band = trustBand(trust.score);

  // Cancelled bookings are refunded — exclude their payments from earnings.
  // (Double guard: payout_status 'refunded' OR the booking itself cancelled.)
  const cancelledIds = new Set(
    bookings.filter((b) => b.status === "cancelled").map((b) => b.id)
  );
  const isRefunded = (p: (typeof payments)[number]) =>
    p.payoutStatus === "refunded" || cancelledIds.has(p.bookingId);
  const earnedPayments = payments.filter((p) => !isRefunded(p));

  const lifetimeEarnings = earnedPayments.reduce((s, p) => s + p.split.hostPayout, 0);

  // Host payouts by calendar month, last six months (for the earnings chart).
  const localeTag =
    { en: "en-GB", ur: "ur-PK", hi: "hi-IN", de: "de-DE", zh: "zh-CN" }[locale] ?? "en-GB";
  const monthKey = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
  const nowDate = new Date();
  const earningsMonths = Array.from({ length: 6 }, (_, i) => {
    const d = new Date(nowDate.getFullYear(), nowDate.getMonth() - (5 - i), 1);
    return { key: monthKey(d), label: d.toLocaleDateString(localeTag, { month: "short" }), value: 0 };
  });
  for (const pay of earnedPayments) {
    const m = earningsMonths.find((x) => x.key === monthKey(new Date(pay.createdAt)));
    if (m) m.value += pay.split.hostPayout;
  }
  // Calendar month from ?cal=YYYY-MM (falls back to the current month).
  const calMonth = /^\d{4}-(0[1-9]|1[0-2])$/.test(cal ?? "")
    ? (cal as string)
    : monthKey(nowDate);
  const pendingPayouts = earnedPayments
    .filter((p) => p.payoutStatus !== "paid")
    .reduce((s, p) => s + p.split.hostPayout, 0);
  const liveCount = spaces.filter((s) => s.status === "live").length;
  const upcoming = bookings
    .filter(
      (b) =>
        (b.status === "paid" || b.status === "active") &&
        new Date(b.startAt).getTime() > Date.now()
    )
    .sort((a, b) => +new Date(a.startAt) - +new Date(b.startAt));
  const upcomingCount = upcoming.length;
  const nextBooking = upcoming[0];
  const daysToArrival = nextBooking
    ? Math.max(0, Math.ceil((new Date(nextBooking.startAt).getTime() - Date.now()) / 86_400_000))
    : 0;
  const nowMs = Date.now();
  const isPastBooking = (b: (typeof bookings)[number]) =>
    b.status === "cancelled" ||
    b.status === "completed" ||
    b.status === "reviewed" ||
    new Date(b.endAt).getTime() < nowMs;
  const upcomingBookings = bookings
    .filter((b) => !isPastBooking(b))
    .sort((a, b) => +new Date(a.startAt) - +new Date(b.startAt));
  const pastBookings = bookings
    .filter(isPastBooking)
    .sort((a, b) => +new Date(b.endAt) - +new Date(a.endAt));

  const renderHostBooking = (b: (typeof bookings)[number]) => {
              const traveller = travellerMap.get(b.travellerId);
              return (
                <div key={b.id} className="flex flex-wrap items-center justify-between gap-3 p-4">
                  <div className="flex items-center gap-3">
                    <Avatar
                      name={traveller?.name ?? "PG"}
                      avatarUrl={traveller?.avatarUrl}
                      color={traveller?.avatarColor ?? "#1B6CB3"}
                      className="h-9 w-9 text-xs"
                    />
                    <div>
                      <div className="font-mono text-sm font-bold text-navy-900">{b.reference}</div>
                      <div className="text-sm text-navy-500">
                        {formatDate(b.startAt)} → {formatDate(b.endAt)}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <StatusBadge status={b.status} />
                    {b.status === "cancelled" ? (
                      <span className="font-bold text-navy-300 line-through">
                        {formatMoney(b.price.split.hostPayout, b.price.currency)}
                      </span>
                    ) : (
                      <span className="font-bold text-navy-900">
                        +{formatMoney(b.price.split.hostPayout, b.price.currency)}
                      </span>
                    )}
                  </div>
                </div>
              );
  };

  const spaceMap = new Map(spaces.map((s) => [s.id, s]));

  // Confirmed bookings per listing (cancelled ones don't count).
  const bookingsBySpace = new Map<string, number>();
  bookings.forEach((b) => {
    if (b.status === "cancelled" || b.status === "requested") return;
    bookingsBySpace.set(b.spaceId, (bookingsBySpace.get(b.spaceId) ?? 0) + 1);
  });

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
        <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-3 xl:grid-cols-5">
          <StatCard label={t("host.stat.lifetimeEarnings")} value={formatMoney(lifetimeEarnings)} sub={t("host.stat.lifetimeEarningsSub")} icon={Banknote} tone="go" />
          <StatCard label={t("host.stat.pendingPayouts")} value={formatMoney(pendingPayouts)} sub={t("host.stat.pendingPayoutsSub")} icon={CalendarCheck} tone="accent" />
          <StatCard label={t("host.stat.upcoming")} value={String(upcomingCount)} sub={t("host.stat.upcomingSub")} icon={CalendarCheck} tone="brand" />
          <StatCard label={t("host.stat.liveListings")} value={String(liveCount)} sub={`${spaces.length} ${t("host.total")}`} icon={Warehouse} tone="brand" />
          <StatCard label={t("host.stat.trustScore")} value={`${trust.score}`} sub={`${band.label} · ${host.rating.toFixed(1)}★`} icon={Star} tone="navy" />
        </div>

        {/* Earnings trend */}
        <Card className="p-5">
          <div className="mb-4 flex items-center justify-between gap-3">
            <h3 className="font-bold text-navy-900">{t("host.earnings.title")}</h3>
            <span className="text-xs text-navy-400">{t("host.earnings.sub")}</span>
          </div>
          <EarningsChart
            months={earningsMonths}
            currency="GBP"
            title={t("host.earnings.title")}
          />
        </Card>

        {/* Next arrival */}
        {nextBooking && (
          <Card className="flex flex-wrap items-center justify-between gap-3 border-brand-200 bg-brand-50/40 p-5">
            <div className="flex items-center gap-3">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-brand-100 text-brand-700">
                <CalendarCheck className="h-5 w-5" />
              </span>
              <div>
                <div className="text-xs font-semibold uppercase tracking-wide text-brand-600">
                  {t("host.nextArrival")}
                </div>
                <div className="font-bold text-navy-900">
                  {travellerMap.get(nextBooking.travellerId)?.name ?? "—"} ·{" "}
                  {spaceMap.get(nextBooking.spaceId)?.title ?? nextBooking.spaceId}
                </div>
                <div className="text-sm text-navy-600">{formatDateTime(nextBooking.startAt)}</div>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-center">
                <div className="text-2xl font-extrabold leading-none text-navy-900">
                  {daysToArrival === 0 ? t("app.dash.today") : daysToArrival}
                </div>
                {daysToArrival > 0 && (
                  <div className="mt-0.5 text-[11px] text-navy-400">
                    {daysToArrival === 1 ? t("common.day") : t("common.days")} ·{" "}
                    {t("host.untilArrival")}
                  </div>
                )}
              </div>
              <span className="text-lg font-extrabold text-navy-900">
                +{formatMoney(nextBooking.price.split.hostPayout, nextBooking.price.currency)}
              </span>
            </div>
          </Card>
        )}

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
                      <Badge tone="navy">
                        <Car className="h-3 w-3" /> {s.capacity ?? 1} {t("app.space.carSpaces")}
                      </Badge>
                      {(bookingsBySpace.get(s.id) ?? 0) > 0 && (
                        <Badge tone="neutral">
                          <CalendarCheck className="h-3 w-3" /> {bookingsBySpace.get(s.id)}{" "}
                          {t("host.badge.bookings")}
                        </Badge>
                      )}
                      <Badge tone="neutral">{formatMoney(s.pricePerDay)}/day</Badge>
                      {s.pricePerHour && (
                        <Badge tone="neutral">
                          {formatMoney(s.pricePerHour)}/{t("common.hour")}
                        </Badge>
                      )}
                    </div>
                    <div className="mt-3 flex flex-wrap items-center gap-2">
                      <Link
                        href={`/host/spaces/${s.id}/edit`}
                        className={buttonVariants({ variant: "outline", size: "sm" })}
                      >
                        <Pencil className="h-3.5 w-3.5" /> {t("host.editListing")}
                      </Link>
                      {(s.status === "live" || s.status === "paused") && (
                        <form action={pauseOwnSpaceAction}>
                          <input type="hidden" name="spaceId" value={s.id} />
                          <input
                            type="hidden"
                            name="state"
                            value={s.status === "live" ? "pause" : "reactivate"}
                          />
                          <button
                            type="submit"
                            className={buttonVariants({
                              variant: s.status === "live" ? "ghost" : "primary",
                              size: "sm",
                            })}
                          >
                            {s.status === "live" ? (
                              <>
                                <PauseCircle className="h-3.5 w-3.5" /> {t("host.pauseListing")}
                              </>
                            ) : (
                              <>
                                <PlayCircle className="h-3.5 w-3.5" /> {t("host.resumeListing")}
                              </>
                            )}
                          </button>
                        </form>
                      )}
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        </section>

        {/* Bookings */}
        <section id="bookings" className="scroll-mt-20">
          <h3 className="mb-3 text-lg font-bold text-navy-900">{t("host.section.recentBookings")}</h3>
          {bookings.length === 0 ? (
            <Card className="p-6 text-center text-navy-500">{t("host.noBookings")}</Card>
          ) : (
            <div className="space-y-6">
              {upcomingBookings.length > 0 && (
                <div>
                  <div className="mb-2 flex items-center gap-2">
                    <h4 className="text-xs font-bold uppercase tracking-wide text-navy-500">
                      {t("host.bookings.upcoming")}
                    </h4>
                    <Badge tone="brand">{upcomingBookings.length}</Badge>
                  </div>
                  <Card className="divide-y divide-navy-100">
                    {upcomingBookings.map(renderHostBooking)}
                  </Card>
                </div>
              )}
              {pastBookings.length > 0 && (
                <details className="group" open={upcomingBookings.length === 0}>
                  <summary className="mb-2 flex cursor-pointer list-none items-center gap-2 [&::-webkit-details-marker]:hidden">
                    <h4 className="text-xs font-bold uppercase tracking-wide text-navy-500">
                      {t("host.bookings.past")}
                    </h4>
                    <Badge tone="neutral">{pastBookings.length}</Badge>
                    <ChevronDown className="h-4 w-4 text-navy-400 transition-transform group-open:rotate-180" aria-hidden />
                  </summary>
                  <Card className="divide-y divide-navy-100">
                    {pastBookings.map(renderHostBooking)}
                  </Card>
                </details>
              )}
            </div>
          )}
        </section>

        {/* Occupancy calendar */}
        <section id="calendar" className="scroll-mt-20">
          <h3 className="mb-3 text-lg font-bold text-navy-900">{t("host.cal.title")}</h3>
          <Card className="p-5">
            <HostCalendar
              bookings={bookings.map((b) => ({
                startAt: b.startAt,
                endAt: b.endAt,
                status: b.status,
              }))}
              month={calMonth}
              localeTag={localeTag}
              labels={{
                prev: t("host.cal.prev"),
                next: t("host.cal.next"),
                legend: t("host.cal.legend"),
              }}
            />
          </Card>
        </section>

        <div className="grid gap-6 lg:grid-cols-2">
          {/* Earnings / payouts */}
          <section id="earnings" className="scroll-mt-20">
            <div className="mb-3 flex items-center justify-between gap-2">
              <h3 className="text-lg font-bold text-navy-900">{t("host.section.payouts")}</h3>
              <a
                href="/host/export"
                className={buttonVariants({ variant: "outline", size: "sm" })}
              >
                <Download className="h-4 w-4" /> {t("host.export")}
              </a>
            </div>
            <Card className="divide-y divide-navy-100">
              {payments.map((p) => {
                const refunded = isRefunded(p);
                return (
                  <div key={p.id} className="flex items-center justify-between p-4">
                    <div>
                      <div
                        className={
                          refunded
                            ? "text-sm font-semibold text-navy-300 line-through"
                            : "text-sm font-semibold text-navy-900"
                        }
                      >
                        {formatMoney(p.split.hostPayout, p.currency)}
                      </div>
                      <div className="text-xs text-navy-400">{formatDate(p.createdAt)}</div>
                    </div>
                    <StatusBadge status={refunded ? "refunded" : p.payoutStatus} />
                  </div>
                );
              })}
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
