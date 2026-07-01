import Link from "next/link";
import { Menu } from "lucide-react";
import { Logo } from "@/components/brand/logo";
import { buttonVariants } from "@/components/ui/button";
import { LanguageSwitcher } from "@/components/common/language-switcher";
import { getI18n } from "@/lib/i18n";

export async function SiteHeader() {
  const { t, locale } = await getI18n();

  const links = [
    { href: "/how-it-works", label: t("nav.how") },
    { href: "/travellers", label: t("nav.travellers") },
    { href: "/hosts", label: t("nav.hosts") },
    { href: "/pricing", label: t("nav.pricing") },
    { href: "/trust-safety", label: t("nav.trust") },
  ];

  return (
    <header className="sticky top-0 z-40 border-b border-navy-100 bg-white/90 backdrop-blur">
      <div className="container-px flex h-16 items-center justify-between gap-4">
        <Logo />

        <nav className="hidden items-center gap-6 lg:flex">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="link-underline text-sm font-medium text-navy-700 hover:text-navy-900"
            >
              {l.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2 sm:gap-3">
          <LanguageSwitcher current={locale} className="hidden sm:inline-flex" />
          <Link href="/login" className={buttonVariants({ variant: "ghost", size: "sm", className: "hidden sm:inline-flex" })}>
            {t("nav.signin")}
          </Link>
          <Link href="/app" className={buttonVariants({ variant: "primary", size: "sm" })}>
            {t("nav.getStarted")}
          </Link>

          {/* Mobile menu (CSS-only via <details>) */}
          <details className="relative lg:hidden">
            <summary className="flex h-9 w-9 cursor-pointer list-none items-center justify-center rounded-lg text-navy-700 hover:bg-navy-50 [&::-webkit-details-marker]:hidden">
              <Menu className="h-5 w-5" />
            </summary>
            <div className="absolute right-0 mt-2 w-60 rounded-2xl border border-navy-100 bg-white p-2 shadow-card-lg">
              {links.map((l) => (
                <Link
                  key={l.href}
                  href={l.href}
                  className="block rounded-lg px-3 py-2 text-sm font-medium text-navy-700 hover:bg-navy-50"
                >
                  {l.label}
                </Link>
              ))}
              <div className="my-2 border-t border-navy-100" />
              <Link href="/login" className="block rounded-lg px-3 py-2 text-sm font-medium text-navy-700 hover:bg-navy-50">
                {t("nav.signin")}
              </Link>
              <div className="px-3 py-2">
                <LanguageSwitcher current={locale} />
              </div>
            </div>
          </details>
        </div>
      </div>
    </header>
  );
}
