import Link from "next/link";
import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { Eye, EyeOff, Star } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PortalShell } from "@/components/portal/shell";
import { adminNav } from "@/components/portal/navs";
import { requireRole } from "@/lib/auth";
import { setReviewHiddenAction } from "@/lib/admin-suite-actions";
import { listAllReviews } from "@/lib/data/reviews";
import { listAllSpaces } from "@/lib/data/hosts";
import { getUsersByIds } from "@/lib/data/users";
import { formatDate } from "@/lib/utils";
import { getI18n } from "@/lib/i18n";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Reviews",
  path: "/admin/reviews",
  noindex: true,
});

export default async function AdminReviewsPage() {
  const user = await requireRole("admin");
  // Support agents live on the ticket queue — nothing else here is theirs.
  if (user.adminScope === "support") redirect("/admin/support");
  const { t } = await getI18n();

  const reviews = await listAllReviews();
  const spaces = await listAllSpaces();
  const spaceMap = new Map(spaces.map((s) => [s.id, s]));
  const authorMap = await getUsersByIds(reviews.map((r) => r.authorId));

  return (
    <PortalShell user={user} nav={adminNav} title="admin.reviews.title">
      <div className="mx-auto max-w-4xl space-y-6">
        <Link href="/admin" className="text-sm font-semibold text-brand-700">
          ← {t("common.backToDash")}
        </Link>

        <section id="reviews">
          <div className="mb-3 flex items-center gap-2">
            <h3 className="flex items-center gap-2 text-lg font-bold text-navy-900">
              <Star className="h-5 w-5 text-navy-500" /> {t("admin.reviews.title")}
            </h3>
            <Badge tone="neutral">{reviews.length} {t("admin.total")}</Badge>
          </div>
          <Card className="divide-y divide-navy-100">
            {reviews.length === 0 && (
              <div className="p-6 text-center text-navy-500">{t("admin.reviews.empty")}</div>
            )}
            {reviews.map((r) => (
              <div key={r.id} className="p-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-semibold text-navy-900">
                        {authorMap.get(r.authorId)?.name ?? "—"}
                      </span>
                      <span className="inline-flex items-center gap-0.5 text-sm font-bold text-navy-900">
                        {r.rating}
                        <Star className="h-3.5 w-3.5 fill-accent-600 text-accent-600" />
                      </span>
                      {r.hidden && <Badge tone="danger">{t("admin.reviews.hiddenBadge")}</Badge>}
                    </div>
                    <div className="text-xs text-navy-400">
                      {r.subjectType === "space"
                        ? spaceMap.get(r.subjectId)?.title ?? r.subjectId
                        : `${r.subjectType} · ${r.subjectId}`}{" "}
                      · {formatDate(r.createdAt)}
                    </div>
                  </div>
                  <form action={setReviewHiddenAction}>
                    <input type="hidden" name="reviewId" value={r.id} />
                    <input type="hidden" name="state" value={r.hidden ? "show" : "hide"} />
                    {r.hidden ? (
                      <button
                        type="submit"
                        className="inline-flex items-center gap-1 rounded-lg bg-go-500 px-3 py-1.5 text-xs font-semibold text-navy-900 hover:bg-go-400"
                      >
                        <Eye className="h-3.5 w-3.5" /> {t("admin.reviews.unhide")}
                      </button>
                    ) : (
                      <button
                        type="submit"
                        className="inline-flex items-center gap-1 rounded-lg border border-red-200 bg-white px-3 py-1.5 text-xs font-semibold text-red-600 hover:bg-red-50"
                      >
                        <EyeOff className="h-3.5 w-3.5" /> {t("admin.reviews.hide")}
                      </button>
                    )}
                  </form>
                </div>
                {r.comment && (
                  <p
                    className={`mt-2 text-sm ${r.hidden ? "text-navy-400 line-through" : "text-navy-700"}`}
                  >
                    {r.comment}
                  </p>
                )}
              </div>
            ))}
          </Card>
        </section>
      </div>
    </PortalShell>
  );
}
