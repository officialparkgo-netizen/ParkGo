import type { SupportMessage, SupportNote, SupportTicket } from "@/types";
import { IS_LIVE } from "@/lib/config";
import { supabaseAdmin } from "@/lib/supabase/server";
import { sortQueue } from "@/lib/support-queue";
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
  notes?: SupportNote[] | null;
  tags?: string[] | null;
  snooze_until?: string | null;
  escalated_at?: string | null;
  phone?: string | null;
  callback_at?: string | null;
  locale?: string | null;
};

const LOCALES = ["en", "ur", "hi", "de", "zh", "ar"] as const;

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
    notes: Array.isArray(r.notes) ? r.notes : [],
    tags: Array.isArray(r.tags) ? r.tags : [],
    snoozeUntil: r.snooze_until ?? undefined,
    escalatedAt: r.escalated_at ?? undefined,
    phone: r.phone ?? undefined,
    callbackAt: r.callback_at ?? undefined,
    locale: (LOCALES as readonly string[]).includes(r.locale ?? "")
      ? (r.locale as SupportTicket["locale"])
      : undefined,
  };
}

const COLS = "*";

export async function createSupportTicket(
  entry: Omit<SupportTicket, "id" | "createdAt" | "status">
): Promise<SupportTicket> {
  if (!IS_LIVE) return addSupportTicketMock(entry);

  const insert = (withLocale: boolean) =>
    supabaseAdmin()
      .from("support_tickets")
      .insert({
        name: entry.name,
        email: entry.email,
        topic: entry.topic,
        transcript: entry.transcript,
        ...(entry.userId ? { user_id: entry.userId } : {}),
        ...(entry.priority ? { priority: entry.priority } : {}),
        ...(withLocale && entry.locale ? { locale: entry.locale } : {}),
        ...(entry.phone ? { phone: entry.phone } : {}),
        ...(entry.callbackAt ? { callback_at: entry.callbackAt } : {}),
        ...(entry.assignedTo ? { assigned_to: entry.assignedTo } : {}),
        ...(entry.tags?.length ? { tags: entry.tags } : {}),
      })
      .select(COLS)
      .single();

  let { data, error } = await insert(true);
  // A pre-0030 check constraint doesn't know "ar" yet. The customer's ticket
  // must survive that — retry without the language rather than losing it.
  if (error && entry.locale) {
    ({ data, error } = await insert(false));
  }

  if (error) throw new Error(`support ticket insert failed: ${error.message}`);
  return fromRow(data as TicketRow);
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

/**
 * Back to open. A visitor who replies to a resolved thread is telling us it
 * is not resolved — leaving the ticket closed would file their message where
 * nobody looks.
 */
export async function reopenSupportTicket(id: string): Promise<boolean> {
  if (!IS_LIVE) {
    const { reopenSupportTicket: reopenMock } = await import("@/lib/data/store");
    return reopenMock(id);
  }
  const { error } = await supabaseAdmin()
    .from("support_tickets")
    .update({ status: "open" })
    .eq("id", id)
    .eq("status", "resolved");
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

/**
 * Repair a ticket's missing translations in place, and persist the repair.
 *
 * Translations are stored at write time — which means a ticket written before
 * the provider key existed (or before per-message detection shipped) shows an
 * agent raw Arabic forever, however healthy translation is today. The queue
 * page calls this for the tickets on screen: the language field is corrected
 * from what the visitor actually wrote (that is the reply direction), and up
 * to five untranslated visitor messages get their English rendering. Opening
 * the queue is the moment an agent needs it, so that is when it heals.
 */
export async function healSupportTicketTranslations(ticket: SupportTicket): Promise<void> {
  try {
    const { isTranslationConfigured, translateForReader } = await import("@/lib/translate");
    if (!isTranslationConfigured()) return;

    let localeChanged = false;
    const { detectThreadLocale } = await import("@/lib/support-lang");
    const spoken = detectThreadLocale(ticket.transcript);
    if ((!ticket.locale || ticket.locale === "en") && spoken !== "en") {
      ticket.locale = spoken;
      localeChanged = true;
    }

    let transcriptChanged = false;
    const missing = ticket.transcript
      .filter((m) => m.role === "user" && !!m.text && !m.translated)
      .slice(0, 5);
    for (const m of missing) {
      const out = await translateForReader(m.text, "en", ticket.locale);
      if (!out) continue;
      m.translated = out.text.slice(0, 4000);
      const source = out.source ?? (ticket.locale !== "en" ? ticket.locale : undefined);
      if (source) m.sourceLocale = source;
      transcriptChanged = true;
    }

    // Mock tickets are the store's own objects — the mutation above IS the
    // persistence. Live rows were copied out of Postgres, so write back.
    if (!IS_LIVE || (!transcriptChanged && !localeChanged)) return;
    if (transcriptChanged) {
      await supabaseAdmin()
        .from("support_tickets")
        .update({ transcript: ticket.transcript })
        .eq("id", ticket.id);
    }
    if (localeChanged) {
      // Separately, so a pre-0030 check constraint refusing "ar" cannot take
      // the transcript repair down with it.
      await supabaseAdmin()
        .from("support_tickets")
        .update({ locale: ticket.locale })
        .eq("id", ticket.id);
    }
  } catch {
    // healing is opportunistic — the queue renders fine without it
  }
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

  /**
   * Translate across the language gap, once, here — in both directions.
   *
   * A visitor's message is rendered into English for the team; an agent's
   * reply is rendered into the language the visitor is writing in. Either way
   * the original is kept and both sides are shown both, because a rendering
   * nobody can check is a rendering nobody should have to act on.
   *
   * At write time rather than read time: translating on render would call the
   * provider again on every poll, for every agent watching the queue and every
   * open widget. Storing it also makes the translation part of the record, so
   * the ticket still reads the same in six months if the provider is gone.
   */
  if (msg.text && (role === "user" || role === "agent")) {
    const { translateText, translateForReader } = await import("@/lib/translate");

    if (role === "user") {
      // The shared reader logic: script decides where it can, and Latin text
      // that looks like no English ("hola") is probed with the provider — so
      // any language reaches the agent, whatever the account is set to. A
      // failed call changes nothing: the agent still gets the original.
      const out = await translateForReader(msg.text, "en");
      if (out) {
        msg.translated = out.text.slice(0, 4000);
        if (out.source) msg.sourceLocale = out.source;
      }
    } else {
      /**
       * The reply goes back in the visitor's language. Read from the ticket
       * rather than guessed from the agent's own words — the agent writes
       * English either way, so their text says nothing about who is reading it.
       */
      const ticket = await getSupportTicketById(id);
      const target = ticket?.locale;
      if (target && target !== "en") {
        const out = await translateText(msg.text, target, "en");
        if (out?.text && out.text.trim() !== msg.text) {
          msg.translated = out.text.slice(0, 4000);
          msg.sourceLocale = "en";
        }
      }
    }
  }

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

/**
 * Agent-only note. Kept on the ticket rather than in the transcript so it can
 * never be handed to the visitor by an endpoint that forgets to filter.
 */
export async function addTicketNote(
  id: string,
  by: string,
  text: string
): Promise<boolean> {
  const note: SupportNote = {
    at: new Date().toISOString(),
    by: by.slice(0, 120),
    text: text.trim().slice(0, 2000),
  };
  if (!note.text) return false;
  if (!IS_LIVE) {
    const { patchSupportTicket, getSupportTickets } = await import("@/lib/data/store");
    const existing = getSupportTickets().find((x) => x.id === id)?.notes ?? [];
    return !!patchSupportTicket(id, { notes: [...existing, note] });
  }
  try {
    const { data } = await supabaseAdmin()
      .from("support_tickets")
      .select("notes")
      .eq("id", id)
      .maybeSingle();
    if (!data) return false;
    const notes = Array.isArray(data.notes) ? data.notes : [];
    const { error } = await supabaseAdmin()
      .from("support_tickets")
      .update({ notes: [...notes, note] })
      .eq("id", id);
    return !error;
  } catch {
    return false;
  }
}

/** Replace the ticket's tags (already normalised by the caller). */
export async function setTicketTags(id: string, tags: string[]): Promise<boolean> {
  if (!IS_LIVE) {
    const { patchSupportTicket } = await import("@/lib/data/store");
    return !!patchSupportTicket(id, { tags });
  }
  const { error } = await supabaseAdmin()
    .from("support_tickets")
    .update({ tags })
    .eq("id", id);
  return !error;
}

/** Park a ticket until later, or wake it now by passing null. */
export async function setTicketSnooze(
  id: string,
  until: string | null
): Promise<boolean> {
  if (!IS_LIVE) {
    const { patchSupportTicket } = await import("@/lib/data/store");
    return !!patchSupportTicket(id, { snoozeUntil: until ?? undefined });
  }
  const { error } = await supabaseAdmin()
    .from("support_tickets")
    .update({ snooze_until: until })
    .eq("id", id);
  return !error;
}

/** Stamp that a breached SLA has already been reported, so it fires once. */
export async function markTicketEscalated(id: string): Promise<boolean> {
  const at = new Date().toISOString();
  if (!IS_LIVE) {
    const { patchSupportTicket } = await import("@/lib/data/store");
    return !!patchSupportTicket(id, { escalatedAt: at });
  }
  const { error } = await supabaseAdmin()
    .from("support_tickets")
    .update({ escalated_at: at })
    .eq("id", id);
  return !error;
}

/**
 * How many chats this sender opened in the last hour — the spam brake reads
 * this before creating another. Failure counts as zero: a broken limiter must
 * never block a real customer from asking for help.
 */
export async function countRecentTicketsByEmail(email: string): Promise<number> {
  const since = new Date(Date.now() - 3_600_000).toISOString();
  const needle = email.trim().toLowerCase();
  if (!needle) return 0;
  if (!IS_LIVE) {
    const { getSupportTickets } = await import("@/lib/data/store");
    return getSupportTickets().filter(
      (x) => x.email.toLowerCase() === needle && x.createdAt >= since
    ).length;
  }
  try {
    const { count } = await supabaseAdmin()
      .from("support_tickets")
      .select("id", { count: "exact", head: true })
      .ilike("email", needle)
      .gte("created_at", since);
    return count ?? 0;
  } catch {
    return 0;
  }
}

/** Every past chat from this person — context an agent should not have to ask for. */
export async function listTicketsForVisitor(
  email: string,
  userId?: string
): Promise<SupportTicket[]> {
  const needle = email.trim().toLowerCase();
  if (!IS_LIVE) {
    const { getSupportTickets } = await import("@/lib/data/store");
    return getSupportTickets().filter(
      (x) => (userId && x.userId === userId) || x.email.toLowerCase() === needle
    );
  }
  try {
    const filters = [`email.ilike.${needle.replace(/[,()]/g, "")}`];
    if (userId) filters.push(`user_id.eq.${userId}`);
    const { data } = await supabaseAdmin()
      .from("support_tickets")
      .select(COLS)
      .or(filters.join(","))
      .order("created_at", { ascending: false })
      .limit(20);
    return (data ?? []).map((r) => fromRow(r as TicketRow));
  } catch {
    return [];
  }
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
