import type { TransferMessage } from "@/types";
import { IS_LIVE } from "@/lib/config";
import { supabaseAdmin } from "@/lib/supabase/server";
import {
  addDriverMessage as addDriverMessageMock,
  getDriverMessages as getDriverMessagesMock,
} from "@/lib/data/store";

/**
 * Traveller ↔ driver chat, keyed by booking. Drivers belong to the licensed
 * operator, not ParkGo — in live mode messages are stored here and relayed
 * to the operator integration (driver replies arrive the same way); in mock
 * mode the demo driver answers by itself.
 */

type Row = {
  id: string;
  booking_id: string;
  sender: string;
  body: string;
  created_at: string;
};

function fromRow(r: Row): TransferMessage {
  return {
    id: r.id,
    bookingId: r.booking_id,
    from: r.sender === "driver" ? "driver" : "traveller",
    text: r.body,
    at: r.created_at,
  };
}

const COLS = "id, booking_id, sender, body, created_at";

export async function sendTransferMessage(
  bookingId: string,
  text: string
): Promise<TransferMessage | null> {
  if (!IS_LIVE) return addDriverMessageMock(bookingId, text);

  const { data, error } = await supabaseAdmin()
    .from("transfer_messages")
    .insert({ booking_id: bookingId, sender: "traveller", body: text })
    .select(COLS)
    .single();
  if (error || !data) return null;
  return fromRow(data as Row);
}

export async function listTransferMessages(bookingId: string): Promise<TransferMessage[]> {
  if (!IS_LIVE) return getDriverMessagesMock(bookingId);

  const { data, error } = await supabaseAdmin()
    .from("transfer_messages")
    .select(COLS)
    .eq("booking_id", bookingId)
    .order("created_at", { ascending: true })
    .limit(200);
  if (error || !data) return [];
  return (data as Row[]).map(fromRow);
}
