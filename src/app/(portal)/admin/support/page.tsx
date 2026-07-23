import Link from "next/link";
import type { Metadata } from "next";
import { Clock, Headset, UserCheck } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { PortalShell } from "@/components/portal/shell";
import { adminNav } from "@/components/portal/navs";
import { requireRole } from "@/lib/auth";
import { listSupportTickets } from "@/lib/data/support";
import { resolveSupportTicketAction } from "@/lib/support-actions";
import { assignSupportTicketAction } from "@/lib/admin-suite-actions";
import { formatDateTime } from "@/lib/utils";
import { getI18n } from "@/lib/i18n";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Support tickets",
  path: "/admin/support",
  noindex: true,
});

export default async function AdminSupportPage() {
  const user = await requireRole("admin");
  const { t } = await getI18n();

  const supportTickets = await listSupportTickets().catch(() => []);
  const ageOf = (iso: string) => {
    const h = Math.floor((Date.now() - +new Date(iso)) / 3_600_000);
    return h < 1 ? "<1h" : h < 48 ? `${h}h` : `${Math.floor(h / 24)}d`;
  };
  const isOverdue = (tk: (typeof supportTickets)[number]) =>
    tk.status === "open" && Date.now() - +new Date(tk.createdAt) > 24 * 3_600_000;

  return (
    <PortalShell user={user} nav={adminNav} title="admin.support.title">
      <div className="mx-auto max-w-4xl space-y-6">
        <Link href="/admin" className="text-sm font-semibold text-brand-600">
          ← {t("common.backToDash")}
        </Link>

        <section id="support">
          <div className="mb-3 flex items-center gap-2">
            <h3 className="flex items-center gap-2 text-lg font-bold text-navy-900">
              <Headset className="h-5 w-5 text-navy-500" /> {t("admin.support.title")}
            </h3>
            <Badge tone={supportTickets.some((x) => x.status === "open") ? "accent" : "neutral"}>
              {supportTickets.filter((x) => x.status === "open").length} {t("admin.support.openBadge")}
            </Badge>
          </div>
          <p className="mb-3 text-sm text-navy-500">{t("admin.support.sub")}</p>
          <Card className="divide-y divide-navy-100">
            {supportTickets.length === 0 && (
              <div className="p-6 text-center text-navy-500">{t("admin.support.empty")}</div>
            )}
            {supportTickets.slice(0, 20).map((ticket) => (
              <div key={ticket.id} className="p-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="min-w-0">
                    <div className="truncate font-semibold text-navy-900">
                      {ticket.name || ticket.email}
                      <span className="ms-2 text-xs font-normal text-navy-400">{ticket.email}</span>
                    </div>
                    <div className="text-xs text-navy-400">
                      {ticket.topic} · {formatDateTime(ticket.createdAt)}
                    </div>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="inline-flex items-center gap-1 text-xs font-semibold text-navy-400">
                      <Clock className="h-3 w-3" /> {ageOf(ticket.createdAt)}
                    </span>
                    {isOverdue(ticket) && (
                      <Badge tone="danger">{t("admin.sla.overdue")}</Badge>
                    )}
                    {ticket.assignedTo && (
                      <Badge tone="navy">
                        <UserCheck className="h-3 w-3" /> {ticket.assignedTo}
                      </Badge>
                    )}
                    <Badge tone={ticket.status === "open" ? "accent" : "go"}>
                      {ticket.status === "open"
                        ? t("admin.support.openBadge")
                        : t("admin.support.resolvedBadge")}
                    </Badge>
                    {ticket.status === "open" && !ticket.assignedTo && (
                      <form action={assignSupportTicketAction}>
                        <input type="hidden" name="ticketId" value={ticket.id} />
                        <button
                          type="submit"
                          className={buttonVariants({ variant: "outline", size: "sm" })}
                        >
                          <UserCheck className="h-3.5 w-3.5" /> {t("admin.sla.assignMe")}
                        </button>
                      </form>
                    )}
                    {ticket.status === "open" && (
                      <form action={resolveSupportTicketAction}>
                        <input type="hidden" name="ticketId" value={ticket.id} />
                        <button
                          type="submit"
                          className={buttonVariants({ variant: "outline", size: "sm" })}
                        >
                          {t("admin.support.resolve")}
                        </button>
                      </form>
                    )}
                  </div>
                </div>
                {ticket.transcript.length > 0 && (
                  <p className="mt-2 line-clamp-2 text-sm text-navy-600">
                    {ticket.transcript
                      .filter((m) => m.role === "user")
                      .map((m) => m.text)
                      .join(" · ") || ticket.transcript[ticket.transcript.length - 1]?.text}
                  </p>
                )}
              </div>
            ))}
          </Card>
        </section>
      </div>
    </PortalShell>
  );
}
