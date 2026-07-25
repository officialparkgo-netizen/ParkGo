"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface Labels {
  prev: string;
  next: string;
  hint: string;
  clear: string;
  blockedCount: string;
}

const navBtn =
  "flex h-8 w-8 items-center justify-center rounded-lg border border-navy-200 text-navy-500 transition-colors hover:bg-navy-50 hover:text-navy-900 disabled:opacity-40";

/**
 * Click-to-block day picker for the listing edit form. Selected days are
 * serialised into a hidden `blockedDates` input (JSON array of "YYYY-MM-DD");
 * the server treats the submitted set as authoritative. Past days can't be
 * toggled; browsing is limited to the next 12 months.
 */
export function BlockedDatesPicker({
  initial,
  locale,
  labels,
}: {
  initial: string[];
  locale: string;
  labels: Labels;
}) {
  const today = new Date();
  const [blocked, setBlocked] = useState<Set<string>>(new Set(initial));
  const [offset, setOffset] = useState(0); // months from current

  const y = today.getUTCFullYear();
  const m = today.getUTCMonth() + offset;
  const first = new Date(Date.UTC(y, m, 1));
  const daysInMonth = new Date(Date.UTC(y, m + 1, 0)).getUTCDate();
  const startPad = (first.getUTCDay() + 6) % 7; // Monday-first

  const iso = (day: number) => {
    const d = new Date(Date.UTC(y, m, day));
    return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, "0")}-${String(
      d.getUTCDate()
    ).padStart(2, "0")}`;
  };
  const todayIso = `${today.getUTCFullYear()}-${String(today.getUTCMonth() + 1).padStart(2, "0")}-${String(
    today.getUTCDate()
  ).padStart(2, "0")}`;

  const toggle = (day: number) => {
    const key = iso(day);
    if (key < todayIso) return;
    setBlocked((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  // 2024-01-01 was a Monday — stable base for localized weekday labels.
  const weekdays = Array.from({ length: 7 }, (_, i) =>
    new Date(Date.UTC(2024, 0, 1 + i)).toLocaleDateString(locale, {
      weekday: "short",
      timeZone: "UTC",
    })
  );
  const title = first.toLocaleDateString(locale, {
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  });

  return (
    <div data-blocked-picker>
      <input type="hidden" name="blockedDates" value={JSON.stringify([...blocked].sort())} />
      <div className="mb-2 flex items-center justify-between gap-2">
        <div className="font-bold capitalize text-navy-900">{title}</div>
        <div className="flex items-center gap-1">
          <button type="button" aria-label={labels.prev} disabled={offset <= 0} onClick={() => setOffset((o) => Math.max(0, o - 1))} className={navBtn}>
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button type="button" aria-label={labels.next} disabled={offset >= 11} onClick={() => setOffset((o) => Math.min(11, o + 1))} className={navBtn}>
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>
      <div className="grid grid-cols-7 gap-1 text-center">
        {weekdays.map((w, i) => (
          <div key={i} className="py-1 text-[11px] font-semibold uppercase tracking-wide text-navy-400">
            {w}
          </div>
        ))}
        {Array.from({ length: startPad }, (_, i) => (
          <div key={`b${i}`} />
        ))}
        {Array.from({ length: daysInMonth }, (_, i) => {
          const day = i + 1;
          const key = iso(day);
          const isPast = key < todayIso;
          const isBlocked = blocked.has(key);
          return (
            <button
              key={day}
              type="button"
              disabled={isPast}
              onClick={() => toggle(day)}
              aria-pressed={isBlocked}
              data-day={key}
              className={[
                "flex h-10 items-center justify-center rounded-lg text-sm transition-colors",
                isPast
                  ? "cursor-not-allowed text-navy-200"
                  : isBlocked
                    ? "bg-red-600 font-bold text-white line-through"
                    : "text-navy-700 hover:bg-navy-50",
              ].join(" ")}
            >
              {day}
            </button>
          );
        })}
      </div>
      <div className="mt-3 flex flex-wrap items-center justify-between gap-2 text-xs text-navy-500">
        <span data-blocked-count>
          {blocked.size} {labels.blockedCount}
        </span>
        {blocked.size > 0 && (
          <button
            type="button"
            onClick={() => setBlocked(new Set())}
            className="font-semibold text-red-600 hover:text-red-700"
          >
            {labels.clear}
          </button>
        )}
      </div>
      <p className="mt-1 text-xs text-navy-400">{labels.hint}</p>
    </div>
  );
}
