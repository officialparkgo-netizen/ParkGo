import { cn } from "@/lib/utils";

/** Single shimmer placeholder bar. Uses the global `.skeleton` class (navy-100 + sweep). */
export function Skeleton({ className }: { className?: string }) {
  return <div className={cn("skeleton", className)} />;
}

/** A stack of `n` skeleton lines, the last one slightly shorter for realism. */
export function SkeletonText({
  n = 3,
  className,
}: {
  n?: number;
  className?: string;
}) {
  return (
    <div className={cn("space-y-2", className)}>
      {Array.from({ length: n }).map((_, i) => (
        <Skeleton
          key={i}
          className={cn("h-3.5 w-full", i === n - 1 && "w-2/3")}
        />
      ))}
    </div>
  );
}

/** A rounded card outline with a few skeleton bars inside. */
export function SkeletonCard({
  className,
  lines = 3,
}: {
  className?: string;
  lines?: number;
}) {
  return (
    <div
      className={cn(
        "rounded-2xl border border-navy-100 bg-white p-5 shadow-card",
        className
      )}
    >
      <Skeleton className="mb-3 h-5 w-1/3" />
      <SkeletonText n={lines} />
    </div>
  );
}

/** Responsive row of 4 stat-card skeletons, matching the portal StatCard grid. */
export function SkeletonStats({ className }: { className?: string }) {
  return (
    <div className={cn("grid gap-4 sm:grid-cols-2 lg:grid-cols-4", className)}>
      {Array.from({ length: 4 }).map((_, i) => (
        <div
          key={i}
          className="rounded-2xl border border-navy-100 bg-white p-5 shadow-card"
        >
          <div className="flex items-center justify-between">
            <Skeleton className="h-3 w-20" />
            <Skeleton className="h-9 w-9 rounded-xl" />
          </div>
          <Skeleton className="mt-3 h-7 w-24" />
          <Skeleton className="mt-2 h-3 w-28" />
        </div>
      ))}
    </div>
  );
}
