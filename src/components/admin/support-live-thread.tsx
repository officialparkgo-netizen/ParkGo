"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Bell, Languages, Paperclip, Send, StickyNote, Tag } from "lucide-react";
import type { SupportMessage, SupportNote } from "@/types";
import { SUGGESTED_TAGS } from "@/lib/support-queue";

interface Template {
  id: string;
  label: string;
  text: string;
}

interface Payload {
  transcript: SupportMessage[];
  typing?: boolean;
  seenAt?: string | null;
  notes?: SupportNote[];
  tags?: string[];
}

/**
 * Admin side of the live support chat: polls the thread, sends as "agent"
 * (with the saved-reply macros and attachments), never reloads the page. The
 * visitor's widget picks replies up on its own poll.
 */
export function SupportLiveThread({
  ticketId,
  initial,
  initialNotes = [],
  initialTags = [],
  translating = false,
  templates,
  labels,
}: {
  ticketId: string;
  initial: SupportMessage[];
  initialNotes?: SupportNote[];
  initialTags?: string[];
  /** True when replies on this ticket get translated before they are sent. */
  translating?: boolean;
  templates: Template[];
  labels: {
    pick: string;
    send: string;
    visitor: string;
    team: string;
    typing: string;
    seen: string;
    attach: string;
    attachError: string;
    notify: string;
    notifyOn: string;
    newReply: string;
    notes: string;
    notePlaceholder: string;
    addNote: string;
    noteHint: string;
    tags: string;
    addTag: string;
    /** Screen-reader label for the untranslated text under a translation. */
    original: string;
    /** …and for the translated copy under an agent's own reply. */
    sentAs: string;
    /** Warns the agent that what they type will be machine-translated. */
    replyTranslated: string;
  };
}) {
  const [messages, setMessages] = useState<SupportMessage[]>(initial);
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);
  const [typing, setTyping] = useState(false);
  const [seenAt, setSeenAt] = useState<string | null>(null);
  const [uploadError, setUploadError] = useState(false);
  const [notify, setNotify] = useState(false);
  const [notes, setNotes] = useState<SupportNote[]>(initialNotes);
  const [tags, setTags] = useState<string[]>(initialTags);
  const [noteDraft, setNoteDraft] = useState("");
  const [tagDraft, setTagDraft] = useState("");
  const listRef = useRef<HTMLDivElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const typedAt = useRef(0);
  /** Message count at the last render, so we only alert on genuinely new ones. */
  const seenCount = useRef(initial.length);

  const url = `/api/support/thread?id=${encodeURIComponent(ticketId)}`;

  useEffect(() => {
    const el = listRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [messages.length, typing]);

  const apply = useCallback(
    (data: { ticket?: Payload | null }) => {
      if (!data.ticket) return;
      const tk = data.ticket;
      setTyping(!!tk.typing);
      setSeenAt(tk.seenAt ?? null);
      if (tk.notes) setNotes(tk.notes);
      if (tk.tags) setTags(tk.tags);
      if (tk.transcript.length === seenCount.current) return;
      // A message arriving from the visitor while the agent is elsewhere is
      // exactly the case a desktop alert exists for.
      const incoming = tk.transcript.slice(seenCount.current).filter((m) => m.role === "user");
      if (notify && incoming.length > 0 && typeof Notification !== "undefined") {
        try {
          new Notification(`${labels.newReply} · ${labels.visitor}`, {
            body: incoming[incoming.length - 1].text.slice(0, 140) || labels.attach,
            tag: ticketId,
          });
        } catch {
          // notifications are a nicety; never let them break the thread
        }
      }
      seenCount.current = tk.transcript.length;
      setMessages(tk.transcript);
    },
    [notify, labels.newReply, labels.visitor, labels.attach, ticketId]
  );

  useEffect(() => {
    const timer = setInterval(async () => {
      if (document.hidden) return;
      try {
        const res = await fetch(url, { cache: "no-store" });
        if (res.ok) apply(await res.json());
      } catch {
        // next tick retries
      }
    }, 4000);
    return () => clearInterval(timer);
  }, [url, apply]);

  /** Let the visitor see "typing…" while a reply is being composed. */
  const pingTyping = () => {
    if (Date.now() - typedAt.current < 3000) return;
    typedAt.current = Date.now();
    fetch(url, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ typing: true }),
    }).catch(() => {});
  };

  const askNotify = async () => {
    if (typeof Notification === "undefined") return;
    const granted =
      Notification.permission === "granted"
        ? "granted"
        : await Notification.requestPermission().catch(() => "denied");
    setNotify(granted === "granted");
  };

  /** Notes and tags share the thread endpoint but never reach the visitor. */
  const post = async (body: Record<string, unknown>) => {
    try {
      const res = await fetch(url, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(body),
      });
      if (res.ok) apply(await res.json());
    } catch {
      // the poll re-syncs
    }
  };

  const addNote = async (e: React.FormEvent) => {
    e.preventDefault();
    const note = noteDraft.trim();
    if (!note) return;
    setNoteDraft("");
    await post({ note });
  };

  const toggleTag = (tag: string) =>
    post({ tags: tags.includes(tag) ? tags.filter((x) => x !== tag) : [...tags, tag] });

  const addTag = async (e: React.FormEvent) => {
    e.preventDefault();
    const tag = tagDraft.trim();
    if (!tag) return;
    setTagDraft("");
    await post({ tags: [...tags, tag] });
  };

  const send = async (e: React.FormEvent) => {
    e.preventDefault();
    const body = text.trim();
    if (!body || sending) return;
    setSending(true);
    try {
      const res = await fetch(url, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ text: body }),
      });
      if (res.ok) {
        apply(await res.json());
        setText("");
      }
    } catch {
      // keep the draft so the admin can retry
    } finally {
      setSending(false);
    }
  };

  const sendFile = async (file: File) => {
    setUploadError(false);
    setSending(true);
    const body = new FormData();
    body.append("file", file);
    try {
      const res = await fetch(url, { method: "POST", body });
      if (res.ok) apply(await res.json());
      else setUploadError(true);
    } catch {
      setUploadError(true);
    } finally {
      setSending(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  };

  const lastMine = [...messages].reverse().find((m) => m.role === "agent");
  const showSeen = !!seenAt && !!lastMine?.at && +new Date(seenAt) >= +new Date(lastMine.at);

  return (
    <div className="mt-3 border-t border-navy-100 pt-3" data-admin-thread>
      <div ref={listRef} className="max-h-56 space-y-1.5 overflow-y-auto">
        {messages.map((m, i) => (
          <div key={i} className={`flex ${m.role === "agent" ? "justify-end" : "justify-start"}`}>
            <div
              className={`max-w-[85%] whitespace-pre-line rounded-xl px-3 py-1.5 text-xs leading-relaxed ${
                m.role === "agent"
                  ? "rounded-ee-sm bg-brand-500 text-white"
                  : m.role === "bot"
                    ? "rounded-es-sm bg-navy-50 italic text-navy-400"
                    : "rounded-es-sm bg-navy-100 text-navy-800"
              }`}
            >
              <span className="me-1 font-bold">
                {m.role === "agent" ? labels.team : m.role === "bot" ? "bot" : labels.visitor}:
              </span>
              {/* Whichever way the translation runs, the agent reads English
                  first and sees the other language second. On a visitor's
                  message that means the translation leads and the original
                  follows — machine translation drops negations, and an agent
                  must be able to check what was actually said. On their own
                  reply it is the reverse: their English leads, and what the
                  visitor was actually sent sits underneath. */}
              {m.translated ? (
                <>
                  {m.role === "agent" ? m.text : m.translated}
                  <span
                    className={`mt-1 flex items-start gap-1 border-t pt-1 text-[11px] ${
                      m.role === "agent"
                        ? "border-white/30 text-white/80"
                        : "border-navy-200/70 text-navy-500"
                    }`}
                  >
                    <Languages className="mt-0.5 h-3 w-3 shrink-0" aria-hidden />
                    <span dir="auto">
                      <span className="sr-only">
                        {m.role === "agent" ? labels.sentAs : labels.original}:{" "}
                      </span>
                      {m.role === "agent" ? m.translated : m.text}
                    </span>
                  </span>
                </>
              ) : (
                m.text
              )}
              {m.attachment &&
                (m.attachment.kind === "image" ? (
                  <a href={m.attachment.url} target="_blank" rel="noopener noreferrer">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={m.attachment.url}
                      alt={m.attachment.name}
                      className="mt-1 max-h-32 rounded-lg object-cover"
                    />
                  </a>
                ) : (
                  <a
                    href={m.attachment.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-1 flex items-center gap-1 font-semibold underline"
                  >
                    <Paperclip className="h-3 w-3" aria-hidden /> {m.attachment.name}
                  </a>
                ))}
            </div>
          </div>
        ))}
      </div>

      {typing && (
        <p className="mt-1 text-[11px] italic text-navy-400" data-visitor-typing>
          {labels.typing}
        </p>
      )}
      {showSeen && (
        <p className="mt-1 text-end text-[10px] text-navy-400" data-agent-seen>
          ✓✓ {labels.seen}
        </p>
      )}
      {uploadError && (
        <p className="mt-1 text-[11px] font-semibold text-red-600">{labels.attachError}</p>
      )}

      {/* Tags — one click for the common ones, free text for the rest. */}
      <div className="mt-2 flex flex-wrap items-center gap-1.5" data-ticket-tags>
        <Tag className="h-3.5 w-3.5 text-navy-400" aria-hidden />
        <span className="sr-only">{labels.tags}</span>
        {SUGGESTED_TAGS.map((tag) => (
          <button
            key={tag}
            type="button"
            onClick={() => toggleTag(tag)}
            aria-pressed={tags.includes(tag)}
            className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${
              tags.includes(tag)
                ? "bg-navy-900 text-white"
                : "border border-navy-200 bg-white text-navy-500 hover:bg-navy-50"
            }`}
          >
            {tag}
          </button>
        ))}
        {tags
          .filter((tag) => !SUGGESTED_TAGS.includes(tag as (typeof SUGGESTED_TAGS)[number]))
          .map((tag) => (
            <button
              key={tag}
              type="button"
              onClick={() => toggleTag(tag)}
              aria-pressed
              className="rounded-full bg-brand-500 px-2 py-0.5 text-[11px] font-semibold text-white"
            >
              {tag} ×
            </button>
          ))}
        <input
          value={tagDraft}
          onChange={(e) => setTagDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") addTag(e);
          }}
          placeholder={labels.addTag}
          aria-label={labels.addTag}
          className="w-24 rounded-full border border-dashed border-navy-200 px-2 py-0.5 text-[11px] text-navy-700 focus:border-brand-400 focus:outline-none"
        />
      </div>

      {/* Internal notes — for the next agent, never for the visitor. */}
      <details className="mt-2 rounded-lg bg-accent-50/60 px-2.5 py-2" data-ticket-notes>
        <summary className="cursor-pointer text-[11px] font-bold text-accent-700">
          <StickyNote className="me-1 inline h-3.5 w-3.5" aria-hidden />
          {labels.notes} ({notes.length})
        </summary>
        <ul className="mt-1.5 space-y-1">
          {notes.map((n, i) => (
            <li key={i} className="text-[11px] leading-snug text-navy-700">
              <span className="font-semibold">{n.by}:</span> {n.text}
            </li>
          ))}
        </ul>
        <form onSubmit={addNote} className="mt-1.5 flex gap-1.5">
          <input
            value={noteDraft}
            onChange={(e) => setNoteDraft(e.target.value)}
            maxLength={2000}
            placeholder={labels.notePlaceholder}
            className="min-w-0 flex-1 rounded-lg border border-navy-200 bg-white px-2 py-1.5 text-[11px] text-navy-700 focus:border-brand-400 focus:outline-none"
          />
          <button
            type="submit"
            disabled={!noteDraft.trim()}
            className="shrink-0 rounded-lg bg-accent-500 px-2.5 py-1.5 text-[11px] font-semibold text-white disabled:opacity-50"
          >
            {labels.addNote}
          </button>
        </form>
        <p className="mt-1 text-[10px] text-navy-400">{labels.noteHint}</p>
      </details>

      {/* Said once, above the box, because an agent who does not know their
          words will be machine-translated writes idioms and abbreviations that
          do not survive the trip. */}
      {translating && (
        <p className="mt-2 flex items-start gap-1 text-[11px] leading-snug text-navy-500">
          <Languages className="mt-0.5 h-3 w-3 shrink-0" aria-hidden />
          {labels.replyTranslated}
        </p>
      )}

      <form onSubmit={send} className="mt-2 space-y-2">
        <div className="flex gap-2">
          <select
            aria-label={labels.pick}
            defaultValue=""
            onChange={(e) => {
              const tpl = templates.find((x) => x.id === e.target.value);
              if (tpl) setText(tpl.text);
              e.target.value = "";
            }}
            className="min-w-0 flex-1 rounded-lg border border-navy-200 bg-white px-2.5 py-2 text-xs text-navy-700 focus:border-brand-400 focus:outline-none"
          >
            <option value="" disabled>
              {labels.pick}
            </option>
            {templates.map((tpl) => (
              <option key={tpl.id} value={tpl.id}>
                {tpl.label}
              </option>
            ))}
          </select>
          <button
            type="button"
            onClick={askNotify}
            aria-pressed={notify}
            className={`shrink-0 rounded-lg border px-2.5 py-2 text-xs font-semibold ${
              notify
                ? "border-go-300 bg-go-50 text-go-700"
                : "border-navy-200 bg-white text-navy-600 hover:bg-navy-50"
            }`}
          >
            <Bell className="me-1 inline h-3.5 w-3.5" aria-hidden />
            {notify ? labels.notifyOn : labels.notify}
          </button>
        </div>
        <div className="flex gap-2">
          <input
            ref={fileRef}
            type="file"
            accept="image/*,application/pdf"
            className="hidden"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) void sendFile(f);
            }}
          />
          <button
            type="button"
            aria-label={labels.attach}
            title={labels.attach}
            disabled={sending}
            onClick={() => fileRef.current?.click()}
            className="shrink-0 rounded-lg border border-navy-200 bg-white px-2.5 py-2 text-navy-500 hover:bg-navy-50 disabled:opacity-50"
          >
            <Paperclip className="h-3.5 w-3.5" aria-hidden />
          </button>
          <input
            name="message"
            value={text}
            onChange={(e) => {
              setText(e.target.value);
              pingTyping();
            }}
            maxLength={2000}
            className="min-w-0 flex-1 rounded-lg border border-navy-200 bg-white px-2.5 py-2 text-xs text-navy-700 focus:border-brand-400 focus:outline-none"
          />
          <button
            type="submit"
            disabled={sending || !text.trim()}
            className="inline-flex items-center gap-1.5 rounded-lg bg-navy-900 px-3 py-2 text-xs font-semibold text-white hover:bg-navy-700 disabled:opacity-50"
          >
            <Send className="h-3.5 w-3.5" /> {labels.send}
          </button>
        </div>
      </form>
    </div>
  );
}
