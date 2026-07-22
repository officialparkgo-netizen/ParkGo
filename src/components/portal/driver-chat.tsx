"use client";

import { useEffect, useRef, useState } from "react";
import { MessageCircle, Send } from "lucide-react";
import type { TransferMessage } from "@/types";
import {
  listDriverMessagesAction,
  sendDriverMessageAction,
} from "@/lib/chat-actions";
import { useT } from "@/lib/i18n/client";

/**
 * Traveller ↔ driver chat for a booking with a transfer. Polls for new
 * messages every few seconds (driver replies arrive through the operator
 * relay). Kept deliberately small: thread + input, no read receipts.
 */
export function DriverChat({ bookingId }: { bookingId: string }) {
  const t = useT();
  const [messages, setMessages] = useState<TransferMessage[]>([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let active = true;
    const load = () =>
      listDriverMessagesAction(bookingId).then((m) => {
        if (active) setMessages(m);
      });
    load();
    const timer = setInterval(load, 4000);
    return () => {
      active = false;
      clearInterval(timer);
    };
  }, [bookingId]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight });
  }, [messages.length]);

  async function send() {
    const text = input.trim();
    if (!text || sending) return;
    setSending(true);
    setInput("");
    const thread = await sendDriverMessageAction(bookingId, text);
    setMessages(thread);
    setSending(false);
  }

  return (
    <div className="rounded-2xl border border-navy-100 bg-white shadow-card">
      <div className="flex items-center gap-2 border-b border-navy-100 px-4 py-3">
        <MessageCircle className="h-4 w-4 text-brand-600" aria-hidden />
        <span className="text-sm font-bold text-navy-900">{t("app.chat.title")}</span>
      </div>

      <div ref={scrollRef} className="max-h-56 space-y-2 overflow-y-auto bg-navy-50/40 p-3">
        {messages.length === 0 && (
          <p className="py-4 text-center text-xs text-navy-400">{t("app.chat.empty")}</p>
        )}
        {messages.map((m) => (
          <div
            key={m.id}
            className={`max-w-[85%] whitespace-pre-line rounded-2xl px-3 py-2 text-sm leading-relaxed ${
              m.from === "driver"
                ? "me-auto rounded-es-md border border-navy-100 bg-white text-navy-800"
                : "ms-auto rounded-ee-md bg-brand-500 text-white"
            }`}
          >
            {m.text}
          </div>
        ))}
      </div>

      <div className="flex items-center gap-2 border-t border-navy-100 p-2.5">
        <input
          type="text"
          value={input}
          maxLength={500}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") send();
          }}
          placeholder={t("app.chat.placeholder")}
          className="h-10 flex-1 rounded-xl border border-navy-200 px-3 text-sm focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-100"
        />
        <button
          type="button"
          aria-label={t("app.chat.send")}
          onClick={send}
          disabled={sending}
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-navy-900 text-white transition-colors hover:bg-navy-800 disabled:opacity-50"
        >
          <Send className="h-4 w-4 rtl:-scale-x-100" aria-hidden />
        </button>
      </div>
      <p className="px-4 pb-3 text-[11px] text-navy-400">{t("app.chat.note")}</p>
    </div>
  );
}
