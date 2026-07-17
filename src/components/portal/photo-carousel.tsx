"use client";

import { useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Photo } from "@/components/common/photo";

/**
 * Listing photo gallery as a carousel: swipe + counter on phones, arrow
 * buttons from `sm` up. Works for uploaded photos and scene tokens alike
 * (each slide is a <Photo/>). Navigation scrolls by the delta between the
 * current and target slides, so RTL behaves identically; smooth scrolling
 * defers to prefers-reduced-motion at call time. No autoplay — listing
 * photos move only when the traveller asks.
 */
export function PhotoCarousel({
  tokens,
  label,
  prevLabel,
  nextLabel,
  className,
}: {
  tokens: string[];
  label: string;
  prevLabel: string;
  nextLabel: string;
  className?: string;
}) {
  const scrollerRef = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);
  const activeRef = useRef(0);
  const count = tokens.length;

  function goTo(i: number) {
    const scroller = scrollerRef.current;
    if (!scroller) return;
    const slides = scroller.children;
    const current = slides[activeRef.current] as HTMLElement | undefined;
    const target = slides[i] as HTMLElement | undefined;
    if (!current || !target) return;
    const delta =
      target.getBoundingClientRect().left - current.getBoundingClientRect().left;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    scroller.scrollBy({ left: delta, behavior: reduced ? "auto" : "smooth" });
  }

  useEffect(() => {
    const scroller = scrollerRef.current;
    if (!scroller) return;
    const slides = Array.from(scroller.children);
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            const i = slides.indexOf(e.target);
            if (i >= 0) {
              activeRef.current = i;
              setActive(i);
            }
          }
        }
      },
      { root: scroller, threshold: 0.6 }
    );
    slides.forEach((s) => io.observe(s));
    return () => io.disconnect();
  }, [count]);

  if (count <= 1) {
    return <Photo token={tokens[0] ?? "drive-1"} className={className ?? "h-64 sm:h-96"} />;
  }

  return (
    <div
      role="group"
      aria-roledescription="carousel"
      aria-label={label}
      className={`relative overflow-hidden rounded-2xl ${className ?? ""}`}
    >
      <div
        ref={scrollerRef}
        className="no-scrollbar flex snap-x snap-mandatory gap-2 overflow-x-auto"
      >
        {tokens.map((token, i) => (
          <div key={`${token}-${i}`} className="w-full shrink-0 snap-center">
            <Photo token={token} rounded="rounded-2xl" className="h-64 sm:h-96" />
          </div>
        ))}
      </div>

      {/* Arrows (desktop) */}
      <button
        type="button"
        aria-label={prevLabel}
        disabled={active === 0}
        onClick={() => goTo(Math.max(0, activeRef.current - 1))}
        className="absolute start-3 top-1/2 hidden h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-navy-700 shadow-card transition-all hover:bg-white disabled:opacity-0 sm:flex"
      >
        <ChevronLeft className="h-5 w-5 rtl:-scale-x-100" aria-hidden />
      </button>
      <button
        type="button"
        aria-label={nextLabel}
        disabled={active === count - 1}
        onClick={() => goTo(Math.min(count - 1, activeRef.current + 1))}
        className="absolute end-3 top-1/2 hidden h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-navy-700 shadow-card transition-all hover:bg-white disabled:opacity-0 sm:flex"
      >
        <ChevronRight className="h-5 w-5 rtl:-scale-x-100" aria-hidden />
      </button>

      {/* Counter */}
      <span
        aria-live="polite"
        className="absolute bottom-3 end-3 rounded-full bg-navy-900/70 px-2.5 py-1 text-xs font-semibold text-white"
      >
        {active + 1} / {count}
      </span>

      {/* Dots */}
      <div className="absolute bottom-3 start-1/2 flex -translate-x-1/2 gap-1.5 rtl:translate-x-1/2">
        {tokens.map((token, i) => (
          <button
            key={`${token}-dot-${i}`}
            type="button"
            aria-label={`${label} · ${i + 1} / ${count}`}
            aria-current={active === i}
            onClick={() => goTo(i)}
            className="flex h-6 w-4 items-center justify-center"
          >
            <span
              className={`h-1.5 rounded-full transition-all duration-300 ${
                active === i ? "w-4 bg-white" : "w-1.5 bg-white/60"
              }`}
            />
          </button>
        ))}
      </div>
    </div>
  );
}
