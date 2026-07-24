import Link from "next/link";
import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { CheckCircle2, MessageSquareReply, Star, XCircle } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PortalShell } from "@/components/portal/shell";
import { hostNav } from "@/components/portal/navs";
import { requireRole } from "@/lib/auth";
import { getHostForUser, getSpacesForHost } from "@/lib/data/hosts";
import { listReviewsForHostSpaces } from "@/lib/data/reviews";
import { getUsersByIds } from "@/lib/data/users";
import { replyReviewAction } from "@/lib/host-suite-actions";
import { formatDate } from "@/lib/utils";
import { getI18n } from "@/lib/i18n";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Reviews",
  path: "/host/reviews",
  noindex: true,
});

/** The host's reviews across all their spaces, with public replies. */
export default async function HostReviewsPage({
  searchParams,
}: {
  searchParams: Promise<{ replied?: string }>;
}) {
  const user = await requireRole("host");
  if (user.cohostHostId) redirect("/host/today");
  const { t } = await getI18n();
  const { replied } = await searchParams;
  const host = await getHostForUser(user);
  const spaces = host ? await getSpacesForHost(host.id) : [];
  const spaceMap = new Map(spaces.map((s) => [s.id, s]));
  const reviews = await listReviewsForHostSpaces(spaces.map((s) => s.id));
  const authorMap = await getUsersByIds(reviews.map((r) => r.authorId));

  return (
    <PortalShell user={user} nav={hostNav} title="host.reviews.title">
      <div className="mx-auto max-w-3xl space-y-5">
        <Link href="/host" className="text-sm font-semibold text-brand-600">
          ← {t("common.backToDash")}
        </Link>

        {replied === "1" && (
          <div className="flex items-center gap-2 rounded-2xl border border-go-200 bg-go-50 px-4 py-3 font-semibold text-go-700">
            <CheckCircle2 className="h-5 w-5" /> {t("host.reviews.replied")}
          </div>
        )}
        {replied === "error" && (
          <div className="flex items-center gap-2 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 font-semibold text-red-700">
            <XCircle className="h-5 w-5" /> {t("host.reviews.replyError")}
          </div>
        )}

        <div className="flex items-center gap-2">
          <h2 className="flex items-center gap-2 text-xl font-extrabold text-navy-900">
            <Star className="h-5 w-5 text-accent-400" /> {t("host.reviews.title")}
          </h2>
          <Badge tone="neutral">{reviews.length}</Badge>
        </div>
        <p className="text-sm text-navy-500">{t("host.reviews.sub")}</p>

        {reviews.length === 0 ? (
          <Card className="p-8 text-center text-sm text-navy-500">
            {t("host.reviews.empty")}
          </Card>
        ) : (
          <div className="space-y-4">
            {reviews.map((r) => (
              <Card key={r.id} className="p-5">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-semibold text-navy-900">
                    {authorMap.get(r.authorId)?.name ?? "—"}
                  </span>
                  <span className="inline-flex items-center gap-0.5 text-sm font-bold text-navy-900">
                    {r.rating}
                    <Star className="h-3.5 w-3.5 fill-accent-400 text-accent-400" />
                  </span>
                  <span className="text-xs text-navy-400">
                    {spaceMap.get(r.subjectId)?.title ?? ""} · {formatDate(r.createdAt)}
                  </span>
                </div>
                {r.comment && <p className="mt-2 text-sm text-navy-700">{r.comment}</p>}

                {r.reply ? (
                  <div className="mt-3 rounded-xl bg-navy-50 px-3.5 py-2.5">
                    <p className="text-xs font-bold text-navy-700">
                      {t("host.reviews.yourReply")}
                    </p>
                    <p className="text-sm text-navy-600">{r.reply}</p>
                  </div>
                ) : (
                  <form
                    action={replyReviewAction}
                    className="mt-3 flex flex-wrap items-center gap-2 border-t border-navy-100 pt-3"
                  >
                    <input type="hidden" name="reviewId" value={r.id} />
                    <input
                      name="reply"
                      required
                      maxLength={600}
                      placeholder={t("host.reviews.replyPh")}
                      className="min-w-0 flex-1 rounded-xl border border-navy-200 bg-white px-3.5 py-2.5 text-sm text-navy-900 placeholder:text-navy-300 focus:border-brand-400 focus:outline-none"
                    />
                    <button
                      type="submit"
                      className="inline-flex items-center gap-1.5 rounded-xl bg-navy-900 px-4 py-2.5 text-sm font-semibold text-white hover:bg-navy-700"
                    >
                      <MessageSquareReply className="h-4 w-4" /> {t("host.reviews.reply")}
                    </button>
                  </form>
                )}
              </Card>
            ))}
          </div>
        )}
        <p className="text-xs text-navy-400">{t("host.reviews.note")}</p>
      </div>
    </PortalShell>
  );
}
