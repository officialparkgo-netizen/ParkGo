"use client";

import { useRef, useState } from "react";
import { Camera } from "lucide-react";
import { initials } from "@/lib/utils";

/**
 * Profile-photo field for profile forms: circular live preview + a button
 * that opens the hidden `avatar` file input (submitted with the form).
 */
export function AvatarPicker({
  name,
  avatarUrl,
  color,
  chooseLabel,
  changeLabel,
}: {
  name: string;
  avatarUrl?: string;
  color?: string;
  chooseLabel: string;
  changeLabel: string;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const src = preview ?? avatarUrl ?? null;

  return (
    <div className="flex items-center gap-4">
      {src ? (
        // eslint-disable-next-line @next/next/no-img-element -- local preview / user upload
        <img
          src={src}
          alt=""
          data-avatar-preview
          className="h-16 w-16 shrink-0 rounded-full object-cover"
        />
      ) : (
        <span
          className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full text-lg font-bold text-white"
          style={{ backgroundColor: color ?? "#F26A1B" }}
        >
          {initials(name)}
        </span>
      )}
      <div>
        <input
          ref={inputRef}
          type="file"
          name="avatar"
          accept="image/*"
          className="hidden"
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) setPreview(URL.createObjectURL(f));
          }}
        />
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="inline-flex items-center gap-1.5 rounded-xl border border-navy-200 bg-white px-3.5 py-2 text-sm font-semibold text-navy-700 transition-colors hover:bg-navy-50"
        >
          <Camera className="h-4 w-4" /> {src ? changeLabel : chooseLabel}
        </button>
      </div>
    </div>
  );
}
