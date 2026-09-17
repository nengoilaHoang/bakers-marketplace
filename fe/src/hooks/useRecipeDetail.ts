import { useEffect, useState } from "react";

import { getRecipeById } from "@/services/recipes";
import type { RecipeDetail } from "@/types/recipe";
import { ApiError } from "@/utils/api";

type DetailResult = {
  id: string;
  attempt: number;
  recipe: RecipeDetail | null;
  error: string | null;
  isNotFound: boolean;
};

export function useRecipeDetail(id: string | undefined, enabled: boolean) {
  const [attempt, setAttempt] = useState(0);
  const [result, setResult] = useState<DetailResult | null>(null);

  useEffect(() => {
    if (!enabled || !id) return;

    const controller = new AbortController();

    async function loadRecipe(recipeId: string) {
      try {
        const recipe = await getRecipeById(recipeId, {
          signal: controller.signal,
        });

        if (!controller.signal.aborted) {
          setResult({ id: recipeId, attempt, recipe, error: null, isNotFound: false });
        }
      } catch (error) {
        if (controller.signal.aborted) return;

        setResult({
          id: recipeId,
          attempt,
          recipe: null,
          error: error instanceof Error ? error.message : "Không thể tải công thức. Vui lòng thử lại.",
          isNotFound: error instanceof ApiError && error.status === 404,
        });
      }
    }

    const requestTimer = window.setTimeout(() => void loadRecipe(id), 0);

    return () => {
      window.clearTimeout(requestTimer);
      controller.abort();
    };
  }, [id, enabled, attempt]);

  // Hide a previous recipe immediately when navigating to another ID or retrying.
  const current = result?.id === id && result?.attempt === attempt ? result : null;

  return {
    recipe: current?.recipe ?? null,
    error: current?.error ?? null,
    isNotFound: current?.isNotFound ?? false,
    isLoading: !current,
    retry: () => setAttempt((value) => value + 1),
  };
}
