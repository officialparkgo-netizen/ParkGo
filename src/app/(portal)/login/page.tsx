import Link from "next/link";
import { ArrowLeft, ArrowRight, CheckCircle2, Home, Plane, ShieldCheck } from "lucide-react";
import type { Metadata } from "next";
import { Logo } from "@/components/brand/logo";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { DEMO_LOGINS } from "@/lib/auth";
import { loginAs } from "@/lib/auth-actions";
import { IS_LIVE } from "@/lib/config";
import { AuthForm } from "@/components/auth/auth-form";
import { getI18n } from "@/lib/i18n";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Sign in",
  path: "/login",
  noindex: true,
});

const ICONS = {
  traveller: Plane,
  host: Home,
  admin: ShieldCheck,
} as const;

const PANEL_TRUST = [
  "home.hero.trust.hosts",
  "home.hero.trust.drivers",
  "home.hero.trust.camera",
  "home.hero.trust.cancel",
] as const;

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string; error?: string; suspended?: string; deleted?: string }>;
}) {
  const { next, error, suspended, deleted } = await searchParams;
  const { t } = await getI18n();

  return (
    <div className="min-h-screen bg-gradient-to-b from-navy-50/70 to-white lg:grid lg:grid-cols-[5fr_7fr]">
      {/* Brand panel (desktop) */}
      <aside className="relative hidden overflow-hidden bg-navy-950 p-10 lg:flex lg:flex-col lg:justify-between">
        <div aria-hidden className="absolute -top-24 -end-24 h-80 w-80 rounded-full bg-brand-500/20 blur-3xl" />
        <div aria-hidden className="absolute -bottom-32 -start-20 h-96 w-96 rounded-full bg-brand-500/10 blur-3xl" />
        <div className="relative">
          <Logo inverted />
        </div>
        <div className="relative max-w-sm">
          <h2 className="text-3xl font-extrabold leading-tight tracking-tight text-white xl:text-4xl">
            {t("login.panel.title")}
          </h2>
          <p className="mt-3 text-sm leading-relaxed text-white/70">{t("login.panel.sub")}</p>
          <ul className="mt-7 space-y-3">
            {PANEL_TRUST.map((key) => (
              <li key={key} className="flex items-center gap-2.5 text-sm font-medium text-white/85">
                <CheckCircle2 className="h-4.5 w-4.5 shrink-0 text-brand-400" aria-hidden />
                {t(key)}
              </li>
            ))}
          </ul>
        </div>
        <p className="relative text-xs text-white/40">© {new Date().getFullYear()} PARKGO LIMITED</p>
      </aside>

      {/* Content */}
      <div className="flex min-h-screen flex-col">
        <div className="container-px flex h-16 items-center justify-between">
          <span className="lg:hidden">
            <Logo />
          </span>
          <Link
            href="/"
            className="-me-2 ms-auto inline-flex min-h-[44px] items-center gap-1.5 rounded-lg px-2 text-sm font-semibold text-navy-600 transition-colors hover:bg-navy-50 hover:text-navy-900"
          >
            <ArrowLeft className="h-4 w-4 rtl:-scale-x-100" /> {t("nav.backToSite")}
          </Link>
        </div>

        <div className="container-px flex flex-1 items-center justify-center py-10">
          <div className="w-full max-w-2xl">
            {error && (
              <p className="mx-auto mb-6 max-w-md rounded-xl bg-red-50 px-4 py-3 text-center text-sm font-medium text-red-700">
                {t("login.linkError")}
              </p>
            )}
            {suspended && (
              <p className="mx-auto mb-6 max-w-md rounded-xl bg-red-50 px-4 py-3 text-center text-sm font-medium text-red-700">
                {t("login.suspended")}
              </p>
            )}
            {deleted && (
              <p className="mx-auto mb-6 max-w-md rounded-xl bg-go-50 px-4 py-3 text-center text-sm font-medium text-go-700" data-deleted-banner>
                {t("login.deleted")}
              </p>
            )}
            {IS_LIVE ? (
              <>
                <div className="text-center">
                  <h1 className="text-3xl font-extrabold tracking-tight text-navy-900">
                    {t("login.welcome")}
                  </h1>
                  <p className="mt-2 text-navy-600">{t("login.welcomeSub")}</p>
                </div>
                <div className="mt-8">
                  <AuthForm next={next} />
                </div>
              </>
            ) : (
              <>
                <div className="text-center">
                  <Badge tone="go" className="mb-3">
                    {t("login.demoMode")}
                  </Badge>
                  <h1 className="text-3xl font-extrabold tracking-tight text-navy-900">
                    {t("login.chooseRole")}
                  </h1>
                  <p className="mt-2 text-navy-600">{t("login.blurbIntro")}</p>
                </div>

                <div className="mt-8 grid gap-4 sm:grid-cols-2">
                  {DEMO_LOGINS.map((demo) => {
                    const Icon = ICONS[demo.role];
                    const action = loginAs.bind(null, demo.role, next);
                    return (
                      <Card key={demo.role} className="p-5 transition-shadow hover:shadow-card-lg">
                        <div className="flex items-start gap-3">
                          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-50 text-brand-700">
                            <Icon className="h-5 w-5" />
                          </div>
                          <div className="flex-1">
                            <h2 className="font-bold text-navy-900">{t(`login.role.${demo.role}`)}</h2>
                            <p className="text-sm text-navy-500">{t(`login.blurb.${demo.role}`)}</p>
                          </div>
                        </div>
                        <form action={action} className="mt-4">
                          <button
                            type="submit"
                            className={buttonVariants({
                              variant: demo.role === "admin" ? "navy" : "primary",
                              className: "w-full",
                            })}
                          >
                            {t("login.enterAs")} {t(`login.role.${demo.role}`)} <ArrowRight className="h-4 w-4 rtl:-scale-x-100" />
                          </button>
                        </form>
                      </Card>
                    );
                  })}
                </div>

                <p className="mt-6 text-center text-sm text-navy-400">{t("login.productionNote")}</p>
              </>
            )}

            <p className="mt-8 text-center text-sm text-navy-400">
              <Link
                href="/team/login"
                className="-mx-2 inline-block rounded-lg px-2 py-1.5 font-semibold text-navy-500 underline-offset-2 transition-colors hover:text-navy-800 hover:underline"
              >
                {t("login.staffLink")}
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
