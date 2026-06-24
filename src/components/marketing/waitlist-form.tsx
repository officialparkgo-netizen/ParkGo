"use client";

import { useActionState } from "react";
import { CheckCircle2 } from "lucide-react";
import { joinWaitlist, type WaitlistState } from "@/app/(marketing)/actions";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function WaitlistForm({
  role = "traveller",
  className,
  dark = false,
}: {
  role?: "traveller" | "host" | "transfer";
  className?: string;
  dark?: boolean;
}) {
  const [state, action, pending] = useActionState<WaitlistState, FormData>(
    joinWaitlist,
    {}
  );

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
        You&apos;re on the list. We&apos;ll be in touch.
      </div>
    );
  }

  return (
    <form action={action} className={cn("w-full", className)}>
      <input type="hidden" name="role" value={role} />
      <div className="flex flex-col gap-2 sm:flex-row">
        <input
          type="email"
          name="email"
          required
          placeholder="you@email.com"
          aria-label="Email address"
          className={cn(
            "h-12 flex-1 rounded-xl border px-4 text-sm focus:outline-none focus:ring-2",
            dark
              ? "border-white/20 bg-white/10 text-white placeholder:text-white/50 focus:ring-white/40"
              : "border-navy-200 bg-white text-navy-900 placeholder:text-navy-300 focus:border-brand-400 focus:ring-brand-100"
          )}
        />
        <Button
          type="submit"
          size="lg"
          variant={dark ? "white" : "primary"}
          disabled={pending}
          className="h-12"
        >
          {pending ? "Joining…" : "Join the waitlist"}
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
