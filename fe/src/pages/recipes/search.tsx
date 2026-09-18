import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";

import RecipesLayout from "@/components/layout/RecipesLayout";
import RecipeSearchPanel, {
  type RecipeMatchMode,
} from "@/components/recipe/search/RecipeSearchPanel";
import RecipeSearchResultCard, {
  type RecipeSearchResultItem,
} from "@/components/recipe/search/RecipeSearchResultCard";

const previewResults: RecipeSearchResultItem[] = [
  {
    id: "preview-chocolate-cookie",
    title: "Cookie chocolate mềm",
    description: "Cookie thơm bơ, viền giòn nhẹ và phần giữa mềm ẩm với chocolate đậm vị.",
    portion: 12,
    matchMode: "complete",
    ingredientMatch: { matched: 8, total: 8, missing: [] },
    toolMatch: { matched: 4, total: 4, missing: [] },
  },
  {
    id: "preview-banana-bread",
    title: "Bánh chuối nướng",
    description: "Công thức tận dụng chuối chín, dễ làm và phù hợp cho bữa sáng nhẹ nhàng.",
    portion: 8,
    matchMode: "complete",
    ingredientMatch: { matched: 7, total: 7, missing: [] },
    toolMatch: { matched: 3, total: 3, missing: [] },
  },
  {
    id: "preview-tiramisu",
    title: "Tiramisu không cần lò",
    description: "Tiramisu mềm mịn với lớp kem mascarpone và hương cà phê cân bằng.",
    portion: 6,
    matchMode: "flexible",
    ingredientMatch: { matched: 7, total: 8, missing: ["Mascarpone"] },
    toolMatch: { matched: 3, total: 3, missing: [] },
  },
  {
    id: "preview-butter-cake",
    title: "Butter cake cổ điển",
    description: "Cốt bánh bơ cơ bản, mềm xốp và dễ kết hợp với trái cây hoặc kem tươi.",
    portion: 8,
    matchMode: "flexible",
    ingredientMatch: { matched: 6, total: 7, missing: ["Kem tươi"] },
    toolMatch: { matched: 3, total: 4, missing: ["Máy đánh trứng"] },
  },
  {
    id: "preview-pancake",
    title: "Pancake sữa tươi",
    description: "Bánh pancake nhanh gọn, mềm nhẹ, dùng được với mật ong hoặc trái cây.",
    portion: 4,
    matchMode: "complete",
    ingredientMatch: { matched: 6, total: 6, missing: [] },
    toolMatch: { matched: 2, total: 2, missing: [] },
  },
  {
    id: "preview-cinnamon-roll",
    title: "Cinnamon roll phủ kem",
    description: "Bánh cuộn quế thơm mềm với lớp đường quế và kem phủ dịu ngọt.",
    portion: 9,
    matchMode: "flexible",
    ingredientMatch: { matched: 8, total: 10, missing: ["Cream cheese", "Đường nâu"] },
    toolMatch: { matched: 4, total: 5, missing: ["Cây cán bột"] },
  },
];

function readQueryValue(value: string | string[] | undefined) {
  return typeof value === "string" ? value : value?.[0] ?? "";
}

function readQueryList(value: string | string[] | undefined) {
  if (Array.isArray(value)) return value;
  return value ? [value] : [];
}

export default function RecipeSearchPage() {
  const router = useRouter();
  const queryText = readQueryValue(router.query.q);
  const matchModeValue = readQueryValue(router.query.matchMode);
  const matchMode: RecipeMatchMode =
    matchModeValue === "flexible" ? "flexible" : "complete";
  const displayedResults =
    matchMode === "complete"
      ? previewResults.filter((result) => result.matchMode === "complete")
      : previewResults;
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
          initialTools={readQueryList(router.query.tools)}
          initialIngredients={readQueryList(router.query.ingredients)}
          initialMatchMode={matchMode}
        />

        <section className="mt-12" aria-labelledby="search-results-title">
          <div className="flex flex-col justify-between gap-4 border-b border-zinc-200 pb-5 sm:flex-row sm:items-end">
            <div>
              <p className="text-sm text-zinc-500">{displayedResults.length} kết quả phù hợp</p>
              <h2 id="search-results-title" className="mt-1 text-2xl font-semibold tracking-tight text-zinc-950">
                Công thức dành cho bạn
              </h2>
            </div>
            <label className="flex w-full items-center gap-3 text-sm text-zinc-600 sm:w-auto">
              <span className="shrink-0">Sắp xếp</span>
              <select
                defaultValue="relevance"
                className="min-h-10 min-w-44 flex-1 rounded-xl border border-zinc-300 bg-white px-3 text-sm text-zinc-800 outline-none focus:border-zinc-950 focus:ring-2 focus:ring-zinc-950/10"
              >
                <option value="relevance">Phù hợp nhất</option>
                <option value="missing">Ít mục còn thiếu nhất</option>
                <option value="newest">Mới nhất</option>
              </select>
            </label>
          </div>

          <ul className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
            {displayedResults.map((result) => (
              <li key={result.id}>
                <RecipeSearchResultCard result={result} />
              </li>
            ))}
          </ul>
        </section>
      </RecipesLayout>
    </>
  );
}
