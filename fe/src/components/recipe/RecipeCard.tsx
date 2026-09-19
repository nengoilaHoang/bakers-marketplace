import Link from "next/link";
import type { Recipe } from "@/types/recipe";

type RecipeCardProps = {
  recipe: Recipe;
  href?: string;
};

const dateFormatter = new Intl.DateTimeFormat("vi-VN", {
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
});

function formatDate(value: string | null | undefined) {
  if (!value) {
    return null;
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return null;
  }

  return dateFormatter.format(date);
}

export default function RecipeCard({ recipe, href }: RecipeCardProps) {
  const formattedDate = formatDate(recipe.createdAt);

  return (
    <article className="h-full">
      <Link
        href={href ?? `/recipes/${encodeURIComponent(recipe.id)}`}
        aria-label={`Xem công thức ${recipe.title}`}
        className="flex h-full flex-col overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm transition-shadow hover:shadow-md focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-zinc-950"
      >
        <div
          className="flex aspect-[4/3] items-center justify-center border-b border-zinc-200 bg-zinc-100 text-zinc-400"
          role="img"
          aria-label={`Ảnh minh họa cho ${recipe.title}`}
        >
          <svg
            viewBox="0 0 24 24"
            aria-hidden="true"
            className="h-10 w-10"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 0 0 1.5-1.5V6a1.5 1.5 0 0 0-1.5-1.5H3.75A1.5 1.5 0 0 0 2.25 6v12a1.5 1.5 0 0 0 1.5 1.5Zm10.5-11.25h.008v.008h-.008V8.25Z"
            />
          </svg>
        </div>

        <div className="flex flex-1 flex-col p-5">
          <h2 className="text-lg font-semibold leading-7 tracking-tight text-black">
            {recipe.title}
          </h2>

          <p className="mt-2 line-clamp-3 flex-1 text-sm leading-6 text-zinc-600">
            {recipe.description?.trim() || "Công thức chưa có mô tả."}
          </p>

          <dl className="mt-5 flex flex-wrap items-center gap-x-4 gap-y-2 border-t border-zinc-100 pt-4 text-sm text-zinc-500">
            {recipe.portion != null && (
              <div className="flex items-center gap-1.5">
                <dt className="sr-only">Khẩu phần</dt>
                <dd>{recipe.portion} khẩu phần</dd>
              </div>
            )}

            {formattedDate && (
              <div className="flex items-center gap-1.5">
                <dt className="sr-only">Ngày tạo</dt>
                <dd>
                  <time dateTime={recipe.createdAt ?? undefined}>{formattedDate}</time>
                </dd>
              </div>
            )}
          </dl>
        </div>
      </Link>
    </article>
  );
}
