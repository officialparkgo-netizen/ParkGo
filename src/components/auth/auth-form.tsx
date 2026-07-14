"use client";

import { useActionState, useState } from "react";
import { ArrowRight, Loader2, Mail, Sparkles } from "lucide-react";
import {
  signInWithPassword,
  signUp,
  signInWithMagicLink,
  type AuthState,
} from "@/lib/auth-actions";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const INPUT =
  "h-12 w-full rounded-xl border border-navy-200 bg-white px-4 text-base text-navy-900 placeholder:text-navy-400 focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-100 sm:text-sm";

export function AuthForm({ next }: { next?: string }) {
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");

  const [state, action, pending] = useActionState<AuthState, FormData>(
    mode === "signin" ? signInWithPassword : signUp,
    {}
  );
  const [magicState, magicAction, magicPending] = useActionState<AuthState, FormData>(
    signInWithMagicLink,
    {}
  );

  const rawError = state.error || magicState.error;
  const rawMessage = state.message || magicState.message;
  const error = rawError
    ? typeof rawError === "string"
      ? rawError
      : "Something went wrong. Please try again."
    : "";
  const message = rawMessage && typeof rawMessage === "string" ? rawMessage : "";

  return (
    <div className="mx-auto w-full max-w-md">
      {/* Sign in / Sign up toggle */}
      <div className="mb-6 grid grid-cols-2 gap-1 rounded-xl bg-navy-50 p-1">
        {(["signin", "signup"] as const).map((m) => (
          <button
            key={m}
            type="button"
            onClick={() => setMode(m)}
            className={cn(
              "rounded-lg px-4 py-2 text-sm font-semibold transition-colors",
              mode === m ? "bg-white text-navy-900 shadow-sm" : "text-navy-500 hover:text-navy-800"
            )}
          >
            {m === "signin" ? "Sign in" : "Create account"}
          </button>
        ))}
      </div>

      {error && (
        <p className="mb-4 rounded-lg bg-red-50 px-3 py-2.5 text-sm font-medium text-red-700">
          {error}
        </p>
      )}
      {message && (
        <p className="mb-4 flex items-center gap-2 rounded-lg bg-go-50 px-3 py-2.5 text-sm font-medium text-go-700">
          <Sparkles className="h-4 w-4 shrink-0" aria-hidden /> {message}
        </p>
      )}

      <form action={action} className="space-y-3">
        {next && <input type="hidden" name="next" value={next} />}

        {mode === "signup" && (
          <>
            <input name="name" required placeholder="Full name" autoComplete="name" className={INPUT} />
            <select name="role" defaultValue="traveller" className={INPUT} aria-label="I am a">
              <option value="traveller">I&apos;m a traveller</option>
              <option value="host">I&apos;m a host / landlord</option>
            </select>
          </>
        )}

        <input
          type="email"
          name="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@email.com"
          autoComplete="email"
          inputMode="email"
          autoCapitalize="none"
          spellCheck={false}
          className={INPUT}
        />
        <input
          type="password"
          name="password"
          required
          minLength={8}
          placeholder="Password (8+ characters)"
          autoComplete={mode === "signin" ? "current-password" : "new-password"}
          className={INPUT}
        />

        <Button type="submit" size="lg" disabled={pending} className="w-full">
          {pending ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <>
              {mode === "signin" ? "Sign in" : "Create account"}
              <ArrowRight className="h-4 w-4 rtl:-scale-x-100" aria-hidden />
            </>
          )}
        </Button>
      </form>

      {/* Magic link */}
      <div className="my-4 flex items-center gap-3 text-xs font-semibold uppercase tracking-wide text-navy-300">
        <span className="h-px flex-1 bg-navy-100" /> or <span className="h-px flex-1 bg-navy-100" />
      </div>
      <form action={magicAction}>
        <input type="hidden" name="email" value={email} />
        {next && <input type="hidden" name="next" value={next} />}
        <Button type="submit" variant="outline" size="lg" disabled={magicPending || !email} className="w-full">
          {magicPending ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <>
              <Mail className="h-4 w-4" aria-hidden /> Email me a magic link
            </>
          )}
        </Button>
      </form>
    </div>
  );
}
