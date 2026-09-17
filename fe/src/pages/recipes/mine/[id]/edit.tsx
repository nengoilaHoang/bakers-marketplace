import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";

import RecipesLayout from "@/components/layout/RecipesLayout";
import RecipeDetailSkeleton from "@/components/recipe/detail/RecipeDetailSkeleton";
import RecipeForm from "@/components/recipe/RecipeForm";
import { ErrorState } from "@/components/ui/ErrorState";
import { useRecipeDetail } from "@/hooks/useRecipeDetail";
import { updateRecipe } from "@/services/recipes";

export default function EditRecipePage() {
  const router = useRouter();
  const id = typeof router.query.id === "string" ? router.query.id : undefined;
  const { recipe, error, isLoading, isNotFound, retry } = useRecipeDetail(
    id,
    router.isReady,
  );
  const detailHref = id ? `/recipes/mine/${encodeURIComponent(id)}` : "/recipes/mine";

  return (
    <>
      <Head>
        <title>{recipe ? `Sửa ${recipe.title} | Recipe Book` : "Sửa công thức | Recipe Book"}</title>
      </Head>

      <RecipesLayout>
        <Link
          href={detailHref}
          className="mb-6 inline-flex items-center gap-2 rounded text-sm font-medium text-zinc-600 hover:text-zinc-950 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-zinc-950"
        >
          <span aria-hidden="true">←</span>
          Quay lại chi tiết công thức
        </Link>

        <header className="mb-8">
          <h1 className="text-3xl font-semibold tracking-tight text-zinc-950 sm:text-4xl">
            Sửa công thức
          </h1>
          <p className="mt-3 text-base leading-7 text-zinc-600">
            Cập nhật thông tin và sắp xếp lại các bước, ghi chú khi cần.
          </p>
        </header>

        {isLoading ? (
          <RecipeDetailSkeleton />
        ) : isNotFound ? (
          <section className="rounded-2xl border border-zinc-200 bg-white px-6 py-16 text-center">
            <h2 className="text-xl font-semibold text-zinc-950">Không tìm thấy công thức</h2>
          </section>
        ) : error ? (
          <ErrorState title="Không thể tải công thức" message={error} onRetry={retry} />
        ) : recipe ? (
          <RecipeForm
            key={recipe.id}
            initialRecipe={recipe}
            submitLabel="Lưu thay đổi"
            cancelHref={detailHref}
            onSubmit={async (values) => {
              await updateRecipe(recipe.id, values);
              await router.replace(`/recipes/mine/${encodeURIComponent(recipe.id)}`);
            }}
          />
        ) : null}
      </RecipesLayout>
    </>
  );
}
