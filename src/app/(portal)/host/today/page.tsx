import Link from "next/link";
import type { Metadata } from "next";
import {
  CalendarClock,
  Car,
  CheckCircle2,
  Hourglass,
  LogIn,
  LogOut,
  ParkingSquare,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar } from "@/components/common/avatar";
import { PortalShell } from "@/components/portal/shell";
import { StatusBadge } from "@/components/portal/status";
import { cohostNav, hostNav } from "@/components/portal/navs";
import { requireRole } from "@/lib/auth";
import { getHostById, getHostForUser, getSpacesForHost } from "@/lib/data/hosts";
import { listBookingsForHost, sweepExpiredApprovals } from "@/lib/data/bookings";
import { getUsersByIds } from "@/lib/data/users";
import { hostCheckInAction, hostCheckOutAction } from "@/lib/host-suite-actions";
import { approveBookingAction, declineBookingAction } from "@/lib/host-suite2-actions";
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
  const nav = user.cohostHostId ? cohostNav : hostNav;
  const host = user.cohostHostId
    ? await getHostById(user.cohostHostId)
    : await getHostForUser(user);
  if (!host || (user.cohostHostId && host.cohostUserId !== user.id)) {
    return (
      <PortalShell user={user} nav={nav} title="host.today.title">
        <div className="mx-auto max-w-xl py-12 text-center text-navy-500">
          {t("host.today.noHost")}
        </div>
      </PortalShell>
    );
  }

  // Lazy 24h sweep — expired requests refund without waiting for the cron.
  await sweepExpiredApprovals();

  const spaces = await getSpacesForHost(host.id);
  const spaceMap = new Map(spaces.map((s) => [s.id, s]));
  const bookings = await listBookingsForHost(host.id);
  const travellerMap = await getUsersByIds(bookings.map((b) => b.travellerId));

  const requests = bookings
    .filter((b) => b.approval === "pending" && b.status === "paid")
    .sort((a, b) => +new Date(a.startAt) - +new Date(b.startAt));

  // Live bay board: which named bay is occupied by a checked-in car right now.
  const baySpaces = spaces.filter((s) => (s.bayNames ?? []).length > 0);
  const bayOccupant = (spaceId: string, bayIndex: number) =>
    bookings.find(
      (b) => b.spaceId === spaceId && b.status === "active" && b.bayIndex === bayIndex
    );

  const dayStart = new Date();
  dayStart.setHours(0, 0, 0, 0);
  const dayEnd = new Date(dayStart.getTime() + 86_400_000);
  const inToday = (iso: string) => {
    const ts = +new Date(iso);
    return ts >= +dayStart && ts < +dayEnd;
  };
  // Pending requests live in their own queue — never in the day plan.
  const confirmed = (b: (typeof bookings)[number]) =>
    (b.status === "paid" || b.status === "active") && b.approval !== "pending";
  const arrivals = bookings
    .filter((b) => confirmed(b) && inToday(b.startAt))
    .sort((a, b) => +new Date(a.startAt) - +new Date(b.startAt));
  const departures = bookings
    .filter((b) => confirmed(b) && inToday(b.endAt))
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
              {typeof b.bayIndex === "number" &&
              spaceMap.get(b.spaceId)?.bayNames?.[b.bayIndex] ? (
                <span className="ms-1 rounded bg-brand-50 px-1.5 py-0.5 font-bold text-brand-700">
                  {t("host.bays.bay")} {spaceMap.get(b.spaceId)?.bayNames?.[b.bayIndex]}
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
    <PortalShell user={user} nav={nav} title="host.today.title">
      <div className="mx-auto max-w-3xl space-y-6">
        {!user.cohostHostId && (
          <Link href="/host" className="text-sm font-semibold text-brand-700">
            ← {t("common.backToDash")}
          </Link>
        )}

        <div className="flex flex-wrap items-center gap-2">
          <h2 className="flex items-center gap-2 text-xl font-extrabold text-navy-900">
            <CalendarClock className="h-5 w-5 text-brand-700" /> {t("host.today.title")}
          </h2>
          <span className="text-sm text-navy-500">
            {new Date().toLocaleDateString("en-GB", {
              weekday: "long",
              day: "numeric",
              month: "long",
            })}
          </span>
        </div>

        {requests.length > 0 && (
          <section id="requests">
            <div className="mb-3 flex items-center gap-2">
              <h3 className="flex items-center gap-2 text-lg font-bold text-navy-900">
                <Hourglass className="h-5 w-5 text-accent-700" /> {t("host.rtb.queue")}
              </h3>
              <Badge tone="accent">{requests.length}</Badge>
            </div>
            <Card className="divide-y divide-navy-100">
              {requests.map((b) => {
                const traveller = travellerMap.get(b.travellerId);
                const hoursLeft = b.approvalDeadline
                  ? Math.max(0, Math.round((+new Date(b.approvalDeadline) - Date.now()) / 3_600_000))
                  : null;
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
                        <span className="font-mono text-sm font-bold text-navy-900">
                          {b.reference}
                        </span>
                        <div className="truncate text-xs text-navy-400">
                          {traveller?.name ?? "—"} · {spaceMap.get(b.spaceId)?.title ?? ""}
                          {hoursLeft !== null && (
                            <span className="ms-1 font-semibold text-accent-700">
                              {t("host.rtb.hoursLeft").replace("{h}", String(hoursLeft))}
                            </span>
                          )}
                        </div>
                      </div>
                    </Link>
                    <div className="flex items-center gap-2">
                      <form action={approveBookingAction}>
                        <input type="hidden" name="bookingId" value={b.id} />
                        <input type="hidden" name="back" value="/host/today" />
                        <button
                          type="submit"
                          className="rounded-lg bg-go-500 px-3 py-1.5 text-xs font-semibold text-white hover:bg-go-600"
                        >
                          {t("host.rtb.approve")}
                        </button>
                      </form>
                      <form action={declineBookingAction}>
                        <input type="hidden" name="bookingId" value={b.id} />
                        <input type="hidden" name="back" value="/host/today" />
                        <button
                          type="submit"
                          className="rounded-lg border border-red-200 bg-red-50 px-3 py-1.5 text-xs font-semibold text-red-700 hover:bg-red-100"
                        >
                          {t("host.rtb.decline")}
                        </button>
                      </form>
                    </div>
                  </div>
                );
              })}
            </Card>
            <p className="mt-2 text-xs text-navy-400">{t("host.rtb.note")}</p>
          </section>
        )}

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
              <LogOut className="h-5 w-5 text-brand-700" /> {t("host.today.departures")}
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

        {baySpaces.length > 0 && (
          <section id="bays">
            <div className="mb-3 flex items-center gap-2">
              <h3 className="flex items-center gap-2 text-lg font-bold text-navy-900">
                <ParkingSquare className="h-5 w-5 text-brand-700" /> {t("host.bays.title")}
              </h3>
            </div>
            <div className="space-y-3">
              {baySpaces.map((s) => (
                <Card key={s.id} className="p-4">
                  <p className="text-sm font-bold text-navy-900">{s.title}</p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {(s.bayNames ?? []).map((bay, i) => {
                      const occupant = bayOccupant(s.id, i);
                      const guest = occupant
                        ? travellerMap.get(occupant.travellerId)
                        : undefined;
                      return (
                        <span
                          key={bay}
                          className={`inline-flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-semibold ${
                            occupant
                              ? "bg-navy-900 text-white"
                              : "bg-go-50 text-go-700"
                          }`}
                        >
                          {t("host.bays.bay")} {bay} ·{" "}
                          {occupant
                            ? guest?.vehicle?.reg ?? guest?.name ?? occupant.reference
                            : t("host.bays.free")}
                        </span>
                      );
                    })}
                  </div>
                </Card>
              ))}
            </div>
            <p className="mt-2 text-xs text-navy-400">{t("host.bays.note")}</p>
          </section>
        )}
      </div>
    </PortalShell>
  );
}
