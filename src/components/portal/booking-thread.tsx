import { MessageCircle, Send } from "lucide-react";
import { Card } from "@/components/ui/card";
import { listMessagesForBooking } from "@/lib/data/booking-messages";
import { sendBookingMessageAction } from "@/lib/host-suite-actions";
import { formatDateTime } from "@/lib/utils";

/**
 * Traveller ↔ host thread on a booking. Server-rendered; sending re-renders
 * the page (no realtime needed for arrival coordination).
 */
export async function BookingThread({
  bookingId,
  viewer,
  backHref,
  labels,
}: {
  bookingId: string;
  viewer: "host" | "traveller";
  backHref: string;
  labels: { title: string; empty: string; placeholder: string; send: string; you: string; other: string };
}) {
  const messages = await listMessagesForBooking(bookingId);

  return (
    <Card className="p-5">
      <h3 className="flex items-center gap-2 text-sm font-bold text-navy-900">
        <MessageCircle className="h-4 w-4 text-navy-500" /> {labels.title}
      </h3>
      <div className="mt-3 max-h-64 space-y-2 overflow-y-auto">
        {messages.length === 0 && (
          <p className="py-3 text-center text-sm text-navy-400">{labels.empty}</p>
        )}
        {messages.map((m) => {
          const mine = m.from === viewer;
          return (
            <div key={m.id} className={`flex ${mine ? "justify-end" : "justify-start"}`}>
              <div
                className={`max-w-[85%] rounded-2xl px-3.5 py-2 text-sm ${
                  mine
                    ? "rounded-br-md bg-brand-500 text-white"
                    : "rounded-bl-md bg-navy-50 text-navy-800"
                }`}
              >
                <p className="whitespace-pre-line">{m.text}</p>
                <p
                  className={`mt-0.5 text-[10px] ${
                    mine ? "text-white/70" : "text-navy-400"
                  }`}
                >
                  {mine ? labels.you : labels.other} · {formatDateTime(m.at)}
                </p>
              </div>
            </div>
          );
        })}
      </div>
      <form action={sendBookingMessageAction} className="mt-3 flex gap-2">
        <input type="hidden" name="bookingId" value={bookingId} />
        <input type="hidden" name="back" value={backHref} />
        <input
          name="text"
          required
          maxLength={1000}
          placeholder={labels.placeholder}
          className="min-w-0 flex-1 rounded-xl border border-navy-200 bg-white px-3.5 py-2.5 text-sm text-navy-900 placeholder:text-navy-300 focus:border-brand-400 focus:outline-none"
        />
        <button
          type="submit"
          className="inline-flex items-center gap-1.5 rounded-xl bg-navy-900 px-4 py-2.5 text-sm font-semibold text-white hover:bg-navy-700"
        >
          <Send className="h-4 w-4" /> {labels.send}
        </button>
      </form>
    </Card>
  );
}
