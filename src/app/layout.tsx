import type { Metadata, Viewport } from "next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { Analytics } from "@vercel/analytics/next";
import "./globals.css";
import { getDictionary, getLocale } from "@/lib/i18n";
import { I18nProvider } from "@/lib/i18n/client";
import { SupportWidget } from "@/components/common/support-widget";
import { CookieConsent } from "@/components/common/cookie-consent";
import { localeMeta } from "@/lib/i18n/config";
import { SITE } from "@/lib/seo";

export const metadata: Metadata = {
  metadataBase: new URL(SITE.url),
  title: {
    default: `${SITE.name} — ${SITE.tagline}`,
    template: `%s · ${SITE.name}`,
  },
  description: SITE.description,
  applicationName: SITE.name,
  keywords: [
    "airport parking",
    "Heathrow parking",
    "Gatwick parking",
    "meet and greet",
    "EV airport parking",
    "park and ride",
    "UK airport parking",
    "Dublin airport parking",
  ],
  authors: [{ name: SITE.name }],
  // Defaults for anything that doesn't call pageMetadata() — without these a
  // shared link renders as a bare blue URL on WhatsApp, LinkedIn and Slack.
  alternates: { canonical: "/" },
  openGraph: {
    title: `${SITE.name} — ${SITE.tagline}`,
    description: SITE.description,
    url: SITE.url,
    siteName: SITE.name,
    type: "website",
    locale: "en_GB",
    images: [
      { url: SITE.ogImage, width: 1200, height: 630, alt: `${SITE.name} — ${SITE.tagline}` },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: `${SITE.name} — ${SITE.tagline}`,
    description: SITE.description,
    images: [SITE.ogImage],
  },
  // Favicon is provided by the App Router convention file src/app/icon.svg.
};

export const viewport: Viewport = {
  themeColor: "#15171A",
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const locale = await getLocale();
  const dir = localeMeta(locale).dir;
  const dict = getDictionary(locale);
  return (
    <html lang={locale} dir={dir}>
      <body className="min-h-screen bg-white">
        <a href="#main-content" className="skip-link">
          {dict["a11y.skip"] ?? "Skip to content"}
        </a>
        <I18nProvider dict={dict}>
          {children}
          <SupportWidget />
          <CookieConsent />
        </I18nProvider>
        <SpeedInsights />
        <Analytics />
      </body>
    </html>
  );
}
