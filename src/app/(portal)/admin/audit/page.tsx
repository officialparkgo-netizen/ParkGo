import Link from "next/link";
import type { Metadata } from "next";
import { ScrollText } from "lucide-react";
import { Card } from "@/components/ui/card";
import { PortalShell } from "@/components/portal/shell";
import { adminNav } from "@/components/portal/navs";
import { requireRole } from "@/lib/auth";
import { buildAuditFeed } from "@/lib/admin-insights";
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
  const user = await requireRole("admin");
  const { t } = await getI18n();

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
        <Link href="/admin" className="text-sm font-semibold text-brand-600">
          ← {t("common.backToDash")}
        </Link>

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
