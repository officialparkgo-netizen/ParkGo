import type { AdminAction, Booking, User } from "@/types";

export interface RiskFlag {
  key: "high_cancel_rate" | "disposable_email" | "new_account_high_value" | "previously_suspended";
  severity: "warn" | "high";
}

const DISPOSABLE_DOMAINS = [
  "mailinator.com",
  "guerrillamail.com",
  "10minutemail.com",
  "tempmail.com",
  "temp-mail.org",
  "yopmail.com",
  "sharklasers.com",
  "trashmail.com",
];

/**
 * Cheap screening heuristics for the admin user page. Signals, not verdicts —
 * they tell an admin where to look first, nothing is automated off them.
 */
export function computeRiskFlags(input: {
  user: Pick<User, "email" | "createdAt">;
  bookings: Pick<Booking, "status" | "createdAt" | "price">[];
  actions?: Pick<AdminAction, "action">[];
  now?: number;
}): RiskFlag[] {
  const flags: RiskFlag[] = [];
  const now = input.now ?? Date.now();

  // 1. Cancels a lot: 2+ cancellations AND over 30% of their bookings.
  const cancelled = input.bookings.filter((b) => b.status === "cancelled").length;
  if (
    cancelled >= 2 &&
    input.bookings.length > 0 &&
    cancelled / input.bookings.length > 0.3
  ) {
    flags.push({ key: "high_cancel_rate", severity: "warn" });
  }

  // 2. Disposable email domain.
  const domain = input.user.email.split("@")[1]?.toLowerCase() ?? "";
  if (DISPOSABLE_DOMAINS.includes(domain)) {
    flags.push({ key: "disposable_email", severity: "high" });
  }

  // 3. Brand-new account with a high-value booking (>£150 within 48h of signup).
  const accountAgeMs = now - +new Date(input.user.createdAt);
  if (
    accountAgeMs < 48 * 3_600_000 &&
    input.bookings.some(
      (b) => b.status !== "cancelled" && b.price.total > 15_000
    )
  ) {
    flags.push({ key: "new_account_high_value", severity: "warn" });
  }

  // 4. Was suspended before (from the admin action log).
  if (input.actions?.some((a) => a.action === "user.suspended")) {
    flags.push({ key: "previously_suspended", severity: "high" });
  }

  return flags;
}
