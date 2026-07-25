"use client";

import { useActionState } from "react";
import { KeyRound, Loader2 } from "lucide-react";
import { setTeamPasswordAction, type TeamAuthState } from "@/lib/team-actions";

const INPUT =
  "h-12 w-full rounded-xl border border-navy-200 bg-white px-4 text-base text-navy-900 placeholder:text-navy-400 focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-100 sm:text-sm";

/** Invited teammate chooses their password and is signed straight in. */
export function TeamPasswordForm({
  token,
  labels,
}: {
  token: string;
  labels: {
    password: string;
    confirm: string;
    submit: string;
    hint: string;
    errShort: string;
    errMismatch: string;
    errLink: string;
    errSave: string;
  };
}) {
  const [state, action, pending] = useActionState<TeamAuthState, FormData>(
    setTeamPasswordAction,
    {}
  );
  const message =
    state.error === "short"
      ? labels.errShort
      : state.error === "mismatch"
        ? labels.errMismatch
        : state.error === "link"
          ? labels.errLink
          : state.error
            ? labels.errSave
            : "";

  return (
    <form action={action} className="space-y-3" data-team-password-form>
      <input type="hidden" name="token" value={token} />
      {message && (
        <p
          className="rounded-xl bg-red-50 px-4 py-3 text-sm font-medium text-red-700"
          data-form-error
        >
          {message}
        </p>
      )}
      <label className="block">
        <span className="mb-1 block text-xs font-bold uppercase tracking-wide text-navy-500">
          {labels.password}
        </span>
        <input
          type="password"
          name="password"
          required
          minLength={8}
          autoComplete="new-password"
          className={INPUT}
        />
      </label>
      <label className="block">
        <span className="mb-1 block text-xs font-bold uppercase tracking-wide text-navy-500">
          {labels.confirm}
        </span>
        <input
          type="password"
          name="confirm"
          required
          minLength={8}
          autoComplete="new-password"
          className={INPUT}
        />
      </label>
      <p className="text-xs text-navy-400">{labels.hint}</p>
      <button
        type="submit"
        disabled={pending}
        className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-brand-500 text-sm font-bold text-white transition-colors hover:bg-brand-600 disabled:opacity-60"
      >
        {pending ? (
          <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
        ) : (
          <KeyRound className="h-4 w-4" aria-hidden />
        )}
        {labels.submit}
      </button>
    </form>
  );
}
