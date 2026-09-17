export default function RecipeCardSkeleton() {
  return (
    <div
      aria-hidden="true"
      className="h-full overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm"
    >
      <div className="aspect-[4/3] animate-pulse border-b border-zinc-200 bg-zinc-200 motion-reduce:animate-none" />

      <div className="p-5">
        <div className="h-6 w-3/5 animate-pulse rounded bg-zinc-200 motion-reduce:animate-none" />
        <div className="mt-4 space-y-2">
          <div className="h-4 w-full animate-pulse rounded bg-zinc-100 motion-reduce:animate-none" />
          <div className="h-4 w-5/6 animate-pulse rounded bg-zinc-100 motion-reduce:animate-none" />
          <div className="h-4 w-2/3 animate-pulse rounded bg-zinc-100 motion-reduce:animate-none" />
        </div>
        <div className="mt-5 border-t border-zinc-100 pt-4">
          <div className="h-4 w-2/5 animate-pulse rounded bg-zinc-100 motion-reduce:animate-none" />
        </div>
      </div>
    </div>
  );
}
