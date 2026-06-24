import type { Metadata } from "next";

export const SITE = {
  name: "ParkGo",
  tagline: "Park Smart. Travel Easy.",
  description:
    "ParkGo bundles a verified private airport parking space, a licensed terminal transfer, EV charging and live security into one booking and one payment — across the UK & Ireland.",
  url: process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000",
  twitter: "@parkgo",
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
