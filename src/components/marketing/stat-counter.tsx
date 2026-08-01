"use client";

import { useEffect, useRef, useState } from "react";

/**
 * A number that counts up when it scrolls into view.
 *
 * The server renders the FINAL value — no JS, no observer, no reduced-motion
 * media query ever shows a wrong number; the animation is pure decoration on
 * top. The display string is parsed rather than restructured ("100%",
 * "1 price", "١ قیمت"): a leading integer animates, whatever follows it is
 * kept verbatim, and a string with no leading number simply stays still.
 */
export function StatCounter({ value, durationMs = 1400 }: { value: string; durationMs?: number }) {
  const match = value.match(/^(\d+)([\s\S]*)$/);
  const target = match ? Number(match[1]) : null;
  const rest = match ? match[2] : "";

  const ref = useRef<HTMLSpanElement>(null);
  const [shown, setShown] = useState<number | null>(target);

  useEffect(() => {
    if (target === null || !ref.current) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let raf = 0;
    const observer = new IntersectionObserver(
      (entries) => {
        if (!entries.some((e) => e.isIntersecting)) return;
        observer.disconnect();
        const start = performance.now();
        const tick = (now: number) => {
          const p = Math.min(1, (now - start) / durationMs);
          const eased = 1 - Math.pow(1 - p, 3);
          setShown(Math.round(target * eased));
          if (p < 1) raf = requestAnimationFrame(tick);
        };
        setShown(0);
        raf = requestAnimationFrame(tick);
      },
      { threshold: 0.4 }
    );
    observer.observe(ref.current);
    return () => {
      observer.disconnect();
      cancelAnimationFrame(raf);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (target === null) return <span>{value}</span>;
  return (
    <span ref={ref} className="tabular-nums" data-stat-counter data-stat-target={target}>
      {shown}
      {rest}
    </span>
  );
}
