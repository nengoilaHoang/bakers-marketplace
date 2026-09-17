import { useCallback, useEffect, useRef, useState } from "react";

import { getRecipes } from "@/services/recipes";
import type { Recipe, RecipeCursor } from "@/types/recipe";

function getErrorMessage(error: unknown): string {
  if (error instanceof Error && error.message) {
    return error.message;
  }

  return "Đã có lỗi xảy ra. Vui lòng thử lại.";
}

function isAbortError(error: unknown): boolean {
  return error instanceof DOMException && error.name === "AbortError";
}

function appendUniqueRecipes(
  currentRecipes: Recipe[],
  nextRecipes: Recipe[],
): Recipe[] {
  const recipeIds = new Set(currentRecipes.map((recipe) => recipe.id));
  const uniqueRecipes = nextRecipes.filter((recipe) => {
    if (recipeIds.has(recipe.id)) {
      return false;
    }

    recipeIds.add(recipe.id);
    return true;
  });

  return [...currentRecipes, ...uniqueRecipes];
}

function didCursorAdvance(
  currentCursor: RecipeCursor,
  nextCursor: RecipeCursor | null,
): boolean {
  return Boolean(
    nextCursor &&
      (nextCursor.id !== currentCursor.id ||
        nextCursor.createdAt !== currentCursor.createdAt),
  );
}

export function useInfiniteRecipes() {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [cursor, setCursor] = useState<RecipeCursor | null>();
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);
  const isLoadingMoreRef = useRef(false);
  const loadMoreControllerRef = useRef<AbortController | null>(null);
  const sentinelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const controller = new AbortController();
    let isActive = true;

    async function loadInitialRecipes() {
      try {
        const page = await getRecipes({ signal: controller.signal });

        if (!isActive) {
          return;
        }

        setRecipes(page.recipes);
        setCursor(page.cursor);
        setError(null);
      } catch (requestError) {
        if (!isActive || isAbortError(requestError)) {
          return;
        }

        setCursor(undefined);
        setError(getErrorMessage(requestError));
      } finally {
        if (isActive) {
          setIsInitialLoading(false);
        }
      }
    }

    // Defer one tick so React StrictMode can complete its development-only
    // setup/cleanup cycle without sending the same initial request twice.
    const requestTimer = window.setTimeout(() => {
      void loadInitialRecipes();
    }, 0);

    return () => {
      isActive = false;
      window.clearTimeout(requestTimer);
      controller.abort();
    };
  }, [reloadKey]);

  useEffect(() => {
    return () => {
      loadMoreControllerRef.current?.abort();
    };
  }, []);

  const loadMore = useCallback(async () => {
    if (!cursor || isInitialLoading || isLoadingMoreRef.current) {
      return;
    }

    const requestedCursor = cursor;
    const controller = new AbortController();
    loadMoreControllerRef.current = controller;
    isLoadingMoreRef.current = true;
    setIsLoadingMore(true);
    setError(null);

    try {
      const page = await getRecipes({
        cursor: requestedCursor,
        signal: controller.signal,
      });

      if (controller.signal.aborted) {
        return;
      }

      setRecipes((currentRecipes) =>
        appendUniqueRecipes(currentRecipes, page.recipes),
      );
      setCursor(
        page.recipes.length > 0 &&
          didCursorAdvance(requestedCursor, page.cursor)
          ? page.cursor
          : null,
      );
    } catch (requestError) {
      if (!controller.signal.aborted && !isAbortError(requestError)) {
        setError(getErrorMessage(requestError));
      }
    } finally {
      if (!controller.signal.aborted) {
        setIsLoadingMore(false);
      }

      if (loadMoreControllerRef.current === controller) {
        loadMoreControllerRef.current = null;
        isLoadingMoreRef.current = false;
      }
    }
  }, [cursor, isInitialLoading]);

  const retryInitialLoad = useCallback(() => {
    setError(null);
    setIsInitialLoading(true);
    setReloadKey((currentKey) => currentKey + 1);
  }, []);

  const retry = recipes.length === 0 ? retryInitialLoad : loadMore;
  const hasMore = cursor !== undefined && cursor !== null;

  useEffect(() => {
    const sentinel = sentinelRef.current;

    if (
      !sentinel ||
      !hasMore ||
      isInitialLoading ||
      isLoadingMore ||
      error ||
      typeof IntersectionObserver === "undefined"
    ) {
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          void loadMore();
        }
      },
      { rootMargin: "400px 0px" },
    );

    observer.observe(sentinel);

    return () => observer.disconnect();
  }, [error, hasMore, isInitialLoading, isLoadingMore, loadMore]);

  return {
    recipes,
    isInitialLoading,
    isLoadingMore,
    error,
    hasMore,
    loadMore,
    retry,
    sentinelRef,
  };
}
