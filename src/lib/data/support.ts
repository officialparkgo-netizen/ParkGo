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
  user_id?: string | null;
  priority?: string | null;
  first_response_at?: string | null;
  typing_by?: string | null;
  typing_at?: string | null;
  user_read_at?: string | null;
  agent_read_at?: string | null;
  csat?: number | null;
  csat_comment?: string | null;
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
    userId: r.user_id ?? undefined,
    priority: r.priority === "urgent" ? "urgent" : "normal",
    firstResponseAt: r.first_response_at ?? undefined,
    typingBy: r.typing_by === "agent" || r.typing_by === "user" ? r.typing_by : undefined,
    typingAt: r.typing_at ?? undefined,
    userReadAt: r.user_read_at ?? undefined,
    agentReadAt: r.agent_read_at ?? undefined,
    csat: r.csat === 1 ? 1 : r.csat === -1 ? -1 : undefined,
    csatComment: r.csat_comment ?? undefined,
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
      ...(entry.userId ? { user_id: entry.userId } : {}),
      ...(entry.priority ? { priority: entry.priority } : {}),
    })
    .select(COLS)
    .single();

  if (error) throw new Error(`support ticket insert failed: ${error.message}`);
  return fromRow(data as TicketRow);
}

/** Open before resolved, urgent before normal, newest first. */
function sortQueue(list: SupportTicket[]): SupportTicket[] {
  const rank = (t: SupportTicket) =>
    (t.status === "open" ? 0 : 2) + (t.priority === "urgent" ? 0 : 1);
  return [...list].sort(
    (a, b) => rank(a) - rank(b) || b.createdAt.localeCompare(a.createdAt)
  );
}

export async function listSupportTickets(): Promise<SupportTicket[]> {
  if (!IS_LIVE) return sortQueue(getSupportTicketsMock());

  const { data, error } = await supabaseAdmin()
    .from("support_tickets")
    .select(COLS)
    .order("created_at", { ascending: false })
    .limit(100);
  if (error || !data) return [];
  return sortQueue((data as TicketRow[]).map(fromRow));
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

/**
 * Append a message to the stored transcript (mock + live). An attachment may
 * ride along with an empty body — a photo of the blocked gate says plenty on
 * its own. The first agent line also stamps `first_response_at`, which is what
 * the response-time stat on the support dashboard counts.
 */
export async function appendSupportThreadMessage(
  id: string,
  role: SupportMessage["role"],
  text: string,
  attachment?: SupportMessage["attachment"]
): Promise<boolean> {
  const msg: SupportMessage = {
    role,
    text: text.trim().slice(0, 2000),
    at: new Date().toISOString(),
    ...(attachment ? { attachment } : {}),
  };
  if (!msg.text && !attachment) return false;

  if (!IS_LIVE) {
    const { appendSupportMessage, patchSupportTicket } = await import("@/lib/data/store");
    const t = appendSupportMessage(id, msg);
    if (!t) return false;
    if (role === "agent" && !t.firstResponseAt) {
      patchSupportTicket(id, { firstResponseAt: msg.at });
    }
    // A new message from one side clears the other side's stale "typing…".
    patchSupportTicket(id, { typingBy: undefined, typingAt: undefined });
    return true;
  }

  try {
    const { data } = await supabaseAdmin()
      .from("support_tickets")
      .select("transcript, first_response_at")
      .eq("id", id)
      .maybeSingle();
    if (!data) return false;
    const transcript = Array.isArray(data.transcript) ? data.transcript : [];
    const { error } = await supabaseAdmin()
      .from("support_tickets")
      .update({
        transcript: [...transcript, msg],
        typing_by: null,
        typing_at: null,
        ...(role === "agent" && !data.first_response_at
          ? { first_response_at: msg.at }
          : {}),
      })
      .eq("id", id);
    return !error;
  } catch {
    return false;
  }
}

/** Append an agent reply to the stored transcript (mock + live). */
export async function appendAgentReply(
  id: string,
  text: string,
  attachment?: SupportMessage["attachment"]
): Promise<boolean> {
  return appendSupportThreadMessage(id, "agent", text, attachment);
}

/**
 * "… is typing" presence. Stored as a single stamp rather than a subscription:
 * the reader treats anything older than ~8s as stale, so a closed tab can't
 * leave a phantom indicator running forever.
 */
export async function setTicketTyping(
  id: string,
  side: "user" | "agent"
): Promise<boolean> {
  const at = new Date().toISOString();
  if (!IS_LIVE) {
    const { patchSupportTicket } = await import("@/lib/data/store");
    return !!patchSupportTicket(id, { typingBy: side, typingAt: at });
  }
  const { error } = await supabaseAdmin()
    .from("support_tickets")
    .update({ typing_by: side, typing_at: at })
    .eq("id", id);
  return !error;
}

/** Mark the thread read by one side — drives the "Seen" line. */
export async function markTicketRead(
  id: string,
  side: "user" | "agent"
): Promise<boolean> {
  const at = new Date().toISOString();
  const col = side === "user" ? "user_read_at" : "agent_read_at";
  if (!IS_LIVE) {
    const { patchSupportTicket } = await import("@/lib/data/store");
    return !!patchSupportTicket(
      id,
      side === "user" ? { userReadAt: at } : { agentReadAt: at }
    );
  }
  const { error } = await supabaseAdmin()
    .from("support_tickets")
    .update({ [col]: at })
    .eq("id", id);
  return !error;
}

/** Post-resolution rating. One vote per ticket; re-rating overwrites. */
export async function setTicketCsat(
  id: string,
  score: 1 | -1,
  comment?: string
): Promise<boolean> {
  const csatComment = comment?.trim().slice(0, 500) || undefined;
  if (!IS_LIVE) {
    const { patchSupportTicket } = await import("@/lib/data/store");
    return !!patchSupportTicket(id, { csat: score, csatComment });
  }
  const { error } = await supabaseAdmin()
    .from("support_tickets")
    .update({ csat: score, csat_comment: csatComment ?? null })
    .eq("id", id);
  return !error;
}

/** Agents can bump a ticket up (or back down) the queue by hand. */
export async function setTicketPriority(
  id: string,
  priority: "normal" | "urgent"
): Promise<boolean> {
  if (!IS_LIVE) {
    const { patchSupportTicket } = await import("@/lib/data/store");
    return !!patchSupportTicket(id, { priority });
  }
  const { error } = await supabaseAdmin()
    .from("support_tickets")
    .update({ priority })
    .eq("id", id);
  return !error;
}
