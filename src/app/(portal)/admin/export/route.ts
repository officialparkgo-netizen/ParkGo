import { requireRole } from "@/lib/auth";
import { listSupportTickets } from "@/lib/data/support";
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
  if (type === "audit") {
    const { listAdminActions } = await import("@/lib/data/admin-actions");
    const actions = await listAdminActions(500);
    return {
      header: ["When", "Admin", "Action", "Target type", "Target", "Detail"],
      rows: actions.map((a) => [
        friendly(a.createdAt), a.adminName, a.action, a.targetType, a.targetId, a.detail ?? "",
      ]),
    };
  }
  if (type === "payouts") {
    // Payout run: everything still owed, grouped per host — hand to the bank.
    const [payments, bookings, spaces, hosts, users] = await Promise.all([
      listAllPayments(),
      listAllBookings(),
      listAllSpaces(),
      listAllHosts(),
      listAllUsers(),
    ]);
    const bookingMap = new Map(bookings.map((b) => [b.id, b]));
    const spaceMap = new Map(spaces.map((s) => [s.id, s]));
    const hostMap = new Map(hosts.map((h) => [h.id, h]));
    const userMap = new Map(users.map((u) => [u.id, u]));
    const due = payments.filter((p) => {
      const b = bookingMap.get(p.bookingId);
      const refunded = p.payoutStatus === "refunded" || b?.status === "cancelled";
      return !refunded && p.payoutStatus !== "paid" && p.split.hostPayout > 0;
    });
    return {
      header: [
        "Host", "Host email", "Payout account", "Reference", "Date",
        "Host payout (£)", "Currency", "Payment id",
      ],
      rows: due.map((p) => {
        const b = bookingMap.get(p.bookingId);
        const host = b ? hostMap.get(spaceMap.get(b.spaceId)?.hostId ?? "") : undefined;
        const hostUser = host ? userMap.get(host.userId) : undefined;
        return [
          host?.displayName ?? "", hostUser?.email ?? "", host?.payoutAccountRef ?? "",
          b?.reference ?? p.bookingId, friendly(p.createdAt),
          pounds(p.split.hostPayout), p.currency, p.id,
        ];
      }),
    };
  }
  if (type === "finance") {
    // Month-by-month statement for accounting: GMV, fees, payouts, refunds.
    const [payments, bookings] = await Promise.all([listAllPayments(), listAllBookings()]);
    const cancelled = new Set(
      bookings.filter((b) => b.status === "cancelled").map((b) => b.id)
    );
    const months = new Map<
      string,
      { gmv: number; platform: number; host: number; driver: number; refunded: number; count: number }
    >();
    for (const p of payments) {
      const key = `${p.createdAt.slice(0, 7)} ${p.currency}`; // YYYY-MM per currency
      const m = months.get(key) ?? {
        gmv: 0, platform: 0, host: 0, driver: 0, refunded: 0, count: 0,
      };
      const refunded = p.payoutStatus === "refunded" || cancelled.has(p.bookingId);
      if (refunded) {
        m.refunded += p.amount;
      } else {
        m.gmv += p.amount;
        m.platform += p.split.platform;
        m.host += p.split.hostPayout;
        m.driver += p.split.driverPayout;
        m.count += 1;
      }
      months.set(key, m);
    }
    return {
      header: [
        "Month", "Currency", "Paid bookings", "GMV", "Platform revenue",
        "Host payouts", "Driver payouts", "Refunded",
      ],
      rows: [...months.entries()]
        .sort((a, b) => b[0].localeCompare(a[0]))
        .map(([key, m]) => {
          const [month, currency] = key.split(" ");
          return [
            month, currency, m.count, pounds(m.gmv), pounds(m.platform),
            pounds(m.host), pounds(m.driver), pounds(m.refunded),
          ];
        }),
    };
  }
  return null;
}

/** GDPR: everything we hold on one user, in one sheet. */
async function buildUserDataRows(userId: string) {
  const [users, bookings, payments, tickets] = await Promise.all([
    listAllUsers(),
    listAllBookings(),
    listAllPayments(),
    listSupportTickets().catch(() => []),
  ]);
  const u = users.find((x) => x.id === userId);
  if (!u) return null;
  const own = bookings.filter((b) => b.travellerId === userId);
  const ownIds = new Set(own.map((b) => b.id));
  const rows: (string | number)[][] = [
    ["PROFILE", "", ""],
    ["Name", u.name, ""],
    ["Email", u.email, ""],
    ["Phone", u.phone ?? "", ""],
    ["Role", u.role, ""],
    ["Joined", friendly(u.createdAt), ""],
    ["", "", ""],
    ["BOOKINGS", "", ""],
    ...own.map((b) => [b.reference, b.status, `${friendly(b.startAt)} → ${friendly(b.endAt)}`]),
    ["", "", ""],
    ["PAYMENTS", "", ""],
    ...payments
      .filter((pm) => ownIds.has(pm.bookingId))
      .map((pm) => [friendly(pm.createdAt), pm.payoutStatus, pounds(pm.amount)]),
    ["", "", ""],
    ["SUPPORT TICKETS", "", ""],
    ...tickets
      .filter((tk) => tk.email.toLowerCase() === u.email.toLowerCase())
      .map((tk) => [friendly(tk.createdAt), tk.topic, tk.status]),
  ];
  return { header: ["Field", "Value", "Detail"], rows };
}

export async function GET(request: Request) {
  const admin = await requireRole("admin");
  const url = new URL(request.url);
  const type = url.searchParams.get("type") ?? "bookings";
  // Support agents get no bulk exports at all — data stays in the building.
  if (admin.adminScope === "support") {
    return new Response("Forbidden", { status: 403 });
  }
  const data =
    type === "userdata"
      ? await buildUserDataRows(url.searchParams.get("user") ?? "")
      : await buildRows(type);
  if (!data) return new Response("Unknown export type", { status: 400 });

  return sheetResponse({
    sheetName: type.charAt(0).toUpperCase() + type.slice(1),
    filename: `parkgo-${type}`,
    header: data.header,
    rows: data.rows,
    format: url.searchParams.get("format"),
  });
}
