import Link from "next/link";
import type { Metadata } from "next";
import {
  ArrowUpRight,
  CalendarCheck,
  CalendarClock,
  Car,
  Headset,
  LogIn,
  LogOut,
  ShieldAlert,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PortalShell } from "@/components/portal/shell";
import { StatusBadge } from "@/components/portal/status";
import { adminNav } from "@/components/portal/navs";
import { requireRole } from "@/lib/auth";
import { listAllBookings } from "@/lib/data/bookings";
import { listAllSpaces } from "@/lib/data/hosts";
import { getUsersByIds } from "@/lib/data/users";
import { listPendingVerificationsLive } from "@/lib/data/verifications";
import { listSupportTickets } from "@/lib/data/support";
import { listAllClaims } from "@/lib/data/claims";
import { getOperatorJobs } from "@/lib/services/transfer-operator";
import { formatDateTime } from "@/lib/utils";
import { getI18n } from "@/lib/i18n";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Today",
  path: "/admin/today",
  noindex: true,
});

/** Live-ops view: everything happening on site today, one screen. */
export default async function AdminTodayPage() {
  const user = await requireRole("admin");
  const { t } = await getI18n();

  const bookings = await listAllBookings();
  const spaces = await listAllSpaces();
  const spaceMap = new Map(spaces.map((s) => [s.id, s]));
  const travellerMap = await getUsersByIds(bookings.map((b) => b.travellerId));

  const dayStart = new Date();
  dayStart.setHours(0, 0, 0, 0);
  const dayEnd = new Date(dayStart.getTime() + 86_400_000);
  const inToday = (iso: string) => {
    const ts = +new Date(iso);
    return ts >= +dayStart && ts < +dayEnd;
  };
  const relevant = (b: (typeof bookings)[number]) =>
    b.status === "paid" || b.status === "active";
  const arrivals = bookings
    .filter((b) => relevant(b) && inToday(b.startAt))
    .sort((a, b) => +new Date(a.startAt) - +new Date(b.startAt));
  const departures = bookings
    .filter((b) => relevant(b) && inToday(b.endAt))
    .sort((a, b) => +new Date(a.endAt) - +new Date(b.endAt));

  const operatorJobs = getOperatorJobs();
  const pending = await listPendingVerificationsLive();
  const openTickets = (await listSupportTickets().catch(() => [])).filter(
    (x) => x.status === "open"
  ).length;
  const openClaims = (await listAllClaims()).filter(
    (c) => c.status === "open" || c.status === "in_review"
  ).length;

  const renderRow = (b: (typeof bookings)[number], when: string) => (
    <div key={b.id} className="flex flex-wrap items-center justify-between gap-3 p-4">
      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-2">
          <span className="font-mono text-sm font-bold text-navy-900">{b.reference}</span>
          <StatusBadge status={b.status} />
        </div>
        <div className="mt-0.5 text-xs text-navy-400">
          {travellerMap.get(b.travellerId)?.name ?? "—"} ·{" "}
          {spaceMap.get(b.spaceId)?.title ?? b.spaceId}
        </div>
      </div>
      <div className="flex items-center gap-3">
        <span className="text-sm font-semibold text-navy-800">{when}</span>
        <Link
          href={`/app/booking/${b.id}`}
          className="inline-flex items-center gap-1 rounded-lg border border-navy-200 bg-white px-3 py-1.5 text-xs font-semibold text-navy-600 hover:bg-navy-50"
        >
          <ArrowUpRight className="h-3.5 w-3.5" /> {t("admin.view")}
        </Link>
      </div>
    </div>
  );

  return (
    <PortalShell user={user} nav={adminNav} title="admin.today.title">
      <div className="mx-auto max-w-4xl space-y-6">
        <Link href="/admin" className="text-sm font-semibold text-brand-600">
          ← {t("common.backToDash")}
        </Link>

        <div className="flex flex-wrap items-center gap-2">
          <h2 className="flex items-center gap-2 text-xl font-extrabold text-navy-900">
            <CalendarClock className="h-5 w-5 text-brand-600" /> {t("admin.today.title")}
          </h2>
          <span className="text-sm text-navy-500">
            {new Date().toLocaleDateString("en-GB", {
              weekday: "long",
              day: "numeric",
              month: "long",
            })}
          </span>
        </div>

        {/* Needs-attention chips */}
        <div className="flex flex-wrap gap-2 text-sm">
          <Link
            href="/admin/verification"
            className="inline-flex items-center gap-1.5 rounded-full bg-accent-50 px-3 py-1.5 font-semibold text-accent-500 hover:bg-accent-100"
          >
            <ShieldAlert className="h-3.5 w-3.5" /> {pending.length}{" "}
            {t("admin.attention.verifications")}
          </Link>
          <Link
            href="/admin/support"
            className="inline-flex items-center gap-1.5 rounded-full bg-navy-50 px-3 py-1.5 font-semibold text-navy-600 hover:bg-navy-100"
          >
            <Headset className="h-3.5 w-3.5" /> {openTickets} {t("admin.attention.tickets")}
          </Link>
          <Link
            href="/admin/claims"
            className="inline-flex items-center gap-1.5 rounded-full bg-navy-50 px-3 py-1.5 font-semibold text-navy-600 hover:bg-navy-100"
          >
            <ShieldAlert className="h-3.5 w-3.5" /> {openClaims} {t("admin.today.claims")}
          </Link>
        </div>

        {/* Arrivals */}
        <section id="arrivals">
          <div className="mb-3 flex items-center gap-2">
            <h3 className="flex items-center gap-2 text-lg font-bold text-navy-900">
              <LogIn className="h-5 w-5 text-go-600" /> {t("admin.today.arrivals")}
            </h3>
            <Badge tone={arrivals.length > 0 ? "go" : "neutral"}>{arrivals.length}</Badge>
          </div>
          <Card className="divide-y divide-navy-100">
            {arrivals.length === 0 && (
              <div className="p-6 text-center text-sm text-navy-500">
                {t("admin.today.none")}
              </div>
            )}
            {arrivals.map((b) =>
              renderRow(
                b,
                new Date(b.startAt).toLocaleTimeString("en-GB", {
                  hour: "2-digit",
                  minute: "2-digit",
                })
              )
            )}
          </Card>
        </section>

        {/* Departures */}
        <section id="departures">
          <div className="mb-3 flex items-center gap-2">
            <h3 className="flex items-center gap-2 text-lg font-bold text-navy-900">
              <LogOut className="h-5 w-5 text-brand-600" /> {t("admin.today.departures")}
            </h3>
            <Badge tone={departures.length > 0 ? "brand" : "neutral"}>
              {departures.length}
            </Badge>
          </div>
          <Card className="divide-y divide-navy-100">
            {departures.length === 0 && (
              <div className="p-6 text-center text-sm text-navy-500">
                {t("admin.today.none")}
              </div>
            )}
            {departures.map((b) =>
              renderRow(
                b,
                new Date(b.endAt).toLocaleTimeString("en-GB", {
                  hour: "2-digit",
                  minute: "2-digit",
                })
              )
            )}
          </Card>
        </section>

        {/* Transfers on the road */}
        <section id="transfers">
          <div className="mb-3 flex items-center gap-2">
            <h3 className="flex items-center gap-2 text-lg font-bold text-navy-900">
              <Car className="h-5 w-5 text-navy-500" /> {t("admin.liveJobs")}
            </h3>
            <Badge tone="neutral">{operatorJobs.length}</Badge>
          </div>
          <Card className="divide-y divide-navy-100">
            {operatorJobs.length === 0 && (
              <div className="p-6 text-center text-sm text-navy-500">{t("admin.noJobs")}</div>
            )}
            {operatorJobs.map((job) => (
              <div key={job.id} className="flex flex-wrap items-center justify-between gap-3 p-4">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-sm font-bold text-navy-900">
                    {job.bookingRef}
                  </span>
                  <StatusBadge status={job.status} />
                </div>
                <span className="text-sm text-navy-500">
                  {job.driverName}
                  {job.etaMinutes !== null
                    ? ` · ${t("admin.eta")} ${job.etaMinutes} ${t("admin.min")}`
                    : ""}
                </span>
              </div>
            ))}
          </Card>
          <p className="mt-2 flex items-center gap-1 text-xs text-navy-400">
            <CalendarCheck className="h-3.5 w-3.5" /> {formatDateTime(new Date().toISOString())}
          </p>
        </section>
      </div>
    </PortalShell>
  );
}
