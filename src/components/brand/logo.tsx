import Link from "next/link";
import { cn } from "@/lib/utils";

/** ParkGo mark: navy rounded tile with a "P" and a green location pin. */
export function LogoMark({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 40 40"
      className={cn("h-9 w-9", className)}
      role="img"
      aria-label="ParkGo"
    >
      <rect width="40" height="40" rx="11" fill="#0E2A47" />
      <path
        d="M13 11h7.2c3.7 0 6.3 2.3 6.3 5.8s-2.6 5.9-6.3 5.9H17V29h-4V11Zm4 8.2h2.8c1.6 0 2.6-.9 2.6-2.4s-1-2.3-2.6-2.3H17v4.7Z"
        fill="#fff"
      />
      <circle cx="29.5" cy="13.5" r="4.5" fill="#36B24A" />
      <circle cx="29.5" cy="13.5" r="1.7" fill="#fff" />
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
          <span className="text-go-500">Go</span>
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
