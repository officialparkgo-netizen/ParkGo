import { requireRole } from "@/lib/auth";
import { listAllBookings } from "@/lib/data/bookings";
import { listAllUsers } from "@/lib/data/users";
import { listWaitlist } from "@/lib/data/waitlist";
import { listAllSpaces } from "@/lib/data/hosts";
import { getAirport } from "@/lib/data/store";

/**
 * Admin-only data exports: /admin/export?type=bookings|users|waitlist
 * Default is a real .xlsx workbook (styled header, frozen row, sized
 * columns) so it opens straight into columns in Excel; &format=csv keeps a
 * plain-CSV path for imports into other tools.
 */

const friendly = (iso: string) =>
  new Date(iso).toLocaleString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

const pounds = (pence: number) => pence / 100;

async function buildRows(type: string): Promise<{ header: string[]; rows: (string | number)[][] } | null> {
  if (type === "bookings") {
    const [bookings, spaces] = await Promise.all([listAllBookings(), listAllSpaces()]);
    const spaceMap = new Map(spaces.map((s) => [s.id, s]));
    return {
      header: [
        "Reference", "Status", "Space", "Destination", "Drop-off", "Pick-up",
        "Total (£)", "Currency", "Transfer", "Trip", "EV", "Booked",
      ],
      rows: bookings.map((b) => {
        const sp = spaceMap.get(b.spaceId);
        const dest = sp ? getAirport(sp.airportSlug) : undefined;
        return [
          b.reference, b.status, sp?.title ?? b.spaceId, dest?.name ?? "",
          friendly(b.startAt), friendly(b.endAt), pounds(b.price.total), b.price.currency,
          b.bundle.transfer ? "yes" : "no",
          b.bundle.transfer ? (b.bundle.transferReturn ? "return" : "one-way") : "",
          b.bundle.ev ? "yes" : "no", friendly(b.createdAt),
        ];
      }),
    };
  }
  if (type === "users") {
    const users = await listAllUsers();
    return {
      header: ["Name", "Email", "Role", "Joined"],
      rows: users.map((u) => [u.name, u.email, u.role, friendly(u.createdAt)]),
    };
  }
  if (type === "waitlist") {
    const entries = await listWaitlist().catch(() => []);
    return {
      header: ["Email", "Role", "Airport", "Signed up"],
      rows: entries.map((w) => [w.email, w.role, w.airport ?? "", friendly(w.createdAt)]),
    };
  }
  return null;
}

function toCsv(header: string[], rows: (string | number)[][]): string {
  return [header, ...rows]
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

export async function GET(request: Request) {
  await requireRole("admin");
  const url = new URL(request.url);
  const type = url.searchParams.get("type") ?? "bookings";
  const data = await buildRows(type);
  if (!data) return new Response("Unknown export type", { status: 400 });

  if (url.searchParams.get("format") === "csv") {
    // BOM so Excel opens UTF-8 names correctly.
    return new Response("﻿" + toCsv(data.header, data.rows), {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="parkgo-${type}.csv"`,
        "Cache-Control": "no-store",
      },
    });
  }

  const { default: ExcelJS } = await import("exceljs");
  const wb = new ExcelJS.Workbook();
  wb.creator = "ParkGo";
  const ws = wb.addWorksheet(type.charAt(0).toUpperCase() + type.slice(1), {
    views: [{ state: "frozen", ySplit: 1 }],
  });

  ws.addRow(data.header);
  data.rows.forEach((r) => ws.addRow(r));

  // Header styling: bold white on brand orange.
  const head = ws.getRow(1);
  head.font = { bold: true, color: { argb: "FFFFFFFF" } };
  head.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFF26A1B" } };
  head.height = 20;

  // Column widths sized to content (capped so one long field can't explode).
  data.header.forEach((h, i) => {
    const longest = Math.max(
      h.length,
      ...data.rows.map((r) => String(r[i] ?? "").length)
    );
    ws.getColumn(i + 1).width = Math.min(Math.max(longest + 3, 10), 42);
  });

  const buf = await wb.xlsx.writeBuffer();
  return new Response(buf, {
    headers: {
      "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": `attachment; filename="parkgo-${type}.xlsx"`,
      "Cache-Control": "no-store",
    },
  });
}
