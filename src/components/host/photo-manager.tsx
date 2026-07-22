"use client";

import { useState } from "react";
import { Undo2, X } from "lucide-react";
import { Photo } from "@/components/common/photo";

/**
 * Existing listing photos with per-photo removal. Marked photos dim and emit
 * a hidden `removePhotos` input; nothing is deleted until the form is saved,
 * and the × toggles back to undo. Must render inside the edit form.
 */
export function PhotoManager({
  photos,
  removeLabel,
  keepLabel,
}: {
  photos: string[];
  removeLabel: string;
  keepLabel: string;
}) {
  const [marked, setMarked] = useState<Set<string>>(new Set());

  function toggle(p: string) {
    setMarked((prev) => {
      const next = new Set(prev);
      if (next.has(p)) next.delete(p);
      else next.add(p);
      return next;
    });
  }

  return (
    <div className="flex gap-2 overflow-x-auto pb-1">
      {photos.map((p) => {
        const removing = marked.has(p);
        return (
          <div key={p} className="relative shrink-0">
            <Photo
              token={p}
              className={`h-20 w-28 transition-opacity ${removing ? "opacity-35" : ""}`}
              rounded="rounded-xl"
            />
            {removing && <input type="hidden" name="removePhotos" value={p} />}
            <button
              type="button"
              aria-label={removing ? keepLabel : removeLabel}
              aria-pressed={removing}
              onClick={() => toggle(p)}
              className={`absolute end-1 top-1 flex h-7 w-7 items-center justify-center rounded-full shadow-card transition-colors ${
                removing
                  ? "bg-navy-900 text-white hover:bg-navy-800"
                  : "bg-white/95 text-navy-700 hover:bg-white"
              }`}
            >
              {removing ? <Undo2 className="h-3.5 w-3.5" /> : <X className="h-3.5 w-3.5" />}
            </button>
          </div>
        );
      })}
    </div>
  );
}
