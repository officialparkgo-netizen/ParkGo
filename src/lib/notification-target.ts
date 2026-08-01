import type { Notification, User } from "@/types";
import { rolePath } from "@/lib/auth";

export const NOTIF_REF_RE = /PG-[A-Z0-9]{4,8}/;

/**
 * Where a notification should take you. Booking-shaped ones carry a "PG-…"
 * reference we resolve to the role's booking page (the chat lives there);
 * the rest fall back to the section the kind belongs to. Shared by the
 * notifications page and the dashboard alert lists, so an alert opens the
 * same place wherever it is clicked.
 */
export function notificationTarget(
  n: Notification,
  user: User,
  byRef: Map<string, { id: string }>
): string | null {
  const ref = `${n.title} ${n.body}`.match(NOTIF_REF_RE)?.[0];
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
    case "support":
      // Staff-only kind: the desk is one click away. Anyone else (an old
      // notification on a demoted account) gets the public help page.
      return user.role === "admin" ? "/admin/support" : "/help";
    default:
      return null; // announcements etc. — nothing to open
  }
}

/** The booking references mentioned across a list of notifications. */
export function notificationRefs(notifications: Notification[]): string[] {
  return notifications.flatMap((n) => `${n.title} ${n.body}`.match(NOTIF_REF_RE) ?? []);
}
