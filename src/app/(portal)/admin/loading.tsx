import {
  Skeleton,
  SkeletonCard,
  SkeletonStats,
} from "@/components/portal/skeleton";

export default function Loading() {
  return (
    <div className="mx-auto max-w-6xl space-y-8 px-4 py-6">
      {/* Stats */}
      <SkeletonStats />

      {/* Verification queue */}
      <div className="space-y-3">
        <Skeleton className="h-5 w-48" />
        <SkeletonCard lines={2} />
        <SkeletonCard lines={2} />
      </div>

      {/* Listings + trust */}
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-3 lg:col-span-2">
          <Skeleton className="h-5 w-40" />
          <SkeletonCard lines={3} />
        </div>
        <div className="space-y-3">
          <Skeleton className="h-5 w-32" />
          <SkeletonCard lines={5} />
        </div>
      </div>
    </div>
  );
}
