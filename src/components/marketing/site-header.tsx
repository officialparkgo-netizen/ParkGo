import Link from "next/link";
import { ArrowRight, KeyRound, Plane, Route, ShieldCheck, Tag } from "lucide-react";
import { Logo } from "@/components/brand/logo";
import { buttonVariants } from "@/components/ui/button";
import { LanguageSwitcher } from "@/components/common/language-switcher";
import { NavLinks } from "@/components/marketing/nav-links";
import { MobileNav, StickyHeader } from "@/components/common/mobile-nav";
import { getI18n } from "@/lib/i18n";

export async function SiteHeader() {
  const { t, locale } = await getI18n();

  const links = [
    { href: "/how-it-works", label: t("nav.how"), icon: <Route className="h-5 w-5 shrink-0" aria-hidden /> },
    { href: "/travellers", label: t("nav.travellers"), icon: <Plane className="h-5 w-5 shrink-0" aria-hidden /> },
    { href: "/hosts", label: t("nav.hosts"), icon: <KeyRound className="h-5 w-5 shrink-0" aria-hidden /> },
    { href: "/pricing", label: t("nav.pricing"), icon: <Tag className="h-5 w-5 shrink-0" aria-hidden /> },
    { href: "/trust-safety", label: t("nav.trust"), icon: <ShieldCheck className="h-5 w-5 shrink-0" aria-hidden /> },
  ];

  return (
    <StickyHeader className="sticky top-0 z-40 border-b border-transparent bg-white/80 backdrop-blur">
      <div className="container-px flex h-16 items-center justify-between gap-4">
        <Logo />

        <NavLinks items={links.map(({ href, label }) => ({ href, label }))} />

        <div className="flex items-center gap-2 sm:gap-3">
          <LanguageSwitcher current={locale} className="hidden sm:inline-flex" />
          <Link href="/login" className={buttonVariants({ variant: "ghost", size: "sm", className: "hidden sm:inline-flex" })}>
            {t("nav.signin")}
          </Link>
          <Link href="/app" className={buttonVariants({ variant: "primary", size: "md" })}>
            {t("nav.getStarted")} <ArrowRight className="h-4 w-4 rtl:-scale-x-100" aria-hidden />
          </Link>

          {/* Mobile menu (accessible slide-in drawer) */}
          <MobileNav
            items={links}
            label={t("nav.menu")}
            closeLabel={t("nav.closeMenu")}
            footer={
              <div className="space-y-3">
                <Link
                  href="/app"
                  className={buttonVariants({ variant: "primary", size: "lg", className: "w-full" })}
                >
                  {t("nav.getStarted")}
                </Link>
                <Link
                  href="/login"
                  className={buttonVariants({ variant: "outline", size: "lg", className: "w-full" })}
                >
                  {t("nav.signin")}
                </Link>
                <div className="pt-1">
                  <LanguageSwitcher current={locale} fullWidth openUp />
                </div>
              </div>
            }
          />
        </div>
      </div>
    </StickyHeader>
  );
}
