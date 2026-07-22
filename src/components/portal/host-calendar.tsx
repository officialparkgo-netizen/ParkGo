import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface CalBooking {
  startAt: string;
  endAt: string;
  status: string;
}

const navBtn =
  "flex h-8 w-8 items-center justify-center rounded-lg border border-navy-200 text-navy-500 transition-colors hover:bg-navy-50 hover:text-navy-900";

/**
 * Month occupancy calendar for the host dashboard. Server-rendered: the
 * prev/next arrows are plain links (`?cal=YYYY-MM#calendar`), so no client
 * JS is needed. Days are compared in UTC to match the booking timestamps.
 */
export function HostCalendar({
  bookings,
  month,
  localeTag,
  labels,
}: {
  bookings: CalBooking[];
  month: string; // "YYYY-MM", validated by the caller
  localeTag: string;
  labels: { prev: string; next: string; legend: string };
}) {
  const [y, m] = month.split("-").map(Number);
  const first = new Date(Date.UTC(y, m - 1, 1));
  const daysInMonth = new Date(Date.UTC(y, m, 0)).getUTCDate();
  const offset = (first.getUTCDay() + 6) % 7; // Monday-first grid

  const fmtMonth = (d: Date) =>
    `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, "0")}`;
  const prevMonth = fmtMonth(new Date(Date.UTC(y, m - 2, 1)));
  const nextMonth = fmtMonth(new Date(Date.UTC(y, m, 1)));

  const active = bookings.filter((b) => b.status !== "cancelled");
  const carsOn = (day: number) => {
    const dayStart = Date.UTC(y, m - 1, day);
    const dayEnd = Date.UTC(y, m - 1, day + 1);
    return active.filter(
      (b) => +new Date(b.startAt) < dayEnd && +new Date(b.endAt) > dayStart
    ).length;
  };

  const now = new Date();
  const isToday = (day: number) =>
    now.getUTCFullYear() === y && now.getUTCMonth() === m - 1 && now.getUTCDate() === day;

  // 2024-01-01 was a Monday — a stable base for localized weekday labels.
  const weekdays = Array.from({ length: 7 }, (_, i) =>
    new Date(Date.UTC(2024, 0, 1 + i)).toLocaleDateString(localeTag, {
      weekday: "short",
      timeZone: "UTC",
    })
  );
  const title = first.toLocaleDateString(localeTag, {
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  });

  return (
    <div>
      <div className="mb-3 flex items-center justify-between gap-2">
        <div className="font-bold capitalize text-navy-900">{title}</div>
        <div className="flex items-center gap-1">
          <Link href={`/host?cal=${prevMonth}#calendar`} aria-label={labels.prev} className={navBtn}>
            <ChevronLeft className="h-4 w-4" />
          </Link>
          <Link href={`/host?cal=${nextMonth}#calendar`} aria-label={labels.next} className={navBtn}>
            <ChevronRight className="h-4 w-4" />
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-1 text-center">
        {weekdays.map((w, i) => (
          <div
            key={i}
            className="py-1 text-[11px] font-semibold uppercase tracking-wide text-navy-400"
          >
            {w}
          </div>
        ))}
        {Array.from({ length: offset }, (_, i) => (
          <div key={`blank-${i}`} />
        ))}
        {Array.from({ length: daysInMonth }, (_, i) => {
          const day = i + 1;
          const n = carsOn(day);
          return (
            <div
              key={day}
              data-cal-day={day}
              {...(n > 0 ? { "data-occupied": "1" } : {})}
              title={n > 0 ? String(n) : undefined}
              className={[
                "flex h-11 flex-col items-center justify-center gap-1 rounded-lg text-sm sm:h-12",
                n > 0 ? "bg-brand-50 font-semibold text-navy-900" : "text-navy-600",
                isToday(day) ? "ring-2 ring-brand-400" : "",
              ]
                .filter(Boolean)
                .join(" ")}
            >
              <span className="leading-none">{day}</span>
              {n > 0 &&
                (n <= 3 ? (
                  <span className="flex gap-0.5">
                    {Array.from({ length: n }, (_, j) => (
                      <span key={j} className="h-1.5 w-1.5 rounded-full bg-brand-500" />
                    ))}
                  </span>
                ) : (
                  <span className="text-[10px] font-bold leading-none text-brand-700">{n}</span>
                ))}
            </div>
          );
        })}
      </div>

      <p className="mt-3 flex items-center gap-1.5 text-xs text-navy-400">
        <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-brand-500" /> {labels.legend}
      </p>
    </div>
  );
}
