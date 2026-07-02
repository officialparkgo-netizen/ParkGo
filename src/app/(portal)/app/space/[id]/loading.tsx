import { Skeleton, SkeletonText } from "@/components/portal/skeleton";

export default function Loading() {
  return (
    <div className="mx-auto max-w-5xl space-y-6 px-4 py-6">
      {/* Back link */}
      <Skeleton className="h-4 w-32" />

      {/* Gallery */}
      <div className="grid gap-3 sm:grid-cols-3">
        <Skeleton className="h-64 w-full rounded-2xl sm:col-span-2 sm:h-80" />
        <div className="grid gap-3">
          <Skeleton className="h-[7.75rem] w-full rounded-2xl sm:h-[9.5rem]" />
          <Skeleton className="h-[7.75rem] w-full rounded-2xl sm:h-[9.5rem]" />
        </div>
      </div>

      {/* Host row */}
      <div className="flex items-start gap-4 rounded-2xl border border-navy-100 bg-white p-5 shadow-card">
        <Skeleton className="h-14 w-14 shrink-0 rounded-full" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-4 w-48" />
          <Skeleton className="h-3.5 w-36" />
          <SkeletonText n={2} />
        </div>
      </div>

      {/* Two-column detail */}
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <div className="space-y-3">
            <Skeleton className="h-8 w-2/3" />
            <Skeleton className="h-4 w-1/2" />
            <div className="flex flex-wrap gap-2">
              <Skeleton className="h-6 w-24 rounded-full" />
              <Skeleton className="h-6 w-28 rounded-full" />
              <Skeleton className="h-6 w-20 rounded-full" />
            </div>
          </div>

          {/* Features */}
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-20 w-full rounded-xl" />
            ))}
          </div>

          {/* Access rules + map */}
          <Skeleton className="h-28 w-full rounded-2xl" />
          <Skeleton className="h-64 w-full rounded-2xl" />
        </div>

        {/* Booking rail */}
        <div>
          <div className="space-y-4 rounded-2xl border border-navy-100 bg-white p-5 shadow-card">
            <Skeleton className="h-8 w-1/2" />
            <Skeleton className="h-4 w-2/3" />
            <Skeleton className="h-11 w-full rounded-lg" />
            <SkeletonText n={3} />
          </div>
        </div>
      </div>
    </div>
  );
}
