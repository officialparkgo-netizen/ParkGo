import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, Bell, ChevronRight } from "lucide-react";
import type { Notification, User } from "@/types";
import { Card } from "@/components/ui/card";
import { PortalShell } from "@/components/portal/shell";
import {
  adminNav,
  cohostNav,
  hostNav,
  supportAgentNav,
  travellerNav,
} from "@/components/portal/navs";
import { requireUser, rolePath } from "@/lib/auth";
import {
  listNotificationsForUser,
  markAllNotificationsRead,
} from "@/lib/data/notifications";
import { listBookingsByReferences } from "@/lib/data/bookings";
import { formatDateTime } from "@/lib/utils";
import { getI18n } from "@/lib/i18n";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Notifications",
  path: "/notifications",
  noindex: true,
});

const REF_RE = /PG-[A-Z0-9]{4,8}/;

/**
 * Where a notification should take you. Booking-shaped ones carry a "PG-…"
 * reference we resolve to the role's booking page (the chat lives there);
 * the rest fall back to the section the kind belongs to.
 */
function notificationTarget(
  n: Notification,
  user: User,
  byRef: Map<string, { id: string }>
): string | null {
  const ref = `${n.title} ${n.body}`.match(REF_RE)?.[0];
  const booking = ref ? byRef.get(ref) : undefined;
  if (booking) {
    if (user.role === "host") return `/host/bookings/${booking.id}`;
    if (n.kind === "handover") return `/app/booking/${booking.id}/track`;
    return `/app/booking/${booking.id}`; // traveller — and admins may view too
  }
  switch (n.kind) {
    case "payout":
      if (user.role === "host") return "/host/payouts";
      if (user.role === "admin") return "/admin/payments";
      return "/app/trips";
    case "verification":
      if (user.role === "host") return "/host/verify";
      if (user.role === "admin") return "/admin/verification";
      return rolePath(user.role);
    case "booking":
    case "handover":
      if (user.role === "host") return "/host/today";
      if (user.role === "admin") return "/admin/bookings";
      return "/app/trips";
    default:
      return null; // announcements etc. — nothing to open
  }
}

export default async function NotificationsPage() {
  const user = await requireUser();
  const { t } = await getI18n();
  const notifications = await listNotificationsForUser(user.id);
  // Opening the page clears the unread badge; the dots below still show
  // which ones were new on this visit (the list was read first).
  await markAllNotificationsRead(user.id);
  const nav =
    user.role === "admin"
      ? user.adminScope === "support"
        ? supportAgentNav
        : adminNav
      : user.role === "host"
        ? user.cohostHostId
          ? cohostNav
          : hostNav
        : travellerNav;

  // One lookup for every reference mentioned across the list.
  const refs = notifications.flatMap(
    (n) => `${n.title} ${n.body}`.match(REF_RE) ?? []
  );
  const byRef = new Map(
    (await listBookingsByReferences(refs)).map((b) => [b.reference, b])
  );

  return (
    <PortalShell user={user} nav={nav} title="portal.notifications">
      <div className="mx-auto max-w-3xl space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="flex items-center gap-2 text-2xl font-extrabold text-navy-900">
              <Bell className="h-6 w-6 text-brand-500" /> {t("portal.notifications")}
            </h2>
            <p className="text-navy-500">{t("notif.sub")}</p>
          </div>
          <Link
            href={rolePath(user.role)}
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-navy-600 hover:text-navy-900"
          >
            <ArrowLeft className="h-4 w-4 rtl:-scale-x-100" /> {t("notif.back")}
          </Link>
        </div>

        {notifications.length === 0 ? (
          <Card className="p-10 text-center">
            <Bell className="mx-auto mb-3 h-8 w-8 text-navy-300" aria-hidden />
            <p className="font-semibold text-navy-700">{t("notif.emptyTitle")}</p>
            <p className="mt-1 text-sm text-navy-500">{t("notif.emptySub")}</p>
          </Card>
        ) : (
          <Card className="divide-y divide-navy-100">
            {notifications.map((n) => {
              const target = notificationTarget(n, user, byRef);
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
                  data-notif-link
                  className="group flex items-start gap-3 p-4 transition-colors hover:bg-navy-50/60"
                >
                  {row}
                  <ChevronRight className="mt-1 h-4 w-4 shrink-0 text-navy-300 transition-colors group-hover:text-brand-700 rtl:-scale-x-100" />
                </Link>
              ) : (
                <div key={n.id} className="flex items-start gap-3 p-4">
                  {row}
                </div>
              );
            })}
          </Card>
        )}
      </div>
    </PortalShell>
  );
}
