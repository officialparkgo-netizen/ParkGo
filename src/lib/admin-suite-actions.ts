"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { requireRole, requireUser, rolePath } from "@/lib/auth";
import { recordAdminAction } from "@/lib/data/admin-actions";
import { adminCancelBooking, getBookingById, markPayoutPaid } from "@/lib/data/bookings";
import { setReviewHiddenAdmin } from "@/lib/data/reviews";
import { createPromo, setPromoActive } from "@/lib/data/promos";
import { fileClaim, setClaimStatus } from "@/lib/data/claims";
import { getUsersByIds, listAllUsers } from "@/lib/data/users";
import { listWaitlist } from "@/lib/data/waitlist";
import {
  IMPERSONATE_COOKIE,
  IMPERSONATE_MS,
  makeImpersonationToken,
} from "@/lib/impersonation";
import { isEmailConfigured, sendEmail, emailShell } from "@/lib/email";
import { IS_LIVE } from "@/lib/config";
import type { ClaimStatus, PromoKind } from "@/types";

/** Support cancellation: full refund, no fee; logged to the admin action log. */
export async function adminCancelBookingAction(formData: FormData) {
  const admin = await requireRole("admin");
  const bookingId = String(formData.get("bookingId") || "");
  const reason = String(formData.get("reason") || "").trim().slice(0, 300);
  if (!bookingId) return;
  const result = await adminCancelBooking(bookingId);
  if (result.ok) {
    await recordAdminAction(
      admin,
      "booking.cancelled_refunded",
      "booking",
      bookingId,
      reason || undefined
    );
  }
  revalidatePath("/admin/bookings");
  revalidatePath("/admin");
  redirect(`/admin/bookings?${result.ok ? "cancelled=1" : "cancelerror=1"}`);
}

/** Manually settle a payout (bank transfer done outside Stripe). */
export async function markPayoutPaidAction(formData: FormData) {
  const admin = await requireRole("admin");
  const paymentId = String(formData.get("paymentId") || "");
  if (!paymentId) return;
  const ok = await markPayoutPaid(paymentId);
  if (ok) await recordAdminAction(admin, "payout.marked_paid", "payment", paymentId);
  revalidatePath("/admin/payments");
  revalidatePath("/admin");
}

/** Hide/restore a review on public pages. */
export async function setReviewHiddenAction(formData: FormData) {
  const admin = await requireRole("admin");
  const reviewId = String(formData.get("reviewId") || "");
  const hidden = String(formData.get("state") || "") === "hide";
  if (!reviewId) return;
  const ok = await setReviewHiddenAdmin(reviewId, hidden);
  if (ok) {
    await recordAdminAction(admin, hidden ? "review.hidden" : "review.restored", "review", reviewId);
  }
  revalidatePath("/admin/reviews");
}

export async function createPromoAction(formData: FormData) {
  const admin = await requireRole("admin");
  const code = String(formData.get("code") || "");
  const kind: PromoKind = String(formData.get("kind")) === "fixed" ? "fixed" : "percent";
  const valueRaw = Number(formData.get("value") || 0);
  // Percent codes are whole percents; fixed codes are entered in pounds.
  const value = kind === "percent" ? Math.round(valueRaw) : Math.round(valueRaw * 100);
  const maxUsesRaw = Number(formData.get("maxUses") || 0);
  const expiresRaw = String(formData.get("expiresAt") || "");
  const promo = await createPromo({
    code,
    kind,
    value,
    ...(maxUsesRaw > 0 ? { maxUses: Math.round(maxUsesRaw) } : {}),
    ...(/^\d{4}-\d{2}-\d{2}$/.test(expiresRaw)
      ? { expiresAt: new Date(`${expiresRaw}T23:59:59Z`).toISOString() }
      : {}),
  });
  if (promo) {
    await recordAdminAction(admin, "promo.created", "promo", promo.id, promo.code);
  }
  revalidatePath("/admin/promos");
  redirect(`/admin/promos?${promo ? "created=1" : "createerror=1"}`);
}

export async function setPromoActiveAction(formData: FormData) {
  const admin = await requireRole("admin");
  const id = String(formData.get("promoId") || "");
  const active = String(formData.get("state") || "") === "on";
  if (!id) return;
  const ok = await setPromoActive(id, active);
  if (ok) {
    await recordAdminAction(admin, active ? "promo.enabled" : "promo.disabled", "promo", id);
  }
  revalidatePath("/admin/promos");
}

/** Internal note on a user, stored in the admin action log. */
export async function addUserNoteAction(formData: FormData) {
  const admin = await requireRole("admin");
  const userId = String(formData.get("userId") || "");
  const note = String(formData.get("note") || "").trim().slice(0, 500);
  if (!userId || !note) return;
  await recordAdminAction(admin, "note", "user", userId, note);
  revalidatePath(`/admin/users/${userId}`);
}

/** Start viewing the app as another (non-admin) user. */
export async function startImpersonationAction(formData: FormData) {
  const admin = await requireRole("admin");
  const userId = String(formData.get("userId") || "");
  if (!userId) return;
  const target = (await getUsersByIds([userId])).get(userId);
  if (!target || target.role === "admin") return;
  const store = await cookies();
  store.set(IMPERSONATE_COOKIE, makeImpersonationToken(userId), {
    httpOnly: true,
    sameSite: "lax",
    secure: IS_LIVE,
    maxAge: Math.floor(IMPERSONATE_MS / 1000),
    path: "/",
  });
  await recordAdminAction(admin, "impersonation.started", "user", userId, target.email);
  redirect(rolePath(target.role));
}

/** Exit impersonation and return to the admin portal. */
export async function stopImpersonationAction() {
  const user = await requireUser(); // impersonated target (or the admin)
  const store = await cookies();
  store.delete(IMPERSONATE_COOKIE);
  if (user.impersonatedBy) {
    await recordAdminAction(
      { id: user.impersonatedBy, name: "Admin" },
      "impersonation.stopped",
      "user",
      user.id
    );
  }
  redirect("/admin/users");
}

/** Traveller/host: file a damage or incident claim against a booking. */
export async function fileClaimAction(formData: FormData) {
  const user = await requireUser();
  const bookingId = String(formData.get("bookingId") || "");
  const description = String(formData.get("description") || "");
  const booking = await getBookingById(bookingId);
  if (!booking) redirect("/app");
  // Only the traveller who owns the booking (or an admin) can raise it here.
  if (booking.travellerId !== user.id && user.role !== "admin") redirect("/app");
  const claim = await fileClaim({
    bookingId,
    bookingRef: booking.reference,
    openedBy: user.id,
    openedByRole: user.role,
    description,
  });
  await notifyAdminsByEmail(
    `New claim on ${booking.reference}`,
    `<p><strong>${user.name}</strong> filed a claim on booking ${booking.reference}:</p><p>${description
      .slice(0, 500)
      .replace(/</g, "&lt;")}</p>`
  );
  revalidatePath(`/app/booking/${bookingId}`);
  redirect(`/app/booking/${bookingId}?${claim ? "claim=filed" : "claim=error"}`);
}

/** Admin decision on a claim (notifies the claimant). */
export async function setClaimStatusAction(formData: FormData) {
  const admin = await requireRole("admin");
  const claimId = String(formData.get("claimId") || "");
  const statusRaw = String(formData.get("status") || "");
  const resolution = String(formData.get("resolution") || "");
  const allowed: ClaimStatus[] = ["in_review", "resolved", "rejected"];
  if (!claimId || !allowed.includes(statusRaw as ClaimStatus)) return;
  const claim = await setClaimStatus(claimId, statusRaw as ClaimStatus, resolution);
  if (claim) {
    await recordAdminAction(admin, `claim.${statusRaw}`, "claim", claimId, resolution || undefined);
  }
  revalidatePath("/admin/claims");
}

/** Email an announcement to a whole audience (capped; logged). */
export async function broadcastEmailAction(formData: FormData) {
  const admin = await requireRole("admin");
  const audience = String(formData.get("audience") || "");
  const subject = String(formData.get("subject") || "").trim().slice(0, 150);
  const message = String(formData.get("message") || "").trim().slice(0, 5000);
  if (!subject || !message || !["waitlist", "hosts", "travellers"].includes(audience)) {
    redirect("/admin/broadcast?error=1");
  }

  let emails: string[] = [];
  if (audience === "waitlist") {
    emails = (await listWaitlist().catch(() => [])).map((w) => w.email);
  } else {
    const users = await listAllUsers();
    emails = users
      .filter((u) => (audience === "hosts" ? u.role === "host" : u.role === "traveller"))
      .map((u) => u.email);
  }
  emails = [...new Set(emails.filter(Boolean))].slice(0, 200);

  const html = emailShell(
    `<p style="white-space:pre-line">${message.replace(/</g, "&lt;")}</p>`
  );
  let sent = 0;
  if (isEmailConfigured()) {
    for (const to of emails) {
      try {
        await sendEmail(to, subject, html);
        sent += 1;
      } catch {
        // keep going — one bad address must not stop the batch
      }
    }
  }
  await recordAdminAction(
    admin,
    "broadcast.sent",
    "broadcast",
    audience,
    `${subject} → ${emails.length} recipients${isEmailConfigured() ? "" : " (email not configured — preview)"}`
  );
  redirect(
    `/admin/broadcast?sent=${sent}&total=${emails.length}${isEmailConfigured() ? "" : "&preview=1"}`
  );
}

/** Best-effort "something needs an admin" email (verification, ticket, claim). */
export async function notifyAdminsByEmail(subject: string, bodyHtml: string): Promise<void> {
  try {
    if (!isEmailConfigured()) return;
    const override = process.env.ADMIN_ALERT_EMAIL;
    let recipients: string[];
    if (override) {
      recipients = [override];
    } else {
      recipients = (await listAllUsers())
        .filter((u) => u.role === "admin")
        .map((u) => u.email)
        .filter((e) => !e.endsWith("@parkgo.demo"));
    }
    for (const to of recipients.slice(0, 5)) {
      await sendEmail(to, subject, emailShell(bodyHtml));
    }
  } catch {
    // alerts must never break the underlying flow
  }
}
