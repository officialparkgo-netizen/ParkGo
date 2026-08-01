"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { requireFinanceAdmin, requireRole, requireUser, rolePath, requireOpsAdmin } from "@/lib/auth";
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
import { uploadSpacePhoto } from "@/lib/storage";
import { IS_LIVE } from "@/lib/config";
import type { ClaimStatus, PromoKind } from "@/types";

/** Support cancellation: full refund, no fee; logged to the admin action log. */
export async function adminCancelBookingAction(formData: FormData) {
  const admin = await requireFinanceAdmin();
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
  const admin = await requireFinanceAdmin();
  const paymentId = String(formData.get("paymentId") || "");
  if (!paymentId) return;
  const ok = await markPayoutPaid(paymentId);
  if (ok) await recordAdminAction(admin, "payout.marked_paid", "payment", paymentId);
  revalidatePath("/admin/payments");
  revalidatePath("/admin");
}

/** Hide/restore a review on public pages. */
export async function setReviewHiddenAction(formData: FormData) {
  const admin = await requireFinanceAdmin();
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
  const admin = await requireFinanceAdmin();
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
  const admin = await requireFinanceAdmin();
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
  const admin = await requireOpsAdmin();
  const userId = String(formData.get("userId") || "");
  const note = String(formData.get("note") || "").trim().slice(0, 500);
  if (!userId || !note) return;
  await recordAdminAction(admin, "note", "user", userId, note);
  revalidatePath(`/admin/users/${userId}`);
}

/** Start viewing the app as another (non-admin) user. */
export async function startImpersonationAction(formData: FormData) {
  const admin = await requireFinanceAdmin();
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

  /**
   * Photographs are what actually settle a damage dispute, so the form takes
   * them alongside the description. Uploaded before the claim is created: a
   * claim that exists without its evidence reads as a weaker case than it is,
   * and there is no second chance to attach them once it is filed.
   */
  const photos: string[] = [];
  const files = formData
    .getAll("photos")
    .filter((f): f is File => f instanceof File && f.size > 0);
  for (const file of files.slice(0, 6)) {
    const url = await uploadSpacePhoto(file, `claims/${bookingId}`);
    if (url) photos.push(url);
  }

  const claim = await fileClaim({
    bookingId,
    bookingRef: booking.reference,
    openedBy: user.id,
    openedByRole: user.role,
    description,
    photos,
  });
  const { sendOpsAlert } = await import("@/lib/ops-alerts");
  await sendOpsAlert(`🛑 New claim on ${booking.reference} from ${user.name}`);
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
  const admin = await requireFinanceAdmin();
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

/**
 * Write a campaign: sent to its segment right now, or stored with a send
 * time and delivered by the daily digest sweep. Audiences resolve at send
 * time, and the addresses themselves are never stored.
 */
export async function createCampaignAction(formData: FormData) {
  const admin = await requireFinanceAdmin();
  const { isSegmentKey } = await import("@/lib/segments");
  const segment = String(formData.get("segment") || "");
  const subject = String(formData.get("subject") || "").trim().slice(0, 150);
  const message = String(formData.get("message") || "").trim().slice(0, 5000);
  const sendAtRaw = String(formData.get("sendAt") || "").trim();
  if (!subject || !message || !isSegmentKey(segment)) {
    redirect("/admin/broadcast?error=1");
  }

  // A parseable future moment schedules; anything else sends now.
  const sendAtMs = sendAtRaw ? Date.parse(sendAtRaw) : NaN;
  const scheduled = Number.isFinite(sendAtMs) && sendAtMs > Date.now();

  const { createCampaign, markCampaignSent } = await import("@/lib/data/campaigns");
  const { resolveSegmentEmails } = await import("@/lib/segments");
  const recipientCount = (await resolveSegmentEmails(segment)).length;
  const campaign = await createCampaign({
    subject,
    message,
    segment,
    sendAt: scheduled ? new Date(sendAtMs).toISOString() : undefined,
    recipientCount,
    createdBy: admin.name,
  });
  if (!campaign) redirect("/admin/broadcast?error=1");

  if (scheduled) {
    await recordAdminAction(
      admin,
      "broadcast.scheduled",
      "broadcast",
      segment,
      `${subject} → ~${recipientCount} recipients at ${new Date(sendAtMs).toISOString()}`
    );
    redirect("/admin/broadcast?scheduled=1");
  }

  const { deliverCampaign } = await import("@/lib/campaign-send");
  const counts = await deliverCampaign(campaign);
  await markCampaignSent(campaign.id, counts);
  await recordAdminAction(
    admin,
    "broadcast.sent",
    "broadcast",
    segment,
    `${subject} → ${counts.recipients} recipients${isEmailConfigured() ? "" : " (email not configured — preview)"}`
  );
  redirect(
    `/admin/broadcast?sent=${counts.sent}&total=${counts.recipients}${isEmailConfigured() ? "" : "&preview=1"}`
  );
}

/** Cancel a scheduled campaign before the sweep picks it up. */
export async function cancelCampaignAction(formData: FormData) {
  const admin = await requireFinanceAdmin();
  const id = String(formData.get("campaignId") || "");
  const { cancelCampaign } = await import("@/lib/data/campaigns");
  if (id && (await cancelCampaign(id))) {
    await recordAdminAction(admin, "broadcast.cancelled", "broadcast", id);
  }
  revalidatePath("/admin/broadcast");
  redirect("/admin/broadcast?cancelled=1");
}

export interface TranslationCheckState {
  provider?: string;
  samples?: { lang: string; text: string; ok: boolean }[];
  failed?: boolean;
  off?: boolean;
  /** Whether booking-chat translations can actually be stored (migration 0030). */
  thread?: "ready" | "missing";
}

/**
 * Round-trip a real sentence through the live translation provider, so the
 * admin can see a freshly pasted API key working (or failing) right here —
 * not when the first Urdu customer does. Read-only: nothing is stored.
 *
 * Every supported language gets a row — read from the locale registry, so a
 * seventh language shows up here the day it ships. A language the provider
 * refuses stays visible as a failed row rather than quietly vanishing.
 */
export async function runTranslationCheckAction(
  _prev: TranslationCheckState,
  _formData: FormData
): Promise<TranslationCheckState> {
  await requireFinanceAdmin();
  const { isTranslationConfigured, translateText, translationProvider } = await import(
    "@/lib/translate"
  );
  if (!isTranslationConfigured()) return { off: true };

  const { LOCALES } = await import("@/lib/i18n/config");
  const sample = "Your booking is confirmed — see you at the airport.";
  const targets = LOCALES.map((l) => l.code).filter((code) => code !== "en");
  const samples: { lang: string; text: string; ok: boolean }[] = [];
  for (const lang of targets) {
    try {
      const out = await translateText(sample, lang, "en");
      const ok = !!out?.text && out.text.trim() !== sample;
      samples.push({ lang, text: ok && out ? out.text : "", ok });
    } catch {
      samples.push({ lang, text: "", ok: false });
    }
  }

  // A working key is only half the story on live: the booking-chat columns
  // come from migration 0030, and until it runs, thread translations are
  // silently dropped at insert. Say so here, where the admin is looking.
  let thread: TranslationCheckState["thread"] = "ready";
  const { IS_LIVE } = await import("@/lib/config");
  if (IS_LIVE) {
    try {
      const { supabaseAdmin } = await import("@/lib/supabase/server");
      const { error } = await supabaseAdmin()
        .from("booking_messages")
        .select("translated")
        .limit(1);
      if (error) thread = "missing";
    } catch {
      thread = "missing";
    }
  }

  if (!samples.some((s) => s.ok)) return { failed: true, thread };
  return { provider: translationProvider() ?? "", samples, thread };
}

/** Best-effort "something needs an admin" email (verification, ticket, claim). */
export async function notifyAdminsByEmail(subject: string, bodyHtml: string): Promise<void> {
  try {
    if (!isEmailConfigured()) return;
    const { getPlatformSettings } = await import("@/lib/data/settings");
    const settings = await getPlatformSettings();
    const override = settings.adminAlertEmail || process.env.ADMIN_ALERT_EMAIL;
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

/** Save platform settings (fees, cancel policy, alerts, announcement). */
export async function savePlatformSettingsAction(formData: FormData) {
  const admin = await requireFinanceAdmin();
  const { savePlatformSettings } = await import("@/lib/data/settings");
  const num = (k: string) => Number(formData.get(k));
  await savePlatformSettings({
    serviceFee: Math.round(num("serviceFee") * 100),
    parkingCommissionBps: Math.round(num("parkingPct") * 100),
    transferCommissionBps: Math.round(num("transferPct") * 100),
    cancelWindowHours: num("cancelWindowHours"),
    cancelFeeBps: Math.round(num("cancelFeePct") * 100),
    payoutHoldDays: num("payoutHoldDays"),
    supportOpenHour: num("supportOpenHour"),
    supportCloseHour: num("supportCloseHour"),
    supportReplyMinutes: num("supportReplyMinutes"),
    supportWhatsapp: String(formData.get("supportWhatsapp") || ""),
    supportSlaMinutes: num("supportSlaMinutes"),
    supportMaxPerHour: num("supportMaxPerHour"),
    supportAutoAssign: formData.get("supportAutoAssign") === "on",
    // Macros arrive as parallel label/text rows; blank rows are dropped by clean().
    supportMacros: formData.getAll("macroLabel").map((label, i) => ({
      id: `m${i + 1}`,
      label: String(label),
      text: String(formData.getAll("macroText")[i] ?? ""),
    })),
    adminAlertEmail: String(formData.get("adminAlertEmail") || ""),
    opsWebhookUrl: String(formData.get("opsWebhookUrl") || ""),
    announcement: String(formData.get("announcement") || ""),
    announcementOn: formData.get("announcementOn") === "on",
    vatNumber: String(formData.get("vatNumber") || ""),
  });
  await recordAdminAction(admin, "settings.updated", "broadcast", "platform");
  revalidatePath("/admin/settings");
  revalidatePath("/");
  redirect("/admin/settings?saved=1");
}

/** Send the daily digest right now (same content as the cron). */
export async function sendDigestNowAction() {
  const admin = await requireFinanceAdmin();
  const { composeAndSendDigest } = await import("@/lib/digest");
  const summary = await composeAndSendDigest();
  await recordAdminAction(
    admin,
    "digest.sent",
    "broadcast",
    "digest",
    summary.emailed ? `emailed ${summary.sentTo.length}` : "preview (email not configured)"
  );
  redirect(`/admin/settings?digest=${summary.emailed ? "sent" : "preview"}`);
}

/** Pick up an open support ticket. */
export async function assignSupportTicketAction(formData: FormData) {
  const admin = await requireOpsAdmin();
  const id = String(formData.get("ticketId") || "");
  if (!id) return;
  const { setSupportTicketAssigned } = await import("@/lib/data/support");
  await setSupportTicketAssigned(id, admin.name);
  await recordAdminAction(admin, "support.assigned", "user", id, admin.name);
  revalidatePath("/admin/support");
}

/** Assign a ticket to any teammate (full admin or support agent). */
export async function assignTicketToAction(formData: FormData) {
  const admin = await requireOpsAdmin();
  const id = String(formData.get("ticketId") || "");
  const assigneeId = String(formData.get("assigneeId") || "");
  if (!id || !assigneeId) return;

  const { getUserProfile } = await import("@/lib/data/users");
  const assignee = await getUserProfile(assigneeId);
  if (!assignee || assignee.role !== "admin") return;

  const { setSupportTicketAssigned } = await import("@/lib/data/support");
  await setSupportTicketAssigned(id, assignee.name);
  await recordAdminAction(admin, "support.assigned", "user", id, assignee.name);

  // Tell the assignee — assignments must never rely on them refreshing.
  if (assignee.id !== admin.id) {
    const { supportRef } = await import("@/lib/support-thread");
    const note = {
      title: `Support ticket assigned · ${supportRef(id)}`,
      body: `${admin.name} assigned you a support conversation — open the queue to reply.`,
      kind: "system" as const,
    };
    const { IS_LIVE } = await import("@/lib/config");
    if (!IS_LIVE) {
      const { addNotification } = await import("@/lib/data/store");
      addNotification({ userId: assignee.id, ...note });
    } else {
      try {
        const { supabaseAdmin } = await import("@/lib/supabase/server");
        await supabaseAdmin().from("notifications").insert({
          user_id: assignee.id,
          title: note.title,
          body: note.body,
          kind: note.kind,
        });
      } catch {
        // best-effort
      }
    }
    try {
      const { isEmailConfigured, sendEmail, emailShell } = await import("@/lib/email");
      if (isEmailConfigured() && assignee.email) {
        await sendEmail(
          assignee.email,
          note.title,
          emailShell(
            `<h2 style="margin:0 0 10px;font-size:19px;color:#15171A">A ticket needs you</h2>
             <p style="margin:0">${note.body}</p>`
          )
        );
      }
    } catch {
      // best-effort
    }
  }
  revalidatePath("/admin/support");
}

/** Bump a ticket to the top of the queue (or back down) by hand. */
export async function setTicketPriorityAction(formData: FormData) {
  const admin = await requireOpsAdmin();
  const id = String(formData.get("ticketId") || "");
  const priority = formData.get("priority") === "urgent" ? "urgent" : "normal";
  if (!id) return;
  const { setTicketPriority } = await import("@/lib/data/support");
  await setTicketPriority(id, priority);
  await recordAdminAction(admin, "support.priority", "user", id, priority);
  revalidatePath("/admin/support");
}

/** Agent duty switch: on duty means auto-assignment may pick you. */
export async function setSupportAvailableAction(formData: FormData) {
  const admin = await requireOpsAdmin();
  const on = formData.get("state") === "on";
  const { setSupportAvailable } = await import("@/lib/data/users");
  await setSupportAvailable(admin.id, on);
  revalidatePath("/admin/support");
}

/** Park a ticket until later — or wake it now with an empty hours value. */
export async function snoozeTicketAction(formData: FormData) {
  const admin = await requireOpsAdmin();
  const id = String(formData.get("ticketId") || "");
  const hours = Number(formData.get("hours"));
  if (!id) return;
  const { setTicketSnooze } = await import("@/lib/data/support");
  const { snoozeUntil } = await import("@/lib/support-sla");
  const until = Number.isFinite(hours) && hours > 0 ? snoozeUntil(hours) : null;
  await setTicketSnooze(id, until);
  await recordAdminAction(admin, "support.snoozed", "user", id, until ?? "woken");
  revalidatePath("/admin/support");
}

/** Invite a limited support agent (full admins only — never a full admin). */
export async function inviteSupportAgentAction(formData: FormData) {
  const admin = await requireFinanceAdmin();
  const email = String(formData.get("email") || "");
  const name = String(formData.get("name") || "");
  const { createSupportAgent, findUserByEmail } = await import("@/lib/data/users");

  // Never re-point an existing FULL admin: minting an invite for them would
  // hand this caller a set-password link for a peer's account.
  const existing = await findUserByEmail(email);
  if (existing && existing.role === "admin" && existing.adminScope !== "support") {
    redirect("/admin/support?team=peer");
  }

  const agent = await createSupportAgent(email, name);
  if (!agent) {
    revalidatePath("/admin/support");
    redirect("/admin/support?team=error");
  }

  // Mint the single-use set-password link and email it.
  const { sendTeamInvite } = await import("@/lib/team-invite-mail");
  const { emailed } = await sendTeamInvite(agent, admin.name);
  await recordAdminAction(admin, "support.agent_invited", "user", agent.id, agent.email);
  revalidatePath("/admin/support");
  redirect(`/admin/support?team=${emailed ? "invited" : "invited-nomail"}`);
}

/** Re-send a teammate's invite email (rotates the link, killing the old one). */
export async function resendTeamInviteAction(formData: FormData) {
  const admin = await requireFinanceAdmin();
  const userId = String(formData.get("userId") || "");
  const { getUserProfile } = await import("@/lib/data/users");
  const member = userId ? await getUserProfile(userId) : null;
  // Only limited-scope teammates (agents and writers) — a resend mints a live
  // set-password link, so it must never be aimable at a peer admin (or at
  // yourself).
  if (
    !member ||
    member.role !== "admin" ||
    (member.adminScope !== "support" && member.adminScope !== "content") ||
    member.id === admin.id
  ) {
    redirect("/admin/support?team=peer");
  }
  // Back to whichever console manages this kind of teammate.
  const home = member.adminScope === "content" ? "/admin/blog" : "/admin/support";
  const { sendTeamInvite } = await import("@/lib/team-invite-mail");
  const { emailed } = await sendTeamInvite(member, admin.name);
  await recordAdminAction(admin, "support.agent_invited", "user", member.id, "resend");
  revalidatePath(home);
  redirect(`${home}?team=${emailed ? "resent" : "invited-nomail"}`);
}

/** Revoke a support agent's access (their account becomes a traveller). */
export async function removeSupportAgentAction(formData: FormData) {
  const admin = await requireFinanceAdmin();
  const userId = String(formData.get("userId") || "");
  if (!userId || userId === admin.id) redirect("/admin/support?team=error");
  const { revokeSupportAgent } = await import("@/lib/data/users");
  const ok = await revokeSupportAgent(userId);
  if (ok) await recordAdminAction(admin, "support.agent_removed", "user", userId);
  revalidatePath("/admin/support");
  redirect(`/admin/support?team=${ok ? "removed" : "error"}`);
}

/** Approve every listing waiting for review in one click. */
export async function bulkApproveListingsAction() {
  const admin = await requireFinanceAdmin();
  const { listAllSpaces, reviewSpaceListing } = await import("@/lib/data/hosts");
  const spaces = await listAllSpaces();
  const pending = spaces.filter(
    (s) => s.status === "pending_review" || s.status === "draft"
  );
  for (const space of pending) {
    await reviewSpaceListing(space.id, "approved", admin.id);
  }
  await recordAdminAction(
    admin,
    "listing.bulk_approved",
    "space",
    "all",
    `${pending.length} listings`
  );
  revalidatePath("/admin/listings");
  revalidatePath("/admin");
  redirect(`/admin/listings?bulk=${pending.length}`);
}

/** GDPR: anonymize an account (typed confirmation required). */
export async function anonymizeUserAction(formData: FormData) {
  const admin = await requireFinanceAdmin();
  const userId = String(formData.get("userId") || "");
  const confirm = String(formData.get("confirm") || "");
  if (!userId || confirm !== "DELETE") {
    redirect(`/admin/users/${userId}?gdpr=confirm`);
  }
  const target = (await getUsersByIds([userId])).get(userId);
  if (!target || target.role === "admin") redirect("/admin/users");
  const { anonymizeUserAdmin } = await import("@/lib/data/users");
  const ok = await anonymizeUserAdmin(userId);
  if (ok) {
    await recordAdminAction(admin, "user.anonymized", "user", userId, target.email);
  }
  revalidatePath(`/admin/users/${userId}`);
  redirect(`/admin/users/${userId}?gdpr=${ok ? "done" : "error"}`);
}

/** Set another admin's scope (full vs support). */
export async function setAdminScopeAction(formData: FormData) {
  const admin = await requireFinanceAdmin();
  const userId = String(formData.get("userId") || "");
  const scope = String(formData.get("scope") || "");
  if (!userId || userId === admin.id) return;
  if (scope !== "full" && scope !== "support") return;
  const { setAdminScopeAdmin } = await import("@/lib/data/users");
  const ok = await setAdminScopeAdmin(userId, scope);
  if (ok) await recordAdminAction(admin, `admin.scope_${scope}`, "user", userId);
  revalidatePath(`/admin/users/${userId}`);
}

/** Goodwill partial refund without cancelling (support tool). */
export async function adminPartialRefundAction(formData: FormData) {
  const admin = await requireFinanceAdmin();
  const bookingId = String(formData.get("bookingId") || "");
  const amount = Math.round(Number(formData.get("amount") || 0) * 100);
  if (!bookingId || amount <= 0) redirect(`/app/booking/${bookingId}?refunded=error`);
  const { adminPartialRefund } = await import("@/lib/data/bookings");
  const result = await adminPartialRefund(bookingId, amount);
  if (result.ok) {
    await recordAdminAction(
      admin,
      "booking.partial_refund",
      "booking",
      bookingId,
      `£${(amount / 100).toFixed(2)}`
    );
  }
  revalidatePath(`/app/booking/${bookingId}`);
  redirect(
    `/app/booking/${bookingId}?refunded=${result.ok ? (amount / 100).toFixed(2) : "error"}`
  );
}

/** Support tool: move a booking's dates (price unchanged). */
export async function adminChangeBookingDatesAction(formData: FormData) {
  const admin = await requireFinanceAdmin();
  const bookingId = String(formData.get("bookingId") || "");
  const start = String(formData.get("newStart") || "");
  const end = String(formData.get("newEnd") || "");
  if (!bookingId || !start || !end) redirect(`/app/booking/${bookingId}?adminedit=error`);
  const startAt = new Date(`${start}T12:00:00Z`).toISOString();
  const endAt = new Date(`${end}T12:00:00Z`).toISOString();
  const { adminUpdateBookingDates } = await import("@/lib/data/bookings");
  const result = await adminUpdateBookingDates(bookingId, startAt, endAt);
  if (result.ok) {
    await recordAdminAction(
      admin,
      "booking.dates_changed",
      "booking",
      bookingId,
      `${start} → ${end}`
    );
  }
  revalidatePath(`/app/booking/${bookingId}`);
  redirect(`/app/booking/${bookingId}?adminedit=${result.ok ? "done" : "error"}`);
}

/** Reply to a support ticket by email (with saved-reply templates). */
export async function replySupportTicketAction(formData: FormData) {
  const admin = await requireOpsAdmin();
  const ticketId = String(formData.get("ticketId") || "");
  const message = String(formData.get("message") || "").trim().slice(0, 2000);
  if (!ticketId || !message) redirect("/admin/support?replied=error");
  const { listSupportTickets, appendAgentReply } = await import("@/lib/data/support");
  const ticket = (await listSupportTickets().catch(() => [])).find(
    (tk) => tk.id === ticketId
  );
  if (!ticket) redirect("/admin/support?replied=error");
  await appendAgentReply(ticketId, message);
  let emailed = false;
  if (isEmailConfigured()) {
    try {
      await sendEmail(
        ticket.email,
        `Re: your ParkGo support request (${ticket.topic})`,
        emailShell(
          `<p style="white-space:pre-line">${message.replace(/</g, "&lt;")}</p>
           <p style="font-size:12px;color:#878D96">— ${admin.name}, ParkGo support</p>`
        )
      );
      emailed = true;
    } catch {
      // reply is stored either way
    }
  }
  await recordAdminAction(admin, "support.replied", "user", ticketId, message.slice(0, 120));
  revalidatePath("/admin/support");
  redirect(`/admin/support?replied=${emailed ? "1" : "preview"}`);
}

/** Invite a waitlist signup to create their account. */
export async function inviteWaitlistAction(formData: FormData) {
  const admin = await requireFinanceAdmin();
  const entryId = String(formData.get("entryId") || "");
  const email = String(formData.get("email") || "");
  if (!entryId || !email) redirect("/admin/users?invited=error");
  let emailed = false;
  if (isEmailConfigured()) {
    try {
      await sendEmail(
        email,
        "You're invited to ParkGo 🎉",
        emailShell(
          `<p>Good news — ParkGo is ready for you.</p>
           <p>Airport parking with licensed transfer, EV charging and CCTV, in one booking.</p>
           <p style="margin-top:14px"><a href="https://www.parkgo.ai/login" style="background:#F97316;color:#fff;padding:10px 18px;border-radius:10px;text-decoration:none;font-weight:700">Create your account</a></p>`
        )
      );
      emailed = true;
    } catch {
      // fall through to preview
    }
  }
  const { markWaitlistInvited } = await import("@/lib/data/waitlist");
  await markWaitlistInvited(entryId);
  await recordAdminAction(admin, "waitlist.invited", "user", entryId, email);
  revalidatePath("/admin/users");
  redirect(`/admin/users?invited=${emailed ? "1" : "preview"}`);
}

/** Run due host payouts as Stripe transfers. GATED: no-op until Stripe keys. */
export async function runStripePayoutsAction() {
  const admin = await requireFinanceAdmin();
  const { isStripeConfigured, runStripePayoutsDue } = await import("@/lib/stripe");
  if (!isStripeConfigured()) redirect("/admin/payments");
  const result = await runStripePayoutsDue();
  await recordAdminAction(
    admin,
    "payouts.stripe_run",
    "payment",
    "batch",
    `${result.transferred} transferred, ${result.skipped} skipped`
  );
  revalidatePath("/admin/payments");
  redirect(`/admin/payments?stripepayouts=${result.transferred}`);
}
