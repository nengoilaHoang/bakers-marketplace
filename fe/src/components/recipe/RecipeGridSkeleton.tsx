import RecipeCardSkeleton from "./RecipeCardSkeleton";

type RecipeGridSkeletonProps = {
  count?: number;
};

export default function RecipeGridSkeleton({
  count = 4,
}: RecipeGridSkeletonProps) {
  return (
    <section aria-label="Đang tải danh sách công thức" aria-live="polite">
      <p className="sr-only">Đang tải công thức...</p>
      <div
        aria-hidden="true"
        className="grid grid-cols-1 gap-6 md:grid-cols-2"
      >
        {Array.from({ length: Math.max(0, count) }, (_, index) => (
          <RecipeCardSkeleton key={index} />
        ))}
      </div>
    </section>
  );
}
