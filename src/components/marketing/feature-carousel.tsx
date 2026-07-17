"use client";

import { useEffect, useRef, useState } from "react";
import { Pause, Play } from "lucide-react";
import { Card } from "@/components/ui/card";
import { useT } from "@/lib/i18n/client";

export interface FeatureItem {
  /** Pre-rendered icon element (component functions can't cross the RSC boundary). */
  icon: React.ReactNode;
  iconClass: string;
  title: string;
  body: string;
}

const AUTO_ADVANCE_MS = 4000;

/**
 * Feature cards: a swipeable snap carousel on phones (dots, gentle
 * auto-advance) and the familiar grid from `sm` upwards.
 *
 * Motion rules: auto-advance runs only while the carousel is on screen, the
 * tab is visible and reduced motion is off — and it stops PERMANENTLY the
 * moment the user engages in any way (touch, wheel, pointer, focus, dot),
 * so it never fights a reader (WCAG 2.2.2). Programmatic scrolling moves by
 * the delta between the current and target cards, which keeps the snap
 * engine's own alignment and therefore works identically in LTR and RTL.
 */
export function FeatureCarousel({ items, label }: { items: FeatureItem[]; label: string }) {
  const t = useT();
  const wrapperRef = useRef<HTMLDivElement>(null);
  const scrollerRef = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);
  const [autoOff, setAutoOff] = useState(false);
  const activeRef = useRef(0);
  const stopped = useRef(false);
  const onScreen = useRef(false);

  function stopAuto() {
    stopped.current = true;
    setAutoOff(true);
  }

  function goTo(i: number) {
    const scroller = scrollerRef.current;
    if (!scroller) return;
    const cards = scroller.children;
    const current = cards[activeRef.current] as HTMLElement | undefined;
    const target = cards[i] as HTMLElement | undefined;
    if (!current || !target) return;
    const delta =
      target.getBoundingClientRect().left - current.getBoundingClientRect().left;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    scroller.scrollBy({ left: delta, behavior: reduced ? "auto" : "smooth" });
  }

  // Active dot follows whichever card is (mostly) visible in the scroller.
  useEffect(() => {
    const scroller = scrollerRef.current;
    if (!scroller) return;
    const cards = Array.from(scroller.children);
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            const i = cards.indexOf(e.target);
            if (i >= 0) {
              activeRef.current = i;
              setActive(i);
            }
          }
        }
      },
      { root: scroller, threshold: 0.6 }
    );
    cards.forEach((c) => io.observe(c));
    return () => io.disconnect();
  }, [items.length]);

  // Auto-advance until the user engages. The scroller is display:none from
  // `sm` up, so this is effectively mobile-only.
  useEffect(() => {
    const wrapper = wrapperRef.current;
    const scroller = scrollerRef.current;
    if (!wrapper || !scroller) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const vis = new IntersectionObserver(
      ([e]) => {
        onScreen.current = !!e?.isIntersecting;
      },
      { threshold: 0.4 }
    );
    vis.observe(scroller);

    const stop = () => {
      stopped.current = true;
      setAutoOff(true);
    };
    wrapper.addEventListener("touchstart", stop, { passive: true });
    wrapper.addEventListener("pointerdown", stop);
    wrapper.addEventListener("wheel", stop, { passive: true });
    wrapper.addEventListener("focusin", stop);

    // Stop for good if the user enables reduced motion mid-session.
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const onMotionChange = () => {
      if (mq.matches) stop();
    };
    mq.addEventListener?.("change", onMotionChange);

    const id = setInterval(() => {
      if (stopped.current || !onScreen.current || document.hidden) return;
      if (!scroller.offsetParent) return; // hidden by the desktop layout
      goTo((activeRef.current + 1) % items.length);
    }, AUTO_ADVANCE_MS);

    return () => {
      clearInterval(id);
      vis.disconnect();
      mq.removeEventListener?.("change", onMotionChange);
      wrapper.removeEventListener("touchstart", stop);
      wrapper.removeEventListener("pointerdown", stop);
      wrapper.removeEventListener("wheel", stop);
      wrapper.removeEventListener("focusin", stop);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [items.length]);

  return (
    <div className="mt-12">
      {/* Phones: swipeable snap carousel, bleeding to the screen edge */}
      <div
        ref={wrapperRef}
        role="region"
        aria-roledescription="carousel"
        aria-label={label}
        className="reveal-scroll sm:hidden"
      >
        <div
          ref={scrollerRef}
          className="no-scrollbar -mx-4 flex snap-x snap-mandatory gap-4 overflow-x-auto px-4 pb-1 scroll-px-4"
        >
          {items.map((f) => (
            <FeatureCard key={f.title} f={f} className="w-[86%] shrink-0 snap-start" />
          ))}
        </div>
        <div className="mt-4 flex items-center justify-center gap-1">
          {items.map((f, i) => (
            <button
              key={f.title}
              type="button"
              aria-label={`${label} · ${i + 1} / ${items.length}`}
              aria-current={active === i}
              onClick={() => {
                stopAuto();
                goTo(i);
              }}
              className="flex h-6 min-w-6 items-center justify-center"
            >
              <span
                className={`h-2 rounded-full transition-all duration-300 ${
                  active === i ? "w-6 bg-brand-500" : "w-2 bg-navy-200"
                }`}
              />
            </button>
          ))}
          {/* WCAG 2.2.2: a real pause/stop control for the auto-advance */}
          <button
            type="button"
            aria-label={autoOff ? t("home.carousel.play") : t("home.carousel.pause")}
            aria-pressed={autoOff}
            onPointerDown={(e) => e.stopPropagation()}
            onTouchStart={(e) => e.stopPropagation()}
            onFocus={(e) => e.stopPropagation()}
            onClick={() => {
              if (autoOff) {
                stopped.current = false;
                setAutoOff(false);
              } else {
                stopAuto();
              }
            }}
            className="ml-1 flex h-6 w-6 items-center justify-center rounded-full text-navy-400 transition-colors hover:bg-navy-100 hover:text-navy-600"
          >
            {autoOff ? <Play className="h-3 w-3" /> : <Pause className="h-3 w-3" />}
          </button>
        </div>
      </div>

      {/* sm and up: the original grid */}
      <div className="hidden gap-5 sm:grid sm:grid-cols-2 lg:grid-cols-4">
        {items.map((f) => (
          <FeatureCard key={f.title} f={f} className="card-hover" />
        ))}
      </div>
    </div>
  );
}

function FeatureCard({ f, className }: { f: FeatureItem; className?: string }) {
  return (
    <Card className={`p-6 ${className ?? ""}`}>
      <div
        className={`mb-4 inline-flex h-11 w-11 items-center justify-center rounded-xl ${f.iconClass}`}
      >
        {f.icon}
      </div>
      <h3 className="text-base font-bold text-navy-900">{f.title}</h3>
      <p className="mt-1.5 text-sm text-navy-600">{f.body}</p>
    </Card>
  );
}
