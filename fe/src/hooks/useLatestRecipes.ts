import { useCallback, useEffect, useState } from "react";

import { getRecipes } from "@/services/recipes";
import type { Recipe } from "@/types/recipe";

function getErrorMessage(error: unknown): string {
  return error instanceof Error && error.message
    ? error.message
    : "Không thể tải công thức. Vui lòng thử lại.";
}

export function useLatestRecipes(limit = 12) {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    const controller = new AbortController();

    async function loadRecipes() {
      try {
        const page = await getRecipes({ signal: controller.signal });

        if (!controller.signal.aborted) {
          setRecipes(page.recipes.slice(0, limit));
          setError(null);
        }
      } catch (requestError) {
        if (!controller.signal.aborted) {
          setError(getErrorMessage(requestError));
        }
      } finally {
        if (!controller.signal.aborted) {
          setIsLoading(false);
        }
      }
    }

    // Lets React StrictMode finish its development-only effect cycle first.
    const requestTimer = window.setTimeout(() => void loadRecipes(), 0);

    return () => {
      window.clearTimeout(requestTimer);
      controller.abort();
    };
  }, [attempt, limit]);

  const retry = useCallback(() => {
    setError(null);
    setIsLoading(true);
    setAttempt((currentAttempt) => currentAttempt + 1);
  }, []);

  return { recipes, isLoading, error, retry };
}
