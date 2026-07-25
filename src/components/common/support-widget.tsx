"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { Headset, Paperclip, PhoneCall, Send, ThumbsDown, ThumbsUp, X } from "lucide-react";
import type { SupportMessage } from "@/types";
import { SUPPORT_TOPICS, matchSupportIntent } from "@/lib/support-intents";
import { answerBookingIntent, detectBookingIntent } from "@/lib/support-bot";
import { formatWait } from "@/lib/support-hours";
import { submitSupportTicket } from "@/lib/support-actions";
import { useT } from "@/lib/i18n/client";

type Stage = "topics" | "feedback" | "escalate" | "callback" | "sending" | "live";

interface ThreadState {
  ref: string;
  status: "open" | "resolved";
  assignedTo: string | null;
  typing: boolean;
  seenAt: string | null;
  csat: 1 | -1 | null;
}

interface Context {
  me: { name: string; email: string } | null;
  desk: { open: boolean; opensInMinutes: number; replyMinutes: number };
  whatsapp: string | null;
  booking: { id: string; ref: string; dates: string; area: string } | null;
}

interface TicketPayload {
  ref: string;
  status: "open" | "resolved";
  assignedTo: string | null;
  transcript: SupportMessage[];
  typing?: boolean;
  seenAt?: string | null;
  csat?: 1 | -1 | null;
}

/**
 * Instant-support chat: a guided assistant answering from the translated FAQ
 * knowledge base and from the visitor's own bookings when they're signed in,
 * with escalation to a human agent (stored ticket + email to the team)
 * whenever it can't resolve the question. Mounted globally.
 */
/** Pages where hesitation usually means a question, not a change of heart. */
const PROACTIVE_PATHS = [/^\/app\/book\//, /^\/checkout/];
const PROACTIVE_DELAY_MS = 60_000;
const PROACTIVE_FLAG = "parkgo_support_nudged";

export function SupportWidget() {
  const t = useT();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<SupportMessage[]>([]);
  const [stage, setStage] = useState<Stage>("topics");
  const [lastTopic, setLastTopic] = useState<string>("other");
  const [input, setInput] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [sentRef, setSentRef] = useState<string | null>(null);
  const [thread, setThread] = useState<ThreadState | null>(null);
  const [ctx, setCtx] = useState<Context | null>(null);
  const [uploadError, setUploadError] = useState(false);
  const [busy, setBusy] = useState(false);
  const [rated, setRated] = useState(false);
  const [csatComment, setCsatComment] = useState("");
  const [phone, setPhone] = useState("");
  const [rateLimited, setRateLimited] = useState(false);
  const [seen, setSeen] = useState(false);
  const [proactive, setProactive] = useState(false);
  /** Deep link offered under an account-aware answer ("Open booking"). */
  const [botLink, setBotLink] = useState<{ href: string; label: string } | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  /** Last typing ping — one every 3s is plenty for a 4s poll. */
  const typedAt = useRef(0);

  const push = (...msgs: SupportMessage[]) => setMessages((m) => [...m, ...msgs]);

  const applyThread = (data: { ticket?: TicketPayload | null }) => {
    if (!data.ticket) return false;
    const tk = data.ticket;
    setThread({
      ref: tk.ref,
      status: tk.status,
      assignedTo: tk.assignedTo,
      typing: !!tk.typing,
      seenAt: tk.seenAt ?? null,
      csat: tk.csat ?? null,
    });
    setSentRef(tk.ref);
    setMessages((prev) => (prev.length === tk.transcript.length ? prev : tk.transcript));
    return true;
  };

  useEffect(() => {
    if (!open || ctx) return;
    fetch("/api/support/context", { cache: "no-store" })
      .then((r) => (r.ok ? r.json() : null))
      .then((d: Context | null) => d && setCtx(d))
      .catch(() => {
        // hours banner and account answers are enhancements, not requirements
      });
  }, [open, ctx]);

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
  }, [messages, stage, open, thread?.typing]);

  /** Tell the agent someone is at the keyboard — throttled, fire-and-forget. */
  const pingTyping = useCallback(() => {
    if (stage !== "live" || Date.now() - typedAt.current < 3000) return;
    typedAt.current = Date.now();
    fetch("/api/support/thread", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ typing: true }),
    }).catch(() => {});
  }, [stage]);

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

  /**
   * "When is my booking?" is answered from the visitor's own account rather
   * than a generic FAQ line. Only signed-in visitors get here — the server
   * decides which booking they may be told about.
   */
  function answerFromAccount(text: string): boolean {
    const intent = detectBookingIntent(text);
    if (!intent || !ctx?.me) return false;
    const b = ctx.booking;
    const answer = answerBookingIntent(
      intent,
      b,
      {
        none: t("support.bot.none"),
        next: t("support.bot.next"),
        where: t("support.bot.where"),
        qr: t("support.bot.qr"),
        cancel: t("support.bot.cancel"),
        receipt: t("support.bot.receipt"),
        openBooking: t("support.bot.openBooking"),
      },
      { ref: b?.ref ?? "", dates: b?.dates ?? "", area: b?.area ?? "" }
    );
    setLastTopic(intent);
    push(
      { role: "user", text },
      { role: "bot", text: answer.text },
      { role: "bot", text: t("support.didHelp") }
    );
    setBotLink(
      answer.href && answer.linkLabel
        ? { href: answer.href, label: answer.linkLabel }
        : null
    );
    setStage("feedback");
    return true;
  }

  function sendFreeText() {
    const text = input.trim();
    if (!text) return;
    setInput("");
    if (stage === "live") {
      void sendLive(text);
      return;
    }
    setBotLink(null);
    if (answerFromAccount(text)) return;
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

  /** Photo of the blocked gate, a receipt, a boarding pass — straight in. */
  async function sendFile(file: File) {
    if (!file || stage !== "live") return;
    setUploadError(false);
    setBusy(true);
    const body = new FormData();
    body.append("file", file);
    try {
      const res = await fetch("/api/support/thread", { method: "POST", body });
      if (res.ok) applyThread(await res.json());
      else setUploadError(true);
    } catch {
      setUploadError(true);
    } finally {
      setBusy(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  }

  async function rate(score: 1 | -1) {
    setRated(true);
    try {
      await fetch("/api/support/thread", {
        method: "POST",
        headers: { "content-type": "application/json" },
        // A thumbs-down on its own says something went wrong but not what,
        // so the comment rides along with the score.
        body: JSON.stringify({ csat: score, csatComment: csatComment.trim() || undefined }),
      });
    } catch {
      // the rating is a nicety; never block the visitor on it
    }
  }

  function onSolved() {
    push({ role: "user", text: t("support.yes") }, { role: "bot", text: t("support.great") });
    setBotLink(null);
    setStage("topics");
  }

  function onEscalate() {
    push({ role: "user", text: t("support.talkHuman") }, { role: "bot", text: t("support.escalateIntro") });
    setBotLink(null);
    setStage("escalate");
  }

  async function startTicket(withName: string, withEmail: string, withPhone?: string) {
    setStage("sending");
    setRateLimited(false);
    const result = await submitSupportTicket({
      name: withName,
      email: withEmail,
      topic: withPhone ? "callback" : lastTopic,
      transcript: messages,
      ...(withPhone ? { phone: withPhone } : {}),
    });
    if (result.rateLimited) {
      setRateLimited(true);
      setStage("escalate");
      return;
    }
    if (result.ok && result.ref) {
      setSentRef(result.ref);
      setThread({
        ref: result.ref,
        status: "open",
        assignedTo: null,
        typing: false,
        seenAt: null,
        csat: null,
      });
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

  async function onSubmitTicket(e: React.FormEvent) {
    e.preventDefault();
    if (!email.includes("@")) return;
    await startTicket(name, email);
  }

  /**
   * Someone stranded at a barrier does not want to type. Take a number and a
   * one-line reason; the ticket lands tagged "callback" with the phone on it.
   */
  async function onRequestCallback(e: React.FormEvent) {
    e.preventDefault();
    const digits = phone.replace(/[^\d+]/g, "");
    if (digits.length < 7) return;
    const who = ctx?.me?.email || email;
    if (!who.includes("@")) return;
    await startTicket(ctx?.me?.name || name, who, digits);
  }

  // A signed-in customer should never be asked who they are — open the live
  // thread the moment the assistant gives up. Guarded so a re-render mid-await
  // can't file the same ticket twice.
  const autoFiled = useRef(false);
  useEffect(() => {
    if (stage !== "escalate" || sentRef || !ctx?.me || autoFiled.current) return;
    if (rateLimited) return;
    autoFiled.current = true;
    void startTicket(ctx.me.name, ctx.me.email);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stage, sentRef, ctx?.me, rateLimited]);

  /**
   * Sitting on the checkout for a minute usually means something is unclear.
   * Offer help once per session — a nudge that keeps reappearing is an advert,
   * not support, so the flag persists even after the panel is closed.
   */
  useEffect(() => {
    if (!pathname || open) return;
    if (!PROACTIVE_PATHS.some((re) => re.test(pathname))) return;
    try {
      if (sessionStorage.getItem(PROACTIVE_FLAG)) return;
    } catch {
      return; // no session storage (private mode) — don't risk nagging
    }
    const timer = setTimeout(() => {
      try {
        sessionStorage.setItem(PROACTIVE_FLAG, "1");
      } catch {
        /* best-effort */
      }
      setSeen(true);
      setOpen(true);
      setProactive(true);
    }, PROACTIVE_DELAY_MS);
    return () => clearTimeout(timer);
  }, [pathname, open]);

  const desk = ctx?.desk;
  const waMessage = thread?.ref ? `ParkGo ${thread.ref}` : "ParkGo";
  const waHref = ctx?.whatsapp
    ? `https://wa.me/${ctx.whatsapp.replace(/\D/g, "")}?text=${encodeURIComponent(waMessage)}`
    : null;
  const lastMine = [...messages].reverse().find((m) => m.role === "user");
  const showSeen =
    stage === "live" &&
    !!thread?.seenAt &&
    !!lastMine?.at &&
    +new Date(thread.seenAt) >= +new Date(lastMine.at);

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
        className={`fixed bottom-20 end-4 z-50 flex h-14 items-center justify-center rounded-full bg-brand-500 text-navy-900 shadow-card-lg transition-all duration-150 hover:bg-brand-400 hover:shadow-xl active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2 lg:bottom-6 lg:end-6 ${
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
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-navy-900/70" />
                )}
                <span className="relative inline-flex h-3 w-3 rounded-full bg-navy-900 ring-2 ring-brand-500" />
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
          className="fixed bottom-36 end-4 z-50 flex h-[min(32rem,calc(100dvh-11rem))] w-[min(23rem,calc(100vw-2rem))] flex-col overflow-hidden rounded-2xl border border-navy-100 bg-white shadow-card-lg lg:bottom-24 lg:end-6"
        >
          {/* Header */}
          <div className="bg-navy-950 px-4 py-3 text-white">
            <div className="flex items-center gap-2.5">
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-500">
                <Headset className="h-4.5 w-4.5" aria-hidden />
              </span>
              <div className="min-w-0">
                <div className="text-sm font-bold">{t("support.title")}</div>
                <div className="flex items-center gap-1.5 text-[11px] text-white/70">
                  <span
                    className={`h-1.5 w-1.5 rounded-full ${
                      desk && !desk.open ? "bg-navy-400" : "bg-go-400"
                    }`}
                    aria-hidden
                  />
                  <span className="truncate" data-desk-state>
                    {!desk
                      ? t("support.subtitle")
                      : desk.open
                        ? t("support.desk.open").replace("{mins}", String(desk.replyMinutes))
                        : t("support.desk.closed").replace(
                            "{wait}",
                            formatWait(desk.opensInMinutes)
                          )}
                  </span>
                </div>
              </div>
            </div>
            {ctx?.me && (
              <p className="mt-1.5 truncate text-[11px] text-white/50" data-identified>
                {t("support.identified").replace("{name}", ctx.me.name || ctx.me.email)}
              </p>
            )}
          </div>

          {/* Messages */}
          <div ref={scrollRef} className="flex-1 space-y-2 overflow-y-auto bg-navy-50/50 p-3">
            {proactive && stage !== "live" && (
              <p
                className="rounded-xl border border-brand-200 bg-brand-50 px-3 py-2 text-xs font-semibold text-brand-800"
                data-proactive
              >
                {t("support.proactive")}
              </p>
            )}

            {desk && !desk.open && stage !== "live" && (
              <p className="rounded-xl border border-navy-100 bg-white px-3 py-2 text-[11px] text-navy-500">
                {t("support.desk.closedNote")}
              </p>
            )}

            {messages.map((m, i) => (
              <div
                key={i}
                className={`max-w-[85%] whitespace-pre-line rounded-2xl px-3 py-2 text-sm leading-relaxed ${
                  m.role === "agent"
                    ? "me-auto rounded-es-md border border-brand-300 bg-brand-50 text-navy-900"
                    : m.role === "bot"
                      ? "me-auto rounded-es-md border border-navy-100 bg-white text-navy-800"
                      : "ms-auto rounded-ee-md bg-brand-500 text-navy-900"
                }`}
              >
                {m.role === "agent" && (
                  <div className="mb-0.5 text-[10px] font-bold uppercase tracking-wide text-brand-700">
                    {thread?.assignedTo || t("support.title")}
                  </div>
                )}
                {m.text}
                {m.attachment &&
                  (m.attachment.kind === "image" ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={m.attachment.url}
                      alt={m.attachment.name}
                      className="mt-1.5 max-h-40 w-full rounded-lg object-cover"
                    />
                  ) : (
                    <a
                      href={m.attachment.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-1.5 flex items-center gap-1.5 rounded-lg bg-white/15 px-2 py-1 text-xs font-semibold underline"
                    >
                      <Paperclip className="h-3 w-3" aria-hidden /> {m.attachment.name}
                    </a>
                  ))}
              </div>
            ))}

            {/* The account-aware answers offer a deep link to the booking. */}
            {botLink && (
              <a
                href={botLink.href}
                className="inline-flex rounded-full bg-navy-900 px-3.5 py-1.5 text-xs font-semibold text-white hover:bg-navy-700"
              >
                {botLink.label}
              </a>
            )}

            {thread?.typing && (
              <p className="px-1 text-[11px] italic text-navy-400" data-agent-typing>
                {thread.assignedTo || t("support.title")} {t("support.typing")}
              </p>
            )}

            {showSeen && (
              <p className="px-1 text-end text-[10px] text-navy-400" data-seen>
                ✓✓ {t("support.seen")}
              </p>
            )}

            {stage === "live" && thread?.status === "open" && (
              <p className="px-1 pt-1 text-center text-[11px] text-navy-400" data-live-note>
                {t("support.live.note")}
              </p>
            )}

            {/* Rate the conversation once the team has closed it. */}
            {stage === "live" && thread?.status === "resolved" && (
              <div
                className="space-y-2 rounded-2xl border border-navy-100 bg-white p-3 text-center"
                data-csat
              >
                <p className="text-xs font-semibold text-navy-700">
                  {rated || thread.csat ? t("support.csat.thanks") : t("support.csat.ask")}
                </p>
                {!rated && !thread.csat && (
                  <>
                    <input
                      type="text"
                      value={csatComment}
                      onChange={(e) => setCsatComment(e.target.value)}
                      maxLength={500}
                      placeholder={t("support.csat.commentPh")}
                      aria-label={t("support.csat.commentPh")}
                      className="h-9 w-full rounded-xl border border-navy-200 px-3 text-xs focus:border-brand-400 focus:outline-none"
                    />
                    <div className="flex justify-center gap-2">
                      <button
                        type="button"
                        onClick={() => rate(1)}
                        className="inline-flex items-center gap-1.5 rounded-full bg-go-500 px-3.5 py-1.5 text-xs font-semibold text-navy-900 hover:bg-go-400"
                      >
                        <ThumbsUp className="h-3.5 w-3.5" aria-hidden /> {t("support.csat.good")}
                      </button>
                      <button
                        type="button"
                        onClick={() => rate(-1)}
                        className="inline-flex items-center gap-1.5 rounded-full border border-navy-300 bg-white px-3.5 py-1.5 text-xs font-semibold text-navy-700 hover:bg-navy-50"
                      >
                        <ThumbsDown className="h-3.5 w-3.5" aria-hidden /> {t("support.csat.bad")}
                      </button>
                    </div>
                  </>
                )}
              </div>
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
                  className="rounded-full bg-go-500 px-3.5 py-1.5 text-xs font-semibold text-navy-900 transition-colors hover:bg-go-400"
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

            {(stage === "escalate" || (stage === "sending" && !phone)) && !sentRef && !ctx?.me && (
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
                  className="inline-flex h-10 w-full items-center justify-center gap-2 rounded-xl bg-brand-500 text-sm font-semibold text-navy-900 transition-colors hover:bg-brand-400 disabled:opacity-60"
                >
                  {stage === "sending" ? t("support.sending") : t("support.submit")}
                </button>
              </form>
            )}

            {rateLimited && (
              <p
                className="rounded-xl border border-accent-200 bg-accent-50 px-3 py-2 text-[11px] font-semibold text-accent-700"
                data-rate-limited
              >
                {t("support.tooMany")}
              </p>
            )}

            {/* Stranded at a barrier? Leave a number instead of typing. */}
            {(stage === "escalate" || stage === "feedback") && !sentRef && (
              <button
                type="button"
                onClick={() => setStage("callback")}
                data-callback-open
                className="inline-flex items-center gap-1.5 rounded-full border border-navy-300 bg-white px-3.5 py-1.5 text-xs font-semibold text-navy-700 hover:bg-navy-50"
              >
                <PhoneCall className="h-3.5 w-3.5" aria-hidden /> {t("support.callback.ask")}
              </button>
            )}

            {stage === "callback" && !sentRef && (
              <form
                onSubmit={onRequestCallback}
                data-callback-form
                className="space-y-2 rounded-2xl border border-navy-100 bg-white p-3"
              >
                <p className="text-xs text-navy-600">{t("support.callback.intro")}</p>
                {!ctx?.me && (
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder={t("support.email")}
                    className="h-10 w-full rounded-xl border border-navy-200 px-3 text-sm focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-100"
                  />
                )}
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder={t("support.callback.phone")}
                  className="h-10 w-full rounded-xl border border-navy-200 px-3 text-sm focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-100"
                />
                <button
                  type="submit"
                  className="inline-flex h-10 w-full items-center justify-center gap-2 rounded-xl bg-navy-900 text-sm font-semibold text-white hover:bg-navy-700"
                >
                  <PhoneCall className="h-4 w-4" aria-hidden /> {t("support.callback.submit")}
                </button>
              </form>
            )}

            {uploadError && (
              <p className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-[11px] font-semibold text-red-700">
                {t("support.attachError")}
              </p>
            )}
          </div>

          {/* WhatsApp fallback — for people who'd rather not sit in a browser */}
          {waHref && (
            <a
              href={waHref}
              target="_blank"
              rel="noopener noreferrer"
              data-whatsapp
              className="border-t border-navy-100 bg-go-50 px-3 py-2 text-center text-xs font-semibold text-go-700 hover:bg-go-100"
            >
              {t("support.whatsapp")}
            </a>
          )}

          {/* Free-text input */}
          <div className="flex items-center gap-2 border-t border-navy-100 bg-white p-2.5">
            {stage === "live" && (
              <>
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
                  aria-label={t("support.attach")}
                  title={t("support.attach")}
                  disabled={busy}
                  onClick={() => fileRef.current?.click()}
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-navy-200 text-navy-500 transition-colors hover:bg-navy-50 disabled:opacity-50"
                >
                  <Paperclip className="h-4 w-4" aria-hidden />
                </button>
              </>
            )}
            <input
              type="text"
              value={input}
              onChange={(e) => {
                setInput(e.target.value);
                pingTyping();
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter") sendFreeText();
              }}
              placeholder={t("support.placeholder")}
              className="h-10 min-w-0 flex-1 rounded-xl border border-navy-200 px-3 text-sm focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-100"
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
