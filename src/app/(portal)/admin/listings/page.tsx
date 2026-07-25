import Link from "next/link";
import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { ArrowUpRight, CheckCheck, CheckCircle2, PauseCircle, XCircle } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PortalShell } from "@/components/portal/shell";
import { StatusBadge } from "@/components/portal/status";
import { adminNav } from "@/components/portal/navs";
import { requireRole } from "@/lib/auth";
import { pauseSpaceAction, reviewSpaceAction } from "@/lib/booking-actions";
import { bulkApproveListingsAction } from "@/lib/admin-suite-actions";
import { getAirport } from "@/lib/data/store";
import { getHostsByIds, listAllSpaces } from "@/lib/data/hosts";
import { formatMoney } from "@/lib/utils";
import { getI18n } from "@/lib/i18n";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Listings",
  path: "/admin/listings",
  noindex: true,
});

export default async function AdminListingsPage({
  searchParams,
}: {
  searchParams: Promise<{ bulk?: string }>;
}) {
  const user = await requireRole("admin");
  // Support agents live on the ticket queue — nothing else here is theirs.
  if (user.adminScope === "support") redirect("/admin/support");
  const { t } = await getI18n();
  const { bulk } = await searchParams;

  const spaces = await listAllSpaces();
  const spaceHostMap = await getHostsByIds(spaces.map((s) => s.hostId));
  const pendingListings = spaces.filter(
    (s) => s.status === "pending_review" || s.status === "draft"
  ).length;
  // Listings needing review first, then live, then everything else.
  const listingRank = (status: string) =>
    status === "pending_review" || status === "draft" ? 0 : status === "live" ? 1 : 2;
  const sortedSpaces = [...spaces].sort(
    (a, b) => listingRank(a.status) - listingRank(b.status)
  );

  return (
    <PortalShell user={user} nav={adminNav} title="nav.listings">
      <div className="mx-auto max-w-4xl space-y-6">
        <Link href="/admin" className="text-sm font-semibold text-brand-700">
          ← {t("common.backToDash")}
        </Link>

        {bulk && (
          <div className="flex items-center gap-2 rounded-2xl border border-go-200 bg-go-50 px-4 py-3 font-semibold text-go-700">
            <CheckCircle2 className="h-5 w-5" /> {bulk} {t("admin.bulk.done")}
          </div>
        )}

        <section id="listings">
          <div className="mb-3 flex items-center gap-2">
            <h3 className="text-lg font-bold text-navy-900">{t("nav.listings")}</h3>
            <Badge tone="neutral">{spaces.length} {t("admin.total")}</Badge>
            {pendingListings > 0 && (
              <Badge tone="accent">{pendingListings} {t("admin.awaitingReview")}</Badge>
            )}
            {pendingListings > 0 && (
              <form action={bulkApproveListingsAction} className="ms-auto">
                <button
                  type="submit"
                  className="inline-flex items-center gap-1.5 rounded-lg bg-go-500 px-3 py-1.5 text-xs font-semibold text-navy-900 hover:bg-go-400"
                >
                  <CheckCheck className="h-3.5 w-3.5" /> {t("admin.bulk.approveAll")} ({pendingListings})
                </button>
              </form>
            )}
          </div>
          <Card className="divide-y divide-navy-100">
            {sortedSpaces.map((s) => {
              const host = spaceHostMap.get(s.hostId);
              const airport = getAirport(s.airportSlug);
              const needsReview = s.status === "pending_review" || s.status === "draft";
              return (
                <div key={s.id} className="flex flex-wrap items-center justify-between gap-3 p-4">
                  <div>
                    <div className="font-semibold text-navy-900">{s.title}</div>
                    <div className="text-xs text-navy-400">
                      {host?.displayName} · {airport?.name} · {formatMoney(s.pricePerDay)}/day
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <StatusBadge status={s.status} />
                    <Link
                      href={`/app/space/${s.id}`}
                      className="inline-flex items-center gap-1 rounded-lg border border-navy-200 bg-white px-3 py-1.5 text-xs font-semibold text-navy-600 hover:bg-navy-50"
                    >
                      <ArrowUpRight className="h-3.5 w-3.5" /> {t("admin.view")}
                    </Link>
                    {(s.status === "live" || s.status === "paused") && (
                      <form action={pauseSpaceAction}>
                        <input type="hidden" name="spaceId" value={s.id} />
                        <input
                          type="hidden"
                          name="state"
                          value={s.status === "live" ? "pause" : "reactivate"}
                        />
                        {s.status === "live" ? (
                          <button
                            type="submit"
                            className="inline-flex items-center gap-1 rounded-lg border border-accent-200 bg-white px-3 py-1.5 text-xs font-semibold text-accent-700 hover:bg-accent-50"
                          >
                            <PauseCircle className="h-3.5 w-3.5" /> {t("admin.pause")}
                          </button>
                        ) : (
                          <button
                            type="submit"
                            className="inline-flex items-center gap-1 rounded-lg bg-go-500 px-3 py-1.5 text-xs font-semibold text-navy-900 hover:bg-go-400"
                          >
                            <CheckCircle2 className="h-3.5 w-3.5" /> {t("admin.reactivate")}
                          </button>
                        )}
                      </form>
                    )}
                    {needsReview && (
                      <form action={reviewSpaceAction} className="flex gap-2">
                        <input type="hidden" name="spaceId" value={s.id} />
                        <button
                          type="submit"
                          name="decision"
                          value="approved"
                          className="inline-flex items-center gap-1 rounded-lg bg-go-500 px-3 py-1.5 text-xs font-semibold text-navy-900 hover:bg-go-400"
                        >
                          <CheckCircle2 className="h-3.5 w-3.5" /> {t("admin.approve")}
                        </button>
                        <button
                          type="submit"
                          name="decision"
                          value="rejected"
                          className="inline-flex items-center gap-1 rounded-lg border border-red-200 bg-white px-3 py-1.5 text-xs font-semibold text-red-600 hover:bg-red-50"
                        >
                          <XCircle className="h-3.5 w-3.5" /> {t("admin.reject")}
                        </button>
                      </form>
                    )}
                  </div>
                </div>
              );
            })}
          </Card>
        </section>
      </div>
    </PortalShell>
  );
}
