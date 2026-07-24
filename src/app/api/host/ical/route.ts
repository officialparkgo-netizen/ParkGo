import { NextRequest } from "next/server";
import { buildIcs, verifyIcalToken } from "@/lib/ical";
import { listBookingsForHost } from "@/lib/data/bookings";
import { getHostById, getSpacesForHost } from "@/lib/data/hosts";
import { getUsersByIds } from "@/lib/data/users";

export const dynamic = "force-dynamic";

/**
 * Host bookings as an iCal feed — subscribe once in Google/Apple Calendar and
 * every confirmed stay appears automatically. Auth is the HMAC token in the
 * URL (calendar apps can't send cookies).
 */
export async function GET(request: NextRequest) {
  const hostId = request.nextUrl.searchParams.get("host") ?? "";
  const token = request.nextUrl.searchParams.get("token") ?? "";
  if (!verifyIcalToken(hostId, token)) {
    return new Response("Not found", { status: 404 });
  }
  const host = await getHostById(hostId);
  if (!host) return new Response("Not found", { status: 404 });

  const [bookings, spaces] = await Promise.all([
    listBookingsForHost(hostId),
    getSpacesForHost(hostId),
  ]);
  const spaceMap = new Map(spaces.map((s) => [s.id, s]));
  const confirmed = bookings.filter(
    (b) =>
      (b.status === "paid" || b.status === "active" || b.status === "completed") &&
      b.approval !== "pending" &&
      b.approval !== "declined"
  );
  const guests = await getUsersByIds(confirmed.map((b) => b.travellerId));

  const ics = buildIcs(
    `ParkGo · ${host.displayName}`,
    confirmed.map((b) => {
      const space = spaceMap.get(b.spaceId);
      const guest = guests.get(b.travellerId);
      return {
        uid: b.id,
        start: b.startAt,
        end: b.endAt,
        summary: `Parking · ${guest?.name ?? "Guest"} (${b.reference})`,
        description: [
          space?.title,
          guest?.vehicle
            ? `${guest.vehicle.make} · ${guest.vehicle.colour} · ${guest.vehicle.reg}`
            : null,
        ]
          .filter(Boolean)
          .join(" — "),
        location: space?.approxArea,
      };
    })
  );

  return new Response(ics, {
    headers: {
      "content-type": "text/calendar; charset=utf-8",
      "content-disposition": 'attachment; filename="parkgo-bookings.ics"',
      "cache-control": "private, max-age=300",
    },
  });
}
