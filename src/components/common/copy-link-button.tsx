"use client";

import { useState } from "react";
import { Check, Copy } from "lucide-react";

/** Clipboard copy with a brief confirmation state. */
export function CopyLinkButton({
  value,
  label,
  copiedLabel,
}: {
  value: string;
  label: string;
  copiedLabel: string;
}) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      type="button"
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(value);
          setCopied(true);
          setTimeout(() => setCopied(false), 2000);
        } catch {
          // clipboard unavailable — the link is visible to copy manually
        }
      }}
      className="inline-flex items-center gap-1.5 rounded-xl bg-navy-900 px-3.5 py-2.5 text-xs font-semibold text-white transition-colors hover:bg-navy-700"
    >
      {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
      {copied ? copiedLabel : label}
    </button>
  );
}
