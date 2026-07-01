import Link from "next/link";
import { cn } from "@/lib/utils";

/**
 * ParkGo mark: black shield containing an orange "P" with a lightning bolt in
 * its counter. Used as the app icon / favicon (shield-only). Placeholder until
 * the final brand asset is supplied — swap the SVG paths, keep the API.
 */
export function LogoMark({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 40 40"
      className={cn("h-9 w-9", className)}
      role="img"
      aria-label="ParkGo"
    >
      {/* shield */}
      <path
        d="M20 3.5 L33.5 8.2 V18.6 C33.5 27.5 27.6 33.6 20 36.6 C12.4 33.6 6.5 27.5 6.5 18.6 V8.2 Z"
        fill="#15171A"
      />
      {/* P (with counter cut out) */}
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        fill="#F26A1B"
        d="M13.6 10.6h6.8c3.6 0 6.1 2.2 6.1 5.6s-2.5 5.7-6.1 5.7H17.5V29.4h-3.9V10.6Zm3.9 7.9h2.6c1.5 0 2.5-.8 2.5-2.3s-1-2.2-2.5-2.2H17.5v4.5Z"
      />
      {/* lightning bolt in the counter */}
      <path
        d="M19.2 13.9l-2.7 3.9h1.7l-1.1 2.7 3.2-4.1h-1.7z"
        fill="#fff"
      />
    </svg>
  );
}

export function Logo({
  className,
  withText = true,
  inverted = false,
  href = "/",
}: {
  className?: string;
  withText?: boolean;
  inverted?: boolean;
  href?: string | null;
}) {
  const content = (
    <span className={cn("inline-flex items-center gap-2.5", className)}>
      <LogoMark />
      {withText && (
        <span className="text-xl font-extrabold tracking-tight">
          <span className={inverted ? "text-white" : "text-navy-900"}>Park</span>
          <span className="text-brand-500">Go</span>
        </span>
      )}
    </span>
  );
  if (href === null) return content;
  return (
    <Link href={href} aria-label="ParkGo home">
      {content}
    </Link>
  );
}
