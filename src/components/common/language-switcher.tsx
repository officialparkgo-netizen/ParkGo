"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { Globe } from "lucide-react";
import type { Locale } from "@/types";
import { LOCALES } from "@/lib/i18n/config";
import { setLocale } from "@/lib/i18n/actions";
import { cn } from "@/lib/utils";

export function LanguageSwitcher({
  current,
  className,
}: {
  current: Locale;
  className?: string;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  function onChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const next = e.target.value as Locale;
    startTransition(async () => {
      await setLocale(next);
      router.refresh();
    });
  }

  return (
    <label
      className={cn(
        "relative inline-flex items-center gap-1.5 text-sm text-navy-600",
        pending && "opacity-60",
        className
      )}
    >
      <Globe className="h-4 w-4" aria-hidden />
      <span className="sr-only">Language</span>
      <select
        value={current}
        onChange={onChange}
        disabled={pending}
        className="cursor-pointer appearance-none bg-transparent pr-1 font-semibold text-navy-700 focus:outline-none"
        aria-label="Select language"
      >
        {LOCALES.map((l) => (
          <option key={l.code} value={l.code}>
            {l.flag} {l.nativeLabel}
          </option>
        ))}
      </select>
    </label>
  );
}
