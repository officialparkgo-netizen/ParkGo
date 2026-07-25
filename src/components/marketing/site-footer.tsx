import Link from "next/link";
import { ArrowRight, Camera, Lock, Mail, ShieldCheck } from "lucide-react";
import { Logo } from "@/components/brand/logo";
import { COMPANY } from "@/lib/seo";
import { getI18n } from "@/lib/i18n";

export async function SiteFooter() {
  const { t } = await getI18n();

  const cols: { title: string; links: { href: string; label: string }[] }[] = [
    {
      title: t("footer.product"),
      links: [
        { href: "/how-it-works", label: t("nav.how") },
        { href: "/travellers", label: t("nav.travellers") },
        { href: "/hosts", label: t("nav.hosts") },
        { href: "/pricing", label: t("nav.pricing") },
      ],
    },
    {
      title: t("footer.company"),
      links: [
        { href: "/about", label: t("footer.about") },
        { href: "/trust-safety", label: t("nav.trust") },
        { href: "/blog", label: t("footer.blog") },
        { href: "/faq", label: t("footer.faq") },
        { href: "/contact", label: t("footer.contact") },
      ],
    },
    {
      title: t("footer.legal"),
      links: [
        { href: "/privacy", label: t("footer.privacy") },
        { href: "/terms", label: t("footer.terms") },
        { href: "/trust-safety", label: t("nav.trust") },
      ],
    },
  ];

  const trustChips = [
    { icon: ShieldCheck, label: t("home.hero.trust.hosts") },
    { icon: Camera, label: t("home.hero.trust.camera") },
    { icon: Lock, label: t("home.guarantee.secure.title") },
  ];

  return (
    <footer className="border-t border-navy-100 bg-navy-50/50">
      {/* CTA strip */}
      <div className="border-b border-navy-100">
        <div className="container-px flex flex-col items-center justify-between gap-4 py-8 sm:flex-row">
          <div>
            <p className="text-lg font-bold text-navy-900">{t("home.cta.heading")}</p>
            <p className="mt-0.5 text-sm text-navy-500">{t("brand.tagline")}</p>
          </div>
          <Link
            href="/app/search"
            className="inline-flex shrink-0 items-center gap-2 rounded-xl bg-brand-500 px-6 py-3 text-sm font-semibold text-navy-900 transition-colors hover:bg-brand-400"
          >
            {t("home.cta.find")} <ArrowRight className="h-4 w-4 rtl:-scale-x-100" aria-hidden />
          </Link>
        </div>
      </div>

      <div className="container-px py-14">
        <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-5">
          <div className="max-w-sm lg:col-span-2">
            <Logo />
            <p className="mt-4 text-sm text-navy-600">{t("brand.tagline")}</p>
            <p className="mt-2 text-sm text-navy-500">{t("footer.integrated")}</p>
            <div className="mt-5 flex flex-wrap gap-2">
              {trustChips.map((c) => (
                <span
                  key={c.label}
                  className="inline-flex items-center gap-1.5 rounded-full bg-white px-3 py-1.5 text-xs font-medium text-navy-600 ring-1 ring-inset ring-navy-200"
                >
                  <c.icon className="h-3.5 w-3.5 text-brand-600" aria-hidden /> {c.label}
                </span>
              ))}
            </div>
            <a
              href={`mailto:${COMPANY.supportEmail}`}
              className="-mx-2 mt-4 inline-flex min-h-[44px] items-center gap-2 rounded-lg px-2 text-sm font-semibold text-navy-700 transition-colors hover:bg-navy-50 hover:text-navy-900"
            >
              <Mail className="h-4 w-4 text-brand-600" aria-hidden /> {COMPANY.supportEmail}
            </a>
          </div>

          {cols.map((col) => (
            <div key={col.title}>
              {/* h2, not h4: the footer follows the page's last section, and a
                  jump in heading level is a dead end for screen-reader
                  navigation. It still *looks* like a small label. */}
              <h2 className="text-sm font-bold uppercase tracking-wide text-navy-500">
                {col.title}
              </h2>
              <ul className="mt-3">
                {col.links.map((l) => (
                  <li key={l.href + l.label}>
                    <Link
                      href={l.href}
                      // Padding rather than margin, so the whole 24px row is
                      // tappable — WCAG asks for 24×24, these links were 16px.
                      className="-mx-2 block rounded-lg px-2 py-1.5 text-sm text-navy-600 transition-colors hover:bg-navy-50 hover:text-navy-900"
                    >
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-navy-100 pt-6 text-sm text-navy-500 sm:flex-row">
          <p>
            © {new Date().getFullYear()} {COMPANY.legalName}. {t("footer.rights")}
          </p>
          <p>{t("brand.tagline")}</p>
        </div>
        <div className="mt-4 space-y-1 text-center text-xs text-navy-400 sm:text-left">
          <p>
            {COMPANY.legalName} · {t("footer.registered")} {COMPANY.registeredIn}
            {COMPANY.number && (
              <>
                {" "}
                · {t("footer.companyNo")} {COMPANY.number}
              </>
            )}
          </p>
          <p>
            {t("footer.regOffice")}: {COMPANY.registeredOffice} · {t("footer.ico")}:{" "}
            {COMPANY.icoRef}
          </p>
          <p>
            {t("footer.support")}:{" "}
            <a
              href={`mailto:${COMPANY.supportEmail}`}
              className="-mx-1 inline-block rounded px-1 py-1.5 font-semibold text-navy-500 transition-colors hover:text-navy-700"
            >
              {COMPANY.supportEmail}
            </a>
          </p>
          <p>{t("footer.insurance")}</p>
        </div>
      </div>
    </footer>
  );
}
