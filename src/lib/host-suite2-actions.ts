"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import type { User } from "@/types";
import { requireRole } from "@/lib/auth";
import {
  ensureHostForUser,
  getHostById,
  getSpaceById,
  setHostAutoWelcome,
  setHostBlockedGuests,
  setHostCohost,
} from "@/lib/data/hosts";
import {
  getBookingById,
  hostApproveBooking,
  hostDeclineBooking,
  setBookingBay,
} from "@/lib/data/bookings";

/**
 * Resolve which host a signed-in user acts for: their own profile, or the
 * host that invited them as a co-host. Co-hosts never get a profile created.
 */
async function actingHost(user: User) {
  if (user.cohostHostId) {
    const host = await getHostById(user.cohostHostId);
    if (!host || host.cohostUserId !== user.id) redirect("/host");
    return host;
  }
  return ensureHostForUser(user);
}

/** Host: accept a pending booking request. */
export async function approveBookingAction(formData: FormData) {
  const user = await requireRole("host");
  const host = await actingHost(user);
  const bookingId = String(formData.get("bookingId") || "");
  const back = String(formData.get("back") || `/host/bookings/${bookingId}`);
  const result = await hostApproveBooking(bookingId, host.id);
  revalidatePath("/host");
  revalidatePath("/host/today");
  revalidatePath(`/host/bookings/${bookingId}`);
  revalidatePath(`/app/booking/${bookingId}`);
  redirect(`${back}${back.includes("?") ? "&" : "?"}request=${result.ok ? "approved" : "error"}`);
}

/** Host: decline a pending booking request (traveller refunded in full). */
export async function declineBookingAction(formData: FormData) {
  const user = await requireRole("host");
  const host = await actingHost(user);
  const bookingId = String(formData.get("bookingId") || "");
  const back = String(formData.get("back") || "/host/today");
  const result = await hostDeclineBooking(bookingId, host.id);
  revalidatePath("/host");
  revalidatePath("/host/today");
  revalidatePath(`/host/bookings/${bookingId}`);
  revalidatePath(`/app/booking/${bookingId}`);
  redirect(`${back}${back.includes("?") ? "&" : "?"}request=${result.ok ? "declined" : "error"}`);
}

/** Host: park this booking in a named bay (or clear the assignment). */
export async function assignBayAction(formData: FormData) {
  const user = await requireRole("host");
  const host = await actingHost(user);
  const bookingId = String(formData.get("bookingId") || "");
  const raw = String(formData.get("bay") ?? "");
  const bayIndex = raw === "" ? null : Number(raw);
  if (bayIndex !== null && (!Number.isInteger(bayIndex) || bayIndex < 0)) {
    redirect(`/host/bookings/${bookingId}?bay=error`);
  }
  const ok = await setBookingBay(bookingId, host.id, bayIndex);
  revalidatePath(`/host/bookings/${bookingId}`);
  revalidatePath("/host/today");
  redirect(`/host/bookings/${bookingId}?bay=${ok ? "saved" : "error"}`);
}

/** Host: save the automatic welcome message (empty clears it). */
export async function saveAutoWelcomeAction(formData: FormData) {
  const user = await requireRole("host");
  if (user.cohostHostId) redirect("/host/today");
  const host = await ensureHostForUser(user);
  const ok = await setHostAutoWelcome(host.id, String(formData.get("autoWelcome") || ""));
  revalidatePath("/host/settings");
  redirect(`/host/settings?welcome=${ok ? "saved" : "error"}`);
}

/** Host: block the traveller behind a booking from booking again. */
export async function blockGuestAction(formData: FormData) {
  const user = await requireRole("host");
  if (user.cohostHostId) redirect("/host/today");
  const host = await ensureHostForUser(user);
  const bookingId = String(formData.get("bookingId") || "");
  const booking = await getBookingById(bookingId);
  const space = booking ? await getSpaceById(booking.spaceId) : null;
  if (!booking || !space || space.hostId !== host.id) {
    redirect(`/host/bookings/${bookingId}?guest=error`);
  }
  const current = host.blockedGuests ?? [];
  if (!current.includes(booking.travellerId)) {
    await setHostBlockedGuests(host.id, [...current, booking.travellerId]);
  }
  revalidatePath(`/host/bookings/${bookingId}`);
  revalidatePath("/host/settings");
  redirect(`/host/bookings/${bookingId}?guest=blocked`);
}

/** Host: lift a block from the settings page. */
export async function unblockGuestAction(formData: FormData) {
  const user = await requireRole("host");
  if (user.cohostHostId) redirect("/host/today");
  const host = await ensureHostForUser(user);
  const guestId = String(formData.get("guestId") || "");
  const next = (host.blockedGuests ?? []).filter((id) => id !== guestId);
  await setHostBlockedGuests(host.id, next);
  revalidatePath("/host/settings");
  redirect("/host/settings?guest=unblocked");
}

/** Host: invite (or re-link) a limited co-host account by email. */
export async function inviteCohostAction(formData: FormData) {
  const user = await requireRole("host");
  if (user.cohostHostId) redirect("/host/today");
  const host = await ensureHostForUser(user);
  const email = String(formData.get("email") || "");
  const name = String(formData.get("name") || "").trim().slice(0, 60);
  const { createCohostUser } = await import("@/lib/data/users");
  const cohost = await createCohostUser(host.id, email, name);
  // Null also means "that email already belongs to someone" — a host must
  // never be able to aim a set-password link at an existing ParkGo account.
  if (!cohost) redirect("/host/settings?cohost=error");
  await setHostCohost(host.id, { userId: cohost.id, email: cohost.email });

  const { sendTeamInvite } = await import("@/lib/team-invite-mail");
  const { emailed } = await sendTeamInvite(cohost, user.name, "cohost");
  revalidatePath("/host/settings");
  redirect(`/host/settings?cohost=${emailed ? "invited" : "invited-nomail"}`);
}

/** Host: re-send the co-host invite (rotates the link, killing the old one). */
export async function resendCohostInviteAction() {
  const user = await requireRole("host");
  if (user.cohostHostId) redirect("/host/today");
  const host = await ensureHostForUser(user);
  const { getUserProfile } = await import("@/lib/data/users");
  const cohost = host.cohostUserId ? await getUserProfile(host.cohostUserId) : null;
  // Only ever this host's own co-host.
  if (!cohost || cohost.cohostHostId !== host.id) {
    redirect("/host/settings?cohost=error");
  }
  const { sendTeamInvite } = await import("@/lib/team-invite-mail");
  const { emailed } = await sendTeamInvite(cohost, user.name, "cohost");
  revalidatePath("/host/settings");
  redirect(`/host/settings?cohost=${emailed ? "resent" : "invited-nomail"}`);
}

/** Host: revoke the co-host's access entirely. */
export async function removeCohostAction() {
  const user = await requireRole("host");
  if (user.cohostHostId) redirect("/host/today");
  const host = await ensureHostForUser(user);
  if (host.cohostUserId) {
    const { revokeCohostUser, setInviteNonce } = await import("@/lib/data/users");
    await revokeCohostUser(host.cohostUserId);
    await setInviteNonce(host.cohostUserId, null); // kill any pending link
  }
  await setHostCohost(host.id, null);
  revalidatePath("/host/settings");
  redirect("/host/settings?cohost=removed");
}

/** Host: report damage / an incident on a booking to the ParkGo team. */
export async function reportIncidentAction(formData: FormData) {
  const user = await requireRole("host");
  const host = await actingHost(user);
  const bookingId = String(formData.get("bookingId") || "");
  const description = String(formData.get("description") || "");
  const booking = await getBookingById(bookingId);
  const space = booking ? await getSpaceById(booking.spaceId) : null;
  if (!booking || !space || space.hostId !== host.id) {
    redirect(`/host/bookings/${bookingId}?incident=error`);
  }
  const { fileClaim } = await import("@/lib/data/claims");
  const claim = await fileClaim({
    bookingId: booking.id,
    bookingRef: booking.reference,
    openedBy: user.id,
    openedByRole: "host",
    description,
  });
  if (claim) {
    try {
      const { sendOpsAlert } = await import("@/lib/ops-alerts");
      await sendOpsAlert(`⚠️ Host incident on ${booking.reference}: ${description.slice(0, 140)}`);
    } catch {
      // alert is best-effort
    }
  }
  revalidatePath(`/host/bookings/${bookingId}`);
  revalidatePath("/admin/claims");
  redirect(`/host/bookings/${bookingId}?incident=${claim ? "filed" : "error"}`);
}
