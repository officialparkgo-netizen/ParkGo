"use client";

import { useActionState } from "react";
import { ArrowRight, Loader2 } from "lucide-react";
import { teamSignInAction, type TeamAuthState } from "@/lib/team-actions";

const INPUT =
  "h-12 w-full rounded-xl border border-navy-200 bg-white px-4 text-base text-navy-900 placeholder:text-navy-400 focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-100 sm:text-sm";

/** Staff sign-in: email + password for admins and support agents. */
export function TeamLoginForm({
  labels,
}: {
  labels: {
    email: string;
    password: string;
    submit: string;
    errCredentials: string;
  };
}) {
  const [state, action, pending] = useActionState<TeamAuthState, FormData>(
    teamSignInAction,
    {}
  );

  return (
    <form action={action} className="space-y-3" data-team-login-form>
      {state.error && (
        <p
          className="rounded-xl bg-red-50 px-4 py-3 text-sm font-medium text-red-700"
          data-form-error
        >
          {labels.errCredentials}
        </p>
      )}
      <label className="block">
        <span className="mb-1 block text-xs font-bold uppercase tracking-wide text-navy-500">
          {labels.email}
        </span>
        <input
          type="email"
          name="email"
          required
          autoComplete="email"
          placeholder="you@parkgo.ai"
          className={INPUT}
        />
      </label>
      <label className="block">
        <span className="mb-1 block text-xs font-bold uppercase tracking-wide text-navy-500">
          {labels.password}
        </span>
        <input
          type="password"
          name="password"
          required
          autoComplete="current-password"
          className={INPUT}
        />
      </label>
      <button
        type="submit"
        disabled={pending}
        className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-navy-900 text-sm font-bold text-white transition-colors hover:bg-navy-700 disabled:opacity-60"
      >
        {pending ? (
          <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
        ) : null}
        {labels.submit}
        {!pending && <ArrowRight className="h-4 w-4 rtl:-scale-x-100" aria-hidden />}
      </button>
    </form>
  );
}
