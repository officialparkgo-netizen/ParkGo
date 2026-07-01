import { cookies } from "next/headers";
import type { Locale } from "@/types";
import { DEFAULT_LOCALE, LOCALE_COOKIE, isLocale, localeMeta } from "@/lib/i18n/config";
import { mergedDict } from "@/lib/i18n/registry";

export type Dict = Record<string, string>;
export { LOCALES, localeMeta } from "@/lib/i18n/config";

/** Current locale from the cookie (server side), defaulting to English. */
export async function getLocale(): Promise<Locale> {
  const store = await cookies();
  const value = store.get(LOCALE_COOKIE)?.value;
  return isLocale(value) ? value : DEFAULT_LOCALE;
}

/** Full merged dictionary for a locale (English fallback per key). */
export function getDictionary(locale: Locale): Dict {
  return mergedDict(locale);
}

/** Build a bound translator + direction for a locale. */
export function translator(locale: Locale) {
  const dict = mergedDict(locale);
  const t = (key: string) => dict[key] ?? key;
  return { t, dir: localeMeta(locale).dir, locale };
}

/** Convenience for server components: resolve locale + translator in one call. */
export async function getI18n() {
  const locale = await getLocale();
  return translator(locale);
}
