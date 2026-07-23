import Link from "next/link";
import { redirect } from "next/navigation";
import type { Metadata } from "next";
import {
  ArrowLeftRight,
  ArrowUpRight,
  CalendarCheck,
  KeyRound,
  ScrollText,
  ShieldCheck,
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
import { getUsersByIds } from "@/lib/data/users";
import { listBookingsForTraveller } from "@/lib/data/bookings";
import { getHostForUser, getSpacesForHost } from "@/lib/data/hosts";
import { listSupportTickets } from "@/lib/data/support";
import { listAdminActionsForTarget } from "@/lib/data/admin-actions";
import { setUserRoleAction, setUserSuspendedAction } from "@/lib/user-actions";
import { addUserNoteAction, startImpersonationAction } from "@/lib/admin-suite-actions";
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
}: {
  params: Promise<{ id: string }>;
}) {
  const admin = await requireRole("admin");
  const { t } = await getI18n();
  const { id } = await params;

  const target = (await getUsersByIds([id])).get(id);
  if (!target) redirect("/admin/users");

  const bookings =
    target.role === "traveller" ? await listBookingsForTraveller(target.id) : [];
  const totalSpend = bookings
    .filter((b) => b.status !== "cancelled" && b.status !== "requested")
    .reduce((s, b) => s + b.price.total, 0);
  const host = target.role === "host" ? await getHostForUser(target) : null;
  const hostSpaces = host ? await getSpacesForHost(host.id) : [];
  const tickets = (await listSupportTickets().catch(() => [])).filter(
    (tk) => tk.email.toLowerCase() === target.email.toLowerCase()
  );
  const activity = await listAdminActionsForTarget(target.id);

  return (
    <PortalShell user={admin} nav={adminNav} title="nav.users">
      <div className="mx-auto max-w-3xl space-y-6">
        <Link href="/admin/users" className="text-sm font-semibold text-brand-600">
          ← {t("nav.users")}
        </Link>

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
                <StatusBadge status={host.verificationStatus} />
              </>
            )}
          </div>

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
