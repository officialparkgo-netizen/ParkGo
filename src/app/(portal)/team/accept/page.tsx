import Link from "next/link";
import type { Metadata } from "next";
import { AlertTriangle } from "lucide-react";
import { Card } from "@/components/ui/card";
import { StaffShell } from "@/components/auth/staff-shell";
import { TeamPasswordForm } from "@/components/auth/team-password-form";
import { getUserProfile } from "@/lib/data/users";
import { inviteeKind, peekInviteUserId, verifyInviteToken } from "@/lib/team-invite";
import { getI18n } from "@/lib/i18n";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Set your password",
  path: "/team/accept",
  noindex: true,
});

/** Landing page for a staff invite link: choose a password, get signed in. */
export default async function TeamAcceptPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  const { t } = await getI18n();
  const { token } = await searchParams;

  const claimedId = peekInviteUserId(token);
  const target = claimedId ? await getUserProfile(claimedId) : null;
  const check = verifyInviteToken(token, target?.inviteNonce);
  const valid = !!target && check.ok && !!inviteeKind(target);

  if (!valid) {
    const reason = !check.ok ? check.reason : "invalid";
    return (
      <StaffShell
        title={t("team.accept.deadTitle")}
        subtitle={t("team.accept.deadSub")}
        backLabel={t("nav.backToSite")}
      >
        <Card className="p-6 text-center" data-invite-invalid>
          <AlertTriangle className="mx-auto mb-3 h-8 w-8 text-accent-500" aria-hidden />
          <p className="font-semibold text-navy-900">
            {reason === "expired" ? t("team.accept.expired") : t("team.accept.used")}
          </p>
          <p className="mt-1 text-sm text-navy-500">{t("team.accept.askAdmin")}</p>
          <Link
            href="/team/login"
            className="mt-4 inline-block text-sm font-semibold text-brand-600 hover:text-brand-700"
          >
            {t("team.login.title")} →
          </Link>
        </Card>
      </StaffShell>
    );
  }

  return (
    <StaffShell
      title={t("team.accept.title")}
      subtitle={t("team.accept.sub").replace("{name}", target.name)}
      backLabel={t("nav.backToSite")}
    >
      <Card className="p-6">
        <p className="mb-4 rounded-xl bg-navy-50 px-3.5 py-2.5 text-sm text-navy-700">
          {t("team.accept.account")} <strong>{target.email}</strong>
        </p>
        <TeamPasswordForm
          token={token ?? ""}
          labels={{
            password: t("team.field.password"),
            confirm: t("team.field.confirm"),
            submit: t("team.accept.submit"),
            hint: t("team.accept.hint"),
            errShort: t("team.err.short"),
            errMismatch: t("team.err.mismatch"),
            errLink: t("team.err.link"),
            errSave: t("team.err.save"),
          }}
        />
      </Card>
    </StaffShell>
  );
}
