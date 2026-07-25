import Link from "next/link";
import type { Metadata } from "next";
import { ArrowUpRight, CalendarCheck, CheckCircle2, Download, XCircle } from "lucide-react";
import { Card } from "@/components/ui/card";
import { buttonVariants } from "@/components/ui/button";
import { PortalShell } from "@/components/portal/shell";
import { StatusBadge } from "@/components/portal/status";
import { adminNav, supportAgentNav } from "@/components/portal/navs";
import { requireRole } from "@/lib/auth";
import { adminCancelBookingAction } from "@/lib/admin-suite-actions";
import { listAllBookings } from "@/lib/data/bookings";
import { listAllSpaces } from "@/lib/data/hosts";
import { getUsersByIds } from "@/lib/data/users";
import { formatDate, formatMoney } from "@/lib/utils";
import { getI18n } from "@/lib/i18n";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Bookings",
  path: "/admin/bookings",
  noindex: true,
});

export default async function AdminBookingsPage({
  searchParams,
}: {
  searchParams: Promise<{ bstatus?: string; cancelled?: string; cancelerror?: string }>;
}) {
  const user = await requireRole("admin");
  const isFullAdmin = user.adminScope !== "support";
  const { t } = await getI18n();
  const { bstatus: bstatusRaw, cancelled, cancelerror } = await searchParams;

  const bookings = await listAllBookings();
  const spaces = await listAllSpaces();
  const travellerMap = await getUsersByIds(bookings.map((b) => b.travellerId));
  const spaceMap = new Map(spaces.map((s) => [s.id, s]));

  // Status filter pills (?bstatus=).
  const BOOKING_FILTERS = ["paid", "active", "completed", "cancelled"] as const;
  const bstatus = (BOOKING_FILTERS as readonly string[]).includes(bstatusRaw ?? "")
    ? (bstatusRaw as (typeof BOOKING_FILTERS)[number])
    : null;
  const filteredBookings = bstatus
    ? bookings.filter((b) => b.status === bstatus)
    : bookings;
  const recentBookings = [...filteredBookings]
    .sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt))
    .slice(0, 20);

  return (
    <PortalShell user={user} nav={user.adminScope === "support" ? supportAgentNav : adminNav} title="nav.bookings">
      <div className="mx-auto max-w-4xl space-y-6">
        <Link href="/admin" className="text-sm font-semibold text-brand-700">
          ← {t("common.backToDash")}
        </Link>

        {cancelled && (
          <div className="flex items-center gap-2 rounded-2xl border border-go-200 bg-go-50 px-4 py-3 font-semibold text-go-700">
            <CheckCircle2 className="h-5 w-5" /> {t("admin.cancel.done")}
          </div>
        )}
        {cancelerror && (
          <div className="flex items-center gap-2 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 font-semibold text-red-600">
            <XCircle className="h-5 w-5" /> {t("admin.cancel.fail")}
          </div>
        )}

        <section id="bookings">
          <div className="mb-3 flex items-center gap-2">
            <h3 className="flex items-center gap-2 text-lg font-bold text-navy-900">
              <CalendarCheck className="h-5 w-5 text-navy-500" /> {t("admin.section.recentBookings")}
            </h3>
            {isFullAdmin && (<a href="/admin/export?type=bookings" className={buttonVariants({ variant: "outline", size: "sm", className: "ms-auto" })}><Download className="h-4 w-4" /> {t("admin.exportCsv")}</a>)}
          </div>
          <div className="mb-3 flex flex-wrap gap-1.5">
            {[null, ...BOOKING_FILTERS].map((s) => {
              const active = s === null ? !bstatus : bstatus === s;
              const count = s ? bookings.filter((b) => b.status === s).length : bookings.length;
              return (
                <Link
                  key={s ?? "all"}
                  href={s ? `/admin/bookings?bstatus=${s}` : "/admin/bookings"}
                  className={`shrink-0 rounded-full border px-3 py-1.5 text-xs font-semibold transition-colors ${
                    active
                      ? "border-navy-900 bg-navy-900 text-white"
                      : "border-navy-200 bg-white text-navy-600 hover:bg-navy-50"
                  }`}
                >
                  {s ? t(`status.${s}`) : t("admin.filter.all")} · {count}
                </Link>
              );
            })}
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
                  <div className="flex flex-wrap items-center gap-2">
                    <span
                      className={
                        b.status === "cancelled"
                          ? "text-sm font-semibold text-navy-400 line-through"
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
                    {isFullAdmin && ["requested", "paid", "active"].includes(b.status) && (
                      <form action={adminCancelBookingAction} className="flex items-center gap-1.5">
                        <input type="hidden" name="bookingId" value={b.id} />
                        <input
                          name="reason"
                          placeholder={t("admin.cancel.reason")}
                          className="w-36 rounded-lg border border-navy-200 bg-white px-2 py-1.5 text-xs text-navy-700 placeholder:text-navy-400"
                        />
                        <button
                          type="submit"
                          className="inline-flex items-center gap-1 rounded-lg border border-red-200 bg-white px-3 py-1.5 text-xs font-semibold text-red-600 hover:bg-red-50"
                        >
                          <XCircle className="h-3.5 w-3.5" /> {t("admin.cancel.btn")}
                        </button>
                      </form>
                    )}
                  </div>
                </div>
              );
            })}
          </Card>
        </section>
      </div>
    </PortalShell>
  );
}
