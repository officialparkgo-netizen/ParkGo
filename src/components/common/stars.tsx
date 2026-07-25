import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

export function Stars({
  rating,
  count,
  size = "sm",
  className,
}: {
  rating: number;
  count?: number;
  size?: "sm" | "md";
  className?: string;
}) {
  const px = size === "md" ? "h-4 w-4" : "h-3.5 w-3.5";
  return (
    <span className={cn("inline-flex items-center gap-1", className)}>
      <span className="flex">
        {[0, 1, 2, 3, 4].map((i) => {
          const filled = rating >= i + 1;
          const half = !filled && rating > i + 0.25 && rating < i + 1;
          return (
            <Star
              key={i}
              className={cn(
                px,
                filled || half ? "text-accent-600" : "text-navy-200"
              )}
              fill={filled ? "currentColor" : half ? "url(#half)" : "none"}
              strokeWidth={1.5}
            />
          );
        })}
      </span>
      <span className="text-sm font-semibold text-navy-800">{rating.toFixed(1)}</span>
      {typeof count === "number" && (
        <span className="text-sm text-navy-400">({count})</span>
      )}
    </span>
  );
}
