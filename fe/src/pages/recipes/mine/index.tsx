import Head from "next/head";
import Link from "next/link";

import RecipesLayout from "@/components/layout/RecipesLayout";
import RecipeGrid from "@/components/recipe/RecipeGrid";
import RecipeGridSkeleton from "@/components/recipe/RecipeGridSkeleton";
import { ErrorState } from "@/components/ui/ErrorState";
import { useMyRecipes } from "@/hooks/useMyRecipes";

export default function MyRecipesPage() {
  const { recipes, isLoading, error, retry } = useMyRecipes();

  return (
    <>
      <Head>
        <title>My recipes | Recipe Book</title>
        <meta name="description" content="Quản lý các công thức của bạn." />
      </Head>

      <RecipesLayout>
        <header className="mb-8 flex flex-col justify-between gap-5 sm:mb-10 sm:flex-row sm:items-end">
          <div>
            <p className="text-sm font-medium uppercase tracking-[0.18em] text-zinc-500">
              Tài khoản của bạn
            </p>
            <h1 className="mt-3 text-3xl font-semibold tracking-tight text-zinc-950 sm:text-4xl">
              My recipes
            </h1>
            <p className="mt-3 text-base leading-7 text-zinc-600">
              Xem, chỉnh sửa hoặc xóa các công thức bạn đã tạo.
            </p>
          </div>
          <Link
            href="/recipes/mine/new"
            className="inline-flex min-h-11 w-fit items-center justify-center rounded-full bg-zinc-950 px-5 text-sm font-medium text-white transition hover:bg-zinc-700 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-zinc-950"
          >
            Tạo công thức mới
          </Link>
        </header>

        {isLoading ? (
          <RecipeGridSkeleton />
        ) : error ? (
          <ErrorState title="Không thể tải công thức của bạn" message={error} onRetry={retry} />
        ) : recipes.length === 0 ? (
          <section className="rounded-2xl border border-dashed border-zinc-300 bg-white px-6 py-16 text-center">
            <h2 className="text-lg font-semibold text-zinc-950">Bạn chưa có công thức nào</h2>
            <p className="mt-2 text-sm leading-6 text-zinc-600">
              Hãy tạo công thức đầu tiên để bắt đầu chia sẻ cùng cộng đồng.
            </p>
            <Link
              href="/recipes/mine/new"
              className="mt-6 inline-flex min-h-11 items-center justify-center rounded-full bg-zinc-950 px-5 text-sm font-medium text-white transition hover:bg-zinc-700 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-zinc-950"
            >
              Tạo công thức mới
            </Link>
          </section>
        ) : (
          <RecipeGrid
            recipes={recipes}
            getRecipeHref={(recipe) => `/recipes/mine/${encodeURIComponent(recipe.id)}`}
          />
        )}
      </RecipesLayout>
    </>
  );
}
