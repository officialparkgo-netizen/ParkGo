import type { Metadata } from "next";

export const SITE = {
  name: "ParkGo",
  tagline: "Park Smart. Travel Easy.",
  // Kept under 160 characters: Google truncates the snippet around there, and
  // a description that gets cut mid-sentence reads worse than a shorter one
  // that finishes its thought.
  description:
    "Verified airport parking, a licensed transfer and EV charging in one booking and one payment. Live across UK & Ireland airports.",
  url: process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000",
  twitter: "@parkgo",
  /** 1200×630 share card. Rebuild from scripts/og/og-card.html. */
  ogImage: "/og.png",
};

/**
 * Legal identity shown site-wide (Companies Act 2006 requires the registered
 * name, number and office on business websites). The company number comes from
 * the NEXT_PUBLIC_COMPANY_NUMBER env var so it can be added without a deploy-
 * time code change; the block renders it only when present.
 */
export const COMPANY = {
  legalName: "PARKGO LIMITED",
  registeredIn: "England & Wales",
  number: process.env.NEXT_PUBLIC_COMPANY_NUMBER || "",
  registeredOffice: "128 City Road, London, EC1V 2NX, United Kingdom",
  icoRef: "ZC151803",
  supportEmail: "support@parkgo.ai",
  infoEmail: "info@parkgo.ai",
};

/** Build per-page metadata with sensible OpenGraph/canonical defaults. */
export function pageMetadata({
  title,
  description,
  path = "/",
  noindex = false,
}: {
  title?: string;
  description?: string;
  path?: string;
  noindex?: boolean;
}): Metadata {
  const fullTitle = title ? `${title} · ${SITE.name}` : `${SITE.name} — ${SITE.tagline}`;
  const desc = description || SITE.description;
  const url = new URL(path, SITE.url).toString();
  // Absolute, because several scrapers (WhatsApp among them) will not resolve
  // a relative og:image against the page URL.
  const image = new URL(SITE.ogImage, SITE.url).toString();
  return {
    title: fullTitle,
    description: desc,
    alternates: { canonical: url },
    robots: noindex ? { index: false, follow: false } : undefined,
    openGraph: {
      title: fullTitle,
      description: desc,
      url,
      siteName: SITE.name,
      type: "website",
      locale: "en_GB",
      images: [{ url: image, width: 1200, height: 630, alt: `${SITE.name} — ${SITE.tagline}` }],
    },
    twitter: {
      card: "summary_large_image",
      title: fullTitle,
      description: desc,
      images: [image],
    },
  };
}
