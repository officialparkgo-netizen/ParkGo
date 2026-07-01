import Link from "next/link";
import { ShieldCheck } from "lucide-react";
import { Container, Eyebrow } from "@/components/ui/section";
import { pageMetadata, SITE } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "Privacy Policy",
  description:
    "How ParkGo collects, uses and protects your personal data under UK GDPR and the Data Protection Act 2018 — including KYC handling, lawful bases, retention and your rights.",
  path: "/privacy",
});

const LAST_UPDATED = "1 June 2026";

export default function PrivacyPage() {
  return (
    <>
      {/* ---------------------------------------------------------------- Hero */}
      <section className="relative overflow-hidden bg-gradient-to-b from-navy-50/60 to-white">
        <div className="absolute inset-0 bg-grid opacity-60" aria-hidden />
        <Container className="relative py-14 lg:py-16">
          <div className="mx-auto max-w-3xl">
            <Eyebrow>Legal</Eyebrow>
            <h1 className="flex items-center gap-3 text-4xl font-extrabold tracking-tight text-navy-900">
              <ShieldCheck className="h-9 w-9 text-go-500" /> Privacy Policy
            </h1>
            <p className="mt-4 text-lg text-navy-600">
              {SITE.name} is built so that trust is the product. We collect as little personal
              data as possible, keep sensitive verification documents separate and encrypted, and
              give you clear control over your information.
            </p>
            <p className="mt-4 text-sm font-semibold text-navy-400">Last updated: {LAST_UPDATED}</p>
          </div>
        </Container>
      </section>

      {/* -------------------------------------------------------- Policy */}
      <Container className="py-12 sm:py-16">
        <article className="mx-auto max-w-3xl space-y-8 text-navy-700 leading-relaxed [&_li]:pl-1 [&_ul]:list-disc [&_ul]:space-y-2 [&_ul]:pl-6 [&_ul]:marker:text-brand-400">
          <Section title="1. Who we are">
            <p>
              This policy explains how {SITE.name} (&ldquo;{SITE.name}&rdquo;, &ldquo;we&rdquo;,
              &ldquo;us&rdquo;) handles personal data when you use our website and apps across the
              United Kingdom and Ireland. For data-protection purposes, {SITE.name} is the data
              controller for the personal data described here.
            </p>
            <p>
              We comply with the UK General Data Protection Regulation (UK GDPR) and the Data
              Protection Act 2018, and, where the Irish service applies, the EU GDPR. We are
              guided by the standards and codes published by the Information Commissioner&apos;s
              Office (ICO).
            </p>
          </Section>

          <Section title="2. The data we collect">
            <p>We collect only what we need to run the marketplace safely:</p>
            <ul>
              <li>
                <strong>Traveller details (minimal):</strong> your name, email, phone number,
                preferred language and basic vehicle information (make, model, colour,
                registration and size) so a host and licensed driver can identify the correct
                car. We do not ask travellers for identity documents.
              </li>
              <li>
                <strong>Host verification (KYC):</strong> identity documents, proof of address and
                right-to-list declarations. This sensitive material is collected only from hosts, is
                held in a separate, access-controlled store, and is encrypted. The independent licensed
                transfer operator manages its own driver and vehicle licensing and insurance.
              </li>
              <li>
                <strong>Booking and payment data:</strong> the bundle you book, dates, price and a
                payment reference. Card details are processed by our regulated payment provider; we
                do not store full card numbers.
              </li>
              <li>
                <strong>Travel-day data:</strong> live location during an active transfer and
                handover confirmations, used to deliver the service and provide a security record.
              </li>
              <li>
                <strong>Technical data:</strong> device, log and cookie data needed to keep the
                service secure and working.
              </li>
            </ul>
          </Section>

          <Section title="3. Lawful bases for processing">
            <p>We rely on the following lawful bases under UK GDPR Article 6:</p>
            <ul>
              <li>
                <strong>Contract:</strong> to create your account, take bookings, process payments
                and provide transfers and handovers.
              </li>
              <li>
                <strong>Legal obligation:</strong> to verify hosts, prevent fraud and meet tax and
                licensing requirements.
              </li>
              <li>
                <strong>Legitimate interests:</strong> to keep the platform safe, calculate trust
                scores from genuine reviews, and improve our service — balanced against your rights.
              </li>
              <li>
                <strong>Consent:</strong> for optional marketing emails and non-essential cookies,
                which you can withdraw at any time.
              </li>
            </ul>
            <p>
              Verification documents are special-category-adjacent and treated with heightened
              safeguards: strict access controls, encryption and minimal retention.
            </p>
          </Section>

          <Section title="4. How we share data">
            <p>
              ParkGo is a marketplace, so some data must be shared to deliver a booking. We share
              the minimum necessary: a host sees the vehicle details and arrival window for a
              confirmed booking; the independent licensed transfer operator receives, via a secure
              API, only what its driver needs to complete the transfer and handover. We also use
              trusted processors — for payments, hosting, identity verification and communications —
              under written contracts that require them to protect your data and use it only on our
              instructions.
            </p>
            <p>
              We never sell your personal data. We may disclose data where required by law, or to
              protect the safety of our users and the integrity of the platform.
            </p>
          </Section>

          <Section title="5. International transfers">
            <p>
              Where data is transferred outside the UK or EEA, we rely on adequacy decisions or
              appropriate safeguards such as the UK International Data Transfer Agreement or
              Standard Contractual Clauses, so your data remains protected to an equivalent
              standard.
            </p>
          </Section>

          <Section title="6. How long we keep it">
            <p>
              We keep personal data only as long as necessary. Booking and payment records are
              retained for as long as required for tax, accounting and dispute purposes (typically
              up to six years). KYC documents are retained for the period required by anti-fraud
              and licensing obligations and then securely deleted. Marketing data is kept until you
              unsubscribe. Inactive accounts are reviewed and deleted in line with these periods.
            </p>
          </Section>

          <Section title="7. Your rights">
            <p>Under data-protection law you have the right to:</p>
            <ul>
              <li>access a copy of the personal data we hold about you;</li>
              <li>have inaccurate data corrected;</li>
              <li>request erasure of your data where there is no overriding legal reason to keep it;</li>
              <li>restrict or object to certain processing;</li>
              <li>data portability for data you provided to us;</li>
              <li>withdraw consent at any time where processing relies on consent.</li>
            </ul>
            <p>
              To exercise any of these rights, contact our Data Protection Officer using the
              details below. We will respond within one month. You also have the right to complain
              to the ICO (in the UK) or the Data Protection Commission (in Ireland), though we hope
              you will contact us first so we can put things right.
            </p>
          </Section>

          <Section title="8. Cookies">
            <p>
              We use essential cookies to keep you signed in and the service secure, and — only
              with your consent — analytics cookies that help us understand how the site is used.
              You can manage non-essential cookies through your browser settings and our cookie
              controls. Essential cookies cannot be switched off as the service will not function
              without them.
            </p>
          </Section>

          <Section title="9. Security">
            <p>
              We protect personal data with encryption in transit and at rest, strict
              role-based access controls, and a clear separation between everyday account data and
              sensitive KYC documents. Access to verification material is limited to our trust and
              safety function on a need-to-know basis and is logged.
            </p>
          </Section>

          <Section title="10. Contact our DPO">
            <p>
              For any privacy question or to exercise your rights, contact our Data Protection
              Officer:
            </p>
            <ul>
              <li>
                Email:{" "}
                <Link href="mailto:dpo@parkgo.app" className="font-semibold text-brand-600">
                  dpo@parkgo.app
                </Link>
              </li>
              <li>Post: Data Protection Officer, {SITE.name}, United Kingdom</li>
            </ul>
            <p>
              We may update this policy from time to time. When we do, we will revise the
              &ldquo;last updated&rdquo; date above and, for significant changes, let you know
              directly.
            </p>
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
