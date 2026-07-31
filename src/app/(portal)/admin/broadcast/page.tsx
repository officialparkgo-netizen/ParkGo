import Link from "next/link";
import type { Metadata } from "next";
import {
  CalendarClock,
  CheckCircle2,
  History,
  Info,
  Megaphone,
  Send,
  XCircle,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/field";
import { PortalShell } from "@/components/portal/shell";
import { adminNav } from "@/components/portal/navs";
import { requireFinanceAdmin } from "@/lib/auth";
import { cancelCampaignAction, createCampaignAction } from "@/lib/admin-suite-actions";
import { listCampaigns } from "@/lib/data/campaigns";
import { segmentCounts, SEGMENT_KEYS } from "@/lib/segments";
import { formatDateTime } from "@/lib/utils";
import { getI18n } from "@/lib/i18n";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Campaigns",
  path: "/admin/broadcast",
  noindex: true,
});

/**
 * Campaigns: pick a segment, write once, send now or schedule. Scheduled
 * ones are delivered by the daily digest sweep — on the Hobby plan that
 * means "the chosen day", not "the chosen minute", and the form says so.
 */
export default async function AdminBroadcastPage({
  searchParams,
}: {
  searchParams: Promise<{
    sent?: string;
    total?: string;
    preview?: string;
    error?: string;
    scheduled?: string;
    cancelled?: string;
  }>;
}) {
  const user = await requireFinanceAdmin();
  const { t } = await getI18n();
  const { sent, total, preview, error, scheduled, cancelled } = await searchParams;

  const [counts, campaigns] = await Promise.all([segmentCounts(), listCampaigns()]);

  const statusOf = (c: (typeof campaigns)[number]) =>
    c.cancelledAt ? "cancelled" : c.sentAt ? "sent" : "scheduled";

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
          <div className="flex items-center gap-2 rounded-2xl border border-accent-200 bg-accent-50 px-4 py-3 font-semibold text-accent-700">
            <Info className="h-5 w-5" /> {t("admin.broadcast.preview")}
          </div>
        )}
        {scheduled && (
          <div className="flex items-center gap-2 rounded-2xl border border-go-200 bg-go-50 px-4 py-3 font-semibold text-go-700" data-scheduled-banner>
            <CalendarClock className="h-5 w-5" /> {t("admin.broadcast.scheduledBanner")}
          </div>
        )}
        {cancelled && (
          <div className="flex items-center gap-2 rounded-2xl border border-navy-200 bg-navy-50 px-4 py-3 font-semibold text-navy-700" data-cancelled-banner>
            {t("admin.broadcast.cancelledBanner")}
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

          <form action={createCampaignAction} className="space-y-5">
            <div>
              <Label htmlFor="bc-aud">{t("admin.broadcast.audience")}</Label>
              <select
                id="bc-aud"
                name="segment"
                required
                className="w-full rounded-xl border border-navy-200 bg-white px-3.5 py-3 text-sm text-navy-900 focus:border-brand-400 focus:outline-none"
              >
                {SEGMENT_KEYS.map((key) => (
                  <option key={key} value={key}>
                    {t(`admin.broadcast.seg.${key}`)} · {counts[key]}
                  </option>
                ))}
              </select>
              <p className="mt-1 text-xs text-navy-400">{t("admin.broadcast.segHint")}</p>
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
                className="w-full rounded-xl border border-navy-200 bg-white px-3.5 py-3 text-sm text-navy-900 placeholder:text-navy-400 focus:border-brand-400 focus:outline-none"
              />
            </div>
            <div>
              <Label htmlFor="bc-sendat">{t("admin.broadcast.sendAt")}</Label>
              <Input id="bc-sendat" name="sendAt" type="datetime-local" />
              <p className="mt-1 text-xs text-navy-400">{t("admin.broadcast.sendAtHint")}</p>
            </div>
            <Button type="submit" size="lg">
              <Send className="h-4 w-4" /> {t("admin.broadcast.send")}
            </Button>
          </form>
        </Card>

        {/* ------------------------------------------------- past + pending */}
        <section data-campaigns>
          <h3 className="mb-3 flex items-center gap-2 text-lg font-bold text-navy-900">
            <History className="h-5 w-5 text-navy-500" /> {t("admin.broadcast.history")}
            <Badge tone="neutral">{campaigns.length}</Badge>
          </h3>
          {campaigns.length === 0 ? (
            <Card className="p-6 text-center text-sm text-navy-500">
              {t("admin.broadcast.historyEmpty")}
            </Card>
          ) : (
            <Card className="divide-y divide-navy-100">
              {campaigns.map((c) => {
                const status = statusOf(c);
                return (
                  <div key={c.id} className="flex flex-wrap items-center justify-between gap-2 p-4" data-campaign={c.id}>
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="truncate font-semibold text-navy-900">{c.subject}</span>
                        <Badge
                          tone={status === "sent" ? "go" : status === "scheduled" ? "accent" : "neutral"}
                          data-campaign-status={status}
                        >
                          {t(`admin.broadcast.status.${status}`)}
                        </Badge>
                      </div>
                      <p className="mt-0.5 text-xs text-navy-500">
                        {t(`admin.broadcast.seg.${c.segment}`)} ·{" "}
                        {status === "sent"
                          ? `${c.sentCount}/${c.recipientCount} · ${formatDateTime(c.sentAt!)}`
                          : status === "scheduled"
                            ? `~${c.recipientCount} · ${formatDateTime(c.sendAt!)}`
                            : formatDateTime(c.cancelledAt!)}
                        {" · "}
                        {c.createdBy}
                      </p>
                    </div>
                    {status === "scheduled" && (
                      <form action={cancelCampaignAction}>
                        <input type="hidden" name="campaignId" value={c.id} />
                        <button
                          type="submit"
                          className="text-xs font-semibold text-navy-500 hover:text-red-600"
                          data-campaign-cancel
                        >
                          {t("admin.broadcast.cancel")}
                        </button>
                      </form>
                    )}
                  </div>
                );
              })}
            </Card>
          )}
        </section>
      </div>
    </PortalShell>
  );
}
