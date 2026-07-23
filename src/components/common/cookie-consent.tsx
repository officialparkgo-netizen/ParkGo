"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Cookie } from "lucide-react";
import { useT } from "@/lib/i18n/client";

const CONSENT_COOKIE = "parkgo_cookie_consent";

function readConsent(): string | null {
  return (
    document.cookie
      .split("; ")
      .find((c) => c.startsWith(`${CONSENT_COOKIE}=`))
      ?.split("=")[1] ?? null
  );
}

function writeConsent(value: "all" | "essential") {
  const oneYear = 60 * 60 * 24 * 365;
  document.cookie = `${CONSENT_COOKIE}=${value}; path=/; max-age=${oneYear}; SameSite=Lax`;
}

/**
 * UK GDPR cookie notice. Strictly-necessary cookies (sign-in session, language)
 * are always on; the stored choice ("all" | "essential") gates any future
 * consent-based tools. Renders nothing until mounted so there is no SSR flash,
 * and never again once a choice exists.
 */
export function CookieConsent() {
  const t = useT();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!readConsent()) setVisible(true);
  }, []);

  if (!visible) return null;

  const choose = (value: "all" | "essential") => {
    writeConsent(value);
    setVisible(false);
  };

  return (
    <div
      role="region"
      aria-label={t("cookie.aria")}
      className="fixed bottom-4 start-4 z-50 max-w-md rounded-2xl border border-navy-200 bg-white p-5 shadow-card-lg max-sm:inset-x-4 max-sm:bottom-4 max-sm:max-w-none"
    >
      <div className="flex items-start gap-3">
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-brand-50 text-brand-600">
          <Cookie className="h-5 w-5" aria-hidden />
        </span>
        <div>
          <p className="text-sm font-bold text-navy-900">{t("cookie.title")}</p>
          <p className="mt-1 text-sm leading-relaxed text-navy-600">
            {t("cookie.body")}{" "}
            <Link href="/privacy" className="font-semibold text-brand-600 underline hover:text-brand-700">
              {t("cookie.more")}
            </Link>
          </p>
        </div>
      </div>
      <div className="mt-4 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => choose("all")}
          className="rounded-xl bg-brand-500 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-brand-600"
        >
          {t("cookie.accept")}
        </button>
        <button
          type="button"
          onClick={() => choose("essential")}
          className="rounded-xl border border-navy-200 bg-white px-4 py-2 text-sm font-semibold text-navy-700 transition-colors hover:bg-navy-50"
        >
          {t("cookie.essential")}
        </button>
      </div>
    </div>
  );
}
