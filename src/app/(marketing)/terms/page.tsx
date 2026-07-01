import Link from "next/link";
import { ScrollText } from "lucide-react";
import { Container, Eyebrow } from "@/components/ui/section";
import { pageMetadata, SITE } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "Terms of Service",
  description:
    "The terms governing your use of the ParkGo marketplace — our role, bookings and payments, cancellations, host obligations, the independent transfer operator, prohibited use, liability and governing law.",
  path: "/terms",
});

const LAST_UPDATED = "1 June 2026";

export default function TermsPage() {
  return (
    <>
      {/* ---------------------------------------------------------------- Hero */}
      <section className="relative overflow-hidden bg-gradient-to-b from-navy-50/60 to-white">
        <div className="absolute inset-0 bg-grid opacity-60" aria-hidden />
        <Container className="relative py-14 lg:py-16">
          <div className="mx-auto max-w-3xl">
            <Eyebrow>Legal</Eyebrow>
            <h1 className="flex items-center gap-3 text-4xl font-extrabold tracking-tight text-navy-900">
              <ScrollText className="h-9 w-9 text-brand-600" /> Terms of Service
            </h1>
            <p className="mt-4 text-lg text-navy-600">
              These terms set out the agreement between you and {SITE.name} when you use our
              marketplace to book parking, transfers and EV charging, or to list a space as a host.
            </p>
            <p className="mt-4 text-sm font-semibold text-navy-400">Last updated: {LAST_UPDATED}</p>
          </div>
        </Container>
      </section>

      {/* -------------------------------------------------------- Terms */}
      <Container className="py-12 sm:py-16">
        <article className="mx-auto max-w-3xl space-y-8 text-navy-700 leading-relaxed [&_li]:pl-1 [&_ul]:list-disc [&_ul]:space-y-2 [&_ul]:pl-6 [&_ul]:marker:text-brand-400">
          <Section title="1. Our role as a marketplace">
            <p>
              {SITE.name} operates an online marketplace that connects travellers with independent
              hosts who provide private parking spaces, and with an independent licensed transfer
              operator who provides terminal transfers. Unless we state otherwise in writing,
              {SITE.name} is not the provider of the parking space or the transfer; we facilitate the
              booking, take payment and provide the supporting technology.
            </p>
            <p>
              The contract for parking is between you and the host; the transfer is delivered by the
              independent licensed transfer operator, whose service is integrated with {SITE.name} by
              API. {SITE.name} verifies hosts before they join, and you acknowledge that hosts and the
              transfer operator are independent businesses responsible for their own licensing,
              insurance and compliance.
            </p>
          </Section>

          <Section title="2. Eligibility and your account">
            <p>
              You must be at least 18 and able to enter a legally binding contract. You agree to
              provide accurate information, keep your account secure, and not share your access
              credentials. You are responsible for activity that takes place under your account.
            </p>
          </Section>

          <Section title="3. Bookings and payments">
            <p>
              When you book, you purchase a bundle that may include parking, a licensed transfer
              and EV charging at a single transparent price shown before you pay. The price you see
              at checkout is the price you pay. Prices are shown in pounds sterling for UK airports
              and euro for Irish airports.
            </p>
            <ul>
              <li>A booking is confirmed once payment has been successfully taken.</li>
              <li>
                Payments are processed by our regulated payment provider; {SITE.name} collects
                payment and distributes the host and transfer operator shares, retaining its service
                and commission fees.
              </li>
              <li>
                EV charging, where included, is priced per kilowatt-hour as shown on the listing
                and forms part of your total.
              </li>
            </ul>
          </Section>

          <Section title="4. Changes and cancellations">
            <p>
              Travel plans change, and our cancellation terms aim to be fair to everyone. The
              cancellation window and any applicable fee are shown at checkout and in your booking
              confirmation. Where you cancel within the free-cancellation window, you receive a
              full refund of the cancellable amount; the service fee may be non-refundable. If a
              host or the transfer operator cancels, or cannot honour a confirmed booking, you are
              entitled to a full refund and we will help you find an alternative where possible.
            </p>
          </Section>

          <Section title="5. Host obligations">
            <p>If you list a space, you agree that you will:</p>
            <ul>
              <li>have the legal right to offer the space and comply with any tenancy, mortgage, lease or planning conditions;</li>
              <li>complete identity and right-to-list verification and keep your details current;</li>
              <li>describe the space accurately, including distance, size, security features and any EV charging;</li>
              <li>make the space available for confirmed bookings and provide safe, lawful access;</li>
              <li>hold appropriate insurance for offering your space to third parties.</li>
            </ul>
          </Section>

          <Section title="6. The transfer operator">
            <p>
              Terminal transfers are provided by an independent licensed transfer operator whose
              service is integrated with {SITE.name} by API. {SITE.name} does not operate a fleet or
              engage drivers directly. The operator is solely responsible for:
            </p>
            <ul>
              <li>holding and maintaining a valid private-hire operator licence and the required commercial passenger insurance;</li>
              <li>ensuring every driver is correctly licensed, badged and verified, and every vehicle is roadworthy and insured;</li>
              <li>its own compliance, record-keeping and periodic re-verification;</li>
              <li>completing the verified handover process and meeting the service standards shown to travellers.</li>
            </ul>
          </Section>

          <Section title="7. Verified handover and live features">
            <p>
              On travel day, the licensed driver, host and traveller may share a live location and
              must confirm a one-time handover code. This code is timestamped and logged as a
              security record. Live camera features, where offered by a host, are provided to give
              travellers reassurance and must not be misused.
            </p>
          </Section>

          <Section title="8. Prohibited use">
            <p>You agree not to:</p>
            <ul>
              <li>use the platform for any unlawful purpose or to facilitate fraud;</li>
              <li>list a space you have no right to offer;</li>
              <li>circumvent {SITE.name} to take bookings or payments off-platform;</li>
              <li>misrepresent identity, vehicle or verification details;</li>
              <li>interfere with the platform&apos;s security, scrape data, or misuse live location or camera features.</li>
            </ul>
            <p>We may suspend or remove accounts that breach these terms or threaten the safety of our community.</p>
          </Section>

          <Section title="9. Fees and taxes">
            <p>
              {SITE.name} charges a service fee to travellers and a commission to hosts, as disclosed
              at the point of booking or in your host agreement. The transfer operator is remunerated
              under its own commercial agreement with {SITE.name}. You are responsible for your own
              tax obligations arising from income earned through the platform.
            </p>
          </Section>

          <Section title="10. Liability">
            <p>
              Nothing in these terms limits liability that cannot be limited by law, including for
              death or personal injury caused by negligence, or for fraud. Subject to that, {SITE.name}
              is not liable for the acts or omissions of independent hosts or the independent licensed
              transfer operator, and
              our total liability to you for any claim connected with a booking is limited to the
              amount you paid for that booking. We are not liable for indirect or consequential
              loss. These terms do not affect the statutory rights of consumers.
            </p>
          </Section>

          <Section title="11. Disputes and complaints">
            <p>
              If something goes wrong, please contact our support team first via{" "}
              <Link href="/contact" className="font-semibold text-brand-600">
                our contact page
              </Link>{" "}
              so we can help resolve it quickly. We operate a clear process for booking disputes,
              refunds and handover issues.
            </p>
          </Section>

          <Section title="12. Governing law">
            <p>
              For travellers and hosts in the United Kingdom, these terms are governed by
              the laws of England and Wales, and the courts of England and Wales have non-exclusive
              jurisdiction. For users of our Irish service, these terms are governed by the laws of
              Ireland, and the Irish courts have non-exclusive jurisdiction. Consumers may also have
              the right to bring proceedings in their country of residence.
            </p>
          </Section>

          <Section title="13. Changes to these terms">
            <p>
              We may update these terms to reflect changes to the service or the law. We will
              revise the &ldquo;last updated&rdquo; date above and, for material changes, give you
              reasonable notice. Continued use of {SITE.name} after changes take effect means you
              accept the updated terms.
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
