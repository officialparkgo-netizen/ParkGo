import Link from "next/link";
import type { Metadata } from "next";
import {
  Banknote,
  Bell,
  CheckCircle2,
  Info,
  Mail,
  Megaphone,
  Send,
  Settings as SettingsIcon,
  XCircle,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/field";
import { PortalShell } from "@/components/portal/shell";
import { adminNav } from "@/components/portal/navs";
import { requireFinanceAdmin } from "@/lib/auth";
import { getPlatformSettings } from "@/lib/data/settings";
import {
  savePlatformSettingsAction,
  sendDigestNowAction,
} from "@/lib/admin-suite-actions";
import { isEmailConfigured } from "@/lib/email";
import { getI18n } from "@/lib/i18n";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Settings",
  path: "/admin/settings",
  noindex: true,
});

export default async function AdminSettingsPage({
  searchParams,
}: {
  searchParams: Promise<{ saved?: string; digest?: string }>;
}) {
  const user = await requireFinanceAdmin();
  const { t } = await getI18n();
  const { saved, digest } = await searchParams;
  const s = await getPlatformSettings();
  const emailOk = isEmailConfigured();

  return (
    <PortalShell user={user} nav={adminNav} title="admin.settings.title">
      <div className="mx-auto max-w-2xl space-y-6">
        <Link href="/admin" className="text-sm font-semibold text-brand-600">
          ← {t("common.backToDash")}
        </Link>

        {saved && (
          <div className="flex items-center gap-2 rounded-2xl border border-go-200 bg-go-50 px-4 py-3 font-semibold text-go-700">
            <CheckCircle2 className="h-5 w-5" /> {t("admin.settings.saved")}
          </div>
        )}
        {digest === "sent" && (
          <div className="flex items-center gap-2 rounded-2xl border border-go-200 bg-go-50 px-4 py-3 font-semibold text-go-700">
            <CheckCircle2 className="h-5 w-5" /> {t("admin.settings.digestSent")}
          </div>
        )}
        {digest === "preview" && (
          <div className="flex items-center gap-2 rounded-2xl border border-accent-200 bg-accent-50 px-4 py-3 font-semibold text-accent-500">
            <Info className="h-5 w-5" /> {t("admin.broadcast.preview")}
          </div>
        )}

        <form action={savePlatformSettingsAction} className="space-y-6">
          {/* Fees */}
          <Card className="p-6">
            <h3 className="mb-1 flex items-center gap-2 text-lg font-bold text-navy-900">
              <Banknote className="h-5 w-5 text-navy-500" /> {t("admin.settings.fees")}
            </h3>
            <p className="mb-4 text-sm text-navy-500">{t("admin.settings.feesSub")}</p>
            <div className="grid gap-4 sm:grid-cols-3">
              <div>
                <Label htmlFor="st-fee">{t("admin.settings.serviceFee")}</Label>
                <Input
                  id="st-fee"
                  name="serviceFee"
                  type="number"
                  step="0.01"
                  min="0"
                  defaultValue={(s.serviceFee / 100).toFixed(2)}
                />
              </div>
              <div>
                <Label htmlFor="st-park">{t("admin.settings.parkingPct")}</Label>
                <Input
                  id="st-park"
                  name="parkingPct"
                  type="number"
                  step="0.1"
                  min="0"
                  max="100"
                  defaultValue={(s.parkingCommissionBps / 100).toFixed(1)}
                />
              </div>
              <div>
                <Label htmlFor="st-trans">{t("admin.settings.transferPct")}</Label>
                <Input
                  id="st-trans"
                  name="transferPct"
                  type="number"
                  step="0.1"
                  min="0"
                  max="100"
                  defaultValue={(s.transferCommissionBps / 100).toFixed(1)}
                />
              </div>
            </div>
          </Card>

          {/* Cancellation policy */}
          <Card className="p-6">
            <h3 className="mb-1 flex items-center gap-2 text-lg font-bold text-navy-900">
              <XCircle className="h-5 w-5 text-navy-500" /> {t("admin.settings.cancel")}
            </h3>
            <p className="mb-4 text-sm text-navy-500">{t("admin.settings.cancelSub")}</p>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <Label htmlFor="st-win">{t("admin.settings.cancelWindow")}</Label>
                <Input
                  id="st-win"
                  name="cancelWindowHours"
                  type="number"
                  min="0"
                  max="720"
                  defaultValue={s.cancelWindowHours}
                />
              </div>
              <div>
                <Label htmlFor="st-cfee">{t("admin.settings.cancelFee")}</Label>
                <Input
                  id="st-cfee"
                  name="cancelFeePct"
                  type="number"
                  step="0.1"
                  min="0"
                  max="100"
                  defaultValue={(s.cancelFeeBps / 100).toFixed(1)}
                />
              </div>
            </div>
          </Card>

          {/* Alerts */}
          <Card className="p-6">
            <h3 className="mb-1 flex items-center gap-2 text-lg font-bold text-navy-900">
              <Bell className="h-5 w-5 text-navy-500" /> {t("admin.settings.alerts")}
            </h3>
            <p className="mb-4 text-sm text-navy-500">{t("admin.settings.alertsSub")}</p>
            <div className="grid gap-4">
              <div>
                <Label htmlFor="st-alert">
                  <Mail className="mr-1 inline h-3.5 w-3.5" /> {t("admin.settings.alertEmail")}
                </Label>
                <Input
                  id="st-alert"
                  name="adminAlertEmail"
                  type="email"
                  placeholder="info@parkgo.ai"
                  defaultValue={s.adminAlertEmail ?? ""}
                />
              </div>
              <div>
                <Label htmlFor="st-hook">{t("admin.settings.opsWebhook")}</Label>
                <Input
                  id="st-hook"
                  name="opsWebhookUrl"
                  type="url"
                  placeholder="https://hooks.slack.com/services/…"
                  defaultValue={s.opsWebhookUrl ?? ""}
                />
              </div>
            </div>
          </Card>

          {/* Announcement banner */}
          <Card className="p-6">
            <h3 className="mb-1 flex items-center gap-2 text-lg font-bold text-navy-900">
              <Megaphone className="h-5 w-5 text-navy-500" /> {t("admin.settings.announce")}
            </h3>
            <p className="mb-4 text-sm text-navy-500">{t("admin.settings.announceSub")}</p>
            <Input
              name="announcement"
              maxLength={300}
              placeholder={t("admin.settings.announcePh")}
              defaultValue={s.announcement ?? ""}
            />
            <label className="mt-3 flex items-center gap-2 text-sm font-semibold text-navy-700">
              <input
                type="checkbox"
                name="announcementOn"
                defaultChecked={s.announcementOn}
                className="h-4 w-4 rounded border-navy-300 text-brand-600 focus:ring-brand-400"
              />
              {t("admin.settings.announceOn")}
            </label>
          </Card>

          <Button type="submit" size="lg">
            <SettingsIcon className="h-4 w-4" /> {t("admin.settings.save")}
          </Button>
        </form>

        {/* Daily digest */}
        <Card className="flex flex-wrap items-center justify-between gap-3 p-6">
          <div>
            <h3 className="flex items-center gap-2 text-lg font-bold text-navy-900">
              <Send className="h-5 w-5 text-navy-500" /> {t("admin.settings.digest")}
            </h3>
            <p className="mt-0.5 text-sm text-navy-500">
              {t("admin.settings.digestSub")}
              {!emailOk && (
                <span className="ml-1 text-accent-500">{t("twofa.noEmail")}</span>
              )}
            </p>
          </div>
          <form action={sendDigestNowAction}>
            <Button type="submit" variant="outline">
              <Send className="h-4 w-4" /> {t("admin.settings.digestNow")}
            </Button>
          </form>
        </Card>
      </div>
    </PortalShell>
  );
}
