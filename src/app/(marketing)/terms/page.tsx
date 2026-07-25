import Link from "next/link";
import { ScrollText } from "lucide-react";
import { Container, Eyebrow } from "@/components/ui/section";
import { pageMetadata } from "@/lib/seo";
import { getI18n } from "@/lib/i18n";

export const metadata = pageMetadata({
  title: "Terms of Service",
  description:
    "The terms governing your use of the ParkGo marketplace — our role, bookings and payments, cancellations, host obligations, the independent transfer operator, prohibited use, liability and governing law.",
  path: "/terms",
});

const LAST_UPDATED = "15 July 2026";

export default async function TermsPage() {
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
              <ScrollText className="h-9 w-9 text-brand-700" /> {t("terms.hero.title")}
            </h1>
            <p className="mt-4 text-lg text-navy-600">
              {t("terms.hero.intro")}
            </p>
            <p className="mt-4 text-sm font-semibold text-navy-400">
              {t("terms.lastUpdated")} {LAST_UPDATED}
            </p>
          </div>
        </Container>
      </section>

      {/* -------------------------------------------------------- Terms */}
      <Container className="py-12 sm:py-16">
        <article className="mx-auto max-w-3xl space-y-8 text-navy-700 leading-relaxed [&_li]:pl-1 [&_ul]:list-disc [&_ul]:space-y-2 [&_ul]:pl-6 [&_ul]:marker:text-brand-400">
          <Section title={t("terms.role.title")}>
            <p>{t("terms.role.p1")}</p>
            <p>{t("terms.role.p2")}</p>
          </Section>

          <Section title={t("terms.eligibility.title")}>
            <p>{t("terms.eligibility.body")}</p>
          </Section>

          <Section title={t("terms.bookings.title")}>
            <p>{t("terms.bookings.intro")}</p>
            <ul>
              <li>{t("terms.bookings.confirm")}</li>
              <li>{t("terms.bookings.payments")}</li>
              <li>{t("terms.bookings.ev")}</li>
            </ul>
          </Section>

          <Section title={t("terms.cancellations.title")}>
            <p>{t("terms.cancellations.body")}</p>
          </Section>

          <Section title={t("terms.hostObligations.title")}>
            <p>{t("terms.hostObligations.intro")}</p>
            <ul>
              <li>{t("terms.hostObligations.right")}</li>
              <li>{t("terms.hostObligations.verify")}</li>
              <li>{t("terms.hostObligations.describe")}</li>
              <li>{t("terms.hostObligations.available")}</li>
              <li>{t("terms.hostObligations.insurance")}</li>
            </ul>
          </Section>

          <Section title={t("terms.operator.title")}>
            <p>{t("terms.operator.intro")}</p>
            <ul>
              <li>{t("terms.operator.licence")}</li>
              <li>{t("terms.operator.drivers")}</li>
              <li>{t("terms.operator.compliance")}</li>
              <li>{t("terms.operator.handover")}</li>
            </ul>
          </Section>

          <Section title={t("terms.handover.title")}>
            <p>{t("terms.handover.body")}</p>
          </Section>

          <Section title={t("terms.prohibited.title")}>
            <p>{t("terms.prohibited.intro")}</p>
            <ul>
              <li>{t("terms.prohibited.unlawful")}</li>
              <li>{t("terms.prohibited.noRight")}</li>
              <li>{t("terms.prohibited.circumvent")}</li>
              <li>{t("terms.prohibited.misrepresent")}</li>
              <li>{t("terms.prohibited.interfere")}</li>
            </ul>
            <p>{t("terms.prohibited.note")}</p>
          </Section>

          <Section title={t("terms.fees.title")}>
            <p>{t("terms.fees.body")}</p>
          </Section>

          <Section title={t("terms.liability.title")}>
            <p>{t("terms.liability.body")}</p>
          </Section>

          <Section title={t("terms.disputes.title")}>
            <p>
              {t("terms.disputes.pre")}{" "}
              <Link href="/contact" className="font-semibold text-brand-700">
                {t("terms.disputes.link")}
              </Link>{" "}
              {t("terms.disputes.post")}
            </p>
          </Section>

          <Section title={t("terms.governingLaw.title")}>
            <p>{t("terms.governingLaw.body")}</p>
          </Section>

          <Section title={t("terms.changes.title")}>
            <p>{t("terms.changes.body")}</p>
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
