import type { Locale } from "@/types";
import type { AreaDict } from "@/lib/i18n/config";
import { core } from "@/lib/i18n/areas/core";
import { home } from "@/lib/i18n/areas/home";
import { marketingA } from "@/lib/i18n/areas/marketingA";
import { marketingB } from "@/lib/i18n/areas/marketingB";
import { marketingC } from "@/lib/i18n/areas/marketingC";
import { portalTraveller } from "@/lib/i18n/areas/portalTraveller";
import { portalAdmin } from "@/lib/i18n/areas/portalAdmin";

/** All translation areas. Add new area modules here. */
const AREAS: AreaDict[] = [
  core,
  home,
  marketingA,
  marketingB,
  marketingC,
  portalTraveller,
  portalAdmin,
];

/** Merge every area into one flat dict for a locale, with English fallback. */
export function mergedDict(locale: Locale): Record<string, string> {
  const en = Object.assign({}, ...AREAS.map((a) => a.en));
  if (locale === "en") return en;
  const loc = Object.assign({}, ...AREAS.map((a) => a[locale] ?? {}));
  return { ...en, ...loc };
}
