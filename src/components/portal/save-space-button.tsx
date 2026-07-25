"use client";

import { useOptimistic, useTransition } from "react";
import { Heart } from "lucide-react";
import { toggleSavedSpaceAction } from "@/lib/guest-actions";

/**
 * Keep a space for later.
 *
 * Optimistic: the heart fills the instant it is clicked and the server action
 * runs behind it. Somebody scanning twenty results should not wait on a round
 * trip to see that the tap registered — and if the write fails, React rolls
 * the heart back on its own.
 */
export function SaveSpaceButton({
  spaceId,
  saved,
  labels,
  className = "",
}: {
  spaceId: string;
  saved: boolean;
  labels: { save: string; saved: string };
  className?: string;
}) {
  const [pending, startTransition] = useTransition();
  const [optimistic, setOptimistic] = useOptimistic(saved);

  return (
    <button
      type="button"
      disabled={pending}
      aria-pressed={optimistic}
      aria-label={optimistic ? labels.saved : labels.save}
      title={optimistic ? labels.saved : labels.save}
      data-save-space={spaceId}
      onClick={() =>
        startTransition(async () => {
          setOptimistic(!optimistic);
          const body = new FormData();
          body.set("spaceId", spaceId);
          await toggleSavedSpaceAction(body);
        })
      }
      className={`flex h-9 w-9 items-center justify-center rounded-full border bg-white/90 backdrop-blur transition-colors ${
        optimistic
          ? "border-red-200 text-red-500 hover:bg-red-50"
          : "border-navy-200 text-navy-400 hover:text-red-500"
      } ${className}`}
    >
      <Heart className={`h-4 w-4 ${optimistic ? "fill-current" : ""}`} aria-hidden />
    </button>
  );
}
