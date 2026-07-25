import Link from "next/link";
import { ShieldCheck } from "lucide-react";
import { Container, Eyebrow } from "@/components/ui/section";
import { pageMetadata } from "@/lib/seo";
import { getI18n } from "@/lib/i18n";

export const metadata = pageMetadata({
  title: "Privacy Policy",
  description:
    "How ParkGo collects, uses and protects your personal data under UK GDPR and the Data Protection Act 2018 — including KYC handling, lawful bases, retention and your rights.",
  path: "/privacy",
});

const LAST_UPDATED = "15 July 2026";

export default async function PrivacyPage() {
  const { t } = await getI18n();

  return (
    <>
      {/* ---------------------------------------------------------------- Hero */}
      <section className="relative overflow-hidden bg-gradient-to-b from-navy-50/60 to-white">
        <div className="absolute inset-0 bg-grid opacity-60" aria-hidden />
        <Container className="relative py-14 lg:py-16">
          <div className="mx-auto max-w-3xl">
            <Eyebrow>{t("footer.legal")}</Eyebrow>
            <h1 className="flex items-center gap-3 text-4xl font-extrabold tracking-tight text-navy-900">
              <ShieldCheck className="h-9 w-9 text-go-600" /> {t("privacy.hero.title")}
            </h1>
            <p className="mt-4 text-lg text-navy-600">
              {t("privacy.hero.intro")}
            </p>
            <p className="mt-4 text-sm font-semibold text-navy-400">
              {t("privacy.lastUpdated")} {LAST_UPDATED}
            </p>
          </div>
        </Container>
      </section>

      {/* -------------------------------------------------------- Policy */}
      <Container className="py-12 sm:py-16">
        <article className="mx-auto max-w-3xl space-y-8 text-navy-700 leading-relaxed [&_li]:pl-1 [&_ul]:list-disc [&_ul]:space-y-2 [&_ul]:pl-6 [&_ul]:marker:text-brand-400">
          <Section title={t("privacy.who.title")}>
            <p>{t("privacy.who.p1")}</p>
            <p>{t("privacy.who.p2")}</p>
          </Section>

          <Section title={t("privacy.data.title")}>
            <p>{t("privacy.data.intro")}</p>
            <ul>
              <li>
                <strong>{t("privacy.data.traveller.label")}</strong> {t("privacy.data.traveller.body")}
              </li>
              <li>
                <strong>{t("privacy.data.kyc.label")}</strong> {t("privacy.data.kyc.body")}
              </li>
              <li>
                <strong>{t("privacy.data.booking.label")}</strong> {t("privacy.data.booking.body")}
              </li>
              <li>
                <strong>{t("privacy.data.travelDay.label")}</strong> {t("privacy.data.travelDay.body")}
              </li>
              <li>
                <strong>{t("privacy.data.technical.label")}</strong> {t("privacy.data.technical.body")}
              </li>
            </ul>
          </Section>

          <Section title={t("privacy.lawful.title")}>
            <p>{t("privacy.lawful.intro")}</p>
            <ul>
              <li>
                <strong>{t("privacy.lawful.contract.label")}</strong> {t("privacy.lawful.contract.body")}
              </li>
              <li>
                <strong>{t("privacy.lawful.legal.label")}</strong> {t("privacy.lawful.legal.body")}
              </li>
              <li>
                <strong>{t("privacy.lawful.interests.label")}</strong> {t("privacy.lawful.interests.body")}
              </li>
              <li>
                <strong>{t("privacy.lawful.consent.label")}</strong> {t("privacy.lawful.consent.body")}
              </li>
            </ul>
            <p>{t("privacy.lawful.note")}</p>
          </Section>

          <Section title={t("privacy.share.title")}>
            <p>{t("privacy.share.p1")}</p>
            <p>{t("privacy.share.p2")}</p>
          </Section>

          <Section title={t("privacy.transfers.title")}>
            <p>{t("privacy.transfers.body")}</p>
          </Section>

          <Section title={t("privacy.retention.title")}>
            <p>{t("privacy.retention.body")}</p>
          </Section>

          <Section title={t("privacy.rights.title")}>
            <p>{t("privacy.rights.intro")}</p>
            <ul>
              <li>{t("privacy.rights.access")}</li>
              <li>{t("privacy.rights.rectify")}</li>
              <li>{t("privacy.rights.erase")}</li>
              <li>{t("privacy.rights.restrict")}</li>
              <li>{t("privacy.rights.portability")}</li>
              <li>{t("privacy.rights.withdraw")}</li>
            </ul>
            <p>{t("privacy.rights.note")}</p>
          </Section>

          <Section title={t("privacy.cookies.title")}>
            <p>{t("privacy.cookies.body")}</p>
          </Section>

          <Section title={t("privacy.security.title")}>
            <p>{t("privacy.security.body")}</p>
          </Section>

          <Section title={t("privacy.dpo.title")}>
            <p>{t("privacy.dpo.intro")}</p>
            <ul>
              <li>
                {t("privacy.dpo.emailLabel")}{" "}
                <Link href="mailto:info@parkgo.ai" className="font-semibold text-brand-700">
                  info@parkgo.ai
                </Link>
              </li>
              <li>{t("privacy.dpo.post")}</li>
            </ul>
            <p>{t("privacy.dpo.updates")}</p>
          </Section>
        </article>
      </Container>
    </>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="space-y-3">
      <h2 className="text-2xl font-bold tracking-tight text-navy-900">{title}</h2>
      {children}
    </section>
  );
}
