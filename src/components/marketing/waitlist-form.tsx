"use client";

import { useActionState } from "react";
import { CheckCircle2, Mail } from "lucide-react";
import { joinWaitlist, type WaitlistState } from "@/app/(marketing)/actions";
import { Button } from "@/components/ui/button";
import { useT } from "@/lib/i18n/client";
import { cn } from "@/lib/utils";

export function WaitlistForm({
  role = "traveller",
  className,
  dark = false,
  refValue,
}: {
  role?: "traveller" | "host";
  className?: string;
  dark?: boolean;
  /** Referral attribution (user id from a ?ref= link). */
  refValue?: string;
}) {
  const [state, action, pending] = useActionState<WaitlistState, FormData>(
    joinWaitlist,
    {}
  );
  const t = useT();

  if (state.ok) {
    return (
      <div
        className={cn(
          "flex items-center gap-2 rounded-xl px-4 py-3 text-sm font-semibold",
          dark ? "bg-white/15 text-white" : "bg-go-50 text-go-700",
          className
        )}
      >
        <CheckCircle2 className="h-5 w-5" />
        {t("waitlist.success")}
      </div>
    );
  }

  return (
    <form action={action} className={cn("w-full", className)}>
      <input type="hidden" name="role" value={role} />
      {refValue && <input type="hidden" name="ref" value={refValue} />}
      <div className="flex flex-col gap-2 sm:flex-row">
        <div className="relative flex-1">
          <Mail
            className={cn(
              "pointer-events-none absolute left-3.5 top-1/2 h-5 w-5 -translate-y-1/2 rtl:left-auto rtl:right-3.5",
              dark ? "text-white/60" : "text-navy-400"
            )}
            aria-hidden
          />
          <input
            type="email"
            name="email"
            required
            inputMode="email"
            autoComplete="email"
            autoCapitalize="none"
            autoCorrect="off"
            spellCheck={false}
            enterKeyHint="go"
            placeholder={t("common.emailPh")}
            aria-label={t("common.email")}
            className={cn(
              // 16px on mobile stops iOS Safari from zooming the page on focus; tighter on desktop.
              "h-12 w-full rounded-xl border pl-11 pr-4 text-base focus:outline-none focus:ring-2 sm:text-sm rtl:pl-4 rtl:pr-11",
              dark
                ? "border-white/25 bg-white/15 text-white placeholder:text-white/70 focus:border-white/50 focus:ring-white/40"
                : "border-navy-200 bg-white text-navy-900 placeholder:text-navy-400 focus:border-brand-400 focus:ring-brand-100"
            )}
          />
        </div>
        <Button
          type="submit"
          size="lg"
          variant={dark ? "white" : "primary"}
          disabled={pending}
          className="h-12 w-full sm:w-auto"
        >
          {pending ? t("waitlist.joining") : t("waitlist.join")}
        </Button>
      </div>
      {state.error && (
        <p className={cn("mt-2 text-sm", dark ? "text-white/90" : "text-red-600")}>
          {state.error}
        </p>
      )}
    </form>
  );
}
