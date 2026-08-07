import Link from "next/link";
import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { Download, ScrollText } from "lucide-react";
import { Card } from "@/components/ui/card";
import { buttonVariants } from "@/components/ui/button";
import { PortalShell } from "@/components/portal/shell";
import { adminNav } from "@/components/portal/navs";
import { requireRole, requireOpsAdmin } from "@/lib/auth";
import { buildAuditFeed } from "@/lib/admin-insights";
import { listAdminActions } from "@/lib/data/admin-actions";
import { listAllBookings } from "@/lib/data/bookings";
import { listAllVerificationsLive } from "@/lib/data/verifications";
import { listAllReviews } from "@/lib/data/reviews";
import { formatDateTime } from "@/lib/utils";
import { getI18n } from "@/lib/i18n";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Audit log",
  path: "/admin/audit",
  noindex: true,
});

export default async function AdminAuditPage() {
  const user = await requireOpsAdmin();
  // Support agents live on the ticket queue — nothing else here is theirs.
  if (user.adminScope === "support") redirect("/admin/support");
  const { t } = await getI18n();

  const adminActions = await listAdminActions(40);
  const audit = buildAuditFeed(
    {
      bookings: await listAllBookings(),
      verifications: await listAllVerificationsLive(),
      reviews: await listAllReviews(),
    },
    40
  );

  return (
    <PortalShell user={user} nav={adminNav} title="admin.section.audit">
      <div className="mx-auto max-w-4xl space-y-6">
        <Link href="/admin" className="text-sm font-semibold text-brand-700">
          ← {t("common.backToDash")}
        </Link>

        {/* Real admin actions — who did what */}
        <section id="admin-actions">
          <div className="mb-3 flex items-center gap-2">
            <h3 className="flex items-center gap-2 text-lg font-bold text-navy-900">
              <ScrollText className="h-5 w-5 text-navy-500" /> {t("admin.actions.title")}
            </h3>
            <a
              href="/admin/export?type=audit"
              className={buttonVariants({ variant: "outline", size: "sm", className: "ms-auto" })}
            >
              <Download className="h-4 w-4" /> {t("admin.exportCsv")}
            </a>
          </div>
          <Card className="divide-y divide-navy-100">
            {adminActions.length === 0 && (
              <div className="p-6 text-center text-sm text-navy-500">
                {t("admin.actions.empty")}
              </div>
            )}
            {adminActions.map((a) => (
              <div key={a.id} className="flex items-start justify-between gap-3 p-3.5 text-sm">
                <div className="min-w-0">
                  <span className="font-semibold text-navy-900">{a.adminName}</span>{" "}
                  {/* Action codes are data, not translations — marked so the
                      site-wide raw-key scanner knows to leave them alone. */}
                  <span className="font-mono text-xs text-navy-500" data-raw-code>
                    {a.action}
                  </span>
                  <span className="text-xs text-navy-400"> · {a.targetType} {a.targetId}</span>
                  {a.detail && <p className="truncate text-navy-600">{a.detail}</p>}
                </div>
                <span className="shrink-0 text-xs text-navy-400">{formatDateTime(a.createdAt)}</span>
              </div>
            ))}
          </Card>
        </section>

        <section id="audit">
          <h3 className="mb-3 flex items-center gap-2 text-lg font-bold text-navy-900">
            <ScrollText className="h-5 w-5 text-navy-500" /> {t("admin.section.audit")}
          </h3>
          <Card className="divide-y divide-navy-100">
            {audit.map((e, i) => (
              <div key={i} className="flex items-center justify-between p-3.5 text-sm">
                <span className="text-navy-700">{e.label}</span>
                <span className="text-xs text-navy-400">{formatDateTime(e.at)}</span>
              </div>
            ))}
          </Card>
          <p className="mt-2 text-xs text-navy-400">
            {t("admin.auditNote")}
          </p>
        </section>
      </div>
    </PortalShell>
  );
}
