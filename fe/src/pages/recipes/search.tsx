import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import { useMemo, useState } from "react";

import RecipesLayout from "@/components/layout/RecipesLayout";
import RecipesEmptyState from "@/components/recipe/RecipesEmptyState";
import RecipeSearchPanel from "@/components/recipe/search/RecipeSearchPanel";
import RecipeSearchResultCard from "@/components/recipe/search/RecipeSearchResultCard";
import RecipeSearchResultsSkeleton from "@/components/recipe/search/RecipeSearchResultsSkeleton";
import { ErrorState } from "@/components/ui/ErrorState";
import { useRecipeSearch } from "@/hooks/useRecipeSearch";
import type {
  RecipeSearchMatchMode,
  RecipeSearchResult,
} from "@/types/recipe";

type RecipeSearchSort = "relevance" | "missing" | "newest";

function readQueryValue(value: string | string[] | undefined) {
  return typeof value === "string" ? value : value?.[0] ?? "";
}

function readQueryList(value: string | string[] | undefined) {
  if (Array.isArray(value)) return value;
  return value ? [value] : [];
}

function getMissingCount(result: RecipeSearchResult): number {
  return result.ingredientMatch.missing.length + result.toolMatch.missing.length;
}

function getCreatedAtTime(result: RecipeSearchResult): number {
  const createdAt = result.createdAt
    ? new Date(result.createdAt).getTime()
    : 0;

  return Number.isNaN(createdAt) ? 0 : createdAt;
}

export default function RecipeSearchPage() {
  const router = useRouter();
  const [sort, setSort] = useState<RecipeSearchSort>("relevance");
  const queryText = readQueryValue(router.query.q);
  const selectedTools = readQueryList(router.query.tools);
  const selectedIngredients = readQueryList(router.query.ingredients);
  const matchModeValue = readQueryValue(router.query.matchMode);
  const matchMode: RecipeSearchMatchMode =
    matchModeValue === "flexible" ? "flexible" : "complete";
  const { results, isLoading, error, retry } = useRecipeSearch({
    query: queryText,
    tools: selectedTools,
    ingredients: selectedIngredients,
    matchMode,
    enabled: router.isReady,
  });
  const displayedResults = useMemo(() => {
    const sortedResults = [...results];

    if (sort === "missing") {
      return sortedResults.sort(
        (first, second) =>
          getMissingCount(first) - getMissingCount(second)
          || second.rankScore - first.rankScore,
      );
    }

    if (sort === "newest") {
      return sortedResults.sort(
        (first, second) =>
          getCreatedAtTime(second) - getCreatedAtTime(first)
          || second.rankScore - first.rankScore,
      );
    }

    return sortedResults.sort(
      (first, second) => second.rankScore - first.rankScore,
    );
  }, [results, sort]);
  const pageTitle = queryText
    ? `Kết quả cho “${queryText}” | Recipe Book`
    : "Kết quả tìm kiếm | Recipe Book";

  return (
    <>
      <Head>
        <title>{pageTitle}</title>
        <meta
          name="description"
          content="Kết quả tìm kiếm công thức theo dụng cụ và nguyên liệu bạn có."
        />
      </Head>

      <RecipesLayout>
        <Link
          href="/recipes"
          className="inline-flex items-center gap-2 rounded-md text-sm font-medium text-zinc-600 transition hover:text-zinc-950 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-zinc-950"
        >
          <span aria-hidden="true">←</span>
          Quay lại danh sách công thức
        </Link>

        <header className="mb-8 mt-6 sm:mb-10">
          <p className="text-sm font-medium uppercase tracking-[0.18em] text-zinc-500">
            Tìm kiếm thông minh
          </p>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight text-zinc-950 sm:text-4xl">
            Kết quả tìm kiếm
          </h1>
          <p className="mt-3 max-w-2xl text-base leading-7 text-zinc-600">
            {queryText
              ? <>Các công thức phù hợp với từ khóa <strong className="font-semibold text-zinc-900">“{queryText}”</strong> và bộ lọc của bạn.</>
              : "Các công thức phù hợp với dụng cụ và nguyên liệu bạn đã chọn."}
          </p>
        </header>

        <RecipeSearchPanel
          key={router.isReady ? router.asPath : "search-loading"}
          initialQuery={queryText}
          initialTools={selectedTools}
          initialIngredients={selectedIngredients}
          initialMatchMode={matchMode}
        />

        <section className="mt-12" aria-labelledby="search-results-title">
          <div className="flex flex-col justify-between gap-4 border-b border-zinc-200 pb-5 sm:flex-row sm:items-end">
            <div>
              <p className="text-sm text-zinc-500" aria-live="polite">
                {isLoading
                  ? "Đang tìm công thức phù hợp..."
                  : error
                    ? "Chưa thể tải kết quả"
                    : `${displayedResults.length} kết quả phù hợp`}
              </p>
              <h2 id="search-results-title" className="mt-1 text-2xl font-semibold tracking-tight text-zinc-950">
                Công thức dành cho bạn
              </h2>
            </div>
            {!isLoading && !error && displayedResults.length > 0 && (
              <label className="flex w-full items-center gap-3 text-sm text-zinc-600 sm:w-auto">
                <span className="shrink-0">Sắp xếp</span>
                <select
                  value={sort}
                  onChange={(event) => setSort(event.target.value as RecipeSearchSort)}
                  className="min-h-10 min-w-44 flex-1 rounded-xl border border-zinc-300 bg-white px-3 text-sm text-zinc-800 outline-none focus:border-zinc-950 focus:ring-2 focus:ring-zinc-950/10"
                >
                  <option value="relevance">Phù hợp nhất</option>
                  <option value="missing">Ít mục còn thiếu nhất</option>
                  <option value="newest">Mới nhất</option>
                </select>
              </label>
            )}
          </div>

          <div className="mt-6">
            {isLoading ? (
              <RecipeSearchResultsSkeleton />
            ) : error ? (
              <ErrorState
                title="Không thể tải kết quả tìm kiếm"
                message={error}
                onRetry={retry}
              />
            ) : displayedResults.length === 0 ? (
              <RecipesEmptyState
                title="Không tìm thấy công thức phù hợp"
                description="Hãy thử đổi từ khóa, chọn thêm dụng cụ hoặc chuyển sang chế độ khớp linh hoạt."
              />
            ) : (
              <ul className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                {displayedResults.map((result) => (
                  <li key={result.id}>
                    <RecipeSearchResultCard result={result} />
                  </li>
                ))}
              </ul>
            )}
          </div>
        </section>
      </RecipesLayout>
    </>
  );
}
