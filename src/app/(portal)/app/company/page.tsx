import type { Metadata } from "next";
import { Receipt } from "lucide-react";
import { Card } from "@/components/ui/card";
import { PortalShell } from "@/components/portal/shell";
import { travellerNav } from "@/components/portal/navs";
import { CompanyDetails, CompanyMembers } from "@/components/portal/company-forms";
import { requireRole } from "@/lib/auth";
import { companyContext } from "@/lib/company-actions";
import { listMembers, listOrganisationBookings } from "@/lib/data/organisations";
import { formatDate, formatMoney } from "@/lib/utils";
import { getI18n } from "@/lib/i18n";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Company account",
  path: "/app/company",
  noindex: true,
});

/**
 * One account for a team, one invoice for finance.
 *
 * The spend figure is computed from the bookings themselves rather than a
 * running total: an invoice that disagrees with the bookings behind it is an
 * invoice somebody has to reconcile by hand.
 */
export default async function CompanyPage() {
  const user = await requireRole("traveller");
  const { t } = await getI18n();

  const ctx = await companyContext(user.id, user.organisationId);
  const members = ctx ? await listMembers(ctx.org.id).catch(() => []) : [];

  const monthStart = new Date();
  monthStart.setDate(1);
  monthStart.setHours(0, 0, 0, 0);
  const bookings = ctx
    ? await listOrganisationBookings(ctx.org.id, { from: monthStart }).catch(() => [])
    : [];
  const spend = bookings
    .filter((b) => b.status !== "cancelled")
    .reduce((n, b) => n + b.price.total, 0);
  const currency = bookings[0]?.price.currency ?? "GBP";

  return (
    <PortalShell user={user} nav={travellerNav} title="guest.org.title">
      <div className="mx-auto max-w-3xl space-y-5">
        <CompanyDetails org={ctx?.org} isOwner={ctx?.isOwner ?? true} />

        {ctx && (
          <>
            <Card className="flex items-center justify-between gap-4 p-5">
              <div>
                <h2 className="flex items-center gap-2 font-bold text-navy-900">
                  <Receipt className="h-5 w-5 text-navy-500" /> {t("guest.org.spend")}
                </h2>
                <p className="mt-1 text-sm text-navy-500">
                  {bookings.length} · {formatDate(monthStart.toISOString())}
                </p>
              </div>
              <div className="shrink-0 text-2xl font-extrabold text-navy-900">
                {formatMoney(spend, currency)}
              </div>
            </Card>

            <CompanyMembers
              members={members}
              ownerId={ctx.org.ownerId}
              isOwner={ctx.isOwner}
            />
          </>
        )}
      </div>
    </PortalShell>
  );
}
