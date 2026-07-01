import * as React from "react";
import { cn } from "@/lib/utils";

type Variant = "primary" | "accent" | "navy" | "outline" | "ghost" | "white";
type Size = "sm" | "md" | "lg";

const variants: Record<Variant, string> = {
  primary: "bg-go-500 text-white hover:bg-go-600 shadow-sm",
  accent: "bg-accent-400 text-white hover:bg-accent-500 shadow-sm",
  navy: "bg-navy-800 text-white hover:bg-navy-900 shadow-sm",
  outline: "border border-navy-200 text-navy-800 hover:bg-navy-50 bg-white",
  ghost: "text-navy-700 hover:bg-navy-50",
  white: "bg-white text-navy-900 hover:bg-navy-50 shadow-sm",
};

const sizes: Record<Size, string> = {
  sm: "h-9 px-3 text-sm gap-1.5",
  md: "h-11 px-5 text-sm gap-2",
  lg: "h-13 px-7 text-base gap-2 py-3",
};

export function buttonVariants({
  variant = "primary",
  size = "md",
  className,
}: {
  variant?: Variant;
  size?: Size;
  className?: string;
} = {}) {
  return cn(
    "inline-flex items-center justify-center rounded-xl font-semibold transition-all duration-150 active:scale-[0.98]",
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2",
    "disabled:opacity-50 disabled:pointer-events-none whitespace-nowrap",
    variants[variant],
    sizes[size],
    className
  );
}

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant, size, className, ...props }, ref) => (
    <button ref={ref} className={buttonVariants({ variant, size, className })} {...props} />
  )
);
Button.displayName = "Button";
