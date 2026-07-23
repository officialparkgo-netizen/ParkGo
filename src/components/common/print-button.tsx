"use client";

import { Printer } from "lucide-react";

/** window.print() trigger for print-friendly pages (receipts). */
export function PrintButton({ label }: { label: string }) {
  return (
    <button
      type="button"
      onClick={() => window.print()}
      className="inline-flex items-center gap-2 rounded-xl bg-navy-900 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-navy-700 print:hidden"
    >
      <Printer className="h-4 w-4" /> {label}
    </button>
  );
}
