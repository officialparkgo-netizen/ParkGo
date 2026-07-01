import * as React from "react";
import { cn } from "@/lib/utils";

/** Page width container. */
export function Container({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("container-px", className)} {...props} />;
}

/** Vertical rhythm wrapper for marketing sections. */
export function Section({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLElement>) {
  return (
    <section className={cn("py-14 sm:py-20", className)} {...props}>
      <Container className="reveal-scroll">{children}</Container>
    </section>
  );
}

export function Eyebrow({ className, ...props }: React.HTMLAttributes<HTMLParagraphElement>) {
  return (
    <p
      className={cn(
        "mb-3 text-sm font-bold uppercase tracking-wide text-brand-600",
        className
      )}
      {...props}
    />
  );
}
