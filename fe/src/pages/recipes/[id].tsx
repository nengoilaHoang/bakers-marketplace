import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";

import RecipesLayout from "@/components/layout/RecipesLayout";
import RecipeDetailSkeleton from "@/components/recipe/detail/RecipeDetailSkeleton";
import RecipeDetailView from "@/components/recipe/detail/RecipeDetailView";
import { ErrorState } from "@/components/ui/ErrorState";
import { useRecipeDetail } from "@/hooks/useRecipeDetail";

export default function RecipeDetailPage() {
  const router = useRouter();
  const id = typeof router.query.id === "string" ? router.query.id : undefined;
  const { recipe, error, isLoading, isNotFound, retry } = useRecipeDetail(id, router.isReady);

  return (
    <>
      <Head>
        <title>{recipe ? `${recipe.title} | Recipe Book` : "Chi tiết công thức | Recipe Book"}</title>
        <meta name="description" content={recipe?.description || "Xem nguyên liệu và hướng dẫn thực hiện công thức."} />
      </Head>

      <RecipesLayout>
        <Link
          href="/recipes"
          className="mb-6 inline-flex items-center gap-2 rounded text-sm font-medium text-zinc-600 hover:text-zinc-950 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-zinc-950"
        >
          <span aria-hidden="true">←</span>
          Quay lại danh sách công thức
        </Link>

        {isLoading ? (
          <RecipeDetailSkeleton />
        ) : isNotFound ? (
          <section className="rounded-2xl border border-zinc-200 bg-white px-6 py-16 text-center">
            <h1 className="text-2xl font-semibold text-zinc-950">Không tìm thấy công thức</h1>
            <p className="mt-3 text-sm text-zinc-600">Công thức này không tồn tại hoặc đã bị xóa.</p>
          </section>
        ) : error ? (
          <ErrorState title="Không thể tải công thức" message={error} onRetry={retry} />
        ) : recipe ? (
          <RecipeDetailView recipe={recipe} />
        ) : null}
      </RecipesLayout>
    </>
  );
}
