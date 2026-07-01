import Link from "next/link";
import { Logo } from "@/components/brand/logo";
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
        { href: "/about", label: "About & team" },
        { href: "/trust-safety", label: t("nav.trust") },
        { href: "/blog", label: "Blog" },
        { href: "/faq", label: "FAQ" },
        { href: "/contact", label: "Contact" },
      ],
    },
    {
      title: t("footer.legal"),
      links: [
        { href: "/privacy", label: "Privacy" },
        { href: "/terms", label: "Terms" },
        { href: "/trust-safety", label: "Trust & Safety" },
      ],
    },
  ];

  return (
    <footer className="border-t border-navy-100 bg-navy-50/50">
      <div className="container-px py-14">
        <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-4">
          <div className="max-w-xs">
            <Logo />
            <p className="mt-4 text-sm text-navy-600">{t("brand.tagline")}</p>
            <p className="mt-3 text-sm text-navy-500">
              Integrated airport access for the UK &amp; Ireland.
            </p>
          </div>
          {cols.map((col) => (
            <div key={col.title}>
              <h4 className="text-sm font-bold uppercase tracking-wide text-navy-500">
                {col.title}
              </h4>
              <ul className="mt-4 space-y-2.5">
                {col.links.map((l) => (
                  <li key={l.href + l.label}>
                    <Link
                      href={l.href}
                      className="text-sm text-navy-600 hover:text-navy-900"
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
            © {new Date().getFullYear()} ParkGo. {t("footer.rights")}
          </p>
          <p>Park Smart. Travel Easy.</p>
        </div>
        <p className="mt-4 text-center text-xs text-navy-400 sm:text-left">
          ParkGo Limited holds Employers&apos; Liability (Compulsory) Insurance (£5m).
        </p>
      </div>
    </footer>
  );
}
