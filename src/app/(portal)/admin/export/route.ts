import { requireRole } from "@/lib/auth";
import { listAllBookings } from "@/lib/data/bookings";
import { listAllUsers } from "@/lib/data/users";
import { listWaitlist } from "@/lib/data/waitlist";
import { listAllSpaces } from "@/lib/data/hosts";
import { getAirport } from "@/lib/data/store";

/** Admin-only CSV exports: /admin/export?type=bookings|users|waitlist */

function toCsv(rows: (string | number)[][]): string {
  return rows
    .map((r) =>
      r
        .map((v) => {
          const s = String(v ?? "");
          return /[",\n]/.test(s) ? `"${s.replaceAll('"', '""')}"` : s;
        })
        .join(",")
    )
    .join("\n");
}

const pounds = (pence: number) => (pence / 100).toFixed(2);

export async function GET(request: Request) {
  await requireRole("admin");
  const type = new URL(request.url).searchParams.get("type") ?? "bookings";

  let rows: (string | number)[][];
  if (type === "bookings") {
    const [bookings, spaces] = await Promise.all([listAllBookings(), listAllSpaces()]);
    const spaceMap = new Map(spaces.map((s) => [s.id, s]));
    rows = [
      [
        "Reference", "Status", "Space", "Destination", "Start", "End",
        "Total", "Currency", "Transfer", "TransferType", "EV", "Created",
      ],
      ...bookings.map((b) => {
        const sp = spaceMap.get(b.spaceId);
        const dest = sp ? getAirport(sp.airportSlug) : undefined;
        return [
          b.reference, b.status, sp?.title ?? b.spaceId, dest?.name ?? "",
          b.startAt, b.endAt, pounds(b.price.total), b.price.currency,
          b.bundle.transfer ? "yes" : "no",
          b.bundle.transfer ? (b.bundle.transferReturn ? "return" : "one-way") : "",
          b.bundle.ev ? "yes" : "no", b.createdAt,
        ];
      }),
    ];
  } else if (type === "users") {
    const users = await listAllUsers();
    rows = [
      ["Name", "Email", "Role", "Joined"],
      ...users.map((u) => [u.name, u.email, u.role, u.createdAt]),
    ];
  } else if (type === "waitlist") {
    const entries = await listWaitlist().catch(() => []);
    rows = [
      ["Email", "Role", "Airport", "Created"],
      ...entries.map((w) => [w.email, w.role, w.airport ?? "", w.createdAt]),
    ];
  } else {
    return new Response("Unknown export type", { status: 400 });
  }

  // BOM so Excel opens UTF-8 names correctly.
  return new Response("﻿" + toCsv(rows), {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="parkgo-${type}.csv"`,
      "Cache-Control": "no-store",
    },
  });
}
