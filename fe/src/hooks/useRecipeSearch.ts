import { useCallback, useEffect, useState } from "react";

import { searchRecipes } from "@/services/recipes";
import type {
  RecipeSearchMatchMode,
  RecipeSearchResult,
} from "@/types/recipe";

type UseRecipeSearchOptions = {
  query: string;
  tools: string[];
  ingredients: string[];
  matchMode: RecipeSearchMatchMode;
  enabled?: boolean;
};

type RecipeSearchState = {
  requestKey: string;
  results: RecipeSearchResult[];
  isLoading: boolean;
  error: string | null;
};

const LIST_SEPARATOR = "\u001f";

function getErrorMessage(error: unknown): string {
  return error instanceof Error && error.message
    ? error.message
    : "Không thể tìm kiếm công thức. Vui lòng thử lại.";
}

function isAbortError(error: unknown): boolean {
  return error instanceof Error && error.name === "AbortError";
}

function readListKey(value: string): string[] {
  return value ? value.split(LIST_SEPARATOR) : [];
}

export function useRecipeSearch({
  query,
  tools,
  ingredients,
  matchMode,
  enabled = true,
}: UseRecipeSearchOptions) {
  const [attempt, setAttempt] = useState(0);
  const toolsKey = tools.join(LIST_SEPARATOR);
  const ingredientsKey = ingredients.join(LIST_SEPARATOR);
  const requestKey = enabled
    ? JSON.stringify([query, toolsKey, ingredientsKey, matchMode, attempt])
    : null;
  const [state, setState] = useState<RecipeSearchState>({
    requestKey: "",
    results: [],
    isLoading: true,
    error: null,
  });

  useEffect(() => {
    if (!requestKey) {
      return;
    }

    const activeRequestKey = requestKey;
    const controller = new AbortController();
    let isActive = true;

    async function loadResults() {
      try {
        const nextResults = await searchRecipes(
          {
            query,
            tools: readListKey(toolsKey),
            ingredients: readListKey(ingredientsKey),
            matchMode,
          },
          { signal: controller.signal },
        );

        if (isActive) {
          setState({
            requestKey: activeRequestKey,
            results: nextResults,
            isLoading: false,
            error: null,
          });
        }
      } catch (requestError) {
        if (isActive && !isAbortError(requestError)) {
          setState({
            requestKey: activeRequestKey,
            results: [],
            isLoading: false,
            error: getErrorMessage(requestError),
          });
        }
      }
    }

    // Defer one tick so React StrictMode can finish its development-only
    // setup/cleanup cycle without sending the same request twice.
    const requestTimer = window.setTimeout(() => {
      if (!isActive) {
        return;
      }

      setState({
        requestKey: activeRequestKey,
        results: [],
        isLoading: true,
        error: null,
      });
      void loadResults();
    }, 0);

    return () => {
      isActive = false;
      window.clearTimeout(requestTimer);
      controller.abort();
    };
  }, [ingredientsKey, matchMode, query, requestKey, toolsKey]);

  const retry = useCallback(() => {
    setAttempt((currentAttempt) => currentAttempt + 1);
  }, []);

  const isCurrentRequest = requestKey !== null && state.requestKey === requestKey;

  return {
    results: isCurrentRequest ? state.results : [],
    isLoading: !isCurrentRequest || state.isLoading,
    error: isCurrentRequest ? state.error : null,
    retry,
  };
}
