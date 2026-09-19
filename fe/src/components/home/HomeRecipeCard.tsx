import Link from "next/link";

import type { Recipe } from "@/types/recipe";

type HomeRecipeCardProps = {
  recipe: Recipe;
};

function getAuthorLabel(userId: string | null | undefined) {
  return userId
    ? `Thành viên #${userId.slice(0, 8)}`
    : "Thành viên cộng đồng";
}

export default function HomeRecipeCard({ recipe }: HomeRecipeCardProps) {
  return (
    <article className="h-full">
      <Link
        href={`/recipes/${encodeURIComponent(recipe.id)}`}
        className="flex h-full flex-col overflow-hidden rounded-2xl border border-zinc-200 bg-white transition hover:border-zinc-400 hover:shadow-sm focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-zinc-950"
      >
        <div
          className="flex aspect-[4/3] items-center justify-center border-b border-zinc-200 bg-zinc-100 text-zinc-400"
          role="img"
          aria-label={`Ảnh minh họa cho ${recipe.title}`}
        >
          <svg
            viewBox="0 0 24 24"
            aria-hidden="true"
            className="h-9 w-9"
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
          <span className="w-fit rounded-full bg-zinc-100 px-2.5 py-1 text-xs font-medium text-zinc-600">
            Công thức mới
          </span>
          <h3 className="mt-4 text-lg font-semibold leading-7 tracking-tight text-zinc-950">
            {recipe.title}
          </h3>
          <p className="mt-1 text-sm text-zinc-500">
            {getAuthorLabel(recipe.userId)}
          </p>
          <p className="mt-3 line-clamp-3 flex-1 text-sm leading-6 text-zinc-600">
            {recipe.description?.trim() || "Công thức chưa có mô tả."}
          </p>
        </div>
      </Link>
    </article>
  );
}
