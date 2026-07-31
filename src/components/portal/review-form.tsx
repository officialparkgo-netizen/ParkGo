"use client";

import { useActionState, useState } from "react";
import { CheckCircle2, Star } from "lucide-react";
import { submitReviewAction, type ReviewState } from "@/lib/booking-actions";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useT } from "@/lib/i18n/client";

export function ReviewForm({
  bookingId,
  allowPhotos = false,
}: {
  bookingId: string;
  /** Photo uploads need live-mode storage; mock hides the field entirely. */
  allowPhotos?: boolean;
}) {
  const t = useT();
  const [state, action, pending] = useActionState<ReviewState, FormData>(
    submitReviewAction,
    {}
  );
  const [rating, setRating] = useState(5);

  if (state.ok) {
    return (
      <div className="flex items-center gap-2 rounded-2xl border border-go-200 bg-go-50 p-5 font-semibold text-go-700">
        <CheckCircle2 className="h-5 w-5" /> {t("app.review.thanks")}
      </div>
    );
  }

  return (
    <form action={action} className="rounded-2xl border border-navy-100 bg-white p-5 shadow-card">
      <h3 className="font-bold text-navy-900">{t("app.review.leaveReview")}</h3>
      <p className="text-sm text-navy-500">{t("app.review.leaveReviewSub")}</p>
      <input type="hidden" name="bookingId" value={bookingId} />
      <input type="hidden" name="rating" value={rating} />
      <div className="mt-3 flex gap-1">
        {[1, 2, 3, 4, 5].map((n) => (
          <button
            key={n}
            type="button"
            onClick={() => setRating(n)}
            aria-label={`${n} star${n > 1 ? "s" : ""}`}
          >
            <Star
              className={cn(
                "h-7 w-7 transition-colors",
                n <= rating ? "text-accent-600" : "text-navy-200"
              )}
              fill={n <= rating ? "currentColor" : "none"}
            />
          </button>
        ))}
      </div>
      <textarea
        name="comment"
        rows={3}
        placeholder={t("app.review.placeholder")}
        className="mt-3 w-full rounded-xl border border-navy-200 px-3.5 py-2.5 text-sm focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-100"
      />
      {allowPhotos && (
        <div className="mt-3" data-review-photos>
          <label htmlFor={`rev-photos-${bookingId}`} className="mb-1 block text-xs font-bold text-navy-600">
            {t("app.review.photos")}
          </label>
          <input
            id={`rev-photos-${bookingId}`}
            name="photos"
            type="file"
            accept="image/*"
            multiple
            className="w-full text-sm text-navy-600 file:mr-2 file:rounded-lg file:border-0 file:bg-navy-100 file:px-3 file:py-2 file:text-sm file:font-bold file:text-navy-800"
          />
          <p className="mt-1 text-xs text-navy-400">{t("app.review.photosHint")}</p>
        </div>
      )}
      <Button type="submit" disabled={pending} className="mt-3">
        {pending ? t("app.review.submitting") : t("app.review.submitReview")}
      </Button>
      {state.error && <p className="mt-2 text-sm text-red-600">{state.error}</p>}
    </form>
  );
}
