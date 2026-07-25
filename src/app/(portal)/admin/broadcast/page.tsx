import Link from "next/link";
import type { Metadata } from "next";
import { CheckCircle2, Info, Megaphone, XCircle } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/field";
import { PortalShell } from "@/components/portal/shell";
import { adminNav } from "@/components/portal/navs";
import { requireFinanceAdmin } from "@/lib/auth";
import { broadcastEmailAction } from "@/lib/admin-suite-actions";
import { listWaitlist } from "@/lib/data/waitlist";
import { listAllUsers } from "@/lib/data/users";
import { getI18n } from "@/lib/i18n";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Broadcast",
  path: "/admin/broadcast",
  noindex: true,
});

export default async function AdminBroadcastPage({
  searchParams,
}: {
  searchParams: Promise<{ sent?: string; total?: string; preview?: string; error?: string }>;
}) {
  const user = await requireFinanceAdmin();
  const { t } = await getI18n();
  const { sent, total, preview, error } = await searchParams;

  const waitlist = await listWaitlist().catch(() => []);
  const users = await listAllUsers();
  const hostCount = users.filter((u) => u.role === "host").length;
  const travellerCount = users.filter((u) => u.role === "traveller").length;

  return (
    <PortalShell user={user} nav={adminNav} title="admin.broadcast.title">
      <div className="mx-auto max-w-2xl space-y-6">
        <Link href="/admin" className="text-sm font-semibold text-brand-700">
          ← {t("common.backToDash")}
        </Link>

        {sent !== undefined && !preview && (
          <div className="flex items-center gap-2 rounded-2xl border border-go-200 bg-go-50 px-4 py-3 font-semibold text-go-700">
            <CheckCircle2 className="h-5 w-5" /> {t("admin.broadcast.sentBanner")} {sent}/{total}
          </div>
        )}
        {preview && (
          <div className="flex items-center gap-2 rounded-2xl border border-accent-200 bg-accent-50 px-4 py-3 font-semibold text-accent-500">
            <Info className="h-5 w-5" /> {t("admin.broadcast.preview")}
          </div>
        )}
        {error && (
          <div className="flex items-center gap-2 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 font-semibold text-red-600">
            <XCircle className="h-5 w-5" /> {t("admin.broadcast.error")}
          </div>
        )}

        <Card className="p-6">
          <h3 className="mb-1 flex items-center gap-2 text-lg font-bold text-navy-900">
            <Megaphone className="h-5 w-5 text-navy-500" /> {t("admin.broadcast.title")}
          </h3>
          <p className="mb-5 text-sm text-navy-500">{t("admin.broadcast.note")}</p>

          <form action={broadcastEmailAction} className="space-y-5">
            <div>
              <Label htmlFor="bc-aud">{t("admin.broadcast.audience")}</Label>
              <select
                id="bc-aud"
                name="audience"
                required
                className="w-full rounded-xl border border-navy-200 bg-white px-3.5 py-3 text-sm text-navy-900 focus:border-brand-400 focus:outline-none"
              >
                <option value="waitlist">
                  {t("admin.broadcast.aud.waitlist")} · {waitlist.length}
                </option>
                <option value="hosts">
                  {t("admin.broadcast.aud.hosts")} · {hostCount}
                </option>
                <option value="travellers">
                  {t("admin.broadcast.aud.travellers")} · {travellerCount}
                </option>
              </select>
            </div>
            <div>
              <Label htmlFor="bc-subject">{t("admin.broadcast.subject")}</Label>
              <Input id="bc-subject" name="subject" required maxLength={150} />
            </div>
            <div>
              <Label htmlFor="bc-message">{t("admin.broadcast.message")}</Label>
              <textarea
                id="bc-message"
                name="message"
                required
                rows={7}
                maxLength={5000}
                className="w-full rounded-xl border border-navy-200 bg-white px-3.5 py-3 text-sm text-navy-900 placeholder:text-navy-300 focus:border-brand-400 focus:outline-none"
              />
            </div>
            <Button type="submit" size="lg">
              <Megaphone className="h-4 w-4" /> {t("admin.broadcast.send")}
            </Button>
          </form>
        </Card>
      </div>
    </PortalShell>
  );
}
