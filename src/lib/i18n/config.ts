import type { Locale } from "@/types";

export const LOCALE_COOKIE = "parkgo_locale";
export const DEFAULT_LOCALE: Locale = "en";

export const LOCALES: {
  code: Locale;
  label: string;
  nativeLabel: string;
  dir: "ltr" | "rtl";
  flag: string;
}[] = [
  { code: "en", label: "English", nativeLabel: "English", dir: "ltr", flag: "🇬🇧" },
  { code: "ur", label: "Urdu", nativeLabel: "اردو", dir: "rtl", flag: "🇵🇰" },
  { code: "hi", label: "Hindi", nativeLabel: "हिन्दी", dir: "ltr", flag: "🇮🇳" },
  { code: "de", label: "German", nativeLabel: "Deutsch", dir: "ltr", flag: "🇩🇪" },
  { code: "zh", label: "Chinese", nativeLabel: "中文", dir: "ltr", flag: "🇨🇳" },
];

export function localeMeta(code: Locale) {
  return LOCALES.find((l) => l.code === code) ?? LOCALES[0];
}

export function isLocale(value: string | undefined): value is Locale {
  return !!value && LOCALES.some((l) => l.code === value);
}
