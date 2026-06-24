import * as React from "react";
import { cn } from "@/lib/utils";

type Tone = "go" | "brand" | "accent" | "navy" | "neutral" | "danger";

const tones: Record<Tone, string> = {
  go: "bg-go-50 text-go-700 ring-go-200",
  brand: "bg-brand-50 text-brand-700 ring-brand-200",
  accent: "bg-accent-50 text-accent-700 ring-accent-200",
  navy: "bg-navy-50 text-navy-800 ring-navy-200",
  neutral: "bg-gray-100 text-gray-700 ring-gray-200",
  danger: "bg-red-50 text-red-700 ring-red-200",
};

export function Badge({
  tone = "neutral",
  className,
  ...props
}: React.HTMLAttributes<HTMLSpanElement> & { tone?: Tone }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold ring-1 ring-inset",
        tones[tone],
        className
      )}
      {...props}
    />
  );
}
