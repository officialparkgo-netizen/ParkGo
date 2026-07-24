"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { requireRole, requireUser } from "@/lib/auth";
import { ensureHostForUser, getSpaceById, getSpacesForHost, setHostBank } from "@/lib/data/hosts";
import { getBookingById, hostSetBookingStatus } from "@/lib/data/bookings";
import { addBookingMessage } from "@/lib/data/booking-messages";
import { setReviewReply, listAllReviews } from "@/lib/data/reviews";
import { setEmailBookingAlerts } from "@/lib/data/users";
import { addNotification } from "@/lib/data/store";
import { IS_LIVE } from "@/lib/config";

/** Host: car arrived → booking goes active. */
export async function hostCheckInAction(formData: FormData) {
  const user = await requireRole("host");
  const host = await ensureHostForUser(user);
  const bookingId = String(formData.get("bookingId") || "");
  const back = String(formData.get("back") || `/host/bookings/${bookingId}`);
  const result = await hostSetBookingStatus(bookingId, host.id, "active");
  revalidatePath("/host");
  revalidatePath(`/host/bookings/${bookingId}`);
  revalidatePath("/host/today");
  redirect(`${back}${back.includes("?") ? "&" : "?"}mark=${result.ok ? "in" : "error"}`);
}

/** Host: car collected → booking completed. */
export async function hostCheckOutAction(formData: FormData) {
  const user = await requireRole("host");
  const host = await ensureHostForUser(user);
  const bookingId = String(formData.get("bookingId") || "");
  const back = String(formData.get("back") || `/host/bookings/${bookingId}`);
  const result = await hostSetBookingStatus(bookingId, host.id, "completed");
  revalidatePath("/host");
  revalidatePath(`/host/bookings/${bookingId}`);
  revalidatePath("/host/today");
  redirect(`${back}${back.includes("?") ? "&" : "?"}mark=${result.ok ? "out" : "error"}`);
}

/**
 * Booking thread message (host or traveller). Participants only; the other
 * side gets an in-app notification.
 */
export async function sendBookingMessageAction(formData: FormData) {
  const user = await requireUser();
  const bookingId = String(formData.get("bookingId") || "");
  const text = String(formData.get("text") || "");
  const back = String(formData.get("back") || "/app");
  const booking = await getBookingById(bookingId);
  if (!booking) redirect(back);

  const space = await getSpaceById(booking.spaceId);
  const isTraveller = booking.travellerId === user.id;
  let isHost = false;
  let hostUserId: string | undefined;
  if (space) {
    const { getHostById } = await import("@/lib/data/hosts");
    const host = await getHostById(space.hostId);
    hostUserId = host?.userId;
    isHost = host?.userId === user.id;
  }
  if (!isTraveller && !isHost && user.role !== "admin") redirect(back);

  const from = isHost ? "host" : "traveller";
  const msg = await addBookingMessage({ bookingId, from, text });
  if (msg) {
    const recipient = from === "host" ? booking.travellerId : hostUserId;
    const note = {
      title: `New message · ${booking.reference}`,
      body: text.trim().slice(0, 120),
      kind: "booking" as const,
    };
    if (recipient) {
      if (!IS_LIVE) {
        addNotification({ userId: recipient, ...note });
      } else {
        try {
          const { supabaseAdmin } = await import("@/lib/supabase/server");
          await supabaseAdmin().from("notifications").insert({
            user_id: recipient,
            title: note.title,
            body: note.body,
            kind: note.kind,
          });
        } catch {
          // best-effort
        }
      }
    }
  }
  revalidatePath(back);
  redirect(`${back}${back.includes("?") ? "&" : "?"}sent=1`);
}

/** Host: save manual payout bank details (validated: 6 + 8 digits). */
export async function saveHostBankAction(formData: FormData) {
  const user = await requireRole("host");
  const host = await ensureHostForUser(user);
  const ok = await setHostBank(
    host.id,
    String(formData.get("bankSort") || ""),
    String(formData.get("bankAccount") || "")
  );
  revalidatePath("/host/payouts");
  redirect(`/host/payouts?bank=${ok ? "saved" : "invalid"}`);
}

/** Host: public reply on a review of one of their spaces. */
export async function replyReviewAction(formData: FormData) {
  const user = await requireRole("host");
  const host = await ensureHostForUser(user);
  const reviewId = String(formData.get("reviewId") || "");
  const reply = String(formData.get("reply") || "");
  const spaces = await getSpacesForHost(host.id);
  const ownIds = new Set(spaces.map((s) => s.id));
  const review = (await listAllReviews()).find((r) => r.id === reviewId);
  if (!review || review.subjectType !== "space" || !ownIds.has(review.subjectId)) {
    redirect("/host/reviews?replied=error");
  }
  const ok = await setReviewReply(reviewId, reply);
  revalidatePath("/host/reviews");
  revalidatePath(`/app/space/${review.subjectId}`);
  redirect(`/host/reviews?replied=${ok ? "1" : "error"}`);
}

/** Host: pause or resume every live listing in one go (holiday mode). */
export async function setVacationModeAction(formData: FormData) {
  const user = await requireRole("host");
  const host = await ensureHostForUser(user);
  const state = String(formData.get("state") || "");
  if (state !== "pause" && state !== "resume") redirect("/host");
  const { setSpacePausedAdmin } = await import("@/lib/data/hosts");
  const spaces = await getSpacesForHost(host.id);
  const targets = spaces.filter((s) =>
    state === "pause" ? s.status === "live" : s.status === "paused"
  );
  for (const s of targets) {
    await setSpacePausedAdmin(s.id, state === "pause", false);
  }
  revalidatePath("/host");
  revalidatePath("/app/search");
  redirect(`/host?vacation=${state}&count=${targets.length}`);
}

/** Host: toggle booking-alert emails (in-app notifications always stay on). */
export async function setBookingAlertsAction(formData: FormData) {
  const user = await requireRole("host");
  const on = String(formData.get("state") || "") === "on";
  await setEmailBookingAlerts(user.id, on);
  revalidatePath("/account");
  redirect(`/account?alerts=${on ? "on" : "off"}`);
}
