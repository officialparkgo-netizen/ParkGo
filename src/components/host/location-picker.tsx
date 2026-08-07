"use client";

import { useMemo, useRef, useState, useTransition } from "react";
import { CheckCircle2, Loader2, MapPin, Plus } from "lucide-react";
import { requestNewLocationAction } from "@/lib/host-suite-actions";

/**
 * The destination field on "List a space" — type-to-search over every covered
 * location, and an honest path for the ones we don't cover yet: typing a
 * place that matches nothing offers "request this location", which files the
 * request with the team instead of dead-ending the host.
 */
export function LocationPicker({
  airports,
  defaultSlug,
  labels,
}: {
  airports: { slug: string; name: string; code?: string }[];
  defaultSlug: string;
  labels: {
    placeholder: string;
    missing: string;
    request: string;
    sentTitle: string;
    sentBody: string;
  };
}) {
  const byNameOf = (slug: string) => {
    const a = airports.find((x) => x.slug === slug);
    return a ? `${a.name}${a.code ? ` (${a.code})` : ""}` : "";
  };
  const [slug, setSlug] = useState(defaultSlug);
  const [query, setQuery] = useState(byNameOf(defaultSlug));
  const [open, setOpen] = useState(false);
  const [sent, setSent] = useState(false);
  const [pending, startTransition] = useTransition();
  const wrapRef = useRef<HTMLDivElement>(null);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return airports;
    return airports.filter(
      (a) =>
        a.name.toLowerCase().includes(q) || (a.code ?? "").toLowerCase().includes(q)
    );
  }, [airports, query]);

  const pick = (a: { slug: string; name: string; code?: string }) => {
    setSlug(a.slug);
    setQuery(`${a.name}${a.code ? ` (${a.code})` : ""}`);
    setOpen(false);
  };

  const requestPlace = () => {
    const place = query.trim();
    if (place.length < 2 || pending) return;
    startTransition(async () => {
      const res = await requestNewLocationAction(place);
      if (res.ok) {
        setSent(true);
        setOpen(false);
      }
    });
  };

  return (
    <div ref={wrapRef} className="relative" data-loc-picker>
      <input type="hidden" name="airportSlug" value={slug} />
      <input
        value={query}
        onChange={(e) => {
          setQuery(e.target.value);
          setOpen(true);
          setSent(false);
        }}
        onFocus={() => setOpen(true)}
        onBlur={() => {
          // Let option clicks land first; then snap back to the selection so
          // the hidden slug and the visible text can never disagree.
          setTimeout(() => {
            setOpen(false);
            setQuery((q) => (q.trim() ? q : byNameOf(slug)));
          }, 150);
        }}
        placeholder={labels.placeholder}
        className="w-full rounded-xl border border-navy-200 bg-white px-3.5 py-2.5 text-sm text-navy-900 placeholder:text-navy-400 focus:border-brand-400 focus:outline-none"
        role="combobox"
        aria-expanded={open}
        aria-autocomplete="list"
      />

      {open && (
        <div className="absolute inset-x-0 top-full z-30 mt-1.5 max-h-64 overflow-y-auto rounded-xl border border-navy-100 bg-white p-1.5 shadow-card-lg">
          {filtered.map((a) => (
            <button
              key={a.slug}
              type="button"
              data-loc-option={a.slug}
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => pick(a)}
              className={`flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-left text-sm ${
                a.slug === slug ? "bg-brand-50 font-semibold text-brand-700" : "text-navy-700 hover:bg-navy-50"
              }`}
            >
              <MapPin className="h-4 w-4 shrink-0 text-navy-400" aria-hidden />
              {a.name}
              {a.code ? ` (${a.code})` : ""}
            </button>
          ))}
          {filtered.length === 0 && (
            <div className="p-2.5">
              <p className="text-sm font-semibold text-navy-700">{labels.missing}</p>
              <button
                type="button"
                data-loc-request
                disabled={pending}
                onMouseDown={(e) => e.preventDefault()}
                onClick={requestPlace}
                className="mt-2 inline-flex items-center gap-1.5 rounded-xl bg-navy-900 px-3.5 py-2 text-sm font-semibold text-white hover:bg-navy-700 disabled:opacity-60"
              >
                {pending ? (
                  <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
                ) : (
                  <Plus className="h-4 w-4" aria-hidden />
                )}
                {labels.request}: “{query.trim().slice(0, 40)}”
              </button>
            </div>
          )}
        </div>
      )}

      {sent && (
        <p className="mt-2 flex items-start gap-1.5 text-sm text-go-700" data-loc-sent>
          <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
          <span>
            <span className="font-bold">{labels.sentTitle}</span> — {labels.sentBody}
          </span>
        </p>
      )}
    </div>
  );
}
