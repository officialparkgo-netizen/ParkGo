"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Bell, Paperclip, Send } from "lucide-react";
import type { SupportMessage } from "@/types";

interface Template {
  id: string;
  label: string;
  text: string;
}

interface Payload {
  transcript: SupportMessage[];
  typing?: boolean;
  seenAt?: string | null;
}

/**
 * Admin side of the live support chat: polls the thread, sends as "agent"
 * (with the saved-reply macros and attachments), never reloads the page. The
 * visitor's widget picks replies up on its own poll.
 */
export function SupportLiveThread({
  ticketId,
  initial,
  templates,
  labels,
}: {
  ticketId: string;
  initial: SupportMessage[];
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
  };
}) {
  const [messages, setMessages] = useState<SupportMessage[]>(initial);
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);
  const [typing, setTyping] = useState(false);
  const [seenAt, setSeenAt] = useState<string | null>(null);
  const [uploadError, setUploadError] = useState(false);
  const [notify, setNotify] = useState(false);
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
              {m.text}
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
