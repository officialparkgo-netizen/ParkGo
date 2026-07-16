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
    <footer className="bg-navy-950 text-navy-200">
      {/* CTA strip */}
      <div className="border-b border-white/10">
        <div className="container-px flex flex-col items-center justify-between gap-4 py-8 sm:flex-row">
          <div>
            <p className="text-lg font-bold text-white">{t("home.cta.heading")}</p>
            <p className="mt-0.5 text-sm text-navy-400">{t("brand.tagline")}</p>
          </div>
          <Link
            href="/app/search"
            className="inline-flex shrink-0 items-center gap-2 rounded-xl bg-brand-500 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-brand-600"
          >
            {t("home.cta.find")} <ArrowRight className="h-4 w-4 rtl:-scale-x-100" aria-hidden />
          </Link>
        </div>
      </div>

      <div className="container-px py-14">
        <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-5">
          <div className="max-w-sm lg:col-span-2">
            <Logo inverted />
            <p className="mt-4 text-sm text-navy-300">{t("brand.tagline")}</p>
            <p className="mt-2 text-sm text-navy-400">{t("footer.integrated")}</p>
            <div className="mt-5 flex flex-wrap gap-2">
              {trustChips.map((c) => (
                <span
                  key={c.label}
                  className="inline-flex items-center gap-1.5 rounded-full bg-white/5 px-3 py-1.5 text-xs font-medium text-navy-200 ring-1 ring-inset ring-white/10"
                >
                  <c.icon className="h-3.5 w-3.5 text-brand-400" aria-hidden /> {c.label}
                </span>
              ))}
            </div>
            <a
              href={`mailto:${COMPANY.supportEmail}`}
              className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-navy-200 transition-colors hover:text-white"
            >
              <Mail className="h-4 w-4 text-brand-400" aria-hidden /> {COMPANY.supportEmail}
            </a>
          </div>

          {cols.map((col) => (
            <div key={col.title}>
              <h4 className="text-sm font-bold uppercase tracking-wide text-navy-400">
                {col.title}
              </h4>
              <ul className="mt-4 space-y-2.5">
                {col.links.map((l) => (
                  <li key={l.href + l.label}>
                    <Link
                      href={l.href}
                      className="text-sm text-navy-300 transition-colors hover:text-white"
                    >
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-white/10 pt-6 text-sm text-navy-400 sm:flex-row">
          <p>
            © {new Date().getFullYear()} {COMPANY.legalName}. {t("footer.rights")}
          </p>
          <p>{t("brand.tagline")}</p>
        </div>
        <div className="mt-4 space-y-1 text-center text-xs text-navy-500 sm:text-left">
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
              className="font-semibold text-navy-400 transition-colors hover:text-navy-200"
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
