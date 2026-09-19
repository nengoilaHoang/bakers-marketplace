import Head from "next/head";

import RecipesLayout from "@/components/layout/RecipesLayout";
import RecipeGrid from "@/components/recipe/RecipeGrid";
import RecipeGridSkeleton from "@/components/recipe/RecipeGridSkeleton";
import RecipesEmptyState from "@/components/recipe/RecipesEmptyState";
import { ErrorState } from "@/components/ui/ErrorState";
import { useInfiniteRecipes } from "@/hooks/useInfiniteRecipes";

export default function RecipesPage() {
  const {
    recipes,
    isInitialLoading,
    isLoadingMore,
    error,
    hasMore,
    loadMore,
    retry,
    sentinelRef,
  } = useInfiniteRecipes();

  return (
    <>
      <Head>
        <title>Công thức | Recipe Book</title>
        <meta
          name="description"
          content="Khám phá danh sách công thức nấu ăn mới nhất."
        />
      </Head>

      <RecipesLayout>
        <header className="mb-8 sm:mb-10">
          <p className="text-sm font-medium uppercase tracking-[0.18em] text-zinc-500">
            Recipe Book
          </p>
          <div className="mt-3 flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
            <div>
              <h1 className="text-3xl font-semibold tracking-tight text-black sm:text-4xl">
                Danh sách công thức
              </h1>
              <p className="mt-3 max-w-2xl text-base leading-7 text-zinc-600">
                Khám phá những công thức mới nhất và tiếp tục cuộn để xem thêm.
              </p>
            </div>

            {!isInitialLoading && recipes.length > 0 && (
              <p className="shrink-0 text-sm text-zinc-500" aria-live="polite">
                Đã tải {recipes.length} công thức
              </p>
            )}
          </div>
        </header>

        {isInitialLoading ? (
          <RecipeGridSkeleton />
        ) : error && recipes.length === 0 ? (
          <ErrorState message={error} onRetry={retry} />
        ) : recipes.length === 0 ? (
          <RecipesEmptyState />
        ) : (
          <>
            <RecipeGrid recipes={recipes} />

            {error && (
              <div className="mt-8">
                <ErrorState
                  title="Không thể tải thêm công thức"
                  message={error}
                  onRetry={retry}
                  compact
                />
              </div>
            )}

            <div
              ref={sentinelRef}
              className="flex min-h-24 items-center justify-center py-6 text-center"
              aria-live="polite"
            >
              {isLoadingMore ? (
                <div className="flex items-center gap-3 text-sm text-zinc-600">
                  <span
                    className="h-5 w-5 animate-spin rounded-full border-2 border-zinc-300 border-t-zinc-900"
                    aria-hidden="true"
                  />
                  Đang tải thêm công thức...
                </div>
              ) : hasMore && !error ? (
                <button
                  type="button"
                  onClick={() => void loadMore()}
                  className="rounded-full border border-zinc-300 bg-white px-5 py-2.5 text-sm font-medium text-zinc-800 transition hover:border-zinc-500 hover:bg-zinc-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-zinc-950"
                >
                  Tải thêm công thức
                </button>
              ) : !hasMore ? (
                <p className="text-sm text-zinc-500">
                  Bạn đã xem hết danh sách công thức.
                </p>
              ) : null}
            </div>
          </>
        )}
      </RecipesLayout>
    </>
  );
}
