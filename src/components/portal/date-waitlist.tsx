"use client";

import { useActionState } from "react";
import { BellRing, Check, X } from "lucide-react";
import type { DateWatch } from "@/types";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  joinDateWaitlistAction,
  leaveDateWaitlistAction,
  type WaitlistState,
} from "@/lib/waitlist-actions";
import { formatDate } from "@/lib/utils";
import { useT } from "@/lib/i18n/client";

/**
 * "Nothing free on your dates" is the one moment a search can lose a customer
 * for good. This turns it into something they can act on instead of a dead end.
 */
export function JoinDateWaitlist({
  airportSlug,
  startAt,
  endAt,
  spaceId,
}: {
  airportSlug: string;
  startAt: string;
  endAt: string;
  spaceId?: string;
}) {
  const t = useT();
  const [state, action, pending] = useActionState<WaitlistState, FormData>(
    joinDateWaitlistAction,
    {}
  );

  if (state.ok) {
    return (
      <p
        className="mt-4 flex items-center justify-center gap-2 rounded-xl bg-go-50 px-3 py-2.5 text-sm font-semibold text-go-700"
        data-waitlist-joined
      >
        <Check className="h-4 w-4 shrink-0" /> {t("guest.waitlist.joined")}
      </p>
    );
  }

  return (
    <form action={action} className="mt-4" data-waitlist-join>
      <input type="hidden" name="airportSlug" value={airportSlug} />
      <input type="hidden" name="startAt" value={startAt} />
      <input type="hidden" name="endAt" value={endAt} />
      {spaceId && <input type="hidden" name="spaceId" value={spaceId} />}
      <p className="text-sm text-navy-500">{t("guest.waitlist.sub")}</p>
      <Button type="submit" size="sm" className="mt-3" disabled={pending}>
        <BellRing className="h-4 w-4" /> {t("guest.waitlist.join")}
      </Button>
      {state.error && (
        <p className="mt-2 text-xs font-semibold text-red-600">{state.error}</p>
      )}
    </form>
  );
}

/** The traveller's open watches, on their saved page. */
export function DateWatchList({ watches }: { watches: DateWatch[] }) {
  const t = useT();
  const [, action, pending] = useActionState<WaitlistState, FormData>(
    leaveDateWaitlistAction,
    {}
  );
  if (watches.length === 0) return null;

  return (
    <section data-date-watches>
      <h2 className="mb-3 flex items-center gap-2 text-lg font-bold text-navy-900">
        <BellRing className="h-5 w-5 text-navy-500" /> {t("guest.waitlist.mine")}
      </h2>
      <ul className="space-y-2">
        {watches.map((w) => (
          <li key={w.id}>
            <Card className="flex items-center justify-between gap-3 p-4">
              <div>
                <p className="font-bold capitalize text-navy-900">{w.airportSlug}</p>
                <p className="text-xs text-navy-500">
                  {formatDate(w.startAt)} → {formatDate(w.endAt)}
                </p>
              </div>
              <form action={action}>
                <input type="hidden" name="id" value={w.id} />
                <Button type="submit" variant="ghost" size="sm" disabled={pending}>
                  <X className="h-4 w-4" /> {t("guest.waitlist.leave")}
                </Button>
              </form>
            </Card>
          </li>
        ))}
      </ul>
    </section>
  );
}
