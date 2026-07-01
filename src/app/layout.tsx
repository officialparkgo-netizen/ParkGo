import type { Metadata, Viewport } from "next";
import "./globals.css";
import { getLocale } from "@/lib/i18n";
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
  return (
    <html lang={locale} dir={dir}>
      <body className="min-h-screen bg-white">{children}</body>
    </html>
  );
}
