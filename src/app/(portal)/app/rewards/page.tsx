import type { Metadata } from "next";
import { Gift, Sparkles, Ticket, Wallet } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PortalShell } from "@/components/portal/shell";
import { travellerNav } from "@/components/portal/navs";
import { BuyGiftCard, BuyTripPass } from "@/components/portal/rewards-forms";
import { requireRole } from "@/lib/auth";
import { completedTripCount, listGiftCardsBought, listTripPasses } from "@/lib/data/rewards";
import { passDaysLeft, passExpired, passOffers, tierFor, tripsToNextTier } from "@/lib/rewards";
import { cheapestDayRateAt } from "@/lib/data/hosts";
import { formatDate, formatMoney } from "@/lib/utils";
import { getI18n } from "@/lib/i18n";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Rewards",
  path: "/app/rewards",
  noindex: true,
});

/**
 * Everything the traveller has earned or paid for in advance, in one place:
 * their tier, their credit, gift cards and trip passes.
 *
 * The tier is derived from completed trips on every load rather than cached —
 * a number that only ever goes up because nothing recalculates it is how a
 * loyalty programme ends up giving discounts nobody earned.
 */
export default async function RewardsPage({
  searchParams,
}: {
  searchParams: Promise<{ bought?: string; code?: string }>;
}) {
  const user = await requireRole("traveller");
  const { t } = await getI18n();
  const sp = await searchParams;

  const [trips, cards, passes, dayRate] = await Promise.all([
    completedTripCount(user),
    listGiftCardsBought(user.id).catch(() => []),
    listTripPasses(user.id).catch(() => []),
    cheapestDayRateAt().catch(() => 1200),
  ]);
  const tier = tierFor(trips);
  const next = tripsToNextTier(trips);
  const offers = passOffers(dayRate);
  const livePasses = passes.filter((p) => !passExpired(p) && passDaysLeft(p) > 0);

  return (
    <PortalShell user={user} nav={travellerNav} title="guest.rewards.title">
      <div className="mx-auto max-w-4xl space-y-6">
        <p className="text-sm text-navy-500">{t("guest.rewards.sub")}</p>

        {sp.bought === "failed" && (
          <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 font-semibold text-red-700">
            {t("guest.rewards.failed")}
          </div>
        )}
        {sp.bought === "gift" && sp.code && (
          <div className="rounded-2xl border border-go-200 bg-go-50 px-4 py-3 font-semibold text-go-700">
            {t("guest.rewards.giftBought")} · <span className="tracking-widest">{sp.code}</span>
          </div>
        )}

        {/* ------------------------------------------------------- tier --- */}
        <Card className="p-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="flex items-center gap-2 text-lg font-bold text-navy-900">
              <Sparkles className="h-5 w-5 text-brand-700" /> {t("guest.rewards.tier")}
            </h2>
            {tier.discountBps > 0 ? (
              <Badge tone="brand">{tier.label}</Badge>
            ) : (
              <Badge tone="neutral">{trips} {t("guest.rewards.trips")}</Badge>
            )}
          </div>
          <p className="mt-2 text-sm text-navy-600">
            {tier.discountBps > 0 ? (
              <>
                <strong className="text-navy-900">
                  {(tier.discountBps / 100).toFixed(0)}%
                </strong>{" "}
                {t("guest.rewards.tierOn")}
              </>
            ) : (
              t("guest.rewards.tierNone")
            )}
          </p>
          {next && (
            <div className="mt-3">
              <div className="h-2 overflow-hidden rounded-full bg-navy-100">
                <div
                  className="h-full rounded-full bg-brand-500"
                  style={{ width: `${Math.round((trips / next.tier.from) * 100)}%` }}
                />
              </div>
              <p className="mt-1.5 text-xs font-semibold text-navy-500">
                {next.need} {t("guest.rewards.toNext")} {next.tier.label}
              </p>
            </div>
          )}
        </Card>

        {/* ----------------------------------------------------- credit --- */}
        <Card className="flex items-center justify-between gap-4 p-5">
          <div>
            <h2 className="flex items-center gap-2 font-bold text-navy-900">
              <Wallet className="h-5 w-5 text-brand-700" /> {t("guest.rewards.credit")}
            </h2>
            <p className="mt-1 text-sm text-navy-500">{t("guest.rewards.creditSub")}</p>
          </div>
          <div className="shrink-0 text-2xl font-extrabold text-navy-900">
            {formatMoney(user.creditPence ?? 0, "GBP")}
          </div>
        </Card>

        {/* ------------------------------------------------- trip passes --- */}
        <section>
          <h2 className="flex items-center gap-2 text-lg font-bold text-navy-900">
            <Ticket className="h-5 w-5 text-brand-700" /> {t("guest.rewards.passTitle")}
          </h2>
          <p className="mt-1 text-sm text-navy-500">{t("guest.rewards.passSub")}</p>

          {livePasses.length > 0 && (
            <div className="mt-3 space-y-2">
              {livePasses.map((p) => (
                <Card key={p.id} className="flex items-center justify-between gap-3 p-4">
                  <div>
                    <p className="font-bold text-navy-900">
                      {passDaysLeft(p)} / {p.daysTotal} {t("guest.rewards.passDays")}
                    </p>
                    <p className="text-xs text-navy-500">
                      {t("guest.rewards.passExpires")} {formatDate(p.expiresAt)}
                    </p>
                  </div>
                  <div className="h-2 w-28 overflow-hidden rounded-full bg-navy-100">
                    <div
                      className="h-full rounded-full bg-brand-500"
                      style={{ width: `${Math.round((passDaysLeft(p) / p.daysTotal) * 100)}%` }}
                    />
                  </div>
                </Card>
              ))}
            </div>
          )}

          <BuyTripPass offers={offers} />
        </section>

        {/* -------------------------------------------------- gift cards --- */}
        <section>
          <h2 className="flex items-center gap-2 text-lg font-bold text-navy-900">
            <Gift className="h-5 w-5 text-brand-700" /> {t("guest.rewards.giftTitle")}
          </h2>
          <p className="mt-1 text-sm text-navy-500">{t("guest.rewards.giftSub")}</p>

          <BuyGiftCard />

          {cards.length > 0 && (
            <>
              <h3 className="mt-5 text-sm font-bold text-navy-700">
                {t("guest.rewards.giftMine")}
              </h3>
              <div className="mt-2 space-y-2">
                {cards.map((c) => (
                  <Card key={c.code} className="flex items-center justify-between gap-3 p-4">
                    <div>
                      <p className="font-mono text-sm font-bold tracking-widest text-navy-900">
                        {c.code}
                      </p>
                      <p className="text-xs text-navy-500">
                        {c.recipientEmail ?? formatDate(c.createdAt)}
                      </p>
                    </div>
                    <p className="shrink-0 text-sm font-bold text-navy-900">
                      {formatMoney(c.balancePence, "GBP")}{" "}
                      <span className="font-normal text-navy-400">
                        {t("guest.rewards.giftBalance")} {formatMoney(c.initialPence, "GBP")}
                      </span>
                    </p>
                  </Card>
                ))}
              </div>
            </>
          )}
        </section>
      </div>
    </PortalShell>
  );
}
