import type { Metadata } from "next";
import { CheckCircle2, LockKeyhole, ShieldCheck, UserRound } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { PortalShell } from "@/components/portal/shell";
import { adminNav, hostNav, travellerNav } from "@/components/portal/navs";
import { PasswordForm } from "@/components/auth/password-form";
import { requireUser } from "@/lib/auth";
import { setOwnTwofaAction } from "@/lib/user-actions";
import { getI18n } from "@/lib/i18n";
import { initials } from "@/lib/utils";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Account",
  path: "/account",
  noindex: true,
});

export default async function AccountPage({
  searchParams,
}: {
  searchParams: Promise<{ reset?: string; twofa?: string }>;
}) {
  const user = await requireUser();
  const { t } = await getI18n();
  const { reset, twofa } = await searchParams;

  const nav =
    user.role === "admin" ? adminNav : user.role === "host" ? hostNav : travellerNav;

  return (
    <PortalShell user={user} nav={nav} title="account.title">
      <div className="mx-auto max-w-2xl space-y-6">
        {reset && (
          <div className="flex items-center gap-2 rounded-2xl border border-accent-200 bg-accent-50 px-4 py-3 font-semibold text-accent-500">
            <LockKeyhole className="h-5 w-5" /> {t("account.resetBanner")}
          </div>
        )}

        {/* Profile */}
        <Card className="flex items-center gap-4 p-5">
          <span
            className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full text-lg font-bold text-white"
            style={{ backgroundColor: user.avatarColor ?? "#F26A1B" }}
          >
            {initials(user.name)}
          </span>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="truncate font-bold text-navy-900">{user.name}</span>
              <Badge tone="navy">{t(`role.${user.role}`)}</Badge>
            </div>
            <p className="truncate text-sm text-navy-500">{user.email}</p>
          </div>
          <UserRound className="hidden h-6 w-6 text-navy-300 sm:block" />
        </Card>

        {/* Admin 2FA (self-service) */}
        {user.role === "admin" && (
          <Card className="p-5">
            {twofa && (
              <div className="mb-4 flex items-center gap-2 rounded-2xl border border-go-200 bg-go-50 px-4 py-3 text-sm font-semibold text-go-700">
                <CheckCircle2 className="h-5 w-5 shrink-0" />
                {twofa === "on" ? t("account.twofa.savedOn") : t("account.twofa.savedOff")}
              </div>
            )}
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="flex items-center gap-2 font-bold text-navy-900">
                  <ShieldCheck className="h-4 w-4 text-brand-600" /> {t("account.twofa.title")}
                </h2>
                <p className="mt-1 max-w-md text-sm text-navy-500">{t("account.twofa.sub")}</p>
              </div>
              <Badge tone={user.twofaEnabled ? "go" : "neutral"} data-twofa-state>
                {user.twofaEnabled ? t("account.twofa.on") : t("account.twofa.off")}
              </Badge>
            </div>
            <form action={setOwnTwofaAction} className="mt-4">
              <input type="hidden" name="state" value={user.twofaEnabled ? "off" : "on"} />
              <button
                type="submit"
                className={buttonVariants({
                  variant: user.twofaEnabled ? "outline" : "primary",
                  size: "sm",
                })}
              >
                {user.twofaEnabled ? t("account.twofa.disable") : t("account.twofa.enable")}
              </button>
            </form>
          </Card>
        )}

        {/* Change password */}
        <Card className="p-5">
          <h2 className="flex items-center gap-2 font-bold text-navy-900">
            <LockKeyhole className="h-4 w-4 text-brand-600" /> {t("account.password.title")}
          </h2>
          <p className="mb-4 mt-1 text-sm text-navy-500">{t("account.password.sub")}</p>
          <PasswordForm />
        </Card>

        <p className="flex items-center gap-2 text-xs text-navy-400">
          <ShieldCheck className="h-4 w-4 shrink-0 text-go-500" />
          {t("account.securityNote")}
        </p>
      </div>
    </PortalShell>
  );
}
