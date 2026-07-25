import Link from "next/link";
import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { Car, CheckCircle2, Clock, Radio } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PortalShell } from "@/components/portal/shell";
import { StatusBadge } from "@/components/portal/status";
import { adminNav } from "@/components/portal/navs";
import { requireRole } from "@/lib/auth";
import { getOperatorJobs, getOperatorStatus } from "@/lib/services/transfer-operator";
import { getI18n } from "@/lib/i18n";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Transfer operator",
  path: "/admin/operator",
  noindex: true,
});

function Metric({ value, label }: { value: string; label: string }) {
  return (
    <div>
      <div className="font-bold text-navy-900">{value}</div>
      <div className="text-xs text-navy-400">{label}</div>
    </div>
  );
}

export default async function AdminOperatorPage() {
  const user = await requireRole("admin");
  // Support agents live on the ticket queue — nothing else here is theirs.
  if (user.adminScope === "support") redirect("/admin/support");
  const { t } = await getI18n();

  // Transfer is fulfilled by an independent licensed operator, integrated by API.
  const operator = getOperatorStatus();
  const operatorJobs = getOperatorJobs();

  return (
    <PortalShell user={user} nav={adminNav} title="admin.section.operator">
      <div className="mx-auto max-w-4xl space-y-6">
        <Link href="/admin" className="text-sm font-semibold text-brand-700">
          ← {t("common.backToDash")}
        </Link>

        <section id="operator">
          <Card className="p-5">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-50 text-brand-700">
                  <Radio className="h-5 w-5" />
                </span>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-navy-900">{operator.name}</span>
                    <Badge tone={operator.connected ? "go" : "danger"}>
                      {operator.connected && (
                        <span className="relative flex h-2 w-2">
                          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-go-500 opacity-75" />
                          <span className="relative inline-flex h-2 w-2 rounded-full bg-go-500" />
                        </span>
                      )}
                      {operator.connected ? t("admin.connected") : t("admin.offline")}
                    </Badge>
                  </div>
                  <p className="text-sm text-navy-500">
                    {t("admin.operatorSubtitle")}
                  </p>
                </div>
              </div>
              <div className="flex gap-6 text-sm">
                <Metric value={String(operator.activeJobs)} label={t("admin.metric.activeJobs")} />
                <Metric value={`${operator.slaMinutes}m`} label={t("admin.metric.pickupSla")} />
                <Metric value={`${operator.rating.toFixed(1)}★`} label={t("admin.metric.rating")} />
                <Metric value={String(operator.handoversConfirmed)} label={t("admin.metric.handovers")} />
              </div>
            </div>
          </Card>

          <div className="mt-4">
            <h4 className="mb-2 text-sm font-bold text-navy-700">{t("admin.liveJobs")}</h4>
            <Card className="divide-y divide-navy-100">
              {operatorJobs.length === 0 && (
                <div className="p-6 text-center text-navy-500">{t("admin.noJobs")}</div>
              )}
              {operatorJobs.map((job) => (
                <div key={job.id} className="flex flex-wrap items-center justify-between gap-3 p-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-sm font-bold text-navy-900">{job.bookingRef}</span>
                      <StatusBadge status={job.status} />
                      {job.handoverConfirmed && (
                        <Badge tone="go">
                          <CheckCircle2 className="h-3 w-3" /> {t("admin.handover")}
                        </Badge>
                      )}
                    </div>
                    <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-0.5 text-sm text-navy-500">
                      <span className="inline-flex items-center gap-1">
                        <Car className="h-3.5 w-3.5" /> {job.driverName}
                      </span>
                      <span className="hidden text-navy-400 sm:inline">{job.vehicle}</span>
                    </div>
                  </div>
                  <div className="text-right text-sm">
                    {job.etaMinutes !== null ? (
                      <span className="inline-flex items-center gap-1 font-semibold text-navy-800">
                        <Clock className="h-3.5 w-3.5" /> {t("admin.eta")} {job.etaMinutes} {t("admin.min")}
                      </span>
                    ) : (
                      <span className="text-navy-400">—</span>
                    )}
                  </div>
                </div>
              ))}
            </Card>
            <p className="mt-2 text-xs text-navy-400">
              {t("admin.operatorNote")}
            </p>
          </div>
        </section>
      </div>
    </PortalShell>
  );
}
