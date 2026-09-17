type RecipesEmptyStateProps = {
  title?: string;
  description?: string;
};

export default function RecipesEmptyState({
  title = "Chưa có công thức nào",
  description = "Các công thức mới sẽ xuất hiện tại đây.",
}: RecipesEmptyStateProps) {
  return (
    <section
      aria-labelledby="recipes-empty-title"
      className="rounded-2xl border border-dashed border-zinc-300 bg-white px-6 py-16 text-center"
    >
      <div
        aria-hidden="true"
        className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-zinc-100 text-xl text-zinc-500"
      >
        +
      </div>
      <h2
        id="recipes-empty-title"
        className="mt-4 text-lg font-semibold text-black"
      >
        {title}
      </h2>
      <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-zinc-600">
        {description}
      </p>
    </section>
  );
}
