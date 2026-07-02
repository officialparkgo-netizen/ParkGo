import { Skeleton } from "@/components/portal/skeleton";

export default function Loading() {
  return (
    <div className="mx-auto max-w-5xl space-y-8 px-4 py-6">
      {/* Greeting */}
      <div className="space-y-2">
        <Skeleton className="h-7 w-56" />
        <Skeleton className="h-4 w-72" />
      </div>

      {/* Search bar */}
      <Skeleton className="h-20 w-full rounded-2xl" />

      {/* Trips */}
      <div className="space-y-3">
        <Skeleton className="h-5 w-32" />
        {Array.from({ length: 3 }).map((_, i) => (
          <div
            key={i}
            className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-navy-100 bg-white p-4 shadow-card"
          >
            <div className="min-w-0 flex-1 space-y-2">
              <Skeleton className="h-4 w-40" />
              <Skeleton className="h-3.5 w-56" />
              <Skeleton className="h-3.5 w-32" />
              <div className="flex gap-1.5 pt-1">
                <Skeleton className="h-5 w-16 rounded-full" />
                <Skeleton className="h-5 w-14 rounded-full" />
              </div>
            </div>
            <div className="flex flex-col items-end gap-2">
              <Skeleton className="h-6 w-20" />
              <div className="flex gap-2">
                <Skeleton className="h-8 w-24 rounded-lg" />
                <Skeleton className="h-8 w-20 rounded-lg" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
