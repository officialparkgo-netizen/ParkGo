"use client";

import { useEffect, useRef, useState } from "react";
import { Headset, Send, X } from "lucide-react";
import type { SupportMessage } from "@/types";
import { SUPPORT_TOPICS, matchSupportIntent } from "@/lib/support-intents";
import { submitSupportTicket } from "@/lib/support-actions";
import { useT } from "@/lib/i18n/client";

type Stage = "topics" | "feedback" | "escalate" | "sending" | "live";

interface ThreadState {
  ref: string;
  status: "open" | "resolved";
  assignedTo: string | null;
}

/**
 * Instant-support chat: a guided assistant answering from the translated FAQ
 * knowledge base, with escalation to a human agent (stored ticket + email to
 * the team) whenever it can't resolve the question. Mounted globally.
 */
export function SupportWidget() {
  const t = useT();
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<SupportMessage[]>([]);
  const [stage, setStage] = useState<Stage>("topics");
  const [lastTopic, setLastTopic] = useState<string>("other");
  const [input, setInput] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [sentRef, setSentRef] = useState<string | null>(null);
  const [thread, setThread] = useState<ThreadState | null>(null);
  const [seen, setSeen] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const push = (...msgs: SupportMessage[]) => setMessages((m) => [...m, ...msgs]);

  const applyThread = (data: {
    ticket?: {
      ref: string;
      status: "open" | "resolved";
      assignedTo: string | null;
      transcript: SupportMessage[];
    } | null;
  }) => {
    if (!data.ticket) return false;
    setThread({
      ref: data.ticket.ref,
      status: data.ticket.status,
      assignedTo: data.ticket.assignedTo,
    });
    setSentRef(data.ticket.ref);
    setMessages((prev) =>
      prev.length === data.ticket!.transcript.length ? prev : data.ticket!.transcript
    );
    return true;
  };

  useEffect(() => {
    if (!open || messages.length > 0) return;
    // Returning visitor with an escalated ticket? Resume the live thread.
    (async () => {
      try {
        const res = await fetch("/api/support/thread", { cache: "no-store" });
        if (res.ok && applyThread(await res.json())) {
          setStage("live");
          return;
        }
      } catch {
        // no thread — start the guided assistant
      }
      push({ role: "bot", text: t("support.greeting") });
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  // Live thread: short poll while the panel is open.
  useEffect(() => {
    if (!open || stage !== "live") return;
    const timer = setInterval(async () => {
      if (document.hidden) return;
      try {
        const res = await fetch("/api/support/thread", { cache: "no-store" });
        if (res.ok) applyThread(await res.json());
      } catch {
        // next tick retries
      }
    }, 4000);
    return () => clearInterval(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, stage]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight });
  }, [messages, stage, open]);

  function answerTopic(topicId: string) {
    const topic = SUPPORT_TOPICS.find((x) => x.id === topicId);
    if (!topic) return;
    setLastTopic(topic.id);
    push(
      { role: "user", text: t(topic.labelKey) },
      { role: "bot", text: t(topic.answerKey) },
      { role: "bot", text: t("support.didHelp") }
    );
    setStage("feedback");
  }

  async function sendLive(text: string) {
    push({ role: "user", text });
    try {
      const res = await fetch("/api/support/thread", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ text }),
      });
      if (res.ok) applyThread(await res.json());
    } catch {
      // the poll re-syncs on the next tick
    }
  }

  function sendFreeText() {
    const text = input.trim();
    if (!text) return;
    setInput("");
    if (stage === "live") {
      void sendLive(text);
      return;
    }
    const topic = matchSupportIntent(text);
    if (topic) {
      setLastTopic(topic.id);
      push(
        { role: "user", text },
        { role: "bot", text: t(topic.answerKey) },
        { role: "bot", text: t("support.didHelp") }
      );
      setStage("feedback");
    } else {
      push({ role: "user", text }, { role: "bot", text: t("support.unsure") });
      setStage("escalate");
    }
  }

  function onSolved() {
    push({ role: "user", text: t("support.yes") }, { role: "bot", text: t("support.great") });
    setStage("topics");
  }

  function onEscalate() {
    push({ role: "user", text: t("support.talkHuman") }, { role: "bot", text: t("support.escalateIntro") });
    setStage("escalate");
  }

  async function onSubmitTicket(e: React.FormEvent) {
    e.preventDefault();
    if (!email.includes("@")) return;
    setStage("sending");
    const result = await submitSupportTicket({
      name,
      email,
      topic: lastTopic,
      transcript: messages,
    });
    if (result.ok && result.ref) {
      setSentRef(result.ref);
      setThread({ ref: result.ref, status: "open", assignedTo: null });
      // From here the chat is live — sync the canonical transcript (it
      // already contains the confirmation line) and let the poll take over.
      setStage("live");
      try {
        const res = await fetch("/api/support/thread", { cache: "no-store" });
        if (res.ok) applyThread(await res.json());
      } catch {
        push({ role: "bot", text: `${t("support.sent")} ${result.ref}. ${t("support.sentNote")}` });
      }
    } else {
      push({ role: "bot", text: t("support.sendError") });
      setStage("escalate");
    }
  }

  return (
    <>
      {/* Launcher — icon circle on phones, labelled pill on desktop */}
      <button
        type="button"
        aria-label={t("support.open")}
        aria-expanded={open}
        onClick={() => {
          setSeen(true);
          setOpen((v) => !v);
        }}
        className={`fixed bottom-20 end-4 z-50 flex h-14 items-center justify-center rounded-full bg-brand-500 text-white shadow-card-lg transition-all duration-150 hover:bg-brand-600 hover:shadow-xl active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2 lg:bottom-6 lg:end-6 ${
          open ? "w-14" : "w-14 lg:w-auto lg:gap-2.5 lg:px-5"
        }`}
      >
        {open ? (
          <X className="h-6 w-6" aria-hidden />
        ) : (
          <>
            <span className="relative" aria-hidden>
              <Headset className="h-6 w-6" />
              <span className="absolute -end-1 -top-1 flex h-3 w-3">
                {!seen && (
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-white/70" />
                )}
                <span className="relative inline-flex h-3 w-3 rounded-full bg-white ring-2 ring-brand-500" />
              </span>
            </span>
            <span className="hidden whitespace-nowrap text-sm font-bold lg:block">
              {t("support.launcher")}
            </span>
          </>
        )}
      </button>

      {/* Panel */}
      {open && (
        <div
          role="dialog"
          aria-label={t("support.title")}
          className="fixed bottom-36 end-4 z-50 flex h-[min(30rem,calc(100dvh-11rem))] w-[min(23rem,calc(100vw-2rem))] flex-col overflow-hidden rounded-2xl border border-navy-100 bg-white shadow-card-lg lg:bottom-24 lg:end-6"
        >
          {/* Header */}
          <div className="bg-navy-950 px-4 py-3 text-white">
            <div className="flex items-center gap-2.5">
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-500">
                <Headset className="h-4.5 w-4.5" aria-hidden />
              </span>
              <div>
                <div className="text-sm font-bold">{t("support.title")}</div>
                <div className="flex items-center gap-1.5 text-[11px] text-white/70">
                  <span className="h-1.5 w-1.5 rounded-full bg-go-400" aria-hidden />
                  {t("support.subtitle")}
                </div>
              </div>
            </div>
          </div>

          {/* Messages */}
          <div ref={scrollRef} className="flex-1 space-y-2 overflow-y-auto bg-navy-50/50 p-3">
            {messages.map((m, i) => (
              <div
                key={i}
                className={`max-w-[85%] whitespace-pre-line rounded-2xl px-3 py-2 text-sm leading-relaxed ${
                  m.role === "agent"
                    ? "me-auto rounded-es-md border border-brand-300 bg-brand-50 text-navy-900"
                    : m.role === "bot"
                      ? "me-auto rounded-es-md border border-navy-100 bg-white text-navy-800"
                      : "ms-auto rounded-ee-md bg-brand-500 text-white"
                }`}
              >
                {m.role === "agent" && (
                  <div className="mb-0.5 text-[10px] font-bold uppercase tracking-wide text-brand-700">
                    {thread?.assignedTo || t("support.title")}
                  </div>
                )}
                {m.text}
              </div>
            ))}

            {stage === "live" && (
              <p className="px-1 pt-1 text-center text-[11px] text-navy-400" data-live-note>
                {t("support.live.note")}
              </p>
            )}

            {stage === "topics" && (
              <div className="flex flex-wrap gap-1.5 pt-1">
                {SUPPORT_TOPICS.map((topic) => (
                  <button
                    key={topic.id}
                    type="button"
                    onClick={() => answerTopic(topic.id)}
                    className="rounded-full border border-brand-300 bg-white px-3 py-1.5 text-xs font-semibold text-brand-700 transition-colors hover:bg-brand-50"
                  >
                    {t(topic.labelKey)}
                  </button>
                ))}
              </div>
            )}

            {stage === "feedback" && (
              <div className="flex flex-wrap gap-1.5 pt-1">
                <button
                  type="button"
                  onClick={onSolved}
                  className="rounded-full bg-go-500 px-3.5 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-go-600"
                >
                  {t("support.yes")}
                </button>
                <button
                  type="button"
                  onClick={onEscalate}
                  className="rounded-full border border-navy-300 bg-white px-3.5 py-1.5 text-xs font-semibold text-navy-700 transition-colors hover:bg-navy-50"
                >
                  {t("support.talkHuman")}
                </button>
              </div>
            )}

            {(stage === "escalate" || stage === "sending") && !sentRef && (
              <form onSubmit={onSubmitTicket} className="space-y-2 rounded-2xl border border-navy-100 bg-white p-3">
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder={t("support.name")}
                  className="h-10 w-full rounded-xl border border-navy-200 px-3 text-sm focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-100"
                />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={t("support.email")}
                  className="h-10 w-full rounded-xl border border-navy-200 px-3 text-sm focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-100"
                />
                <button
                  type="submit"
                  disabled={stage === "sending"}
                  className="inline-flex h-10 w-full items-center justify-center gap-2 rounded-xl bg-brand-500 text-sm font-semibold text-white transition-colors hover:bg-brand-600 disabled:opacity-60"
                >
                  {stage === "sending" ? t("support.sending") : t("support.submit")}
                </button>
              </form>
            )}
          </div>

          {/* Free-text input */}
          <div className="flex items-center gap-2 border-t border-navy-100 bg-white p-2.5">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") sendFreeText();
              }}
              placeholder={t("support.placeholder")}
              className="h-10 flex-1 rounded-xl border border-navy-200 px-3 text-sm focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-100"
            />
            <button
              type="button"
              aria-label={t("support.send")}
              onClick={sendFreeText}
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-navy-900 text-white transition-colors hover:bg-navy-800"
            >
              <Send className="h-4 w-4 rtl:-scale-x-100" aria-hidden />
            </button>
          </div>
        </div>
      )}
    </>
  );
}
