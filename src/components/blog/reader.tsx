"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { Check, Copy, Linkedin, Mail, MessageCircle, ThumbsUp, Twitter } from "lucide-react";
import { subscribeToBlogAction, type SubscribeState } from "@/lib/blog-actions";

/**
 * The reader-side interactive bits of a blog post. Kept in one small client
 * file so the article itself stays a server-rendered page.
 */

// -----------------------------------------------------------------------------
// Reading progress — the thin bar along the top that fills as you scroll
// -----------------------------------------------------------------------------

export function ReadingProgress() {
  const [pct, setPct] = useState(0);
  useEffect(() => {
    const onScroll = () => {
      const el = document.documentElement;
      const total = el.scrollHeight - el.clientHeight;
      setPct(total > 0 ? Math.min(100, (el.scrollTop / total) * 100) : 0);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  return (
    <div className="fixed inset-x-0 top-0 z-50 h-1 bg-transparent" aria-hidden data-read-progress>
      <div
        className="h-full bg-brand-600 transition-[width] duration-150"
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}

// -----------------------------------------------------------------------------
// View ping — one count per browser session, not per prefetch
// -----------------------------------------------------------------------------

/**
 * Counting views in the server component would count every prefetch a hover
 * triggers. A client ping only fires when a person actually rendered the page,
 * and sessionStorage keeps back-and-forth navigation from double counting.
 */
export function ViewPing({ slug }: { slug: string }) {
  useEffect(() => {
    const key = `parkgo-viewed-${slug}`;
    try {
      if (sessionStorage.getItem(key)) return;
      sessionStorage.setItem(key, "1");
    } catch {
      // storage blocked → count anyway; better a rare double than none
    }
    void fetch("/api/blog/react", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ slug, kind: "view" }),
    }).catch(() => {});
  }, [slug]);
  return null;
}

// -----------------------------------------------------------------------------
// "Was this helpful?"
// -----------------------------------------------------------------------------

export function HelpfulButton({
  slug,
  initial,
  labels,
}: {
  slug: string;
  initial: number;
  labels: { ask: string; button: string; thanks: string };
}) {
  const [count, setCount] = useState(initial);
  const [voted, setVoted] = useState(false);

  useEffect(() => {
    try {
      if (localStorage.getItem(`parkgo-helpful-${slug}`)) setVoted(true);
    } catch {
      // storage blocked → the button simply stays votable
    }
  }, [slug]);

  async function vote() {
    if (voted) return;
    setVoted(true);
    setCount((c) => c + 1);
    try {
      localStorage.setItem(`parkgo-helpful-${slug}`, "1");
    } catch {
      // remembering the vote is a nicety, not a requirement
    }
    try {
      const res = await fetch("/api/blog/react", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slug, kind: "helpful" }),
      });
      const data = (await res.json()) as { helpful?: number };
      if (typeof data.helpful === "number") setCount(data.helpful);
    } catch {
      // the optimistic +1 stands
    }
  }

  return (
    <div className="flex flex-wrap items-center gap-3" data-helpful>
      <span className="text-sm font-semibold text-navy-700">
        {voted ? labels.thanks : labels.ask}
      </span>
      <button
        type="button"
        onClick={vote}
        disabled={voted}
        className={`inline-flex items-center gap-1.5 rounded-xl border px-3.5 py-2 text-sm font-semibold transition ${
          voted
            ? "border-go-200 bg-go-50 text-go-700"
            : "border-navy-200 bg-white text-navy-700 hover:border-brand-400 hover:text-brand-700"
        }`}
        data-helpful-btn
      >
        <ThumbsUp className="h-4 w-4" /> {labels.button}
        <span className="rounded-full bg-navy-100 px-1.5 text-xs text-navy-700" data-helpful-count>
          {count}
        </span>
      </button>
    </div>
  );
}

// -----------------------------------------------------------------------------
// Share row — WhatsApp, X, LinkedIn, email, copy
// -----------------------------------------------------------------------------

export function ShareRow({
  url,
  title,
  labels,
}: {
  url: string;
  title: string;
  labels: { share: string; copy: string; copied: string };
}) {
  const [copied, setCopied] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => () => {
    if (timer.current) clearTimeout(timer.current);
  }, []);

  const encodedUrl = encodeURIComponent(url);
  const encodedTitle = encodeURIComponent(title);
  const links = [
    {
      name: "WhatsApp",
      icon: MessageCircle,
      href: `https://wa.me/?text=${encodedTitle}%20${encodedUrl}`,
    },
    {
      name: "X",
      icon: Twitter,
      href: `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}`,
    },
    {
      name: "LinkedIn",
      icon: Linkedin,
      href: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`,
    },
    {
      name: "Email",
      icon: Mail,
      href: `mailto:?subject=${encodedTitle}&body=${encodedUrl}`,
    },
  ];

  async function copy() {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      if (timer.current) clearTimeout(timer.current);
      timer.current = setTimeout(() => setCopied(false), 2000);
    } catch {
      // clipboard blocked — the visible URL in the address bar still exists
    }
  }

  return (
    <div className="flex flex-wrap items-center gap-2" data-share>
      <span className="text-sm font-semibold text-navy-700">{labels.share}</span>
      {links.map((l) => (
        <a
          key={l.name}
          href={l.href}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={l.name}
          title={l.name}
          className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-navy-200 bg-white text-navy-600 transition hover:border-brand-400 hover:text-brand-700"
        >
          <l.icon className="h-4 w-4" />
        </a>
      ))}
      <button
        type="button"
        onClick={copy}
        className="inline-flex items-center gap-1.5 rounded-xl border border-navy-200 bg-white px-3 py-2 text-sm font-semibold text-navy-600 transition hover:border-brand-400 hover:text-brand-700"
        data-share-copy
      >
        {copied ? <Check className="h-4 w-4 text-go-600" /> : <Copy className="h-4 w-4" />}
        {copied ? labels.copied : labels.copy}
      </button>
    </div>
  );
}

// -----------------------------------------------------------------------------
// Newsletter signup
// -----------------------------------------------------------------------------

export function SubscribeForm({
  labels,
}: {
  labels: { title: string; sub: string; placeholder: string; button: string; ok: string; error: string };
}) {
  const [state, action, pending] = useActionState<SubscribeState, FormData>(
    subscribeToBlogAction,
    {}
  );

  return (
    <div className="rounded-2xl bg-navy-800 p-6 sm:p-8" data-subscribe>
      <h2 className="text-xl font-bold tracking-tight text-white">{labels.title}</h2>
      <p className="mt-1.5 text-sm text-navy-200">{labels.sub}</p>
      {state.ok ? (
        <p className="mt-4 rounded-xl bg-go-50 px-4 py-3 text-sm font-semibold text-go-700" data-subscribed>
          {labels.ok}
        </p>
      ) : (
        <form action={action} className="mt-4 flex flex-wrap gap-2">
          <input
            type="email"
            name="email"
            required
            placeholder={labels.placeholder}
            aria-label={labels.placeholder}
            className="h-11 min-w-56 flex-1 rounded-xl border border-navy-600 bg-navy-900/60 px-4 text-sm text-white placeholder:text-navy-400 focus:border-brand-400 focus:outline-none"
          />
          <button
            type="submit"
            disabled={pending}
            className="inline-flex h-11 items-center gap-1.5 rounded-xl bg-brand-600 px-5 text-sm font-bold text-white transition hover:bg-brand-700 disabled:opacity-60"
            data-subscribe-btn
          >
            <Mail className="h-4 w-4" /> {labels.button}
          </button>
          {state.error && (
            <p className="w-full text-sm font-semibold text-red-300">{labels.error}</p>
          )}
        </form>
      )}
    </div>
  );
}
