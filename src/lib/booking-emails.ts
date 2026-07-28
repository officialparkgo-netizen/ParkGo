import "server-only";
import type { Booking, GiftCard } from "@/types";
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

/** Traveller email when a host accepts their request-to-book. */
export async function sendBookingApprovedEmail(booking: Booking): Promise<void> {
  if (!isEmailConfigured()) return;
  try {
    const { traveller, spaceTitle } = await bookingParties(booking);
    if (!traveller?.email) return;
    await sendEmail(
      traveller.email,
      `Booking approved · ${booking.reference}`,
      emailShell(
        `<h2 style="margin:0 0 10px;font-size:19px;color:#15171A">You're booked in</h2>
         <p style="margin:0">The host accepted your request — your space is confirmed.</p>
         ${emailRows([
           ["Reference", booking.reference],
           ["Space", spaceTitle],
           ["Drop-off", formatDateTime(booking.startAt)],
           ["Pick-up", formatDateTime(booking.endAt)],
         ])}
         ${emailButton(`${SITE}/app/booking/${booking.id}`, "Open your booking")}`
      )
    );
  } catch {
    // best-effort only
  }
}

/**
 * "Your parking is tomorrow" nudge, sent by the daily cron for confirmed
 * bookings starting in the next 24–48h. In-app notification always; email
 * only when Resend is configured. Returns how many travellers were nudged.
 */
export async function sendArrivalReminders(): Promise<number> {
  const { IS_LIVE } = await import("@/lib/config");
  const from = Date.now() + 24 * 60 * 60 * 1000;
  const to = Date.now() + 48 * 60 * 60 * 1000;
  let bookings: Booking[] = [];

  if (!IS_LIVE) {
    const { getAllBookings } = await import("@/lib/data/store");
    bookings = getAllBookings().filter((b) => {
      const start = new Date(b.startAt).getTime();
      return (
        (b.status === "paid" || b.status === "active") &&
        b.approval !== "pending" &&
        start >= from &&
        start < to
      );
    });
  } else {
    try {
      const { supabaseAdmin } = await import("@/lib/supabase/server");
      const { data } = await supabaseAdmin()
        .from("bookings")
        .select("*")
        .eq("status", "paid")
        .gte("start_at", new Date(from).toISOString())
        .lt("start_at", new Date(to).toISOString())
        .limit(200);
      bookings = (data ?? [])
        /* eslint-disable @typescript-eslint/no-explicit-any */
        .filter((r: any) => r.approval !== "pending")
        .map((r: any) => ({
          id: r.id,
          reference: r.reference,
          travellerId: r.traveller_id,
          spaceId: r.space_id,
          bundle: r.bundle,
          startAt: r.start_at,
          endAt: r.end_at,
          status: r.status,
          price: r.price,
          qrToken: r.qr_token,
          createdAt: r.created_at,
        }));
      /* eslint-enable @typescript-eslint/no-explicit-any */
    } catch {
      return 0;
    }
  }

  let sent = 0;
  for (const booking of bookings) {
    try {
      if (!IS_LIVE) {
        const { addNotification } = await import("@/lib/data/store");
        addNotification({
          userId: booking.travellerId,
          title: `Parking tomorrow · ${booking.reference}`,
          body: `Drop-off ${formatDateTime(booking.startAt)} — directions and your QR are in the app.`,
          kind: "booking",
        });
      } else {
        const { supabaseAdmin } = await import("@/lib/supabase/server");
        await supabaseAdmin().from("notifications").insert({
          user_id: booking.travellerId,
          title: `Parking tomorrow · ${booking.reference}`,
          body: `Drop-off ${formatDateTime(booking.startAt)} — directions and your QR are in the app.`,
          kind: "booking",
        });
        if (isEmailConfigured()) {
          const { traveller, spaceTitle } = await bookingParties(booking);
          if (traveller?.email) {
            await sendEmail(
              traveller.email,
              `Your parking is tomorrow · ${booking.reference}`,
              emailShell(
                `<h2 style="margin:0 0 10px;font-size:19px;color:#15171A">See you tomorrow</h2>
                 ${emailRows([
                   ["Space", spaceTitle],
                   ["Drop-off", formatDateTime(booking.startAt)],
                   ["Pick-up", formatDateTime(booking.endAt)],
                 ])}
                 ${emailButton(`${SITE}/app/booking/${booking.id}`, "Directions & QR")}`
              )
            );
          }
        }
      }
      sent++;
    } catch {
      // keep going — one bad row must not stop the batch
    }
  }
  return sent;
}

/**
 * The gift card itself, sent to whoever it was bought for. The code is the
 * whole value of the email, so it is the one thing rendered large enough to
 * read off a phone and type in one go.
 */
export async function sendGiftCardEmail(card: GiftCard, buyerName: string): Promise<void> {
  if (!isEmailConfigured() || !card.recipientEmail) return;
  try {
    const note = card.message
      ? `<p style="margin:14px 0 0;padding:12px 14px;background:#F7F8F9;border-radius:10px;font-style:italic;color:#3F4650">“${escapeHtml(
          card.message
        )}”</p><p style="margin:6px 0 0;font-size:12px;color:#878D96">— ${escapeHtml(buyerName)}</p>`
      : "";
    await sendEmail(
      card.recipientEmail,
      `${buyerName} sent you ${formatMoney(card.initialPence, "GBP")} of ParkGo parking`,
      emailShell(
        `<h2 style="margin:0 0 10px;font-size:19px;color:#15171A">A gift from ${escapeHtml(
          buyerName
        )} 🎁</h2>
         <p style="margin:0">Airport parking, a licensed transfer to the terminal and EV charging — all on one booking.</p>
         <div style="margin:18px 0;padding:18px;border:2px dashed #F26A1B;border-radius:14px;text-align:center">
           <div style="font-size:12px;font-weight:700;letter-spacing:.08em;text-transform:uppercase;color:#878D96">Your code</div>
           <div style="margin-top:6px;font-size:26px;font-weight:800;letter-spacing:.12em;color:#15171A">${card.code}</div>
           <div style="margin-top:6px;font-size:14px;color:#3F4650">Worth ${formatMoney(
             card.initialPence,
             "GBP"
           )}</div>
         </div>
         ${note}
         ${emailButton(`${SITE}/app/search`, "Find parking")}
         <p style="margin:0;font-size:12px;color:#878D96">Enter the code at checkout. Spend it across as many trips as you like until it runs out.</p>`
      )
    );
  } catch {
    // a gift card that fails to email still exists and can be resent
  }
}

/** Codes are ours, but a buyer's message is not — never inline it raw. */
function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
