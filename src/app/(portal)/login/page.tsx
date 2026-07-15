import Link from "next/link";
import { ArrowLeft, ArrowRight, Home, Plane, ShieldCheck } from "lucide-react";
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

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string; error?: string }>;
}) {
  const { next, error } = await searchParams;
  const { t } = await getI18n();

  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-b from-navy-50/70 to-white">
      <div className="container-px flex h-16 items-center justify-between">
        <Logo />
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-sm font-semibold text-navy-600 hover:text-navy-900"
        >
          <ArrowLeft className="h-4 w-4" /> {t("nav.backToSite")}
        </Link>
      </div>

      <div className="container-px flex flex-1 items-center justify-center py-10">
        <div className="w-full max-w-2xl">
          {error && (
            <p className="mx-auto mb-6 max-w-md rounded-xl bg-red-50 px-4 py-3 text-center text-sm font-medium text-red-700">
              {t("login.linkError")}
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
            <p className="mt-2 text-navy-600">
              {t("login.blurbIntro")}
            </p>
          </div>

          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            {DEMO_LOGINS.map((demo) => {
              const Icon = ICONS[demo.role];
              const action = loginAs.bind(null, demo.role, next);
              return (
                <Card key={demo.role} className="p-5">
                  <div className="flex items-start gap-3">
                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-50 text-brand-600">
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
                      {t("login.enterAs")} {t(`login.role.${demo.role}`)} <ArrowRight className="h-4 w-4" />
                    </button>
                  </form>
                </Card>
              );
            })}
          </div>

          <p className="mt-6 text-center text-sm text-navy-400">
            {t("login.productionNote")}
          </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
