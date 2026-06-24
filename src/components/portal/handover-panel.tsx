"use client";

import { useActionState } from "react";
import { BadgeCheck, CheckCircle2 } from "lucide-react";
import { confirmHandoverAction, type HandoverState } from "@/lib/booking-actions";
import { Button } from "@/components/ui/button";
import { formatDateTime } from "@/lib/utils";

/**
 * Verified driver↔customer handover. Both parties share a one-time code; either
 * confirms it in-app and it's timestamped + logged. Shows the expected code in
 * mock mode so the demo can complete the flow.
 */
export function HandoverPanel({
  transferId,
  bookingId,
  expectedCode,
  initialConfirmedAt,
}: {
  transferId: string;
  bookingId: string;
  expectedCode: string;
  initialConfirmedAt?: string;
}) {
  const [state, action, pending] = useActionState<HandoverState, FormData>(
    confirmHandoverAction,
    initialConfirmedAt ? { ok: true, confirmedAt: initialConfirmedAt } : {}
  );

  if (state.ok) {
    return (
      <div className="rounded-2xl border border-go-200 bg-go-50 p-5">
        <div className="flex items-center gap-2 font-bold text-go-700">
          <CheckCircle2 className="h-5 w-5" /> Handover confirmed
        </div>
        <p className="mt-1 text-sm text-navy-600">
          Verified and timestamped
          {state.confirmedAt ? ` at ${formatDateTime(state.confirmedAt)}` : ""}. A
          record has been added to the audit log.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-navy-100 bg-white p-5 shadow-card">
      <div className="flex items-center gap-2 font-bold text-navy-900">
        <BadgeCheck className="h-5 w-5 text-brand-600" /> Verified handover
      </div>
      <p className="mt-1 text-sm text-navy-500">
        Enter the one-time code shown on your driver&apos;s screen to confirm the
        handover.
      </p>
      <div className="mt-3 rounded-lg bg-navy-50 px-3 py-2 text-xs text-navy-500">
        Demo code (driver&apos;s screen):{" "}
        <span className="font-mono font-bold text-navy-800">{expectedCode}</span>
      </div>
      <form action={action} className="mt-4 flex flex-col gap-2 sm:flex-row">
        <input type="hidden" name="transferId" value={transferId} />
        <input type="hidden" name="bookingId" value={bookingId} />
        <input
          name="code"
          required
          maxLength={6}
          placeholder="6-digit code"
          autoComplete="off"
          className="h-11 flex-1 rounded-xl border border-navy-200 px-4 font-mono text-lg uppercase tracking-widest text-navy-900 focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-100"
        />
        <Button type="submit" disabled={pending} className="h-11">
          {pending ? "Confirming…" : "Confirm handover"}
        </Button>
      </form>
      {state.error && <p className="mt-2 text-sm text-red-600">{state.error}</p>}
    </div>
  );
}
