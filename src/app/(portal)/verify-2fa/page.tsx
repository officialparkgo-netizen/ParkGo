import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { KeyRound, Mail, ShieldCheck } from "lucide-react";
import { Logo } from "@/components/brand/logo";
import { Card } from "@/components/ui/card";
import { buttonVariants } from "@/components/ui/button";
import { getCurrentUser, rolePath } from "@/lib/auth";
import { twofaRequiredFor, hasAdmin2faSession } from "@/lib/admin-2fa";
import { currentAdminCode } from "@/lib/admin-2fa-core";
import { verifyAdmin2faAction, sendAdmin2faCodeAction } from "@/lib/admin-2fa-actions";
import { isEmailConfigured } from "@/lib/email";
import { IS_LIVE } from "@/lib/config";
import { getI18n } from "@/lib/i18n";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Admin verification",
  path: "/verify-2fa",
  noindex: true,
});

/** Second-factor gate for admin and host accounts (outside PortalShell). */
export default async function Admin2faPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string; error?: string; sent?: string }>;
}) {
  const { next: nextRaw, error, sent } = await searchParams;
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  if (user.role !== "admin" && user.role !== "host") redirect(rolePath(user.role));
  if (!twofaRequiredFor(user)) redirect(rolePath(user.role));

  const home = rolePath(user.role);
  const next = nextRaw && nextRaw.startsWith("/") && !nextRaw.startsWith("//") ? nextRaw : home;
  if (await hasAdmin2faSession(user.id)) redirect(next);

  const { t } = await getI18n();
  const maskedEmail = user.email.replace(/^(..).*(@.*)$/, "$1•••$2");
  // Without a configured email service the code is shown on-page instead —
  // degraded 2FA beats locking every admin out.
  const emailOk = isEmailConfigured();
  const showCodeOnPage = !IS_LIVE || !emailOk;

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-navy-50/70 to-white px-4">
      <Logo />
      <Card className="mt-6 w-full max-w-md p-7">
        <div className="flex items-center gap-3">
          <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-50 text-brand-600">
            <ShieldCheck className="h-5 w-5" aria-hidden />
          </span>
          <div>
            <h1 className="text-lg font-extrabold text-navy-900">{t("twofa.title")}</h1>
            <p className="text-sm text-navy-500">
              {t("twofa.sub")} <span className="font-semibold">{maskedEmail}</span>
            </p>
          </div>
        </div>

        {error && (
          <p className="mt-4 rounded-xl bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
            {t("twofa.error")}
          </p>
        )}
        {sent && (
          <p className="mt-4 rounded-xl bg-go-50 px-4 py-3 text-sm font-medium text-go-700">
            {t("twofa.sent")}
          </p>
        )}
        {showCodeOnPage && (
          <p className="mt-4 rounded-xl bg-navy-50 px-4 py-3 text-sm text-navy-700">
            {t("twofa.demo")}{" "}
            <code data-demo-code className="font-mono text-base font-bold tracking-widest text-navy-900">
              {currentAdminCode(user.id)}
            </code>
          </p>
        )}
        {IS_LIVE && !emailOk && (
          <p className="mt-2 rounded-xl bg-accent-50 px-4 py-3 text-xs text-accent-500">
            {t("twofa.noEmail")}
          </p>
        )}

        <form action={verifyAdmin2faAction} className="mt-5">
          <input type="hidden" name="next" value={next} />
          <label htmlFor="code" className="mb-1.5 block text-sm font-semibold text-navy-700">
            {t("twofa.codeLabel")}
          </label>
          <input
            id="code"
            name="code"
            inputMode="numeric"
            autoComplete="one-time-code"
            maxLength={6}
            required
            pattern="\d{6}"
            autoFocus
            className="w-full rounded-xl border border-navy-200 px-4 py-3 text-center font-mono text-2xl font-bold tracking-[0.5em] focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-100"
          />
          <button type="submit" className={buttonVariants({ size: "lg", className: "mt-4 w-full" })}>
            <KeyRound className="h-4 w-4" /> {t("twofa.verify")}
          </button>
        </form>

        {IS_LIVE && emailOk && (
          <form action={sendAdmin2faCodeAction} className="mt-3">
            <input type="hidden" name="next" value={next} />
            <button
              type="submit"
              className={buttonVariants({ variant: "outline", className: "w-full" })}
            >
              <Mail className="h-4 w-4" /> {t("twofa.send")}
            </button>
          </form>
        )}
      </Card>
    </div>
  );
}
