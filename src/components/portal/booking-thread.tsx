"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Languages, MessageCircle, Send } from "lucide-react";
import type { BookingMessage } from "@/types";
import { Card } from "@/components/ui/card";
import { formatDateTime } from "@/lib/utils";

const POLL_MS = 4000;

/**
 * Traveller ↔ host chat on a booking. Fully client-side against
 * /api/booking/[id]/messages: sending never reloads the page, and the other
 * side's messages arrive on a short poll — no manual refresh.
 */
export function BookingThread({
  bookingId,
  viewer,
  initial,
  labels,
}: {
  bookingId: string;
  viewer: "host" | "traveller";
  initial: BookingMessage[];
  labels: {
    title: string;
    empty: string;
    placeholder: string;
    send: string;
    you: string;
    other: string;
    error: string;
    /** "Original" — under a translated incoming message. */
    original: string;
    /** "Sent as" — under your own message, showing the other side's rendering. */
    sentAs: string;
  };
}) {
  const [messages, setMessages] = useState<BookingMessage[]>(initial);
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);
  const [failed, setFailed] = useState(false);
  const listRef = useRef<HTMLDivElement>(null);
  const lastIdRef = useRef<string | null>(initial[initial.length - 1]?.id ?? null);

  // Keep the (scrollable) list pinned to the newest message — never the page.
  const scrollToEnd = useCallback(() => {
    const el = listRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, []);
  useEffect(scrollToEnd, [messages.length, scrollToEnd]);

  const applyServerMessages = useCallback((incoming: BookingMessage[]) => {
    // Only re-render when something actually arrived (or the tail changed).
    const latest = incoming[incoming.length - 1]?.id ?? null;
    if (latest !== lastIdRef.current) {
      lastIdRef.current = latest;
      setMessages(incoming);
    }
  }, []);

  // Short poll for the other side's messages; naps while the tab is hidden.
  useEffect(() => {
    let stopped = false;
    const tick = async () => {
      if (stopped || document.hidden) return;
      try {
        const res = await fetch(`/api/booking/${bookingId}/messages`, {
          cache: "no-store",
        });
        if (!res.ok) return;
        const data = (await res.json()) as { messages?: BookingMessage[] };
        if (!stopped && Array.isArray(data.messages)) applyServerMessages(data.messages);
      } catch {
        // transient network blips are fine — next tick retries
      }
    };
    const timer = setInterval(tick, POLL_MS);
    return () => {
      stopped = true;
      clearInterval(timer);
    };
  }, [bookingId, applyServerMessages]);

  const send = async (e: React.FormEvent) => {
    e.preventDefault();
    const body = text.trim();
    if (!body || sending) return;
    setSending(true);
    setFailed(false);
    try {
      const res = await fetch(`/api/booking/${bookingId}/messages`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ text: body }),
      });
      if (!res.ok) throw new Error("send failed");
      const data = (await res.json()) as { message?: BookingMessage };
      if (data.message) {
        const msg = data.message;
        setMessages((prev) =>
          prev.some((m) => m.id === msg.id) ? prev : [...prev, msg]
        );
        lastIdRef.current = msg.id;
      }
      setText("");
    } catch {
      setFailed(true);
    } finally {
      setSending(false);
    }
  };

  return (
    <Card className="p-5" data-booking-thread>
      <h3 className="flex items-center gap-2 text-sm font-bold text-navy-900">
        <MessageCircle className="h-4 w-4 text-navy-500" /> {labels.title}
      </h3>
      <div ref={listRef} className="mt-3 max-h-64 space-y-2 overflow-y-auto">
        {messages.length === 0 && (
          <p className="py-3 text-center text-sm text-navy-400">{labels.empty}</p>
        )}
        {messages.map((m) => {
          const mine = m.from === viewer;
          return (
            <div key={m.id} className={`flex ${mine ? "justify-end" : "justify-start"}`}>
              <div
                className={`max-w-[85%] rounded-2xl px-3.5 py-2 text-sm ${
                  mine
                    ? "rounded-br-md bg-brand-500 text-white"
                    : "rounded-bl-md bg-navy-50 text-navy-800"
                }`}
              >
                {/* The reader's language leads; what was actually typed stays
                    underneath. My own bubble is the mirror image: my words,
                    then what the other side was shown. */}
                <p className="whitespace-pre-line" dir="auto">
                  {mine ? m.text : (m.translated ?? m.text)}
                </p>
                {m.translated && (
                  <p
                    className={`mt-1 flex items-start gap-1 border-t pt-1 text-[11px] ${
                      mine
                        ? "border-white/30 text-white/80"
                        : "border-navy-200/70 text-navy-500"
                    }`}
                    data-msg-translated
                  >
                    <Languages className="mt-0.5 h-3 w-3 shrink-0" aria-hidden />
                    <span dir="auto">
                      <span className="sr-only">
                        {mine ? labels.sentAs : labels.original}:{" "}
                      </span>
                      {mine ? m.translated : m.text}
                    </span>
                  </p>
                )}
                <p
                  className={`mt-0.5 text-[10px] ${
                    mine ? "text-white/70" : "text-navy-400"
                  }`}
                >
                  {mine ? labels.you : labels.other} · {formatDateTime(m.at)}
                </p>
              </div>
            </div>
          );
        })}
      </div>
      {failed && <p className="mt-2 text-xs font-semibold text-red-600">{labels.error}</p>}
      <form onSubmit={send} className="mt-3 flex gap-2">
        <input
          name="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          maxLength={1000}
          placeholder={labels.placeholder}
          className="min-w-0 flex-1 rounded-xl border border-navy-200 bg-white px-3.5 py-2.5 text-sm text-navy-900 placeholder:text-navy-400 focus:border-brand-400 focus:outline-none"
        />
        <button
          type="submit"
          disabled={sending || !text.trim()}
          className="inline-flex items-center gap-1.5 rounded-xl bg-navy-900 px-4 py-2.5 text-sm font-semibold text-white transition-opacity hover:bg-navy-700 disabled:opacity-50"
        >
          <Send className="h-4 w-4" /> {labels.send}
        </button>
      </form>
    </Card>
  );
}
