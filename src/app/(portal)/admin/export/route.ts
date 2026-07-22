import { requireRole } from "@/lib/auth";
import { listAllBookings, listAllPayments } from "@/lib/data/bookings";
import { listAllUsers } from "@/lib/data/users";
import { listWaitlist } from "@/lib/data/waitlist";
import { listAllHosts, listAllSpaces } from "@/lib/data/hosts";
import { listAllVerificationsLive } from "@/lib/data/verifications";
import { getAirport } from "@/lib/data/store";
import { sheetResponse } from "@/lib/export-sheet";

/** Admin-only data exports: /admin/export?type=bookings|users|waitlist */

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
  if (type === "payments") {
    const [payments, bookings] = await Promise.all([listAllPayments(), listAllBookings()]);
    const bookingMap = new Map(bookings.map((b) => [b.id, b]));
    return {
      header: [
        "Date", "Reference", "Method", "Payout status", "Gross (£)",
        "Platform fee (£)", "Host payout (£)", "Driver (£)", "Currency",
      ],
      rows: [...payments]
        .sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt))
        .map((p) => {
          const b = bookingMap.get(p.bookingId);
          const refunded = p.payoutStatus === "refunded" || b?.status === "cancelled";
          return [
            friendly(p.createdAt), b?.reference ?? p.bookingId, p.method,
            refunded ? "refunded" : p.payoutStatus, pounds(p.amount),
            pounds(p.split.platform), pounds(p.split.hostPayout),
            pounds(p.split.driverPayout), p.currency,
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
  if (type === "verifications") {
    const [verifications, hosts, users] = await Promise.all([
      listAllVerificationsLive(),
      listAllHosts(),
      listAllUsers(),
    ]);
    const hostMap = new Map(hosts.map((h) => [h.id, h]));
    const userMap = new Map(users.map((u) => [u.id, u]));
    return {
      header: [
        "Submitted", "Name", "Email", "Type", "Status",
        "Documents", "Notes", "Reviewed", "Reviewer",
      ],
      rows: verifications.map((v) => {
        const host = v.subjectType === "host" ? hostMap.get(v.subjectId) : undefined;
        const hostUser = host ? userMap.get(host.userId) : undefined;
        return [
          v.submittedAt ? friendly(v.submittedAt) : "",
          host?.displayName ?? v.subjectId,
          hostUser?.email ?? "",
          v.subjectType,
          v.status,
          v.documents.map((d) => d.label).join(", "),
          v.notes ?? "",
          v.reviewedAt ? friendly(v.reviewedAt) : "",
          v.reviewerId ? userMap.get(v.reviewerId)?.name ?? v.reviewerId : "",
        ];
      }),
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

export async function GET(request: Request) {
  await requireRole("admin");
  const url = new URL(request.url);
  const type = url.searchParams.get("type") ?? "bookings";
  const data = await buildRows(type);
  if (!data) return new Response("Unknown export type", { status: 400 });

  return sheetResponse({
    sheetName: type.charAt(0).toUpperCase() + type.slice(1),
    filename: `parkgo-${type}`,
    header: data.header,
    rows: data.rows,
    format: url.searchParams.get("format"),
  });
}
