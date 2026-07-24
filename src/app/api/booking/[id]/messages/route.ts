import { NextRequest } from "next/server";
import type { User } from "@/types";
import { IS_LIVE } from "@/lib/config";
import { getCurrentUser } from "@/lib/auth";
import { getBookingById } from "@/lib/data/bookings";
import { getHostById, getSpaceById } from "@/lib/data/hosts";
import { addBookingMessage, listMessagesForBooking } from "@/lib/data/booking-messages";
import { addNotification } from "@/lib/data/store";

export const dynamic = "force-dynamic";

/**
 * Live chat backing for the booking thread: the client polls GET for new
 * messages and POSTs to send — no page reloads. Same participant rules as
 * everywhere: the traveller, the owning host (or their co-host), or an admin.
 */
async function resolveParticipant(bookingId: string, user: User) {
  const booking = await getBookingById(bookingId);
  if (!booking) return null;
  const space = await getSpaceById(booking.spaceId);
  const host = space ? await getHostById(space.hostId) : null;
  const isTraveller = booking.travellerId === user.id;
  const isHost =
    !!host &&
    (host.userId === user.id ||
      (!!user.cohostHostId && user.cohostHostId === host.id && host.cohostUserId === user.id));
  if (!isTraveller && !isHost && user.role !== "admin") return null;
  return {
    booking,
    hostUserId: host?.userId,
    from: (isHost ? "host" : "traveller") as "host" | "traveller",
  };
}

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getCurrentUser();
  if (!user) return Response.json({ error: "unauthorised" }, { status: 401 });
  const { id } = await params;
  const part = await resolveParticipant(id, user);
  if (!part) return Response.json({ error: "not found" }, { status: 404 });
  const messages = await listMessagesForBooking(id);
  return Response.json({ messages });
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getCurrentUser();
  if (!user) return Response.json({ error: "unauthorised" }, { status: 401 });
  const { id } = await params;
  const part = await resolveParticipant(id, user);
  if (!part) return Response.json({ error: "not found" }, { status: 404 });

  let text = "";
  try {
    const body = (await request.json()) as { text?: unknown };
    text = typeof body.text === "string" ? body.text : "";
  } catch {
    // fall through to the empty-text guard
  }
  if (!text.trim()) return Response.json({ error: "empty" }, { status: 400 });

  const message = await addBookingMessage({ bookingId: id, from: part.from, text });
  if (!message) return Response.json({ error: "failed" }, { status: 500 });

  // Nudge the other side (best-effort, mirrors the old server action).
  const recipient =
    part.from === "host" ? part.booking.travellerId : part.hostUserId;
  if (recipient) {
    const note = {
      title: `New message · ${part.booking.reference}`,
      body: text.trim().slice(0, 120),
      kind: "booking" as const,
    };
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

  return Response.json({ message });
}
