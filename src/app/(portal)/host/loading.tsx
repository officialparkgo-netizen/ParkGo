import {
  Skeleton,
  SkeletonCard,
  SkeletonStats,
} from "@/components/portal/skeleton";

export default function Loading() {
  return (
    <div className="mx-auto max-w-6xl space-y-8 px-4 py-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="space-y-2">
          <Skeleton className="h-7 w-52" />
          <Skeleton className="h-4 w-64" />
        </div>
        <Skeleton className="h-10 w-40 rounded-lg" />
      </div>

      {/* Stats */}
      <SkeletonStats />

      {/* Listings + activity */}
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-3 lg:col-span-2">
          <Skeleton className="h-5 w-40" />
          <SkeletonCard lines={2} />
          <SkeletonCard lines={2} />
        </div>
        <div className="space-y-3">
          <Skeleton className="h-5 w-32" />
          <SkeletonCard lines={4} />
        </div>
      </div>
    </div>
  );
}
