import Link from "next/link";
import { redirect } from "next/navigation";
import type { Metadata } from "next";
import {
  AlertTriangle,
  ArrowLeftRight,
  ArrowUpRight,
  CalendarCheck,
  Download,
  KeyRound,
  ScrollText,
  ShieldCheck,
  Trash2,
  UserCheck,
  UserX,
  Warehouse,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar } from "@/components/common/avatar";
import { PortalShell } from "@/components/portal/shell";
import { StatusBadge } from "@/components/portal/status";
import { adminNav } from "@/components/portal/navs";
import { requireRole } from "@/lib/auth";
import { getAuthLastSignIn, getUsersByIds } from "@/lib/data/users";
import { listBookingsForTraveller, listBookingsForHost } from "@/lib/data/bookings";
import { getHostForUser, getSpacesForHost } from "@/lib/data/hosts";
import { listSupportTickets } from "@/lib/data/support";
import { listAdminActionsForTarget } from "@/lib/data/admin-actions";
import { setUserRoleAction, setUserSuspendedAction } from "@/lib/user-actions";
import {
  addUserNoteAction,
  anonymizeUserAction,
  setAdminScopeAction,
  startImpersonationAction,
} from "@/lib/admin-suite-actions";
import { computeRiskFlags } from "@/lib/risk";
import { formatDate, formatDateTime, formatMoney } from "@/lib/utils";
import { getI18n } from "@/lib/i18n";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "User detail",
  path: "/admin/users",
  noindex: true,
});

export default async function AdminUserDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ gdpr?: string }>;
}) {
  const admin = await requireRole("admin");
  const { t } = await getI18n();
  const { id } = await params;
  const { gdpr } = await searchParams;

  const target = (await getUsersByIds([id])).get(id);
  if (!target) redirect("/admin/users");

  const bookings =
    target.role === "traveller" ? await listBookingsForTraveller(target.id) : [];
  const totalSpend = bookings
    .filter((b) => b.status !== "cancelled" && b.status !== "requested")
    .reduce((s, b) => s + b.price.total, 0);
  const host = target.role === "host" ? await getHostForUser(target) : null;
  const hostSpaces = host ? await getSpacesForHost(host.id) : [];
  const hostBookings = host ? await listBookingsForHost(host.id) : [];
  const hostCancelRate =
    hostBookings.length > 0
      ? Math.round(
          (hostBookings.filter((b) => b.status === "cancelled").length /
            hostBookings.length) *
            100
        )
      : 0;
  const lastSignIn = await getAuthLastSignIn(target.id);
  const tickets = (await listSupportTickets().catch(() => [])).filter(
    (tk) => tk.email.toLowerCase() === target.email.toLowerCase()
  );
  const activity = await listAdminActionsForTarget(target.id);
  const riskFlags = computeRiskFlags({
    user: target,
    bookings,
    actions: activity,
  });
  const anonymized = target.email.endsWith("@removed.parkgo.ai");

  return (
    <PortalShell user={admin} nav={adminNav} title="nav.users">
      <div className="mx-auto max-w-3xl space-y-6">
        <Link href="/admin/users" className="text-sm font-semibold text-brand-600">
          ← {t("nav.users")}
        </Link>

        {gdpr === "done" && (
          <div className="rounded-2xl border border-go-200 bg-go-50 px-4 py-3 font-semibold text-go-700">
            {t("admin.gdpr.done")}
          </div>
        )}
        {gdpr === "confirm" && (
          <div className="rounded-2xl border border-accent-200 bg-accent-50 px-4 py-3 font-semibold text-accent-500">
            {t("admin.gdpr.confirmNote")}
          </div>
        )}

        {/* Risk screening */}
        {riskFlags.length > 0 && (
          <div className="flex flex-wrap items-center gap-2 rounded-2xl border border-accent-200 bg-accent-50 px-4 py-3">
            <AlertTriangle className="h-5 w-5 shrink-0 text-accent-500" />
            <span className="font-bold text-navy-900">{t("admin.risk.title")}</span>
            {riskFlags.map((f) => (
              <span
                key={f.key}
                className={`rounded-full px-3 py-1 text-sm font-semibold ${
                  f.severity === "high"
                    ? "bg-red-100 text-red-700"
                    : "bg-white text-navy-700"
                }`}
              >
                {t(`admin.risk.${f.key}`)}
              </span>
            ))}
          </div>
        )}

        {/* Profile */}
        <Card className="p-6">
          <div className="flex flex-wrap items-center gap-4">
            <Avatar
              name={target.name}
              avatarUrl={target.avatarUrl}
              color={target.avatarColor ?? "#1B6CB3"}
              className="h-14 w-14 text-lg"
            />
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-xl font-extrabold text-navy-900">{target.name}</h2>
                <Badge tone={target.role === "host" ? "brand" : "neutral"}>{target.role}</Badge>
                {target.suspended && <Badge tone="danger">{t("admin.users.suspended")}</Badge>}
                {target.twofaEnabled && (
                  <Badge tone="go">
                    <ShieldCheck className="h-3 w-3" /> 2FA
                  </Badge>
                )}
              </div>
              <div className="mt-0.5 break-all text-sm text-navy-500">
                {target.email}
                {target.phone ? ` · ${target.phone}` : ""}
              </div>
              <div className="text-xs text-navy-400">
                {t("admin.users.joined")} {formatDate(target.createdAt)}
              </div>
            </div>
          </div>

          {/* Quick facts */}
          <div className="mt-4 flex flex-wrap gap-2 text-sm">
            {target.role === "traveller" && (
              <>
                <span className="inline-flex items-center gap-1.5 rounded-full bg-navy-50 px-3 py-1 font-semibold text-navy-600">
                  <CalendarCheck className="h-3.5 w-3.5" /> {bookings.length}{" "}
                  {t("admin.user.bookings")}
                </span>
                <span className="inline-flex items-center gap-1.5 rounded-full bg-go-50 px-3 py-1 font-semibold text-go-700">
                  {formatMoney(totalSpend)}
                </span>
              </>
            )}
            {host && (
              <>
                <span className="inline-flex items-center gap-1.5 rounded-full bg-navy-50 px-3 py-1 font-semibold text-navy-600">
                  <Warehouse className="h-3.5 w-3.5" /> {hostSpaces.length} {t("nav.listings")}
                </span>
                <span className="inline-flex items-center gap-1.5 rounded-full bg-navy-50 px-3 py-1 font-semibold text-navy-600">
                  <CalendarCheck className="h-3.5 w-3.5" /> {hostBookings.length}{" "}
                  {t("admin.user.bookings")}
                </span>
                <span
                  className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 font-semibold ${
                    hostCancelRate > 10
                      ? "bg-red-100 text-red-700"
                      : "bg-go-50 text-go-700"
                  }`}
                >
                  {t("admin.score.cancelRate")} {hostCancelRate}%
                </span>
                <span className="inline-flex items-center gap-1.5 rounded-full bg-accent-50 px-3 py-1 font-semibold text-accent-500">
                  {host.rating.toFixed(1)}★
                </span>
                <StatusBadge status={host.verificationStatus} />
              </>
            )}
            {lastSignIn && (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-navy-50 px-3 py-1 font-semibold text-navy-600">
                {t("admin.lastSignIn")} {formatDateTime(lastSignIn)}
              </span>
            )}
          </div>

          {/* Admin scope (other admins only, full-scope admins only) */}
          {target.role === "admin" &&
            target.id !== admin.id &&
            admin.adminScope !== "support" && (
              <div className="mt-5 flex flex-wrap items-center gap-2 border-t border-navy-100 pt-4">
                <span className="text-sm font-semibold text-navy-700">
                  {t("admin.scope.label")}
                </span>
                {(["full", "support"] as const).map((sc) => (
                  <form key={sc} action={setAdminScopeAction}>
                    <input type="hidden" name="userId" value={target.id} />
                    <input type="hidden" name="scope" value={sc} />
                    <button
                      type="submit"
                      className={`rounded-full border px-3 py-1.5 text-xs font-semibold transition-colors ${
                        (target.adminScope ?? "full") === sc
                          ? "border-navy-900 bg-navy-900 text-white"
                          : "border-navy-200 bg-white text-navy-600 hover:bg-navy-50"
                      }`}
                    >
                      {t(`admin.scope.${sc}`)}
                    </button>
                  </form>
                ))}
                <span className="text-xs text-navy-400">{t("admin.scope.note")}</span>
              </div>
            )}

          {/* Actions */}
          {target.role !== "admin" && (
            <div className="mt-5 flex flex-wrap gap-2 border-t border-navy-100 pt-4">
              <form action={setUserRoleAction}>
                <input type="hidden" name="userId" value={target.id} />
                <input
                  type="hidden"
                  name="role"
                  value={target.role === "host" ? "traveller" : "host"}
                />
                <button
                  type="submit"
                  className="inline-flex items-center gap-1 rounded-lg border border-navy-200 bg-white px-3 py-2 text-xs font-semibold text-navy-600 hover:bg-navy-50"
                >
                  <ArrowLeftRight className="h-3.5 w-3.5" />{" "}
                  {target.role === "host"
                    ? t("admin.users.makeTraveller")
                    : t("admin.users.makeHost")}
                </button>
              </form>
              <form action={setUserSuspendedAction}>
                <input type="hidden" name="userId" value={target.id} />
                <input
                  type="hidden"
                  name="state"
                  value={target.suspended ? "restore" : "suspend"}
                />
                {target.suspended ? (
                  <button
                    type="submit"
                    className="inline-flex items-center gap-1 rounded-lg bg-go-500 px-3 py-2 text-xs font-semibold text-white hover:bg-go-600"
                  >
                    <UserCheck className="h-3.5 w-3.5" /> {t("admin.users.restore")}
                  </button>
                ) : (
                  <button
                    type="submit"
                    className="inline-flex items-center gap-1 rounded-lg border border-red-200 bg-white px-3 py-2 text-xs font-semibold text-red-600 hover:bg-red-50"
                  >
                    <UserX className="h-3.5 w-3.5" /> {t("admin.users.suspend")}
                  </button>
                )}
              </form>
              <form action={startImpersonationAction} className="ms-auto">
                <input type="hidden" name="userId" value={target.id} />
                <button
                  type="submit"
                  className="inline-flex items-center gap-1 rounded-lg bg-navy-900 px-3 py-2 text-xs font-semibold text-white hover:bg-navy-700"
                >
                  <KeyRound className="h-3.5 w-3.5" /> {t("admin.user.signInAs")}
                </button>
              </form>
            </div>
          )}
        </Card>

        {/* Bookings (traveller) */}
        {bookings.length > 0 && (
          <section>
            <h3 className="mb-3 text-lg font-bold text-navy-900">{t("admin.user.bookings")}</h3>
            <Card className="divide-y divide-navy-100">
              {bookings.slice(0, 8).map((b) => (
                <div key={b.id} className="flex items-center justify-between gap-3 p-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-sm font-bold text-navy-900">
                        {b.reference}
                      </span>
                      <StatusBadge status={b.status} />
                    </div>
                    <div className="text-xs text-navy-400">
                      {formatDate(b.startAt)} → {formatDate(b.endAt)}
                    </div>
                  </div>
                  <Link
                    href={`/app/booking/${b.id}`}
                    className="inline-flex items-center gap-1 rounded-lg border border-navy-200 bg-white px-3 py-1.5 text-xs font-semibold text-navy-600 hover:bg-navy-50"
                  >
                    <ArrowUpRight className="h-3.5 w-3.5" /> {t("admin.view")}
                  </Link>
                </div>
              ))}
            </Card>
          </section>
        )}

        {/* Support tickets */}
        {tickets.length > 0 && (
          <section>
            <h3 className="mb-3 text-lg font-bold text-navy-900">{t("admin.user.tickets")}</h3>
            <Card className="divide-y divide-navy-100">
              {tickets.slice(0, 5).map((tk) => (
                <div key={tk.id} className="flex items-center justify-between gap-3 p-4">
                  <div className="min-w-0">
                    <div className="font-semibold text-navy-900">{tk.topic}</div>
                    <div className="text-xs text-navy-400">{formatDateTime(tk.createdAt)}</div>
                  </div>
                  <Badge tone={tk.status === "open" ? "accent" : "go"}>
                    {tk.status === "open"
                      ? t("admin.support.openBadge")
                      : t("admin.support.resolvedBadge")}
                  </Badge>
                </div>
              ))}
            </Card>
          </section>
        )}

        {/* GDPR: export everything / anonymize */}
        {target.role !== "admin" && admin.adminScope !== "support" && (
          <Card className="border-red-100 p-5">
            <h3 className="flex items-center gap-2 text-lg font-bold text-navy-900">
              <ShieldCheck className="h-5 w-5 text-navy-500" /> {t("admin.gdpr.title")}
            </h3>
            <p className="mt-0.5 text-sm text-navy-500">{t("admin.gdpr.sub")}</p>
            <div className="mt-4 flex flex-wrap items-center gap-2">
              <a
                href={`/admin/export?type=userdata&user=${target.id}`}
                className="inline-flex items-center gap-1.5 rounded-lg border border-navy-200 bg-white px-3 py-2 text-xs font-semibold text-navy-700 hover:bg-navy-50"
              >
                <Download className="h-3.5 w-3.5" /> {t("admin.gdpr.export")}
              </a>
              {!anonymized && (
                <form action={anonymizeUserAction} className="flex items-center gap-2">
                  <input type="hidden" name="userId" value={target.id} />
                  <input
                    name="confirm"
                    placeholder={t("admin.gdpr.typeDelete")}
                    className="w-32 rounded-lg border border-red-200 bg-white px-2.5 py-2 text-xs font-mono text-red-700 placeholder:text-navy-300"
                  />
                  <button
                    type="submit"
                    className="inline-flex items-center gap-1.5 rounded-lg border border-red-200 bg-white px-3 py-2 text-xs font-semibold text-red-600 hover:bg-red-50"
                  >
                    <Trash2 className="h-3.5 w-3.5" /> {t("admin.gdpr.anonymize")}
                  </button>
                </form>
              )}
            </div>
          </Card>
        )}

        {/* Internal notes + admin activity on this user */}
        <section>
          <h3 className="mb-3 flex items-center gap-2 text-lg font-bold text-navy-900">
            <ScrollText className="h-5 w-5 text-navy-500" /> {t("admin.user.notes")}
          </h3>
          <Card className="p-4">
            <form action={addUserNoteAction} className="flex gap-2">
              <input type="hidden" name="userId" value={target.id} />
              <input
                name="note"
                required
                placeholder={t("admin.user.notePh")}
                className="min-w-0 flex-1 rounded-xl border border-navy-200 bg-white px-3.5 py-2.5 text-sm text-navy-900 placeholder:text-navy-300 focus:border-brand-400 focus:outline-none"
              />
              <Button type="submit" size="sm">
                {t("admin.user.addNote")}
              </Button>
            </form>
            <div className="mt-4 divide-y divide-navy-100">
              {activity.length === 0 && (
                <p className="py-2 text-sm text-navy-400">{t("admin.user.noActivity")}</p>
              )}
              {activity.map((a) => (
                <div key={a.id} className="flex items-start justify-between gap-3 py-2.5 text-sm">
                  <div className="min-w-0">
                    <span className="font-semibold text-navy-900">{a.adminName}</span>{" "}
                    <span className="font-mono text-xs text-navy-500">{a.action}</span>
                    {a.detail && <p className="text-navy-600">{a.detail}</p>}
                  </div>
                  <span className="shrink-0 text-xs text-navy-400">
                    {formatDateTime(a.createdAt)}
                  </span>
                </div>
              ))}
            </div>
          </Card>
        </section>
      </div>
    </PortalShell>
  );
}
