import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import type { Metadata } from "next";
import { Card } from "@/components/ui/card";
import { PortalShell } from "@/components/portal/shell";
import { travellerNav } from "@/components/portal/navs";
import { Checkout } from "@/components/portal/checkout";
import { Photo } from "@/components/common/photo";
import { getCurrentUser, rolePath } from "@/lib/auth";
import { getAirport } from "@/lib/data/store";
import { getSpaceById } from "@/lib/data/hosts";
import { getPlatformSettings } from "@/lib/data/settings";
import { getI18n } from "@/lib/i18n";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({ title: "Checkout", path: "/app/book", noindex: true });

function isoDay(offset: number) {
  const d = new Date();
  d.setDate(d.getDate() + offset);
  return d.toISOString().slice(0, 10);
}

export default async function BookPage({
  params,
  searchParams,
}: {
  params: Promise<{ spaceId: string }>;
  searchParams: Promise<{
    from?: string;
    to?: string;
    ev?: string;
    transfer?: string;
    promo?: string;
    guest?: string;
  }>;
}) {
  // Signed out is fine here: the account is made from the checkout details.
  // Hosts and admins still get bounced to their own side of the app.
  const user = await getCurrentUser();
  if (user && user.role !== "traveller") redirect(rolePath(user.role));
  const { t } = await getI18n();
  const { spaceId } = await params;
  const sp = await searchParams;
  const space = await getSpaceById(spaceId);
  if (!space) notFound();
  // Checkout is only for live listings; paused/pending spaces bounce to search.
  if (space.status !== "live") redirect(`/app/search?airport=${space.airportSlug}`);
  const airport = getAirport(space.airportSlug);
  const currency = airport?.country === "IE" ? "EUR" : "GBP";
  const cfg = await getPlatformSettings();
  const priceCfg = {
    serviceFee: cfg.serviceFee,
    parkingCommissionBps: cfg.parkingCommissionBps,
    transferCommissionBps: cfg.transferCommissionBps,
  };

  const body = (
      <div className="mx-auto max-w-5xl space-y-5">
        <Link href={`/app/space/${space.id}`} className="text-sm font-semibold text-brand-600">
          ← {t("app.space.backToSpace")}
        </Link>

        <Card className="flex items-center gap-4 p-4">
          <Photo token={space.photos[0] ?? "drive-1"} className="h-16 w-24" />
          <div>
            <h2 className="font-bold text-navy-900">{space.title}</h2>
            <p className="text-sm text-navy-500">
              {space.approxArea} · {airport?.name}
            </p>
          </div>
        </Card>

        <Checkout
          space={space}
          currency={currency}
          startDate={sp.from || isoDay(2)}
          endDate={sp.to || isoDay(7)}
          initialTransfer={sp.transfer === "1"}
          initialEv={sp.ev === "1"}
          allowTransfer={!airport?.kind || airport.kind === "airport"}
          promoInvalid={sp.promo === "invalid"}
          priceCfg={priceCfg}
          guest={user ? null : { error: sp.guest ?? null }}
        />
      </div>
  );

  if (!user) {
    return (
      <main className="min-h-dvh bg-navy-50/40 px-4 py-8">
        <div className="mx-auto mb-6 max-w-5xl">
          <Link href="/" className="text-xl font-extrabold tracking-tight text-navy-900">
            Park<span className="text-brand-600">Go</span>
          </Link>
        </div>
        {body}
      </main>
    );
  }

  return (
    <PortalShell user={user} nav={travellerNav} title="app.checkout.title">
      {body}
    </PortalShell>
  );
}
