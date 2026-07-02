import { Skeleton, SkeletonText } from "@/components/portal/skeleton";

export default function Loading() {
  return (
    <div className="mx-auto max-w-6xl space-y-6 px-4 py-6">
      {/* Search bar */}
      <Skeleton className="h-20 w-full rounded-2xl" />

      {/* Results header */}
      <div className="flex items-center justify-between">
        <Skeleton className="h-5 w-52" />
        <Skeleton className="h-5 w-24 rounded-full" />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Result cards */}
        <div className="space-y-4 lg:col-span-2">
          {Array.from({ length: 3 }).map((_, i) => (
            <div
              key={i}
              className="flex flex-col gap-4 rounded-2xl border border-navy-100 bg-white p-4 shadow-card sm:flex-row"
            >
              <Skeleton className="h-40 w-full shrink-0 rounded-xl sm:h-32 sm:w-48" />
              <div className="flex-1 space-y-3">
                <Skeleton className="h-5 w-2/3" />
                <Skeleton className="h-3.5 w-1/2" />
                <SkeletonText n={2} />
                <div className="flex items-center justify-between pt-1">
                  <Skeleton className="h-6 w-20" />
                  <Skeleton className="h-9 w-28 rounded-lg" />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Map (desktop) */}
        <div className="hidden lg:block">
          <Skeleton className="h-[28rem] w-full rounded-2xl" />
        </div>
      </div>
    </div>
  );
}
