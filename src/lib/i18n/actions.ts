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

  // Signed in? Remember it on the account too. The cookie renders this
  // browser; the saved locale is what tells support and the booking thread
  // which language to translate for this person everywhere else.
  try {
    const { getCurrentUser } = await import("@/lib/auth");
    const me = await getCurrentUser();
    if (me) {
      const { setUserLocale } = await import("@/lib/data/users");
      await setUserLocale(me.id, locale);
    }
  } catch {
    // language switching must never fail because of the profile write
  }
}
