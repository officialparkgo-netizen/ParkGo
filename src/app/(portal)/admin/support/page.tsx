import Link from "next/link";
import type { Metadata } from "next";
import { Clock, Headset, UserCheck, UserPlus } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { PortalShell } from "@/components/portal/shell";
import { adminNav, supportAgentNav } from "@/components/portal/navs";
import { requireRole } from "@/lib/auth";
import { listSupportTickets } from "@/lib/data/support";
import { resolveSupportTicketAction } from "@/lib/support-actions";
import {
  assignTicketToAction,
  inviteSupportAgentAction,
  removeSupportAgentAction,
} from "@/lib/admin-suite-actions";
import { listAdminUsers } from "@/lib/data/users";
import { SupportLiveThread } from "@/components/admin/support-live-thread";
import { formatDateTime } from "@/lib/utils";
import { getI18n } from "@/lib/i18n";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Support tickets",
  path: "/admin/support",
  noindex: true,
});

export default async function AdminSupportPage({
  searchParams,
}: {
  searchParams: Promise<{ replied?: string; team?: string }>;
}) {
  const user = await requireRole("admin");
  const { t } = await getI18n();
  const { replied, team } = await searchParams;
  const teamMembers = await listAdminUsers().catch(() => []);
  const isFullAdmin = user.adminScope !== "support";
  const templates = [
    { id: "looking", label: t("admin.macros.looking.label"), text: t("admin.macros.looking.body") },
    { id: "refund", label: t("admin.macros.refund.label"), text: t("admin.macros.refund.body") },
    { id: "docs", label: t("admin.macros.docs.label"), text: t("admin.macros.docs.body") },
  ];

  const supportTickets = await listSupportTickets().catch(() => []);
  const ageOf = (iso: string) => {
    const h = Math.floor((Date.now() - +new Date(iso)) / 3_600_000);
    return h < 1 ? "<1h" : h < 48 ? `${h}h` : `${Math.floor(h / 24)}d`;
  };
  const isOverdue = (tk: (typeof supportTickets)[number]) =>
    tk.status === "open" && Date.now() - +new Date(tk.createdAt) > 24 * 3_600_000;

  return (
    <PortalShell user={user} nav={user.adminScope === "support" ? supportAgentNav : adminNav} title="admin.support.title">
      <div className="mx-auto max-w-4xl space-y-6">
        <Link href="/admin" className="text-sm font-semibold text-brand-600">
          ← {t("common.backToDash")}
        </Link>

        {replied === "1" && (
          <div className="rounded-2xl border border-go-200 bg-go-50 px-4 py-3 font-semibold text-go-700">
            {t("admin.macros.sent")}
          </div>
        )}
        {replied === "preview" && (
          <div className="rounded-2xl border border-accent-200 bg-accent-50 px-4 py-3 font-semibold text-accent-500">
            {t("admin.macros.preview")}
          </div>
        )}
        {team === "invited" && (
          <div className="rounded-2xl border border-go-200 bg-go-50 px-4 py-3 font-semibold text-go-700">
            {t("admin.team.invited")}
          </div>
        )}
        {team === "removed" && (
          <div className="rounded-2xl border border-navy-200 bg-navy-50 px-4 py-3 font-semibold text-navy-700">
            {t("admin.team.removed")}
          </div>
        )}
        {team === "error" && (
          <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 font-semibold text-red-700">
            {t("admin.team.error")}
          </div>
        )}

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
                    {ticket.status === "open" && (
                      <form action={assignTicketToAction} className="flex items-center gap-1.5">
                        <input type="hidden" name="ticketId" value={ticket.id} />
                        <select
                          name="assigneeId"
                          defaultValue={user.id}
                          aria-label={t("admin.team.assignTo")}
                          className="rounded-lg border border-navy-200 bg-white px-2 py-1.5 text-xs font-semibold text-navy-700 focus:border-brand-400 focus:outline-none"
                        >
                          {teamMembers.map((m) => (
                            <option key={m.id} value={m.id}>
                              {m.name}
                              {m.adminScope === "support" ? ` · ${t("admin.team.agent")}` : ""}
                            </option>
                          ))}
                        </select>
                        <button
                          type="submit"
                          className={buttonVariants({ variant: "outline", size: "sm" })}
                        >
                          <UserCheck className="h-3.5 w-3.5" /> {t("admin.team.assign")}
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
                {ticket.transcript.some((m) => m.role === "agent") && (
                  <p className="mt-1 text-xs text-go-700">
                    ↳ {ticket.transcript.filter((m) => m.role === "agent").slice(-1)[0]?.text}
                  </p>
                )}
                {/* Resolved tickets keep their full conversation readable —
                    open ones already show everything in the live thread. */}
                {ticket.status === "resolved" && ticket.transcript.length > 0 && (
                  <details className="mt-3 border-t border-navy-100 pt-3" data-chat-archive>
                    <summary className="cursor-pointer text-xs font-semibold text-brand-600 hover:text-brand-700">
                      {t("admin.sup.viewChat")} ({ticket.transcript.length})
                    </summary>
                    <div className="mt-2 max-h-72 space-y-1.5 overflow-y-auto">
                      {ticket.transcript.map((m, i) => (
                        <div
                          key={i}
                          className={`flex ${m.role === "agent" ? "justify-end" : "justify-start"}`}
                        >
                          <div
                            className={`max-w-[85%] whitespace-pre-line rounded-xl px-3 py-1.5 text-xs leading-relaxed ${
                              m.role === "agent"
                                ? "rounded-ee-sm bg-brand-500 text-white"
                                : m.role === "bot"
                                  ? "rounded-es-sm bg-navy-50 italic text-navy-400"
                                  : "rounded-es-sm bg-navy-100 text-navy-800"
                            }`}
                          >
                            <span className="me-1 font-bold">
                              {m.role === "agent"
                                ? t("admin.sup.you")
                                : m.role === "bot"
                                  ? "bot"
                                  : ticket.name || t("admin.support.visitor")}
                              :
                            </span>
                            {m.text}
                          </div>
                        </div>
                      ))}
                    </div>
                  </details>
                )}
                {ticket.status === "open" && (
                  <SupportLiveThread
                    ticketId={ticket.id}
                    initial={ticket.transcript}
                    templates={templates}
                    labels={{
                      pick: t("admin.macros.pick"),
                      send: t("admin.macros.send"),
                      visitor: ticket.name || t("admin.support.visitor"),
                      team: t("admin.sup.you"),
                    }}
                  />
                )}
              </div>
            ))}
          </Card>
        </section>

        {/* Support team: who can pick tickets up, plus limited-agent invites */}
        <section id="team">
          <div className="mb-3 flex items-center gap-2">
            <h3 className="flex items-center gap-2 text-lg font-bold text-navy-900">
              <UserPlus className="h-5 w-5 text-navy-500" /> {t("admin.team.title")}
            </h3>
            <Badge tone="neutral">{teamMembers.length}</Badge>
          </div>
          <p className="mb-3 text-sm text-navy-500">{t("admin.team.sub")}</p>
          <Card className="divide-y divide-navy-100" data-team-card>
            {teamMembers.map((m) => (
              <div key={m.id} className="flex flex-wrap items-center justify-between gap-2 p-4">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-semibold text-navy-900">{m.name}</span>
                    <Badge tone={m.adminScope === "support" ? "brand" : "navy"}>
                      {m.adminScope === "support"
                        ? t("admin.team.agent")
                        : t("admin.team.full")}
                    </Badge>
                    {m.id === user.id && <Badge tone="neutral">{t("admin.team.you")}</Badge>}
                  </div>
                  <div className="truncate text-xs text-navy-400">{m.email}</div>
                </div>
                {isFullAdmin && m.adminScope === "support" && m.id !== user.id && (
                  <form action={removeSupportAgentAction}>
                    <input type="hidden" name="userId" value={m.id} />
                    <button
                      type="submit"
                      className="text-xs font-semibold text-navy-500 hover:text-red-600"
                    >
                      {t("admin.team.remove")}
                    </button>
                  </form>
                )}
              </div>
            ))}
            {isFullAdmin && (
              <form
                action={inviteSupportAgentAction}
                className="flex flex-wrap items-end gap-2 p-4"
              >
                <div className="min-w-36 flex-1">
                  <label
                    htmlFor="agent-name"
                    className="mb-1 block text-xs font-semibold text-navy-500"
                  >
                    {t("host.settings.cohostName")}
                  </label>
                  <input
                    id="agent-name"
                    name="name"
                    className="w-full rounded-xl border border-navy-200 bg-white px-3 py-2 text-sm text-navy-900 focus:border-brand-400 focus:outline-none"
                  />
                </div>
                <div className="min-w-52 flex-[1.5]">
                  <label
                    htmlFor="agent-email"
                    className="mb-1 block text-xs font-semibold text-navy-500"
                  >
                    {t("host.settings.cohostEmail")}
                  </label>
                  <input
                    id="agent-email"
                    name="email"
                    type="email"
                    required
                    placeholder="agent@parkgo.team"
                    className="w-full rounded-xl border border-navy-200 bg-white px-3 py-2 text-sm text-navy-900 placeholder:text-navy-300 focus:border-brand-400 focus:outline-none"
                  />
                </div>
                <button
                  type="submit"
                  className="inline-flex items-center gap-1.5 rounded-xl bg-navy-900 px-4 py-2.5 text-sm font-semibold text-white hover:bg-navy-700"
                >
                  <UserPlus className="h-4 w-4" /> {t("admin.team.invite")}
                </button>
              </form>
            )}
          </Card>
          <p className="mt-2 text-xs text-navy-400">{t("admin.team.note")}</p>
        </section>
      </div>
    </PortalShell>
  );
}
