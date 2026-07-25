/**
 * Idle timeout for staff sessions.
 *
 * A support agent's console shows every customer's email, bookings and chat
 * history, so an unattended laptop is a real exposure. Ordinary traveller and
 * host sessions are left alone — the risk there is one person's own data, and
 * being logged out mid-booking is its own harm.
 *
 * The clock lives in a plain cookie refreshed on each staff page view. It is
 * not a security boundary on its own (a cookie is client-side), but the
 * middleware treats a missing or stale stamp as "log in again", so the worst
 * a tampered value buys is an earlier sign-out.
 */
export const STAFF_ACTIVITY_COOKIE = "parkgo_staff_seen";

/** Minutes of inactivity before a staff session is dropped. */
export const STAFF_IDLE_MINUTES = 30;

/** Paths that count as staff surface — everything behind /admin, plus /team. */
export function isStaffPath(pathname: string): boolean {
  return pathname.startsWith("/admin") || pathname.startsWith("/team/");
}

/**
 * Does this request prove someone is still at the desk?
 *
 * Page views obviously do. So does an agent's live-chat poll: sitting in one
 * conversation for half an hour is working, not idling, and logging that
 * person out mid-sentence would be the worst possible moment. The visitor
 * side of the same endpoint never passes `id`, so it can't hold a session open.
 */
export function isStaffActivity(pathname: string, search: string): boolean {
  if (isStaffPath(pathname)) return true;
  return pathname === "/api/support/thread" && new URLSearchParams(search).has("id");
}

/** True when the stamp is missing, unparseable, or older than the window. */
export function isIdleExpired(
  stamp: string | undefined,
  now: number = Date.now(),
  minutes: number = STAFF_IDLE_MINUTES
): boolean {
  if (!stamp) return false; // first staff view of the session — start the clock
  const seen = Number(stamp);
  if (!Number.isFinite(seen) || seen <= 0) return true;
  // A stamp from the future means a tampered or clock-skewed cookie; treat it
  // as suspect rather than as an indefinite extension.
  if (seen > now + 60_000) return true;
  return now - seen > minutes * 60_000;
}
