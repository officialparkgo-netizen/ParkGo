import Link from "next/link";
import type { Metadata } from "next";
import { ArrowLeftRight, Download, Mail, UserCheck, UserX, Users } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { PortalShell } from "@/components/portal/shell";
import { adminNav } from "@/components/portal/navs";
import { requireRole } from "@/lib/auth";
import { listAllUsers } from "@/lib/data/users";
import { listWaitlist } from "@/lib/data/waitlist";
import { setUserRoleAction, setUserSuspendedAction } from "@/lib/user-actions";
import { formatDate } from "@/lib/utils";
import { getI18n } from "@/lib/i18n";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Users",
  path: "/admin/users",
  noindex: true,
});

export default async function AdminUsersPage() {
  const user = await requireRole("admin");
  const { t } = await getI18n();

  const allUsers = await listAllUsers();
  const recentUsers = allUsers
    .slice()
    .sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt))
    .slice(0, 25);
  const waitlist = await listWaitlist().catch(() => []);

  return (
    <PortalShell user={user} nav={adminNav} title="nav.users">
      <div className="mx-auto max-w-4xl space-y-8">
        <Link href="/admin" className="text-sm font-semibold text-brand-600">
          ← {t("common.backToDash")}
        </Link>

        <section id="users">
          <div className="mb-3 flex items-center gap-2">
            <h3 className="flex items-center gap-2 text-lg font-bold text-navy-900">
              <Users className="h-5 w-5 text-navy-500" /> {t("admin.section.users")}
            </h3>
            <Badge tone="neutral">{allUsers.length} {t("admin.total")}</Badge>
            <a href="/admin/export?type=users" className={buttonVariants({ variant: "outline", size: "sm", className: "ms-auto" })}><Download className="h-4 w-4" /> {t("admin.exportCsv")}</a>
          </div>
          <Card className="divide-y divide-navy-100">
            {recentUsers.length === 0 && (
              <div className="p-6 text-center text-navy-500">{t("admin.users.empty")}</div>
            )}
            {recentUsers.map((u) => (
              <div key={u.id} className="flex flex-wrap items-center justify-between gap-3 p-4">
                <Link href={`/admin/users/${u.id}`} className="min-w-0 hover:opacity-80">
                  <div className="font-semibold text-navy-900 underline-offset-2 hover:underline">
                    {u.name}
                  </div>
                  <div className="truncate text-xs text-navy-400">{u.email}</div>
                </Link>
                <div className="flex flex-wrap items-center gap-2">
                  {u.suspended && <Badge tone="danger">{t("admin.users.suspended")}</Badge>}
                  <Badge tone={u.role === "admin" ? "accent" : u.role === "host" ? "brand" : "neutral"}>
                    {u.role}
                  </Badge>
                  <span className="text-xs text-navy-400">
                    {t("admin.users.joined")} {formatDate(u.createdAt)}
                  </span>
                  {u.role !== "admin" && (
                    <>
                      <form action={setUserRoleAction}>
                        <input type="hidden" name="userId" value={u.id} />
                        <input
                          type="hidden"
                          name="role"
                          value={u.role === "host" ? "traveller" : "host"}
                        />
                        <button
                          type="submit"
                          className="inline-flex items-center gap-1 rounded-lg border border-navy-200 bg-white px-3 py-1.5 text-xs font-semibold text-navy-600 hover:bg-navy-50"
                        >
                          <ArrowLeftRight className="h-3.5 w-3.5" />{" "}
                          {u.role === "host"
                            ? t("admin.users.makeTraveller")
                            : t("admin.users.makeHost")}
                        </button>
                      </form>
                      <form action={setUserSuspendedAction}>
                        <input type="hidden" name="userId" value={u.id} />
                        <input
                          type="hidden"
                          name="state"
                          value={u.suspended ? "restore" : "suspend"}
                        />
                        {u.suspended ? (
                          <button
                            type="submit"
                            className="inline-flex items-center gap-1 rounded-lg bg-go-500 px-3 py-1.5 text-xs font-semibold text-white hover:bg-go-600"
                          >
                            <UserCheck className="h-3.5 w-3.5" /> {t("admin.users.restore")}
                          </button>
                        ) : (
                          <button
                            type="submit"
                            className="inline-flex items-center gap-1 rounded-lg border border-red-200 bg-white px-3 py-1.5 text-xs font-semibold text-red-600 hover:bg-red-50"
                          >
                            <UserX className="h-3.5 w-3.5" /> {t("admin.users.suspend")}
                          </button>
                        )}
                      </form>
                    </>
                  )}
                </div>
              </div>
            ))}
          </Card>
        </section>

        {/* Waitlist signups from the marketing site */}
        <section id="waitlist">
          <div className="mb-3 flex items-center gap-2">
            <h3 className="flex items-center gap-2 text-lg font-bold text-navy-900">
              <Mail className="h-5 w-5 text-navy-500" /> {t("admin.section.waitlist")}
            </h3>
            <Badge tone="neutral">{waitlist.length} {t("admin.total")}</Badge>
            <a href="/admin/export?type=waitlist" className={buttonVariants({ variant: "outline", size: "sm", className: "ms-auto" })}><Download className="h-4 w-4" /> {t("admin.exportCsv")}</a>
          </div>
          <Card className="divide-y divide-navy-100">
            {waitlist.length === 0 && (
              <div className="p-6 text-center text-navy-500">{t("admin.waitlist.empty")}</div>
            )}
            {waitlist.slice(0, 10).map((w) => (
              <div key={w.id} className="flex flex-wrap items-center justify-between gap-3 p-4">
                <div className="min-w-0">
                  <div className="truncate font-semibold text-navy-900">{w.email}</div>
                  {w.airport && <div className="text-xs text-navy-400">{w.airport}</div>}
                </div>
                <div className="flex items-center gap-3">
                  <Badge tone={w.role === "host" ? "brand" : "neutral"}>{w.role}</Badge>
                  <span className="text-xs text-navy-400">
                    {t("admin.waitlist.signedUp")} {formatDate(w.createdAt)}
                  </span>
                </div>
              </div>
            ))}
          </Card>
        </section>
      </div>
    </PortalShell>
  );
}
