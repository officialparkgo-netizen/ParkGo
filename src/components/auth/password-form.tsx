"use client";

import { useActionState } from "react";
import { CheckCircle2, Loader2, LockKeyhole } from "lucide-react";
import { updatePasswordAction, type AuthState } from "@/lib/auth-actions";
import { Button } from "@/components/ui/button";
import { useT } from "@/lib/i18n/client";

const INPUT =
  "h-12 w-full rounded-xl border border-navy-200 bg-white px-4 text-base text-navy-900 placeholder:text-navy-400 focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-100 sm:text-sm";

export function PasswordForm() {
  const t = useT();
  const [state, action, pending] = useActionState<AuthState, FormData>(
    updatePasswordAction,
    {}
  );

  return (
    <form action={action} className="space-y-3">
      {state.error && (
        <p className="rounded-lg bg-red-50 px-3 py-2.5 text-sm font-medium text-red-700">
          {state.error}
        </p>
      )}
      {state.message && (
        <p className="flex items-center gap-2 rounded-lg bg-go-50 px-3 py-2.5 text-sm font-medium text-go-700">
          <CheckCircle2 className="h-4 w-4 shrink-0" /> {state.message}
        </p>
      )}
      <input
        type="password"
        name="password"
        required
        minLength={8}
        placeholder={t("account.password.new")}
        autoComplete="new-password"
        className={INPUT}
      />
      <input
        type="password"
        name="confirm"
        required
        minLength={8}
        placeholder={t("account.password.confirm")}
        autoComplete="new-password"
        className={INPUT}
      />
      <Button type="submit" disabled={pending} className="w-full sm:w-auto">
        {pending ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <>
            <LockKeyhole className="h-4 w-4" /> {t("account.password.btn")}
          </>
        )}
      </Button>
    </form>
  );
}
