"use client";

import { useEffect, useRef, useState } from "react";
import { Send } from "lucide-react";
import type { SupportMessage } from "@/types";

interface Template {
  id: string;
  label: string;
  text: string;
}

/**
 * Admin side of the live support chat: polls the thread, sends as "agent"
 * (with the saved-reply macros), never reloads the page. The visitor's
 * widget picks replies up on its own poll.
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
  labels: { pick: string; send: string; visitor: string; team: string };
}) {
  const [messages, setMessages] = useState<SupportMessage[]>(initial);
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = listRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [messages.length]);

  useEffect(() => {
    const timer = setInterval(async () => {
      if (document.hidden) return;
      try {
        const res = await fetch(`/api/support/thread?id=${encodeURIComponent(ticketId)}`, {
          cache: "no-store",
        });
        if (!res.ok) return;
        const data = (await res.json()) as { ticket?: { transcript: SupportMessage[] } };
        if (data.ticket && data.ticket.transcript.length !== messages.length) {
          setMessages(data.ticket.transcript);
        }
      } catch {
        // next tick retries
      }
    }, 4000);
    return () => clearInterval(timer);
  }, [ticketId, messages.length]);

  const send = async (e: React.FormEvent) => {
    e.preventDefault();
    const body = text.trim();
    if (!body || sending) return;
    setSending(true);
    try {
      const res = await fetch(`/api/support/thread?id=${encodeURIComponent(ticketId)}`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ text: body }),
      });
      if (res.ok) {
        const data = (await res.json()) as { ticket?: { transcript: SupportMessage[] } };
        if (data.ticket) setMessages(data.ticket.transcript);
        setText("");
      }
    } catch {
      // keep the draft so the admin can retry
    } finally {
      setSending(false);
    }
  };

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
            </div>
          </div>
        ))}
      </div>
      <form onSubmit={send} className="mt-2 space-y-2">
        <select
          aria-label={labels.pick}
          defaultValue=""
          onChange={(e) => {
            const tpl = templates.find((x) => x.id === e.target.value);
            if (tpl) setText(tpl.text);
            e.target.value = "";
          }}
          className="w-full rounded-lg border border-navy-200 bg-white px-2.5 py-2 text-xs text-navy-700 focus:border-brand-400 focus:outline-none"
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
        <div className="flex gap-2">
          <input
            name="message"
            value={text}
            onChange={(e) => setText(e.target.value)}
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
