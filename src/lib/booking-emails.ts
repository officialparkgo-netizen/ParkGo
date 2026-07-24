import "server-only";
import type { Booking } from "@/types";
import { emailButton, emailRows, emailShell, isEmailConfigured, sendEmail } from "@/lib/email";
import { formatDateTime, formatMoney } from "@/lib/utils";

const SITE = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

interface Parties {
  traveller: { email: string; name: string } | null;
  host: { email: string; name: string } | null;
  spaceTitle: string;
}

/** Resolve traveller + owning host contact details for a booking (live mode). */
async function bookingParties(booking: Booking): Promise<Parties> {
  const { supabaseAdmin } = await import("@/lib/supabase/server");
  const admin = supabaseAdmin();

  const [{ data: traveller }, { data: space }] = await Promise.all([
    admin.from("users").select("email, name").eq("id", booking.travellerId).maybeSingle(),
    admin.from("spaces").select("title, host_id").eq("id", booking.spaceId).maybeSingle(),
  ]);

  let host: Parties["host"] = null;
  if (space?.host_id) {
    const { data: hostRow } = await admin
      .from("hosts")
      .select("user_id")
      .eq("id", space.host_id)
      .maybeSingle();
    if (hostRow?.user_id) {
      const { data: hostUser } = await admin
        .from("users")
        .select("email, name, email_booking_alerts")
        .eq("id", hostRow.user_id)
        .maybeSingle();
      // Hosts can opt out of booking emails (in-app notifications still arrive).
      if (hostUser && hostUser.email_booking_alerts !== false) host = hostUser;
    }
  }

  return {
    traveller: traveller ?? null,
    host,
    spaceTitle: space?.title ?? "your booked space",
  };
}

/** Traveller receipt + host alert when a booking is paid. Best-effort. */
export async function sendBookingConfirmedEmails(booking: Booking): Promise<void> {
  if (!isEmailConfigured()) return;
  try {
    const { traveller, host, spaceTitle } = await bookingParties(booking);
    const currency = booking.price.currency;
    const rows: [string, string][] = [
      ["Reference", booking.reference],
      ["Space", spaceTitle],
      ["Drop-off", formatDateTime(booking.startAt)],
      ["Pick-up", formatDateTime(booking.endAt)],
      ["Total paid", formatMoney(booking.price.total, currency)],
    ];

    const jobs: Promise<boolean>[] = [];
    if (traveller?.email) {
      jobs.push(
        sendEmail(
          traveller.email,
          `Booking confirmed · ${booking.reference}`,
          emailShell(
            `<h2 style="margin:0 0 10px;font-size:19px;color:#15171A">You're booked, ${traveller.name?.split(" ")[0] ?? "traveller"} ✅</h2>
             <p style="margin:0">Your parking is confirmed. Your QR access code is ready in your booking.</p>
             ${emailRows(rows)}
             ${emailButton(`${SITE}/app/booking/${booking.id}`, "View booking & QR code")}
             <p style="margin:0;font-size:12px;color:#878D96">Free cancellation until 24 hours before drop-off. Within 24 hours a 20% late fee applies.</p>`
          )
        )
      );
    }
    if (host?.email) {
      jobs.push(
        sendEmail(
          host.email,
          `New booking · ${booking.reference}`,
          emailShell(
            `<h2 style="margin:0 0 10px;font-size:19px;color:#15171A">New booking for “${spaceTitle}” 🎉</h2>
             <p style="margin:0">A traveller has booked and paid. Details:</p>
             ${emailRows([
               ["Reference", booking.reference],
               ["Drop-off", formatDateTime(booking.startAt)],
               ["Pick-up", formatDateTime(booking.endAt)],
               ["Your payout", formatMoney(booking.price.split.hostPayout, currency)],
             ])}
             ${emailButton(`${SITE}/host`, "Open host dashboard")}`
          )
        )
      );
    }
    await Promise.all(jobs);
  } catch {
    // email must never break the booking flow
  }
}

/** Cancellation emails: refund summary to the traveller, notice to the host. */
export async function sendBookingCancelledEmails(
  booking: Booking,
  refund: number,
  feeApplied: boolean
): Promise<void> {
  if (!isEmailConfigured()) return;
  try {
    const { traveller, host, spaceTitle } = await bookingParties(booking);
    const currency = booking.price.currency;

    const jobs: Promise<boolean>[] = [];
    if (traveller?.email) {
      jobs.push(
        sendEmail(
          traveller.email,
          `Booking cancelled · ${booking.reference}`,
          emailShell(
            `<h2 style="margin:0 0 10px;font-size:19px;color:#15171A">Your booking is cancelled</h2>
             <p style="margin:0">${
               feeApplied
                 ? "As the cancellation was within 24 hours of drop-off, a 20% late fee applies."
                 : "You cancelled more than 24 hours before drop-off, so there's no fee."
             }</p>
             ${emailRows([
               ["Reference", booking.reference],
               ["Space", spaceTitle],
               ["Refund issued", formatMoney(refund, currency)],
             ])}
             <p style="margin:0;font-size:12px;color:#878F96">Refunds usually reach your card within 5–10 working days.</p>`
          )
        )
      );
    }
    if (host?.email) {
      jobs.push(
        sendEmail(
          host.email,
          `Booking cancelled · ${booking.reference}`,
          emailShell(
            `<h2 style="margin:0 0 10px;font-size:19px;color:#15171A">A booking was cancelled</h2>
             <p style="margin:0">“${spaceTitle}” · ${formatDateTime(booking.startAt)} → ${formatDateTime(
               booking.endAt
             )} is no longer going ahead. The dates are open again for new bookings.</p>
             ${emailButton(`${SITE}/host`, "Open host dashboard")}`
          )
        )
      );
    }
    await Promise.all(jobs);
  } catch {
    // best-effort only
  }
}
