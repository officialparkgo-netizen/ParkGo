import { NextRequest } from "next/server";
import { bookingIcs } from "@/lib/booking-calendar";
import { resolvePassAccess } from "@/lib/booking-access";
import { SITE } from "@/lib/seo";

export const dynamic = "force-dynamic";

/**
 * The stay as a calendar entry.
 *
 * A drop-off is a time-critical appointment, and the phone people already
 * trust for those is their calendar. The same share token that opens the pass
 * works here, so the person actually driving can put it in *their* diary.
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const access = await resolvePassAccess(id, request.nextUrl.searchParams.get("t"));
  if (!access) return new Response("Not found", { status: 404 });

  const { booking, space } = access;
  const base = process.env.NEXT_PUBLIC_SITE_URL || SITE.url;
  const ics = bookingIcs({
    uid: `${booking.id}@parkgo.ai`,
    title: `ParkGo parking · ${booking.reference}`,
    description: [
      `Booking ${booking.reference}`,
      space.accessRules,
      `Entry pass: ${base}/pass/${booking.id}`,
    ]
      .filter(Boolean)
      .join("\n"),
    location: space.exactAddress || space.approxArea,
    startAt: booking.startAt,
    endAt: booking.endAt,
    url: `${base}/pass/${booking.id}`,
  });

  return new Response(ics, {
    headers: {
      "content-type": "text/calendar; charset=utf-8",
      "content-disposition": `attachment; filename="parkgo-${booking.reference}.ics"`,
      "cache-control": "no-store",
    },
  });
}
