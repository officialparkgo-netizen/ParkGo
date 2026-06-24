"use server";

import { cookies } from "next/headers";
import type { Locale } from "@/types";
import { LOCALE_COOKIE } from "@/lib/i18n/config";

/** Persist the chosen UI language (used by the language switcher). */
export async function setLocale(locale: Locale) {
  const store = await cookies();
  store.set(LOCALE_COOKIE, locale, {
    path: "/",
    maxAge: 60 * 60 * 24 * 365,
    sameSite: "lax",
  });
}
