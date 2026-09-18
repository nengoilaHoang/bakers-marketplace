type RecipeSearchResultsSkeletonProps = {
  count?: number;
};

export default function RecipeSearchResultsSkeleton({
  count = 4,
}: RecipeSearchResultsSkeletonProps) {
  return (
    <div aria-label="Đang tìm công thức" aria-live="polite">
      <p className="sr-only">Đang tìm công thức phù hợp...</p>
      <div
        aria-hidden="true"
        className="grid grid-cols-1 gap-6 lg:grid-cols-2"
      >
        {Array.from({ length: Math.max(0, count) }, (_, index) => (
          <div
            key={index}
            className="overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm"
          >
            <div className="aspect-[16/9] animate-pulse border-b border-zinc-200 bg-zinc-200 motion-reduce:animate-none" />
            <div className="p-5">
              <div className="h-6 w-3/5 animate-pulse rounded bg-zinc-200 motion-reduce:animate-none" />
              <div className="mt-3 h-4 w-full animate-pulse rounded bg-zinc-100 motion-reduce:animate-none" />
              <div className="mt-2 h-4 w-4/5 animate-pulse rounded bg-zinc-100 motion-reduce:animate-none" />
              <div className="mt-5 grid grid-cols-2 gap-2">
                <div className="h-16 animate-pulse rounded-xl bg-zinc-100 motion-reduce:animate-none" />
                <div className="h-16 animate-pulse rounded-xl bg-zinc-100 motion-reduce:animate-none" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
