import Link from "next/link";
import type { Metadata } from "next";
import { CalendarClock, Car, CheckCircle2, LogIn, LogOut } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar } from "@/components/common/avatar";
import { PortalShell } from "@/components/portal/shell";
import { StatusBadge } from "@/components/portal/status";
import { hostNav } from "@/components/portal/navs";
import { requireRole } from "@/lib/auth";
import { getHostForUser, getSpacesForHost } from "@/lib/data/hosts";
import { listBookingsForHost } from "@/lib/data/bookings";
import { getUsersByIds } from "@/lib/data/users";
import { hostCheckInAction, hostCheckOutAction } from "@/lib/host-suite-actions";
import { getI18n } from "@/lib/i18n";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Today",
  path: "/host/today",
  noindex: true,
});

/** The host's operating day: who arrives, who leaves, one tap to check in/out. */
export default async function HostTodayPage() {
  const user = await requireRole("host");
  const { t } = await getI18n();
  const host = await getHostForUser(user);
  if (!host) {
    return (
      <PortalShell user={user} nav={hostNav} title="host.today.title">
        <div className="mx-auto max-w-xl py-12 text-center text-navy-500">
          {t("host.today.noHost")}
        </div>
      </PortalShell>
    );
  }

  const spaces = await getSpacesForHost(host.id);
  const spaceMap = new Map(spaces.map((s) => [s.id, s]));
  const bookings = await listBookingsForHost(host.id);
  const travellerMap = await getUsersByIds(bookings.map((b) => b.travellerId));

  const dayStart = new Date();
  dayStart.setHours(0, 0, 0, 0);
  const dayEnd = new Date(dayStart.getTime() + 86_400_000);
  const inToday = (iso: string) => {
    const ts = +new Date(iso);
    return ts >= +dayStart && ts < +dayEnd;
  };
  const arrivals = bookings
    .filter((b) => (b.status === "paid" || b.status === "active") && inToday(b.startAt))
    .sort((a, b) => +new Date(a.startAt) - +new Date(b.startAt));
  const departures = bookings
    .filter((b) => (b.status === "paid" || b.status === "active") && inToday(b.endAt))
    .sort((a, b) => +new Date(a.endAt) - +new Date(b.endAt));

  const renderRow = (b: (typeof bookings)[number], mode: "arrival" | "departure") => {
    const traveller = travellerMap.get(b.travellerId);
    const time = new Date(mode === "arrival" ? b.startAt : b.endAt).toLocaleTimeString(
      "en-GB",
      { hour: "2-digit", minute: "2-digit" }
    );
    return (
      <div key={b.id} className="flex flex-wrap items-center justify-between gap-3 p-4">
        <Link
          href={`/host/bookings/${b.id}`}
          className="flex min-w-0 items-center gap-3 hover:opacity-80"
        >
          <Avatar
            name={traveller?.name ?? "PG"}
            avatarUrl={traveller?.avatarUrl}
            color={traveller?.avatarColor ?? "#1B6CB3"}
            className="h-9 w-9 text-xs"
          />
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-mono text-sm font-bold text-navy-900">{b.reference}</span>
              <StatusBadge status={b.status} />
            </div>
            <div className="truncate text-xs text-navy-400">
              {traveller?.name ?? "—"} · {spaceMap.get(b.spaceId)?.title ?? b.spaceId}
              {traveller?.vehicle?.reg ? (
                <span className="ms-1 font-mono font-bold text-navy-600">
                  {traveller.vehicle.reg}
                </span>
              ) : null}
            </div>
          </div>
        </Link>
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold text-navy-800">{time}</span>
          {mode === "arrival" && b.status === "paid" && (
            <form action={hostCheckInAction}>
              <input type="hidden" name="bookingId" value={b.id} />
              <input type="hidden" name="back" value="/host/today" />
              <button
                type="submit"
                className="inline-flex items-center gap-1 rounded-lg bg-go-500 px-3 py-1.5 text-xs font-semibold text-white hover:bg-go-600"
              >
                <LogIn className="h-3.5 w-3.5" /> {t("host.today.arrived")}
              </button>
            </form>
          )}
          {mode === "departure" && (
            <form action={hostCheckOutAction}>
              <input type="hidden" name="bookingId" value={b.id} />
              <input type="hidden" name="back" value="/host/today" />
              <button
                type="submit"
                className="inline-flex items-center gap-1 rounded-lg bg-navy-900 px-3 py-1.5 text-xs font-semibold text-white hover:bg-navy-700"
              >
                <LogOut className="h-3.5 w-3.5" /> {t("host.today.collected")}
              </button>
            </form>
          )}
        </div>
      </div>
    );
  };

  return (
    <PortalShell user={user} nav={hostNav} title="host.today.title">
      <div className="mx-auto max-w-3xl space-y-6">
        <Link href="/host" className="text-sm font-semibold text-brand-600">
          ← {t("common.backToDash")}
        </Link>

        <div className="flex flex-wrap items-center gap-2">
          <h2 className="flex items-center gap-2 text-xl font-extrabold text-navy-900">
            <CalendarClock className="h-5 w-5 text-brand-600" /> {t("host.today.title")}
          </h2>
          <span className="text-sm text-navy-500">
            {new Date().toLocaleDateString("en-GB", {
              weekday: "long",
              day: "numeric",
              month: "long",
            })}
          </span>
        </div>

        <section id="arrivals">
          <div className="mb-3 flex items-center gap-2">
            <h3 className="flex items-center gap-2 text-lg font-bold text-navy-900">
              <LogIn className="h-5 w-5 text-go-600" /> {t("host.today.arrivals")}
            </h3>
            <Badge tone={arrivals.length > 0 ? "go" : "neutral"}>{arrivals.length}</Badge>
          </div>
          <Card className="divide-y divide-navy-100">
            {arrivals.length === 0 && (
              <div className="p-6 text-center text-sm text-navy-500">
                {t("host.today.none")}
              </div>
            )}
            {arrivals.map((b) => renderRow(b, "arrival"))}
          </Card>
        </section>

        <section id="departures">
          <div className="mb-3 flex items-center gap-2">
            <h3 className="flex items-center gap-2 text-lg font-bold text-navy-900">
              <LogOut className="h-5 w-5 text-brand-600" /> {t("host.today.departures")}
            </h3>
            <Badge tone={departures.length > 0 ? "brand" : "neutral"}>
              {departures.length}
            </Badge>
          </div>
          <Card className="divide-y divide-navy-100">
            {departures.length === 0 && (
              <div className="p-6 text-center text-sm text-navy-500">
                {t("host.today.none")}
              </div>
            )}
            {departures.map((b) => renderRow(b, "departure"))}
          </Card>
          <p className="mt-2 flex items-center gap-1.5 text-xs text-navy-400">
            <Car className="h-3.5 w-3.5" /> {t("host.today.tip")}
            <CheckCircle2 className="h-3.5 w-3.5 text-go-600" />
          </p>
        </section>
      </div>
    </PortalShell>
  );
}
