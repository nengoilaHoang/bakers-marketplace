import Link from "next/link";

import type { RecipeSearchResult } from "@/types/recipe";

function MatchRow({
  label,
  matched,
  total,
  missing,
}: {
  label: string;
  matched: number;
  total: number;
  missing: string[];
}) {
  const isComplete = missing.length === 0;

  return (
    <div className="rounded-xl bg-zinc-50 px-3 py-2.5">
      <div className="flex items-center justify-between gap-3 text-xs">
        <span className="font-medium text-zinc-700">{label}</span>
        <span className={isComplete ? "text-emerald-700" : "text-amber-700"}>
          {matched}/{total} phù hợp
        </span>
      </div>
      <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-zinc-200">
        <div
          className={`h-full rounded-full ${isComplete ? "bg-emerald-500" : "bg-amber-500"}`}
          style={{ width: `${total === 0 ? 100 : Math.round((matched / total) * 100)}%` }}
        />
      </div>
      {missing.length > 0 && (
        <p className="mt-2 truncate text-[11px] text-zinc-500">
          Thiếu: {missing.join(", ")}
        </p>
      )}
    </div>
  );
}

export default function RecipeSearchResultCard({
  result,
}: {
  result: RecipeSearchResult;
}) {
  const isComplete = result.matchMode === "complete";

  return (
    <article className="flex h-full flex-col overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
      <div className="relative flex aspect-[16/9] items-center justify-center border-b border-zinc-200 bg-gradient-to-br from-zinc-100 to-zinc-200 text-zinc-400">
        <svg
          viewBox="0 0 24 24"
          aria-hidden="true"
          className="size-10"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M4 18.5h16M6 18.5c0-4 2.4-7 6-7s6 3 6 7M9 8.5h6M10 5.5h4" />
        </svg>
        <span
          className={`absolute left-3 top-3 rounded-full px-2.5 py-1 text-xs font-semibold shadow-sm ${
            isComplete
              ? "bg-emerald-50 text-emerald-800"
              : "bg-amber-50 text-amber-800"
          }`}
        >
          {isComplete ? "Khớp đầy đủ" : "Khớp linh hoạt"}
        </span>
      </div>

      <div className="flex flex-1 flex-col p-5">
        <div className="flex items-start justify-between gap-3">
          <h2 className="text-lg font-semibold leading-7 tracking-tight text-zinc-950">
            {result.title}
          </h2>
          <span className="shrink-0 rounded-full bg-zinc-100 px-2.5 py-1 text-xs text-zinc-600">
            {result.portion ? `${result.portion} phần` : "Chưa rõ khẩu phần"}
          </span>
        </div>
        <p className="mt-2 line-clamp-2 text-sm leading-6 text-zinc-600">
          {result.description || "Công thức này chưa có mô tả."}
        </p>

        <div className="mt-5 grid gap-2 sm:grid-cols-2">
          <MatchRow label="Nguyên liệu" {...result.ingredientMatch} />
          <MatchRow label="Dụng cụ" {...result.toolMatch} />
        </div>

        <div className="mt-5 flex items-center justify-between border-t border-zinc-100 pt-4">
          <span className="text-xs text-zinc-500">Công thức phù hợp</span>
          <Link
            href={`/recipes/${encodeURIComponent(result.id)}`}
            className="rounded-md text-sm font-semibold text-zinc-900 transition hover:text-zinc-600 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-zinc-950"
          >
            Xem công thức <span aria-hidden="true">→</span>
          </Link>
        </div>
      </div>
    </article>
  );
}
