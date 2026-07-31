import { getCurrentUser } from "@/lib/auth";
import { getHostForUser, getSpacesForHost } from "@/lib/data/hosts";
import { listBookingsForHost } from "@/lib/data/bookings";
import {
  buildHostStatement,
  periodYearLabel,
  statementCsv,
  type StatementPeriod,
} from "@/lib/statement";

export const dynamic = "force-dynamic";

/**
 * The statement page's CSV twin — same period params, same rows, as a file
 * an accountant can drop straight into a spreadsheet.
 */
export async function GET(request: Request) {
  const user = await getCurrentUser();
  if (!user || (user.role !== "host" && user.role !== "admin") || user.cohostHostId) {
    return new Response("Not found", { status: 404 });
  }
  const host = await getHostForUser(user);
  if (!host) return new Response("Not found", { status: 404 });

  const { searchParams } = new URL(request.url);
  const now = new Date();
  const thisYear = now.getUTCFullYear();
  const yearRaw = Number.parseInt(searchParams.get("year") ?? "", 10);
  const year =
    Number.isFinite(yearRaw) && yearRaw >= 2020 && yearRaw <= thisYear + 1 ? yearRaw : null;
  const month = searchParams.get("month") ?? "";
  const period: StatementPeriod = year
    ? searchParams.get("basis") === "tax"
      ? { kind: "tax", year }
      : { kind: "calendar", year }
    : {
        kind: "month",
        month: /^\d{4}-\d{2}$/.test(month) ? month : now.toISOString().slice(0, 7),
      };

  const [bookings, spaces] = await Promise.all([
    listBookingsForHost(host.id),
    getSpacesForHost(host.id),
  ]);
  const csv = statementCsv(buildHostStatement(bookings, spaces, period));

  const name =
    period.kind === "month"
      ? `parkgo-statement-${period.month}.csv`
      : `parkgo-statement-${periodYearLabel(period)?.replace("/", "-")}${period.kind === "tax" ? "-tax" : ""}.csv`;
  return new Response(csv, {
    headers: {
      "content-type": "text/csv; charset=utf-8",
      "content-disposition": `attachment; filename="${name}"`,
    },
  });
}
