"use client";

export function SkeletonLoader() {
  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Hero section skeleton */}
      <div className="space-y-6 text-center">
        <div className="h-4 w-32 skeleton mx-auto" />
        <div className="space-y-3">
          <div className="h-12 skeleton mx-auto w-3/4" />
          <div className="h-12 skeleton mx-auto w-3/4" />
        </div>
        <div className="space-y-2">
          <div className="h-4 skeleton mx-auto w-2/3" />
          <div className="h-4 skeleton mx-auto w-2/3" />
        </div>
        <div className="h-12 w-40 skeleton mx-auto rounded-full" />
      </div>

      {/* Feature cards skeleton */}
      <div className="grid md:grid-cols-3 gap-6 pt-8">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="space-y-4">
            <div className="h-12 skeleton rounded-lg" />
            <div className="h-6 skeleton rounded-lg" />
            <div className="space-y-2">
              <div className="h-4 skeleton" />
              <div className="h-4 skeleton w-5/6" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function PageSkeleton() {
  return (
    <div className="min-h-screen animate-in fade-in duration-300">
      <SkeletonLoader />
    </div>
  );
}
