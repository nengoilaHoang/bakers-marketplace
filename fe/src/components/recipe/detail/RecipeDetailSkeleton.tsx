export default function RecipeDetailSkeleton() {
  return (
    <div role="status" aria-label="Đang tải chi tiết công thức">
      <span className="sr-only">Đang tải chi tiết công thức...</span>
      <div aria-hidden="true" className="space-y-8 motion-safe:animate-pulse">
        <div className="overflow-hidden rounded-2xl border border-zinc-200 bg-white">
          <div className="h-48 bg-zinc-200 sm:h-64" />
          <div className="space-y-4 p-6 sm:p-8">
            <div className="h-9 w-2/3 rounded bg-zinc-200" />
            <div className="h-4 w-full rounded bg-zinc-100" />
            <div className="h-4 w-3/4 rounded bg-zinc-100" />
          </div>
        </div>
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="h-64 rounded-2xl border border-zinc-200 bg-white" />
          <div className="h-80 rounded-2xl border border-zinc-200 bg-white lg:col-span-2" />
        </div>
      </div>
    </div>
  );
}
