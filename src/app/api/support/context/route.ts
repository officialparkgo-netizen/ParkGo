import { getCurrentUser } from "@/lib/auth";
import { getPlatformSettings } from "@/lib/data/settings";
import { listBookingsForTraveller } from "@/lib/data/bookings";
import { getSpaceById } from "@/lib/data/hosts";
import { relevantBooking } from "@/lib/support-bot";
import { deskState } from "@/lib/support-hours";
import { formatDate } from "@/lib/utils";

export const dynamic = "force-dynamic";

/**
 * Everything the chat widget needs before the first message: who is asking
 * (so we never make a signed-in customer retype their name and email), whether
 * the desk is open, the WhatsApp fallback, and a one-line summary of the
 * booking their question is most likely about. The booking is resolved here
 * rather than in the browser so a visitor can't ask about someone else's stay.
 */
export async function GET() {
  const settings = await getPlatformSettings().catch(() => null);
  const desk = settings
    ? deskState(settings)
    : { open: true, opensInMinutes: 0, replyMinutes: 10 };
  const whatsapp = settings?.supportWhatsapp || null;

  const user = await getCurrentUser().catch(() => null);
  if (!user) return Response.json({ me: null, desk, whatsapp, booking: null });

  let booking: { id: string; ref: string; dates: string; area: string } | null = null;
  if (user.role === "traveller") {
    try {
      const b = relevantBooking(await listBookingsForTraveller(user.id));
      if (b) {
        const space = await getSpaceById(b.spaceId).catch(() => null);
        booking = {
          id: b.id,
          ref: b.reference,
          dates: `${formatDate(b.startAt)} – ${formatDate(b.endAt)}`,
          area: space?.approxArea || "",
        };
      }
    } catch {
      // no booking context — the bot falls back to the FAQ answers
    }
  }

  return Response.json({
    me: { name: user.name, email: user.email },
    desk,
    whatsapp,
    booking,
  });
}
