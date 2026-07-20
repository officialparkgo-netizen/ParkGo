import type { Metadata } from "next";

export const SITE = {
  name: "ParkGo",
  tagline: "Park Smart. Travel Easy.",
  description:
    "ParkGo bundles a verified private parking space, a licensed transfer, EV charging and live security into one booking and one payment — starting at UK & Ireland airports, with cities, stations and events next.",
  url: process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000",
  twitter: "@parkgo",
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
    },
    twitter: {
      card: "summary_large_image",
      title: fullTitle,
      description: desc,
    },
  };
}
