import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { Card } from "@/components/ui/card";
import { PortalShell } from "@/components/portal/shell";
import { travellerNav } from "@/components/portal/navs";
import { Checkout } from "@/components/portal/checkout";
import { Photo } from "@/components/common/photo";
import { requireRole } from "@/lib/auth";
import { getAirport } from "@/lib/data/store";
import { getSpaceById } from "@/lib/data/hosts";
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
  searchParams: Promise<{ from?: string; to?: string; ev?: string; transfer?: string }>;
}) {
  const user = await requireRole("traveller");
  const { t } = await getI18n();
  const { spaceId } = await params;
  const sp = await searchParams;
  const space = await getSpaceById(spaceId);
  if (!space) notFound();
  const airport = getAirport(space.airportSlug);
  const currency = airport?.country === "IE" ? "EUR" : "GBP";

  return (
    <PortalShell user={user} nav={travellerNav} title="app.checkout.title">
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
        />
      </div>
    </PortalShell>
  );
}
