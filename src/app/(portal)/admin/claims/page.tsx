import Link from "next/link";
import type { Metadata } from "next";
import { CheckCircle2, Search, ShieldAlert, XCircle } from "lucide-react";
import Image from "next/image";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PortalShell } from "@/components/portal/shell";
import { StatusBadge } from "@/components/portal/status";
import { adminNav, supportAgentNav } from "@/components/portal/navs";
import { requireRole, requireOpsAdmin } from "@/lib/auth";
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
  const user = await requireOpsAdmin();
  const isFullAdmin = user.adminScope !== "support";
  const { t } = await getI18n();

  const claims = await listAllClaims();
  const claimantMap = await getUsersByIds(claims.map((c) => c.openedBy));
  const openCount = claims.filter((c) => c.status === "open" || c.status === "in_review").length;

  return (
    <PortalShell user={user} nav={user.adminScope === "support" ? supportAgentNav : adminNav} title="admin.claims.title">
      <div className="mx-auto max-w-4xl space-y-6">
        <Link href="/admin" className="text-sm font-semibold text-brand-700">
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
                    {/* The evidence, full width and openable — deciding a
                        damage claim off a thumbnail is deciding it blind. */}
                    {(c.photos ?? []).length > 0 && (
                      <ul className="mt-3 flex flex-wrap gap-2" data-claim-photos>
                        {(c.photos ?? []).map((url) => (
                          <li key={url}>
                            <a href={url} target="_blank" rel="noopener noreferrer">
                              <span className="relative block h-24 w-24 overflow-hidden rounded-lg border border-navy-200">
                                <Image
                                  src={url}
                                  alt="Claim evidence"
                                  fill
                                  sizes="96px"
                                  className="object-cover"
                                />
                              </span>
                            </a>
                          </li>
                        ))}
                      </ul>
                    )}
                    {c.resolution && (
                      <p className="mt-2 rounded-lg bg-navy-50 px-3 py-2 text-sm text-navy-700">
                        {c.resolution}
                      </p>
                    )}
                    {isFullAdmin && !decided && (
                      <form
                        action={setClaimStatusAction}
                        className="mt-3 flex flex-wrap items-center gap-2"
                      >
                        <input type="hidden" name="claimId" value={c.id} />
                        <input
                          name="resolution"
                          placeholder={t("admin.claims.resolutionPh")}
                          className="min-w-0 flex-1 rounded-lg border border-navy-200 bg-white px-3 py-2 text-xs text-navy-700 placeholder:text-navy-400"
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
