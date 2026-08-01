"use client";

import { useActionState } from "react";
import { CheckCircle2, Languages, Loader2, XCircle } from "lucide-react";
import {
  runTranslationCheckAction,
  type TranslationCheckState,
} from "@/lib/admin-suite-actions";

/**
 * "Is my translation key actually working?" — one button that round-trips a
 * real sentence through the live provider and shows what came back. The
 * honest answer to a freshly pasted API key, without waiting for the first
 * Urdu customer to find out for everyone.
 */
export function TranslateCheck({
  labels,
}: {
  labels: {
    run: string;
    running: string;
    ok: string;
    failed: string;
    off: string;
  };
}) {
  const [state, action, pending] = useActionState<TranslationCheckState, FormData>(
    runTranslationCheckAction,
    {}
  );

  return (
    <div data-translate-check>
      <form action={action}>
        <button
          type="submit"
          disabled={pending}
          className="inline-flex items-center gap-1.5 rounded-xl border border-navy-200 bg-white px-3.5 py-2 text-sm font-semibold text-navy-700 transition hover:border-brand-400 hover:text-brand-700 disabled:opacity-60"
          data-translate-check-run
        >
          {pending ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Languages className="h-4 w-4" />
          )}
          {pending ? labels.running : labels.run}
        </button>
      </form>

      {state.off && (
        <p className="mt-2 text-sm font-semibold text-navy-500" data-translate-check-off>
          {labels.off}
        </p>
      )}
      {state.failed && (
        <p className="mt-2 flex items-center gap-1.5 text-sm font-semibold text-red-600" data-translate-check-failed>
          <XCircle className="h-4 w-4 shrink-0" /> {labels.failed}
        </p>
      )}
      {state.samples && state.samples.length > 0 && (
        <div className="mt-3 space-y-1.5" data-translate-check-ok>
          <p className="flex items-center gap-1.5 text-sm font-semibold text-go-700">
            <CheckCircle2 className="h-4 w-4 shrink-0" /> {labels.ok} ({state.provider})
          </p>
          {state.samples.map((s) =>
            s.ok ? (
              <p
                key={s.lang}
                className="rounded-lg bg-navy-50 px-3 py-2 text-sm text-navy-800"
                data-translate-check-row={s.lang}
              >
                <span className="me-2 font-mono text-xs font-bold uppercase text-navy-400">
                  {s.lang}
                </span>
                <span dir="auto">{s.text}</span>
              </p>
            ) : (
              // One refused language stays on the board — a missing row would
              // read as "everything works" when it doesn't.
              <p
                key={s.lang}
                className="flex items-center rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600"
                data-translate-check-lang-failed={s.lang}
              >
                <span className="me-2 font-mono text-xs font-bold uppercase">{s.lang}</span>
                <XCircle className="h-4 w-4 shrink-0" />
              </p>
            )
          )}
        </div>
      )}
    </div>
  );
}
