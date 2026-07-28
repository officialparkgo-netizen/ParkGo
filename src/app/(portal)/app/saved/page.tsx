import Link from "next/link";
import type { Metadata } from "next";
import { BellRing, Heart, MapPin, Search, Trash2 } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { Photo } from "@/components/common/photo";
import { PortalShell } from "@/components/portal/shell";
import { travellerNav } from "@/components/portal/navs";
import { SaveSpaceButton } from "@/components/portal/save-space-button";
import { DateWatchList } from "@/components/portal/date-waitlist";
import { requireRole } from "@/lib/auth";
import { getAirport } from "@/lib/data/store";
import { getSpacesByIds } from "@/lib/data/hosts";
import { listAlertsForUser, listSavedSpaceIds } from "@/lib/data/saved";
import { deleteAlertAction } from "@/lib/guest-actions";
import { formatDate, formatMoneyShort } from "@/lib/utils";
import { getI18n } from "@/lib/i18n";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Saved spaces",
  path: "/app/saved",
  noindex: true,
});

/**
 * The traveller's own shortlist, plus anything they've asked to be told about.
 * Somebody who parks at the same airport every month should not have to run
 * the same search every month.
 */
export default async function SavedPage({
  searchParams,
}: {
  searchParams: Promise<{ watch?: string }>;
}) {
  const user = await requireRole("traveller");
  const { t } = await getI18n();
  const { watch } = await searchParams;

  const savedIds = await listSavedSpaceIds(user.id).catch(() => []);
  const spaceMap = await getSpacesByIds(savedIds);
  const spaces = savedIds.map((id) => spaceMap.get(id)).filter((s) => !!s);
  const alerts = await listAlertsForUser(user.id).catch(() => []);
  const open = alerts.filter((a) => !a.notifiedAt);
  const { listDateWatches } = await import("@/lib/data/travel-day");
  const watches = (await listDateWatches(user.id).catch(() => [])).filter(
    (w) => !w.notifiedAt
  );

  return (
    <PortalShell user={user} nav={travellerNav} title="app.saved.title">
      <div className="mx-auto max-w-4xl space-y-6">
        {watch === "on" && (
          <div className="rounded-2xl border border-go-200 bg-go-50 px-4 py-3 font-semibold text-go-700">
            {t("app.saved.watchOn")}
          </div>
        )}
        {watch === "error" && (
          <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 font-semibold text-red-700">
            {t("app.saved.watchError")}
          </div>
        )}

        <DateWatchList watches={watches} />

        <section>
          <div className="mb-3 flex items-center gap-2">
            <h2 className="flex items-center gap-2 text-lg font-bold text-navy-900">
              <Heart className="h-5 w-5 text-navy-500" /> {t("app.saved.title")}
            </h2>
            <Badge tone="neutral">{spaces.length}</Badge>
          </div>

          {spaces.length === 0 ? (
            <Card className="p-8 text-center" data-saved-empty>
              <p className="font-semibold text-navy-900">{t("app.saved.empty")}</p>
              <p className="mt-1 text-sm text-navy-500">{t("app.saved.emptyHint")}</p>
              <Link href="/app/search" className={buttonVariants({ className: "mt-4" })}>
                <Search className="h-4 w-4" /> {t("nav.findParking")}
              </Link>
            </Card>
          ) : (
            <div className="space-y-3" data-saved-list>
              {spaces.map((space) => {
                const airport = getAirport(space.airportSlug);
                const currency = airport?.country === "IE" ? "EUR" : "GBP";
                return (
                  <Card key={space.id} className="flex gap-4 overflow-hidden p-0">
                    <Link href={`/app/space/${space.id}`} className="w-32 shrink-0 sm:w-44">
                      <Photo
                        token={space.photos[0] ?? "drive-1"}
                        rounded="rounded-none"
                        className="h-full min-h-28 w-full"
                      />
                    </Link>
                    <div className="flex flex-1 items-center justify-between gap-3 py-3 pe-3">
                      <div className="min-w-0">
                        <Link
                          href={`/app/space/${space.id}`}
                          className="font-bold text-navy-900 hover:text-brand-700"
                        >
                          {space.title}
                        </Link>
                        <p className="mt-0.5 flex items-center gap-1 truncate text-sm text-navy-500">
                          <MapPin className="h-3.5 w-3.5 shrink-0" /> {space.approxArea}
                        </p>
                        <p className="mt-1 text-sm font-bold text-navy-900">
                          {formatMoneyShort(space.pricePerDay, currency)}
                          <span className="font-normal text-navy-400"> / {t("common.day")}</span>
                        </p>
                      </div>
                      <div className="flex shrink-0 items-center gap-2">
                        <SaveSpaceButton
                          spaceId={space.id}
                          saved
                          labels={{ save: t("app.saved.save"), saved: t("app.saved.saved") }}
                        />
                        <Link
                          href={`/app/space/${space.id}`}
                          className={buttonVariants({ size: "sm" })}
                        >
                          {t("app.saved.book")}
                        </Link>
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>
          )}
        </section>

        {/* Watches — "tell me when this frees up / drops below £X". */}
        <section>
          <div className="mb-3 flex items-center gap-2">
            <h2 className="flex items-center gap-2 text-lg font-bold text-navy-900">
              <BellRing className="h-5 w-5 text-navy-500" /> {t("app.saved.watches")}
            </h2>
            <Badge tone="neutral">{open.length}</Badge>
          </div>
          <p className="mb-3 text-sm text-navy-500">{t("app.saved.watchesSub")}</p>

          <Card className="divide-y divide-navy-100" data-watch-list>
            {open.length === 0 && (
              <p className="p-6 text-center text-navy-500">{t("app.saved.noWatches")}</p>
            )}
            {open.map((alert) => {
              const space = alert.spaceId ? spaceMap.get(alert.spaceId) : undefined;
              const airport = alert.airportSlug ? getAirport(alert.airportSlug) : undefined;
              return (
                <div key={alert.id} className="flex items-center justify-between gap-3 p-4">
                  <div className="min-w-0">
                    <p className="truncate font-semibold text-navy-900">
                      {space?.title ?? airport?.name ?? alert.airportSlug}
                    </p>
                    <p className="text-xs text-navy-400">
                      {alert.maxPricePence
                        ? `${t("app.saved.under")} ${formatMoneyShort(alert.maxPricePence)}`
                        : t("app.saved.anyPrice")}
                      {alert.startAt && alert.endAt
                        ? ` · ${formatDate(alert.startAt)} – ${formatDate(alert.endAt)}`
                        : ""}
                    </p>
                  </div>
                  <form action={deleteAlertAction}>
                    <input type="hidden" name="alertId" value={alert.id} />
                    <button
                      type="submit"
                      aria-label={t("app.saved.stopWatch")}
                      className="inline-flex items-center gap-1.5 rounded-lg border border-navy-200 px-2.5 py-1.5 text-xs font-semibold text-navy-600 hover:bg-navy-50"
                    >
                      <Trash2 className="h-3.5 w-3.5" /> {t("app.saved.stopWatch")}
                    </button>
                  </form>
                </div>
              );
            })}
          </Card>
        </section>
      </div>
    </PortalShell>
  );
}
