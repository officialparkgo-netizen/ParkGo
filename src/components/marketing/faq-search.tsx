"use client";

import { useMemo, useState } from "react";
import { ChevronDown, Search, X } from "lucide-react";
import { Eyebrow } from "@/components/ui/section";

export interface FaqGroup {
  category: string;
  items: { q: string; a: string }[];
}

/**
 * Turns the FAQ page into a searchable help centre.
 *
 * The whole knowledge base is a few kilobytes of text that the server has
 * already rendered, so filtering happens in the browser — instant, works
 * offline, and no query round-trip for someone who is mid-problem. Every term
 * has to match, so extra words narrow the list rather than widening it.
 *
 * Matching answers open automatically: a search that returns a row you still
 * have to click is a search that made you do the work twice.
 */
export function FaqSearch({
  groups,
  labels,
}: {
  groups: FaqGroup[];
  labels: { placeholder: string; clear: string; count: string; none: string; noneHint: string };
}) {
  const [query, setQuery] = useState("");
  const terms = query.toLowerCase().split(/\s+/).filter(Boolean);

  const filtered = useMemo(() => {
    if (terms.length === 0) return groups;
    return groups
      .map((g) => ({
        ...g,
        items: g.items.filter((item) => {
          const hay = `${item.q} ${item.a}`.toLowerCase();
          return terms.every((term) => hay.includes(term));
        }),
      }))
      .filter((g) => g.items.length > 0);
    // `terms` is derived from `query`; depending on the string keeps this stable.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [groups, query]);

  const total = filtered.reduce((n, g) => n + g.items.length, 0);
  const searching = terms.length > 0;

  return (
    <div className="mx-auto max-w-3xl">
      <div className="relative mb-8">
        <Search
          className="pointer-events-none absolute inset-y-0 start-4 my-auto h-5 w-5 text-navy-400"
          aria-hidden
        />
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={labels.placeholder}
          aria-label={labels.placeholder}
          className="h-14 w-full rounded-2xl border border-navy-200 bg-white ps-12 pe-12 text-base text-navy-900 shadow-card placeholder:text-navy-400 focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-100"
        />
        {query && (
          <button
            type="button"
            onClick={() => setQuery("")}
            aria-label={labels.clear}
            className="absolute inset-y-0 end-4 my-auto flex h-6 w-6 items-center justify-center rounded-full text-navy-400 hover:bg-navy-50 hover:text-navy-700"
          >
            <X className="h-4 w-4" aria-hidden />
          </button>
        )}
      </div>

      {searching && (
        <p className="mb-6 text-sm font-semibold text-navy-500" aria-live="polite">
          {labels.count.replace("{n}", String(total))}
        </p>
      )}

      {searching && total === 0 ? (
        <div className="rounded-2xl border border-navy-100 bg-white p-8 text-center shadow-card">
          <p className="font-bold text-navy-900">{labels.none}</p>
          <p className="mt-1 text-sm text-navy-500">{labels.noneHint}</p>
        </div>
      ) : (
        <div className="space-y-12">
          {filtered.map((group) => (
            <div key={group.category}>
              <Eyebrow>{group.category}</Eyebrow>
              <div className="mt-4 space-y-3">
                {group.items.map((item) => (
                  <details
                    key={item.q}
                    open={searching}
                    className="group rounded-2xl border border-navy-100 bg-white shadow-card transition-colors open:border-brand-200"
                  >
                    <summary className="flex cursor-pointer list-none items-center justify-between gap-4 p-5 text-left [&::-webkit-details-marker]:hidden">
                      <span className="font-bold text-navy-900">{item.q}</span>
                      <ChevronDown className="h-5 w-5 shrink-0 text-navy-400 transition-transform group-open:rotate-180" />
                    </summary>
                    <p className="px-5 pb-5 text-navy-600">{item.a}</p>
                  </details>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
