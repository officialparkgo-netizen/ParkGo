import Link from "next/link";
import type { Metadata } from "next";
import { CheckCircle2, Clock } from "lucide-react";
import { Card } from "@/components/ui/card";
import { StaffShell } from "@/components/auth/staff-shell";
import { TeamLoginForm } from "@/components/auth/team-login-form";
import { IS_LIVE } from "@/lib/config";
import { getI18n } from "@/lib/i18n";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Team sign in",
  path: "/team/login",
  noindex: true,
});

/** Staff-only sign-in (full admins + support agents). */
export default async function TeamLoginPage({
  searchParams,
}: {
  searchParams: Promise<{ set?: string; timeout?: string }>;
}) {
  const { t } = await getI18n();
  const { set, timeout } = await searchParams;

  return (
    <StaffShell
      title={t("team.login.title")}
      subtitle={t("team.login.sub")}
      backLabel={t("nav.backToSite")}
    >
      {set === "1" && (
        <div
          className="mb-4 flex items-center gap-2 rounded-2xl border border-go-200 bg-go-50 px-4 py-3 text-sm font-semibold text-go-700"
          data-password-set
        >
          <CheckCircle2 className="h-5 w-5 shrink-0" /> {t("team.login.passwordSet")}
        </div>
      )}
      {timeout === "1" && (
        <div
          className="mb-4 flex items-center gap-2 rounded-2xl border border-accent-200 bg-accent-50 px-4 py-3 text-sm font-semibold text-accent-700"
          data-idle-timeout
        >
          <Clock className="h-5 w-5 shrink-0" /> {t("team.login.timedOut")}
        </div>
      )}
      <Card className="p-6">
        <TeamLoginForm
          labels={{
            email: t("team.field.email"),
            password: t("team.field.password"),
            submit: t("team.login.submit"),
            errCredentials: t("team.err.credentials"),
          }}
        />
        <p className="mt-4 text-center text-xs text-navy-400">{t("team.login.note")}</p>
        {IS_LIVE && (
          <p className="mt-2 text-center text-xs">
            <Link href="/login" className="font-semibold text-brand-600 hover:text-brand-700">
              {t("team.login.forgot")}
            </Link>
          </p>
        )}
      </Card>
    </StaffShell>
  );
}
