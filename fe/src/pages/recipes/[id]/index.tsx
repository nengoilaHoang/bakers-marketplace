import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";

import AppLayout from "@/components/layout/AppLayout";
import RecipeDetailSkeleton from "@/components/recipe/detail/RecipeDetailSkeleton";
import RecipeDetailView from "@/components/recipe/detail/RecipeDetailView";
import { ErrorState } from "@/components/ui/ErrorState";
import { useRecipeDetail } from "@/hooks/useRecipeDetail";
import { getCurrentUser } from "@/services/posts";
import { deleteRecipe } from "@/services/recipes";
import type { SessionUser } from "@/types/post";

export default function RecipeDetailPage() {
  const router = useRouter();
  const id = typeof router.query.id === "string" ? router.query.id : undefined;
  const { recipe, error, isLoading, isNotFound, retry } = useRecipeDetail(id, router.isReady);
  const [currentUser, setCurrentUser] = useState<SessionUser | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  useEffect(() => {
    let isActive = true;

    void getCurrentUser()
      .catch(() => null)
      .then((user) => {
        if (isActive) setCurrentUser(user);
      });

    return () => {
      isActive = false;
    };
  }, []);

  const isOwner = Boolean(recipe?.userId && recipe.userId === currentUser?.id);

  async function handleDelete() {
    if (!recipe || !window.confirm(`Xóa công thức “${recipe.title}”?`)) {
      return;
    }

    setDeleteError(null);
    setIsDeleting(true);

    try {
      await deleteRecipe(recipe.id);
      await router.replace("/me?tab=recipes");
    } catch (requestError) {
      setDeleteError(
        requestError instanceof Error
          ? requestError.message
          : "Không thể xóa công thức. Vui lòng thử lại.",
      );
      setIsDeleting(false);
    }
  }

  return (
    <>
      <Head>
        <title>{recipe ? `${recipe.title} | Recipe Book` : "Chi tiết công thức | Recipe Book"}</title>
        <meta name="description" content={recipe?.description || "Xem nguyên liệu và hướng dẫn thực hiện công thức."} />
      </Head>

      <div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <Link
          href="/recipes"
          className="inline-flex w-fit items-center gap-2 rounded text-sm font-medium text-zinc-600 hover:text-zinc-950 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-zinc-950"
        >
          <span aria-hidden="true">←</span>
          Quay lại danh sách công thức
        </Link>

        {recipe && isOwner && (
          <div className="flex items-center gap-3">
            <Link
              href={`/recipes/${encodeURIComponent(recipe.id)}/edit`}
              className="inline-flex min-h-10 items-center justify-center rounded-full border border-zinc-300 bg-white px-4 text-sm font-medium text-zinc-800 transition hover:border-zinc-500 hover:bg-zinc-100 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-zinc-950"
            >
              Sửa
            </Link>
            <button
              type="button"
              onClick={() => void handleDelete()}
              disabled={isDeleting}
              className="inline-flex min-h-10 items-center justify-center rounded-full bg-zinc-950 px-4 text-sm font-medium text-white transition hover:bg-zinc-700 disabled:cursor-not-allowed disabled:bg-zinc-400 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-zinc-950"
            >
              {isDeleting ? "Đang xóa..." : "Xóa"}
            </button>
          </div>
        )}
      </div>

      {deleteError && (
        <p className="mb-6 rounded-xl border border-zinc-200 bg-white px-4 py-3 text-sm text-zinc-700" role="alert">
          {deleteError}
        </p>
      )}

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
    </>
  );
}

RecipeDetailPage.getLayout = function getLayout(page: React.ReactElement) {
  return <AppLayout>{page}</AppLayout>;
};
