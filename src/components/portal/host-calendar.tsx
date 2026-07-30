import Link from "next/link";
import { ChevronLeft, ChevronRight, Ticket, X } from "lucide-react";
import { StatusBadge } from "@/components/portal/status";

interface CalBooking {
  id: string;
  reference: string;
  startAt: string;
  endAt: string;
  status: string;
}

const navBtn =
  "flex h-8 w-8 items-center justify-center rounded-lg border border-navy-200 text-navy-500 transition-colors hover:bg-navy-50 hover:text-navy-900";

/**
 * Month occupancy calendar for the host dashboard. Server-rendered: the
 * prev/next arrows and the day cells are plain links (`?cal=YYYY-MM&day=D`),
 * so no client JS is needed. A day with bookings opens a panel underneath
 * listing them, each linking to its booking page. Days are compared in UTC to
 * match the booking timestamps.
 */
export function HostCalendar({
  bookings,
  month,
  selectedDay,
  localeTag,
  labels,
}: {
  bookings: CalBooking[];
  month: string; // "YYYY-MM", validated by the caller
  /** Day-of-month from ?day=, validated by the caller; null = nothing open. */
  selectedDay?: number | null;
  localeTag: string;
  labels: {
    prev: string;
    next: string;
    legend: string;
    dayTitle: string;
    dayNone: string;
    dayClose: string;
  };
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
  const bookingsOn = (day: number) => {
    const dayStart = Date.UTC(y, m - 1, day);
    const dayEnd = Date.UTC(y, m - 1, day + 1);
    return active.filter(
      (b) => +new Date(b.startAt) < dayEnd && +new Date(b.endAt) > dayStart
    );
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

  const open = selectedDay && selectedDay >= 1 && selectedDay <= daysInMonth ? selectedDay : null;
  const openBookings = open ? bookingsOn(open) : [];
  const openDate = open
    ? new Date(Date.UTC(y, m - 1, open)).toLocaleDateString(localeTag, {
        weekday: "long",
        day: "numeric",
        month: "long",
        timeZone: "UTC",
      })
    : "";
  const fmtDT = (iso: string) =>
    new Date(iso).toLocaleString(localeTag, {
      day: "numeric",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
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
          const n = bookingsOn(day).length;
          const cellClass = [
            "flex h-11 flex-col items-center justify-center gap-1 rounded-lg text-sm sm:h-12",
            n > 0 ? "bg-brand-50 font-semibold text-navy-900" : "text-navy-600",
            isToday(day) ? "ring-2 ring-brand-400" : "",
            open === day ? "ring-2 ring-navy-700" : "",
          ]
            .filter(Boolean)
            .join(" ");
          const inner = (
            <>
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
            </>
          );
          // An occupied day is a link: open its bookings (or close them again).
          return n > 0 ? (
            <Link
              key={day}
              href={
                open === day
                  ? `/host?cal=${month}#calendar`
                  : `/host?cal=${month}&day=${day}#calendar`
              }
              data-cal-day={day}
              data-occupied="1"
              title={String(n)}
              className={`${cellClass} transition-colors hover:bg-brand-100`}
            >
              {inner}
            </Link>
          ) : (
            <div key={day} data-cal-day={day} className={cellClass}>
              {inner}
            </div>
          );
        })}
      </div>

      {/* ------------------------------------------------ the day, opened --- */}
      {open && (
        <div className="mt-4 rounded-xl border border-navy-100 bg-navy-50/50 p-4" data-cal-day-panel>
          <div className="mb-2 flex items-center justify-between gap-2">
            <p className="text-sm font-bold text-navy-900">
              {labels.dayTitle} {openDate}
            </p>
            <Link
              href={`/host?cal=${month}#calendar`}
              aria-label={labels.dayClose}
              className="flex h-7 w-7 items-center justify-center rounded-lg text-navy-400 hover:bg-navy-100 hover:text-navy-700"
            >
              <X className="h-4 w-4" />
            </Link>
          </div>
          {openBookings.length === 0 ? (
            <p className="text-sm text-navy-500">{labels.dayNone}</p>
          ) : (
            <ul className="space-y-1.5">
              {openBookings.map((b) => (
                <li key={b.id}>
                  <Link
                    href={`/host/bookings/${b.id}`}
                    data-cal-booking={b.reference}
                    className="flex flex-wrap items-center justify-between gap-2 rounded-lg bg-white px-3 py-2 ring-1 ring-navy-100 transition-colors hover:ring-brand-300"
                  >
                    <span className="inline-flex min-w-0 items-center gap-2">
                      <Ticket className="h-4 w-4 shrink-0 text-brand-600" aria-hidden />
                      <span className="font-semibold text-navy-900">{b.reference}</span>
                      <span className="truncate text-xs text-navy-500">
                        {fmtDT(b.startAt)} → {fmtDT(b.endAt)}
                      </span>
                    </span>
                    <StatusBadge status={b.status} />
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      <p className="mt-3 flex items-center gap-1.5 text-xs text-navy-400">
        <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-brand-500" /> {labels.legend}
      </p>
    </div>
  );
}
