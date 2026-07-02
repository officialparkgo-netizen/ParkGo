import { Skeleton, SkeletonText } from "@/components/portal/skeleton";

export default function Loading() {
  return (
    <div className="mx-auto max-w-4xl space-y-5 px-4 py-6">
      <div className="grid gap-5 lg:grid-cols-3">
        {/* QR / access card */}
        <div className="flex flex-col items-center gap-3 rounded-2xl border border-navy-100 bg-white p-6 text-center shadow-card">
          <Skeleton className="h-5 w-24 rounded-full" />
          <Skeleton className="mt-2 h-48 w-48 rounded-xl" />
          <Skeleton className="h-5 w-32" />
          <Skeleton className="h-5 w-20 rounded-full" />
          <Skeleton className="h-3 w-40" />
        </div>

        {/* Details card */}
        <div className="space-y-4 rounded-2xl border border-navy-100 bg-white p-6 shadow-card lg:col-span-2">
          <Skeleton className="h-5 w-1/2" />
          <Skeleton className="h-3.5 w-1/3" />

          <div className="grid gap-4 sm:grid-cols-2">
            {Array.from({ length: 2 }).map((_, i) => (
              <div key={i} className="space-y-2">
                <Skeleton className="h-3 w-20" />
                <Skeleton className="h-4 w-32" />
              </div>
            ))}
          </div>

          {/* Released-after-payment block */}
          <Skeleton className="h-28 w-full rounded-xl" />

          {/* Price rows */}
          <SkeletonText n={4} />

          <div className="flex flex-wrap gap-2 pt-1">
            <Skeleton className="h-9 w-28 rounded-lg" />
            <Skeleton className="h-9 w-24 rounded-lg" />
          </div>
        </div>
      </div>
    </div>
  );
}
