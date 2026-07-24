import { requireRole } from "@/lib/auth";
import { getHostForUser, getSpacesForHost } from "@/lib/data/hosts";
import { listBookingsForHost, listPaymentsForHost } from "@/lib/data/bookings";
import { sheetResponse } from "@/lib/export-sheet";

/**
 * Host payout history export: /host/export (own payments only).
 * Same workbook styling as the admin exports; &format=csv for plain CSV.
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

export async function GET(request: Request) {
  const user = await requireRole("host");
  const host = await getHostForUser(user);
  if (!host) return new Response("No host profile", { status: 404 });
  // ?month=YYYY-MM turns the full history into a single-month statement.
  const url0 = new URL(request.url);
  const month = url0.searchParams.get("month");
  const monthOk = !!month && /^\d{4}-(0[1-9]|1[0-2])$/.test(month);
  // ?taxyear=2025 → UK tax year 6 Apr 2025 – 5 Apr 2026 (self-assessment).
  const taxyearRaw = Number(url0.searchParams.get("taxyear"));
  const taxOk = Number.isInteger(taxyearRaw) && taxyearRaw >= 2020 && taxyearRaw <= 2100;
  const taxFrom = taxOk ? Date.UTC(taxyearRaw, 3, 6) : 0;
  const taxTo = taxOk ? Date.UTC(taxyearRaw + 1, 3, 6) : 0;

  const [bookings, payments, spaces] = await Promise.all([
    listBookingsForHost(host.id),
    listPaymentsForHost(host.id),
    getSpacesForHost(host.id),
  ]);
  const bookingMap = new Map(bookings.map((b) => [b.id, b]));
  const spaceMap = new Map(spaces.map((s) => [s.id, s]));

  const header = [
    "Date", "Reference", "Space", "Drop-off", "Pick-up", "Booking status",
    "Payout status", "Gross (£)", "ParkGo fee (£)", "Driver (£)", "Your payout (£)", "Currency",
  ];
  const rows = [...payments]
    .filter((p) => !monthOk || p.createdAt.slice(0, 7) === month)
    .filter((p) => {
      if (!taxOk) return true;
      const ts = +new Date(p.createdAt);
      return ts >= taxFrom && ts < taxTo;
    })
    .sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt))
    .map((p) => {
      const b = bookingMap.get(p.bookingId);
      const sp = b ? spaceMap.get(b.spaceId) : undefined;
      const refunded = p.payoutStatus === "refunded" || b?.status === "cancelled";
      return [
        friendly(p.createdAt),
        b?.reference ?? p.bookingId,
        sp?.title ?? "",
        b ? friendly(b.startAt) : "",
        b ? friendly(b.endAt) : "",
        b?.status ?? "",
        refunded ? "refunded" : p.payoutStatus,
        pounds(p.amount),
        pounds(p.split.platform),
        pounds(p.split.driverPayout),
        pounds(p.split.hostPayout),
        p.currency,
      ];
    });

  const url = new URL(request.url);
  return sheetResponse({
    sheetName: "Payouts",
    filename: taxOk
      ? `parkgo-tax-${taxyearRaw}-${taxyearRaw + 1}`
      : monthOk
        ? `parkgo-statement-${month}`
        : "parkgo-payouts",
    header,
    rows,
    format: url.searchParams.get("format"),
  });
}
