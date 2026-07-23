import Link from "next/link";
import type { Metadata } from "next";
import { CheckCircle2, Search, ShieldAlert, XCircle } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PortalShell } from "@/components/portal/shell";
import { StatusBadge } from "@/components/portal/status";
import { adminNav } from "@/components/portal/navs";
import { requireRole } from "@/lib/auth";
import { setClaimStatusAction } from "@/lib/admin-suite-actions";
import { listAllClaims } from "@/lib/data/claims";
import { getUsersByIds } from "@/lib/data/users";
import { formatDateTime } from "@/lib/utils";
import { getI18n } from "@/lib/i18n";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Claims",
  path: "/admin/claims",
  noindex: true,
});

export default async function AdminClaimsPage() {
  const user = await requireRole("admin");
  const { t } = await getI18n();

  const claims = await listAllClaims();
  const claimantMap = await getUsersByIds(claims.map((c) => c.openedBy));
  const openCount = claims.filter((c) => c.status === "open" || c.status === "in_review").length;

  return (
    <PortalShell user={user} nav={adminNav} title="admin.claims.title">
      <div className="mx-auto max-w-4xl space-y-6">
        <Link href="/admin" className="text-sm font-semibold text-brand-600">
          ← {t("common.backToDash")}
        </Link>

        <section id="claims">
          <div className="mb-3 flex items-center gap-2">
            <h3 className="flex items-center gap-2 text-lg font-bold text-navy-900">
              <ShieldAlert className="h-5 w-5 text-navy-500" /> {t("admin.claims.title")}
            </h3>
            <Badge tone={openCount > 0 ? "accent" : "neutral"}>{openCount}</Badge>
          </div>
          {claims.length === 0 ? (
            <Card className="p-6 text-center text-navy-500">{t("admin.claims.empty")}</Card>
          ) : (
            <div className="space-y-4">
              {claims.map((c) => {
                const claimant = claimantMap.get(c.openedBy);
                const decided = c.status === "resolved" || c.status === "rejected";
                return (
                  <Card key={c.id} className="p-5">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-mono text-sm font-bold text-navy-900">
                        {c.bookingRef}
                      </span>
                      <StatusBadge status={c.status} />
                      <span className="text-xs text-navy-400">
                        {claimant?.name ?? "—"} · {formatDateTime(c.createdAt)}
                      </span>
                      <Link
                        href={`/app/booking/${c.bookingId}`}
                        className="ms-auto inline-flex items-center gap-1 rounded-lg border border-navy-200 bg-white px-3 py-1.5 text-xs font-semibold text-navy-600 hover:bg-navy-50"
                      >
                        {t("admin.view")}
                      </Link>
                    </div>
                    <p className="mt-2 whitespace-pre-line text-sm text-navy-700">
                      {c.description}
                    </p>
                    {c.resolution && (
                      <p className="mt-2 rounded-lg bg-navy-50 px-3 py-2 text-sm text-navy-700">
                        {c.resolution}
                      </p>
                    )}
                    {!decided && (
                      <form
                        action={setClaimStatusAction}
                        className="mt-3 flex flex-wrap items-center gap-2"
                      >
                        <input type="hidden" name="claimId" value={c.id} />
                        <input
                          name="resolution"
                          placeholder={t("admin.claims.resolutionPh")}
                          className="min-w-0 flex-1 rounded-lg border border-navy-200 bg-white px-3 py-2 text-xs text-navy-700 placeholder:text-navy-300"
                        />
                        {c.status === "open" && (
                          <button
                            type="submit"
                            name="status"
                            value="in_review"
                            className="inline-flex items-center gap-1 rounded-lg border border-navy-200 bg-white px-3 py-2 text-xs font-semibold text-navy-700 hover:bg-navy-50"
                          >
                            <Search className="h-3.5 w-3.5" /> {t("admin.claims.review")}
                          </button>
                        )}
                        <button
                          type="submit"
                          name="status"
                          value="resolved"
                          className="inline-flex items-center gap-1 rounded-lg bg-go-500 px-3 py-2 text-xs font-semibold text-white hover:bg-go-600"
                        >
                          <CheckCircle2 className="h-3.5 w-3.5" /> {t("admin.claims.resolve")}
                        </button>
                        <button
                          type="submit"
                          name="status"
                          value="rejected"
                          className="inline-flex items-center gap-1 rounded-lg border border-red-200 bg-white px-3 py-2 text-xs font-semibold text-red-600 hover:bg-red-50"
                        >
                          <XCircle className="h-3.5 w-3.5" /> {t("admin.claims.reject")}
                        </button>
                      </form>
                    )}
                  </Card>
                );
              })}
            </div>
          )}
        </section>
      </div>
    </PortalShell>
  );
}
