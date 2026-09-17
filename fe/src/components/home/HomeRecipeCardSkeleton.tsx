export default function HomeRecipeCardSkeleton() {
  return (
    <div
      aria-hidden="true"
      className="overflow-hidden rounded-2xl border border-zinc-200 bg-white motion-safe:animate-pulse"
    >
      <div className="aspect-[4/3] bg-zinc-200" />
      <div className="space-y-3 p-5">
        <div className="h-6 w-24 rounded-full bg-zinc-100" />
        <div className="h-6 w-3/4 rounded bg-zinc-200" />
        <div className="h-4 w-1/2 rounded bg-zinc-100" />
        <div className="h-4 w-full rounded bg-zinc-100" />
        <div className="h-4 w-5/6 rounded bg-zinc-100" />
      </div>
    </div>
  );
}
