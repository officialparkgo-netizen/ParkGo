import { cookies } from "next/headers";
import type { Locale } from "@/types";
import { DEFAULT_LOCALE, LOCALE_COOKIE, isLocale, localeMeta } from "@/lib/i18n/config";
import { dictionaries, type Dict } from "@/lib/i18n/dictionaries";

export type { Dict };
export { LOCALES, localeMeta } from "@/lib/i18n/config";

/** Current locale from the cookie (server side), defaulting to English. */
export async function getLocale(): Promise<Locale> {
  const store = await cookies();
  const value = store.get(LOCALE_COOKIE)?.value;
  return isLocale(value) ? value : DEFAULT_LOCALE;
}

/** Merge the locale's dictionary over English so missing keys fall back. */
export function getDictionary(locale: Locale): Dict {
  return { ...dictionaries.en, ...dictionaries[locale] };
}

/** Build a bound translator + direction for a locale. */
export function translator(locale: Locale) {
  const dict = getDictionary(locale);
  const t = (key: string) => dict[key] ?? key;
  return { t, dir: localeMeta(locale).dir, locale };
}

/** Convenience for server components: resolve locale + translator in one call. */
export async function getI18n() {
  const locale = await getLocale();
  return translator(locale);
}
