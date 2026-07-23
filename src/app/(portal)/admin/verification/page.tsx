import Link from "next/link";
import type { Metadata } from "next";
import {
  ArrowUpRight,
  CalendarCheck,
  CheckCircle2,
  Download,
  FileText,
  Mail,
  Phone,
  Warehouse,
  XCircle,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { PortalShell } from "@/components/portal/shell";
import { StatusBadge } from "@/components/portal/status";
import { adminNav } from "@/components/portal/navs";
import { trustBand } from "@/lib/trust";
import { hostTrustScore } from "@/lib/admin-insights";
import { requireRole } from "@/lib/auth";
import { reviewVerificationAction } from "@/lib/booking-actions";
import { getHostsByIds, listAllHosts, listAllSpaces } from "@/lib/data/hosts";
import { listPendingVerificationsLive } from "@/lib/data/verifications";
import { getUsersByIds } from "@/lib/data/users";
import { formatDate } from "@/lib/utils";
import { getI18n } from "@/lib/i18n";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Host verification",
  path: "/admin/verification",
  noindex: true,
});

export default async function AdminVerificationPage() {
  const user = await requireRole("admin");
  const { t } = await getI18n();

  const pending = await listPendingVerificationsLive();
  const spaces = await listAllSpaces();
  const spaceHostMap = await getHostsByIds([
    ...spaces.map((s) => s.hostId),
    ...pending.filter((v) => v.subjectType === "host").map((v) => v.subjectId),
  ]);
  const hostUserMap = await getUsersByIds(
    [...spaceHostMap.values()].map((h) => h.userId)
  );
  const trustRows = (await listAllHosts())
    .map((h) => ({ name: h.displayName, type: "Host", score: hostTrustScore(h) }))
    .sort((a, b) => b.score.score - a.score.score);

  return (
    <PortalShell user={user} nav={adminNav} title="admin.section.verificationQueue">
      <div className="mx-auto max-w-4xl space-y-8">
        <Link href="/admin" className="text-sm font-semibold text-brand-600">
          ← {t("common.backToDash")}
        </Link>

        {/* Host verification queue (driver/vehicle/insurance compliance sits with the operator) */}
        <section id="verification">
          <div className="mb-3 flex items-center gap-2">
            <h3 className="text-lg font-bold text-navy-900">{t("admin.section.verificationQueue")}</h3>
            <Badge tone={pending.length > 0 ? "accent" : "neutral"}>{pending.length}</Badge>
            <a
              href="/admin/export?type=verifications"
              className={buttonVariants({ variant: "outline", size: "sm", className: "ms-auto" })}
            >
              <Download className="h-4 w-4" /> {t("admin.exportCsv")}
            </a>
          </div>
          {pending.length === 0 ? (
            <Card className="p-6 text-center text-navy-500">{t("admin.queueClear")}</Card>
          ) : (
            <div className="space-y-4">
              {pending.map((v) => {
                const vHost = v.subjectType === "host" ? spaceHostMap.get(v.subjectId) : undefined;
                const vUser = vHost ? hostUserMap.get(vHost.userId) : undefined;
                const vListings = vHost ? spaces.filter((s) => s.hostId === vHost.id) : [];
                return (
                  <Card key={v.id} className="p-5">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="font-bold text-navy-900">
                            {vHost?.displayName ?? v.subjectId}
                          </span>
                          <Badge tone="neutral">{v.subjectType}</Badge>
                          <StatusBadge status={v.status} />
                        </div>
                        <p className="mt-0.5 text-sm text-navy-500">
                          {t("admin.submitted")} {v.submittedAt ? formatDate(v.submittedAt) : "—"}
                        </p>

                        {/* Who the admin is actually approving */}
                        {vUser && (
                          <div className="mt-3 grid gap-x-6 gap-y-1.5 text-sm text-navy-700 sm:grid-cols-2">
                            <span className="inline-flex items-center gap-1.5 break-all">
                              <Mail className="h-3.5 w-3.5 shrink-0 text-navy-400" /> {vUser.email}
                            </span>
                            <span className="inline-flex items-center gap-1.5">
                              <Phone className="h-3.5 w-3.5 shrink-0 text-navy-400" />{" "}
                              {vUser.phone ?? "—"}
                            </span>
                            <span className="inline-flex items-center gap-1.5">
                              <CalendarCheck className="h-3.5 w-3.5 shrink-0 text-navy-400" />{" "}
                              {t("admin.users.joined")} {formatDate(vUser.createdAt)}
                            </span>
                            <span className="inline-flex items-center gap-1.5">
                              <Warehouse className="h-3.5 w-3.5 shrink-0 text-navy-400" />{" "}
                              {vListings.length} {t("admin.verif.listings")}
                            </span>
                          </div>
                        )}
                        {vListings.length > 0 && (
                          <ul className="mt-2.5 flex flex-wrap gap-2">
                            {vListings.slice(0, 3).map((s) => (
                              <li key={s.id}>
                                <Link
                                  href={`/app/space/${s.id}`}
                                  className="inline-flex items-center gap-1 rounded-lg border border-navy-200 bg-white px-2.5 py-1 text-xs font-semibold text-navy-600 hover:bg-navy-50"
                                >
                                  {s.title} <ArrowUpRight className="h-3 w-3" />
                                </Link>
                              </li>
                            ))}
                          </ul>
                        )}
                        {v.notes && (
                          <p className="mt-3 rounded-lg bg-navy-50 px-3 py-2 text-sm text-navy-700">
                            {v.notes}
                          </p>
                        )}

                        {/* Submitted documents — open from the private KYC store */}
                        <ul className="mt-3 flex flex-wrap gap-2">
                          {v.documents.map((d) => (
                            <li key={d.id}>
                              <a
                                href={`/admin/kyc?ref=${encodeURIComponent(d.fileRef)}`}
                                target="_blank"
                                rel="noreferrer"
                                title={`${t("admin.verif.uploaded")} ${formatDate(d.uploadedAt)}`}
                                className="inline-flex items-center gap-1.5 rounded-lg border border-brand-200 bg-brand-50 px-3 py-1.5 text-xs font-semibold text-brand-700 transition-colors hover:bg-brand-100"
                              >
                                <FileText className="h-3.5 w-3.5" /> {d.label}
                                <ArrowUpRight className="h-3 w-3" />
                              </a>
                            </li>
                          ))}
                        </ul>
                        <p className="mt-2 text-xs text-navy-400">{t("admin.verif.docsNote")}</p>
                      </div>
                      <form action={reviewVerificationAction} className="flex gap-2">
                        <input type="hidden" name="verificationId" value={v.id} />
                        <button
                          type="submit"
                          name="decision"
                          value="approved"
                          className="inline-flex items-center gap-1.5 rounded-xl bg-go-500 px-4 py-2 text-sm font-semibold text-white hover:bg-go-600"
                        >
                          <CheckCircle2 className="h-4 w-4" /> {t("admin.approve")}
                        </button>
                        <button
                          type="submit"
                          name="decision"
                          value="rejected"
                          className="inline-flex items-center gap-1.5 rounded-xl border border-red-200 bg-white px-4 py-2 text-sm font-semibold text-red-600 hover:bg-red-50"
                        >
                          <XCircle className="h-4 w-4" /> {t("admin.reject")}
                        </button>
                      </form>
                    </div>
                  </Card>
                );
              })}
            </div>
          )}
        </section>

        {/* Trust scores — quality signal for the hosts being reviewed */}
        <section id="trust">
          <h3 className="mb-3 text-lg font-bold text-navy-900">{t("admin.section.trustScores")}</h3>
          <Card className="divide-y divide-navy-100">
            {trustRows.map((row) => {
              const band = trustBand(row.score.score);
              return (
                <div key={row.type + row.name} className="flex items-center justify-between p-4">
                  <div>
                    <div className="font-semibold text-navy-900">{row.name}</div>
                    <div className="text-xs text-navy-400">{row.type === "Host" ? t("admin.hostType") : row.type}</div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="h-2 w-24 overflow-hidden rounded-full bg-navy-100">
                      <div
                        className="h-full rounded-full bg-go-500"
                        style={{ width: `${row.score.score}%` }}
                      />
                    </div>
                    <span className="w-8 text-right font-bold text-navy-900">{row.score.score}</span>
                    <Badge tone={band.tone}>{band.label}</Badge>
                  </div>
                </div>
              );
            })}
          </Card>
        </section>
      </div>
    </PortalShell>
  );
}
