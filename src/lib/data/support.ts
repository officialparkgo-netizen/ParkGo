import type { SupportMessage, SupportTicket } from "@/types";
import { IS_LIVE } from "@/lib/config";
import { supabaseAdmin } from "@/lib/supabase/server";
import {
  addSupportTicket as addSupportTicketMock,
  getSupportTickets as getSupportTicketsMock,
  resolveSupportTicket as resolveSupportTicketMock,
  assignSupportTicket as assignSupportTicketMock,
} from "@/lib/data/store";

/**
 * Support tickets — chats the guided assistant couldn't resolve, forwarded to
 * a human agent. Live mode uses the Supabase `support_tickets` table; mock
 * mode an in-memory list. Same shapes either way.
 */

type TicketRow = {
  id: string;
  name: string;
  email: string;
  topic: string;
  transcript: SupportMessage[] | null;
  status: string;
  created_at: string;
  assigned_to?: string | null;
};

function fromRow(r: TicketRow): SupportTicket {
  return {
    id: r.id,
    name: r.name,
    email: r.email,
    topic: r.topic,
    transcript: Array.isArray(r.transcript) ? r.transcript : [],
    status: r.status === "resolved" ? "resolved" : "open",
    createdAt: r.created_at,
    assignedTo: r.assigned_to ?? undefined,
  };
}

const COLS = "*";

export async function createSupportTicket(
  entry: Omit<SupportTicket, "id" | "createdAt" | "status">
): Promise<SupportTicket> {
  if (!IS_LIVE) return addSupportTicketMock(entry);

  const { data, error } = await supabaseAdmin()
    .from("support_tickets")
    .insert({
      name: entry.name,
      email: entry.email,
      topic: entry.topic,
      transcript: entry.transcript,
    })
    .select(COLS)
    .single();

  if (error) throw new Error(`support ticket insert failed: ${error.message}`);
  return fromRow(data as TicketRow);
}

export async function listSupportTickets(): Promise<SupportTicket[]> {
  if (!IS_LIVE) return getSupportTicketsMock();

  const { data, error } = await supabaseAdmin()
    .from("support_tickets")
    .select(COLS)
    .order("created_at", { ascending: false })
    .limit(100);
  if (error || !data) return [];
  return (data as TicketRow[]).map(fromRow);
}

export async function setSupportTicketResolved(id: string): Promise<boolean> {
  if (!IS_LIVE) return resolveSupportTicketMock(id);

  const { error } = await supabaseAdmin()
    .from("support_tickets")
    .update({ status: "resolved" })
    .eq("id", id);
  return !error;
}

/** Assign an open ticket to an admin by display name. */
export async function setSupportTicketAssigned(
  id: string,
  adminName: string
): Promise<boolean> {
  if (!IS_LIVE) return !!assignSupportTicketMock(id, adminName);
  const { error } = await supabaseAdmin()
    .from("support_tickets")
    .update({ assigned_to: adminName.slice(0, 120) })
    .eq("id", id);
  return !error;
}

/** One ticket by id (mock + live). */
export async function getSupportTicketById(id: string): Promise<SupportTicket | null> {
  if (!IS_LIVE) return getSupportTicketsMock().find((x) => x.id === id) ?? null;
  try {
    const { data } = await supabaseAdmin()
      .from("support_tickets")
      .select(COLS)
      .eq("id", id)
      .maybeSingle();
    return data ? fromRow(data as TicketRow) : null;
  } catch {
    return null;
  }
}

/** Append a message to the stored transcript (mock + live). */
export async function appendSupportThreadMessage(
  id: string,
  role: SupportMessage["role"],
  text: string
): Promise<boolean> {
  const msg = { role, text: text.trim().slice(0, 2000) };
  if (!msg.text) return false;
  if (!IS_LIVE) {
    const { appendSupportMessage } = await import("@/lib/data/store");
    return !!appendSupportMessage(id, msg);
  }
  try {
    const { data } = await supabaseAdmin()
      .from("support_tickets")
      .select("transcript")
      .eq("id", id)
      .maybeSingle();
    const transcript = Array.isArray(data?.transcript) ? data.transcript : [];
    const { error } = await supabaseAdmin()
      .from("support_tickets")
      .update({ transcript: [...transcript, msg] })
      .eq("id", id);
    return !error;
  } catch {
    return false;
  }
}

/** Append an agent reply to the stored transcript (mock + live). */
export async function appendAgentReply(id: string, text: string): Promise<boolean> {
  return appendSupportThreadMessage(id, "agent", text);
}
