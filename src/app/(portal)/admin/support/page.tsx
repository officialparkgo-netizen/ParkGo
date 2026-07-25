import Link from "next/link";
import type { Metadata } from "next";
import {
  AlertTriangle,
  BarChart3,
  Clock,
  Headset,
  History,
  Languages,
  Moon,
  Phone,
  Search,
  ThumbsDown,
  ThumbsUp,
  Timer,
  UserCheck,
  UserPlus,
} from "lucide-react";
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
  resendTeamInviteAction,
  setSupportAvailableAction,
  setTicketPriorityAction,
  snoozeTicketAction,
} from "@/lib/admin-suite-actions";
import { CopyLinkButton } from "@/components/common/copy-link-button";
import { inviteLinkFor } from "@/lib/team-invite-mail";
import { listAdminUsers } from "@/lib/data/users";
import { SupportLiveThread } from "@/components/admin/support-live-thread";
import { PushToggle } from "@/components/admin/push-toggle";
import { supportStats } from "@/lib/support-stats";
import { isSnoozed, slaState, SNOOZE_CHOICES } from "@/lib/support-sla";
import { searchTickets } from "@/lib/support-queue";
import { sweepSlaBreaches } from "@/lib/support-escalate";
import { LOCALE_LABELS } from "@/lib/support-lang";
import { signTranscript } from "@/lib/storage";
import { listTicketsForVisitor } from "@/lib/data/support";
import { getPlatformSettings } from "@/lib/data/settings";
import { listBookingsForTraveller } from "@/lib/data/bookings";
import { formatDate, formatDateTime, formatMoney } from "@/lib/utils";
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
  searchParams: Promise<{ replied?: string; team?: string; show?: string; q?: string }>;
}) {
  const user = await requireRole("admin");
  const { t } = await getI18n();
  const { replied, team, show, q } = await searchParams;
  const teamMembers = await listAdminUsers().catch(() => []);
  const isFullAdmin = user.adminScope !== "support";
  // Canned replies come from settings once an admin has written their own;
  // until then the three translated built-ins keep the dropdown useful.
  const settings = await getPlatformSettings().catch(() => null);
  const templates = settings?.supportMacros?.length
    ? settings.supportMacros
    : [
        { id: "looking", label: t("admin.macros.looking.label"), text: t("admin.macros.looking.body") },
        { id: "refund", label: t("admin.macros.refund.label"), text: t("admin.macros.refund.body") },
        { id: "docs", label: t("admin.macros.docs.label"), text: t("admin.macros.docs.body") },
      ];
  const threadLabels = {
    pick: t("admin.macros.pick"),
    send: t("admin.macros.send"),
    team: t("admin.sup.you"),
    typing: t("admin.sup.typing"),
    seen: t("admin.sup.seen"),
    attach: t("support.attach"),
    attachError: t("support.attachError"),
    notify: t("admin.sup.notify"),
    notifyOn: t("admin.sup.notifyOn"),
    newReply: t("admin.sup.newReply"),
    notes: t("admin.sup.notes"),
    notePlaceholder: t("admin.sup.notePlaceholder"),
    addNote: t("admin.sup.addNote"),
    noteHint: t("admin.sup.noteHint"),
    tags: t("admin.sup.tags"),
    addTag: t("admin.sup.addTag"),
  };

  const allTickets = await listSupportTickets().catch(() => []);
  const stats = supportStats(allTickets);
  const slaMinutes = settings?.supportSlaMinutes ?? 20;
  // Loading the queue is the one moment we know someone is watching, so it is
  // also when a missed reply target gets reported. Stamped, so it fires once.
  const breached = await sweepSlaBreaches(allTickets, slaMinutes).catch(() => []);
  const breachedIds = new Set(breached.map((x) => x.id));

  const query = (q ?? "").trim();
  const filter = show === "open" || show === "urgent" || show === "snoozed" ? show : "all";
  const supportTickets = searchTickets(allTickets, query)
    .filter((x) => (filter === "open" ? x.status === "open" && !isSnoozed(x) : true))
    .filter((x) => (filter === "urgent" ? x.priority === "urgent" : true))
    .filter((x) => (filter === "snoozed" ? isSnoozed(x) : true))
    .slice(0, 20);

  // Attachment links expire, so the ones rendered here are freshly signed.
  const signed = new Map(
    await Promise.all(
      supportTickets.map(
        async (tk) => [tk.id, await signTranscript(tk.transcript)] as const
      )
    )
  );
  const transcriptOf = (id: string, fallback: (typeof supportTickets)[number]["transcript"]) =>
    signed.get(id) ?? fallback;

  // Every earlier chat from the same person — the "have we met before?" check
  // an agent would otherwise have to do by hand.
  const historyByTicket = new Map<string, number>();
  await Promise.all(
    supportTickets.map(async (tk) => {
      const past = await listTicketsForVisitor(tk.email, tk.userId).catch(() => []);
      historyByTicket.set(tk.id, past.filter((x) => x.id !== tk.id).length);
    })
  );

  // Booking context for the visible tickets that belong to a real account —
  // an agent should never have to ask "what did you book?".
  const bookingsByUser = new Map<string, Awaited<ReturnType<typeof listBookingsForTraveller>>>();
  await Promise.all(
    [...new Set(supportTickets.map((x) => x.userId).filter((x): x is string => !!x))].map(
      async (id) => {
        const list = await listBookingsForTraveller(id).catch(() => []);
        bookingsByUser.set(id, list.slice(0, 3));
      }
    )
  );
  const ageOf = (iso: string) => {
    const h = Math.floor((Date.now() - +new Date(iso)) / 3_600_000);
    return h < 1 ? "<1h" : h < 48 ? `${h}h` : `${Math.floor(h / 24)}d`;
  };
  const filterHref = (v: string) => {
    const params = new URLSearchParams();
    if (v !== "all") params.set("show", v);
    if (query) params.set("q", query);
    const qs = params.toString();
    return qs ? `/admin/support?${qs}` : "/admin/support";
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
        {team === "resent" && (
          <div className="rounded-2xl border border-go-200 bg-go-50 px-4 py-3 font-semibold text-go-700">
            {t("admin.team.resent")}
          </div>
        )}
        {team === "invited-nomail" && (
          <div className="rounded-2xl border border-accent-200 bg-accent-50 px-4 py-3 font-semibold text-accent-700" data-nomail>
            {t("admin.team.noMail")}
          </div>
        )}
        {team === "removed" && (
          <div className="rounded-2xl border border-navy-200 bg-navy-50 px-4 py-3 font-semibold text-navy-700">
            {t("admin.team.removed")}
          </div>
        )}
        {team === "peer" && (
          <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 font-semibold text-red-700">
            {t("admin.team.peerBlocked")}
          </div>
        )}
        {team === "error" && (
          <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 font-semibold text-red-700">
            {t("admin.team.error")}
          </div>
        )}

        {/* How the desk is doing — read straight off the queue below. */}
        <section id="stats">
          <h3 className="mb-1 flex items-center gap-2 text-lg font-bold text-navy-900">
            <BarChart3 className="h-5 w-5 text-navy-500" /> {t("admin.sup.stats")}
          </h3>
          <p className="mb-3 text-sm text-navy-500">{t("admin.sup.statsSub")}</p>
          <Card className="p-4" data-support-stats>
            <dl className="grid grid-cols-2 gap-4 sm:grid-cols-5">
              {[
                { k: t("admin.sup.statVolume"), v: String(stats.total) },
                { k: t("admin.sup.statOpen"), v: String(stats.open) },
                {
                  k: t("admin.sup.statFirstReply"),
                  v:
                    stats.avgFirstReplyMinutes === null
                      ? "—"
                      : `${stats.avgFirstReplyMinutes}m`,
                },
                {
                  k: t("admin.sup.statCsat"),
                  v: stats.csatPct === null ? "—" : `${stats.csatPct}%`,
                },
                {
                  k: t("admin.sup.statTopic"),
                  v: stats.topTopic ? stats.topTopic.topic : "—",
                },
              ].map((cell) => (
                <div key={cell.k}>
                  <dt className="text-xs font-semibold text-navy-400">{cell.k}</dt>
                  <dd className="text-xl font-bold text-navy-900">{cell.v}</dd>
                </div>
              ))}
            </dl>
            {stats.perAgent.length > 0 && (
              <div className="mt-4 border-t border-navy-100 pt-3">
                <p className="mb-2 text-xs font-semibold text-navy-400">
                  {t("admin.sup.perAgent")}
                </p>
                <ul className="flex flex-wrap gap-2">
                  {stats.perAgent.map((a) => (
                    <li key={a.name}>
                      <Badge tone="navy">
                        {a.name} · {a.resolved}/{a.total}
                      </Badge>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </Card>
        </section>

        <section id="support">
          <div className="mb-3 flex flex-wrap items-center gap-2">
            <h3 className="flex items-center gap-2 text-lg font-bold text-navy-900">
              <Headset className="h-5 w-5 text-navy-500" /> {t("admin.support.title")}
            </h3>
            <Badge tone={stats.open > 0 ? "accent" : "neutral"}>
              {stats.open} {t("admin.support.openBadge")}
            </Badge>
            {stats.urgent > 0 && (
              <Badge tone="danger">
                <AlertTriangle className="h-3 w-3" /> {stats.urgent} {t("admin.sup.urgent")}
              </Badge>
            )}
          </div>
          <p className="mb-3 text-sm text-navy-500">{t("admin.support.sub")}</p>

          {/* On duty? Auto-assignment only ever picks someone who says yes. */}
          <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
            <form action={setSupportAvailableAction} data-duty-form>
              <input
                type="hidden"
                name="state"
                value={user.supportAvailable ? "off" : "on"}
              />
              <button
                type="submit"
                className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-bold ${
                  user.supportAvailable
                    ? "bg-go-500 text-white hover:bg-go-600"
                    : "border border-navy-200 bg-white text-navy-500 hover:bg-navy-50"
                }`}
              >
                <span
                  className={`h-2 w-2 rounded-full ${
                    user.supportAvailable ? "bg-white" : "bg-navy-300"
                  }`}
                  aria-hidden
                />
                {user.supportAvailable ? t("admin.sup.onDuty") : t("admin.sup.offDuty")}
              </button>
            </form>

            <PushToggle
              labels={{
                off: t("admin.sup.pushOff"),
                on: t("admin.sup.pushOn"),
                blocked: t("admin.sup.pushBlocked"),
                unsupported: t("admin.sup.pushOff"),
              }}
            />

            {/* Search — a GET form, so results survive a refresh and a share. */}
            <form method="get" className="flex items-center gap-1.5" data-queue-search>
              {filter !== "all" && <input type="hidden" name="show" value={filter} />}
              <label htmlFor="sup-q" className="sr-only">
                {t("admin.sup.search")}
              </label>
              <div className="relative">
                <Search
                  className="pointer-events-none absolute inset-y-0 start-2 my-auto h-3.5 w-3.5 text-navy-400"
                  aria-hidden
                />
                <input
                  id="sup-q"
                  name="q"
                  defaultValue={query}
                  placeholder={t("admin.sup.search")}
                  className="h-8 w-48 rounded-full border border-navy-200 bg-white ps-7 pe-3 text-xs text-navy-700 focus:border-brand-400 focus:outline-none"
                />
              </div>
              <button
                type="submit"
                className={buttonVariants({ variant: "outline", size: "sm" })}
              >
                {t("admin.sup.searchGo")}
              </button>
              {query && (
                <Link href={filterHref(filter).split("&q=")[0]} className="text-xs font-semibold text-navy-500">
                  {t("admin.sup.clear")}
                </Link>
              )}
            </form>
          </div>

          {/* Filter — plain links so the queue stays server-rendered. */}
          <div className="mb-3 flex flex-wrap items-center gap-2" data-queue-filter>
            <span className="text-xs font-semibold text-navy-400">{t("admin.sup.filter")}</span>
            {[
              { id: "all", label: t("admin.sup.filterAll") },
              { id: "open", label: t("admin.sup.filterOpen") },
              { id: "urgent", label: t("admin.sup.filterUrgent") },
              { id: "snoozed", label: t("admin.sup.filterSnoozed") },
            ].map((opt) => (
              <Link
                key={opt.id}
                href={filterHref(opt.id)}
                aria-current={filter === opt.id ? "page" : undefined}
                className={`rounded-full px-3 py-1 text-xs font-semibold ${
                  filter === opt.id
                    ? "bg-navy-900 text-white"
                    : "border border-navy-200 bg-white text-navy-600 hover:bg-navy-50"
                }`}
              >
                {opt.label}
              </Link>
            ))}
          </div>
          <Card className="divide-y divide-navy-100">
            {supportTickets.length === 0 && (
              <div className="p-6 text-center text-navy-500">{t("admin.support.empty")}</div>
            )}
            {supportTickets.map((ticket) => (
              <div key={ticket.id} className="p-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="min-w-0">
                    <div className="truncate font-semibold text-navy-900">
                      {ticket.name || ticket.email}
                      <span className="ms-2 text-xs font-normal text-navy-400">{ticket.email}</span>
                    </div>
                    <div className="text-xs text-navy-400">
                      {ticket.topic} · {formatDateTime(ticket.createdAt)} ·{" "}
                      {ticket.userId ? t("admin.sup.account") : t("admin.sup.guest")}
                    </div>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="inline-flex items-center gap-1 text-xs font-semibold text-navy-400">
                      <Clock className="h-3 w-3" /> {ageOf(ticket.createdAt)}
                    </span>
                    {ticket.priority === "urgent" && (
                      <Badge tone="danger" data-urgent>
                        <AlertTriangle className="h-3 w-3" /> {t("admin.sup.urgent")}
                      </Badge>
                    )}
                    {(() => {
                      const sla = slaState(ticket, slaMinutes);
                      if (!sla.breached && !breachedIds.has(ticket.id)) return null;
                      return (
                        <Badge tone="danger" data-sla-breach>
                          <Timer className="h-3 w-3" /> {t("admin.sup.slaMissed")}
                        </Badge>
                      );
                    })()}
                    {isSnoozed(ticket) && ticket.snoozeUntil && (
                      <Badge tone="neutral" data-snoozed>
                        <Moon className="h-3 w-3" /> {formatDateTime(ticket.snoozeUntil)}
                      </Badge>
                    )}
                    {ticket.phone && (
                      <Badge tone="accent" data-callback>
                        <Phone className="h-3 w-3" /> {ticket.phone}
                      </Badge>
                    )}
                    {ticket.locale && ticket.locale !== "en" && (
                      <Badge tone="brand" data-locale>
                        <Languages className="h-3 w-3" /> {LOCALE_LABELS[ticket.locale]}
                      </Badge>
                    )}
                    {(historyByTicket.get(ticket.id) ?? 0) > 0 && (
                      <Badge tone="navy" data-history>
                        <History className="h-3 w-3" /> {historyByTicket.get(ticket.id)}{" "}
                        {t("admin.sup.pastChats")}
                      </Badge>
                    )}
                    {isOverdue(ticket) && (
                      <Badge tone="danger">{t("admin.sla.overdue")}</Badge>
                    )}
                    {ticket.csat && (
                      <Badge tone={ticket.csat === 1 ? "go" : "danger"} data-csat-badge>
                        {ticket.csat === 1 ? (
                          <ThumbsUp className="h-3 w-3" />
                        ) : (
                          <ThumbsDown className="h-3 w-3" />
                        )}
                        {t("admin.sup.rated")}
                      </Badge>
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
                      <form action={setTicketPriorityAction}>
                        <input type="hidden" name="ticketId" value={ticket.id} />
                        <input
                          type="hidden"
                          name="priority"
                          value={ticket.priority === "urgent" ? "normal" : "urgent"}
                        />
                        <button
                          type="submit"
                          className={buttonVariants({ variant: "outline", size: "sm" })}
                        >
                          {ticket.priority === "urgent"
                            ? t("admin.sup.markNormal")
                            : t("admin.sup.markUrgent")}
                        </button>
                      </form>
                    )}
                    {ticket.status === "open" && (
                      <form action={snoozeTicketAction} className="flex items-center gap-1.5">
                        <input type="hidden" name="ticketId" value={ticket.id} />
                        <label htmlFor={`snz-${ticket.id}`} className="sr-only">
                          {t("admin.sup.snooze")}
                        </label>
                        <select
                          id={`snz-${ticket.id}`}
                          name="hours"
                          defaultValue={isSnoozed(ticket) ? "0" : "4"}
                          className="rounded-lg border border-navy-200 bg-white px-2 py-1.5 text-xs font-semibold text-navy-700 focus:border-brand-400 focus:outline-none"
                        >
                          {isSnoozed(ticket) && <option value="0">{t("admin.sup.wake")}</option>}
                          {SNOOZE_CHOICES.map((h) => (
                            <option key={h} value={h}>
                              {h < 24 ? `${h}h` : `${h / 24}d`}
                            </option>
                          ))}
                        </select>
                        <button
                          type="submit"
                          className={buttonVariants({ variant: "outline", size: "sm" })}
                        >
                          <Moon className="h-3.5 w-3.5" /> {t("admin.sup.snooze")}
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
                      {transcriptOf(ticket.id, ticket.transcript).map((m, i) => (
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
                {/* Who they are and what they booked — no tab-hopping. */}
                {ticket.userId && (
                  <div className="mt-2 rounded-xl bg-navy-50 px-3 py-2" data-booking-context>
                    <p className="text-[11px] font-semibold uppercase tracking-wide text-navy-400">
                      {t("admin.sup.recentBookings")}
                    </p>
                    {(bookingsByUser.get(ticket.userId) ?? []).length === 0 ? (
                      <p className="text-xs text-navy-500">{t("admin.sup.noBookings")}</p>
                    ) : (
                      <ul className="mt-1 space-y-0.5">
                        {(bookingsByUser.get(ticket.userId) ?? []).map((b) => (
                          <li key={b.id} className="text-xs text-navy-700">
                            <span className="font-semibold text-navy-900">{b.reference}</span> ·{" "}
                            {formatDate(b.startAt)} – {formatDate(b.endAt)} · {b.status} ·{" "}
                            {formatMoney(b.price.total, b.price.currency)}
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                )}
                {ticket.status === "open" && (
                  <SupportLiveThread
                    ticketId={ticket.id}
                    initial={transcriptOf(ticket.id, ticket.transcript)}
                    initialNotes={ticket.notes ?? []}
                    initialTags={ticket.tags ?? []}
                    templates={templates}
                    labels={{
                      ...threadLabels,
                      visitor: ticket.name || t("admin.support.visitor"),
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
                    {m.inviteNonce && (
                      <Badge tone="accent" data-invite-pending>
                        {t("admin.team.pending")}
                      </Badge>
                    )}
                  </div>
                  <div className="truncate text-xs text-navy-400">{m.email}</div>
                </div>
                <div className="flex flex-wrap items-center gap-3">
                  {isFullAdmin && m.inviteNonce && m.adminScope === "support" && (
                    <>
                      <span data-invite-link={inviteLinkFor(m.id, m.inviteNonce)}>
                        <CopyLinkButton
                          value={inviteLinkFor(m.id, m.inviteNonce)}
                          label={t("admin.team.copyInvite")}
                          copiedLabel={t("host.settings.icalCopied")}
                        />
                      </span>
                      <form action={resendTeamInviteAction}>
                        <input type="hidden" name="userId" value={m.id} />
                        <button
                          type="submit"
                          className="text-xs font-semibold text-brand-600 hover:text-brand-700"
                        >
                          {t("admin.team.resend")}
                        </button>
                      </form>
                    </>
                  )}
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
