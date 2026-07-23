import Link from "next/link";
import type { Metadata } from "next";
import { CheckCircle2, PlusCircle, Tag, XCircle } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/field";
import { PortalShell } from "@/components/portal/shell";
import { adminNav } from "@/components/portal/navs";
import { requireRole } from "@/lib/auth";
import { createPromoAction, setPromoActiveAction } from "@/lib/admin-suite-actions";
import { listPromos } from "@/lib/data/promos";
import { formatDate, formatMoney } from "@/lib/utils";
import { getI18n } from "@/lib/i18n";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Promo codes",
  path: "/admin/promos",
  noindex: true,
});

export default async function AdminPromosPage({
  searchParams,
}: {
  searchParams: Promise<{ created?: string; createerror?: string }>;
}) {
  const user = await requireRole("admin");
  const { t } = await getI18n();
  const { created, createerror } = await searchParams;
  const promos = await listPromos();

  return (
    <PortalShell user={user} nav={adminNav} title="admin.promos.title">
      <div className="mx-auto max-w-4xl space-y-6">
        <Link href="/admin" className="text-sm font-semibold text-brand-600">
          ← {t("common.backToDash")}
        </Link>

        {created && (
          <div className="flex items-center gap-2 rounded-2xl border border-go-200 bg-go-50 px-4 py-3 font-semibold text-go-700">
            <CheckCircle2 className="h-5 w-5" /> {t("admin.promos.created")}
          </div>
        )}
        {createerror && (
          <div className="flex items-center gap-2 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 font-semibold text-red-600">
            <XCircle className="h-5 w-5" /> {t("admin.promos.createError")}
          </div>
        )}

        {/* Create */}
        <Card className="p-5">
          <h3 className="mb-1 flex items-center gap-2 text-lg font-bold text-navy-900">
            <PlusCircle className="h-5 w-5 text-navy-500" /> {t("admin.promos.new")}
          </h3>
          <p className="mb-4 text-sm text-navy-500">{t("admin.promos.note")}</p>
          <form
            action={createPromoAction}
            className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5 lg:items-end"
          >
            <div>
              <Label htmlFor="promo-code">{t("admin.promos.code")}</Label>
              <Input
                id="promo-code"
                name="code"
                required
                placeholder="SUMMER20"
                className="uppercase"
              />
            </div>
            <div>
              <Label htmlFor="promo-kind">{t("admin.promos.kind")}</Label>
              <select
                id="promo-kind"
                name="kind"
                className="w-full rounded-xl border border-navy-200 bg-white px-3.5 py-3 text-sm text-navy-900 focus:border-brand-400 focus:outline-none"
              >
                <option value="percent">{t("admin.promos.percent")}</option>
                <option value="fixed">{t("admin.promos.fixed")}</option>
              </select>
            </div>
            <div>
              <Label htmlFor="promo-value">{t("admin.promos.value")}</Label>
              <Input
                id="promo-value"
                name="value"
                type="number"
                min="1"
                step="1"
                required
                placeholder="10"
              />
            </div>
            <div>
              <Label htmlFor="promo-max">{t("admin.promos.maxUses")}</Label>
              <Input id="promo-max" name="maxUses" type="number" min="1" step="1" />
            </div>
            <div>
              <Label htmlFor="promo-exp">{t("admin.promos.expires")}</Label>
              <Input id="promo-exp" name="expiresAt" type="date" />
            </div>
            <Button type="submit" className="sm:col-span-2 lg:col-span-5 lg:w-auto lg:justify-self-start">
              {t("admin.promos.new")}
            </Button>
          </form>
        </Card>

        {/* Existing codes */}
        <section id="promos">
          <div className="mb-3 flex items-center gap-2">
            <h3 className="flex items-center gap-2 text-lg font-bold text-navy-900">
              <Tag className="h-5 w-5 text-navy-500" /> {t("admin.promos.title")}
            </h3>
            <Badge tone="neutral">{promos.length} {t("admin.total")}</Badge>
          </div>
          <Card className="divide-y divide-navy-100">
            {promos.map((p) => (
              <div key={p.id} className="flex flex-wrap items-center justify-between gap-3 p-4">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-mono text-sm font-bold text-navy-900">{p.code}</span>
                    <Badge tone={p.active ? "go" : "neutral"}>
                      {p.active ? t("admin.connected") : t("admin.offline")}
                    </Badge>
                  </div>
                  <div className="mt-0.5 text-xs text-navy-400">
                    {p.kind === "percent" ? `${p.value}%` : formatMoney(p.value)} · {p.uses}
                    {p.maxUses ? `/${p.maxUses}` : ""} {t("admin.promos.uses")}
                    {p.expiresAt ? ` · ${formatDate(p.expiresAt)}` : ""}
                  </div>
                </div>
                <form action={setPromoActiveAction}>
                  <input type="hidden" name="promoId" value={p.id} />
                  <input type="hidden" name="state" value={p.active ? "off" : "on"} />
                  {p.active ? (
                    <button
                      type="submit"
                      className="inline-flex items-center gap-1 rounded-lg border border-red-200 bg-white px-3 py-1.5 text-xs font-semibold text-red-600 hover:bg-red-50"
                    >
                      <XCircle className="h-3.5 w-3.5" /> {t("admin.promos.off")}
                    </button>
                  ) : (
                    <button
                      type="submit"
                      className="inline-flex items-center gap-1 rounded-lg bg-go-500 px-3 py-1.5 text-xs font-semibold text-white hover:bg-go-600"
                    >
                      <CheckCircle2 className="h-3.5 w-3.5" /> {t("admin.promos.on")}
                    </button>
                  )}
                </form>
              </div>
            ))}
          </Card>
        </section>
      </div>
    </PortalShell>
  );
}
