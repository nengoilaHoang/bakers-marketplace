import type { ReactNode } from "react";

import type { RecipeDetail } from "@/types/recipe";

function DetailSection({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <section className="rounded-2xl border border-zinc-200 bg-white p-5 sm:p-6">
      <h2 className="mb-5 text-xl font-semibold text-zinc-950">{title}</h2>
      {children}
    </section>
  );
}

function formatAmount(amount: number | string | null | undefined) {
  if (amount == null || amount === "") return "";
  const value = Number(amount);
  return Number.isFinite(value) ? value.toLocaleString("vi-VN") : String(amount);
}

export default function RecipeDetailView({ recipe }: { recipe: RecipeDetail }) {
  return (
    <article className="space-y-8">
      <header className="overflow-hidden rounded-2xl border border-zinc-200 bg-white">
        <div className="flex min-h-48 items-center justify-center bg-zinc-100 px-6 py-16 text-sm text-zinc-500 sm:min-h-64">
          Chưa có ảnh công thức
        </div>
        <div className="p-6 sm:p-8">
          <h1 className="break-words text-3xl font-semibold tracking-tight text-zinc-950 sm:text-4xl">
            {recipe.title}
          </h1>
          <p className="mt-4 whitespace-pre-wrap break-words leading-7 text-zinc-600">
            {recipe.description?.trim() || "Công thức chưa có mô tả."}
          </p>
          {recipe.portion != null && (
            <p className="mt-5 text-sm font-medium text-zinc-700">
              Khẩu phần: {recipe.portion} người
            </p>
          )}
          {recipe.recipeTags.length > 0 && (
            <ul aria-label="Nhãn công thức" className="mt-5 flex flex-wrap gap-2">
              {recipe.recipeTags.map((tag) => (
                <li key={tag.id} className="rounded-full bg-zinc-100 px-3 py-1 text-sm text-zinc-600">
                  {tag.name}
                </li>
              ))}
            </ul>
          )}
        </div>
      </header>

      <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,2fr)]">
        <div className="space-y-6">
          <DetailSection title="Nguyên liệu">
            {recipe.recipeIngredients.length === 0 ? (
              <p className="text-sm text-zinc-500">Chưa có nguyên liệu.</p>
            ) : (
              <ul className="divide-y divide-zinc-100">
                {recipe.recipeIngredients.map((ingredient) => (
                  <li key={ingredient.id} className="flex justify-between gap-4 py-3 first:pt-0 last:pb-0">
                    <span className="min-w-0 break-words text-sm text-zinc-800">{ingredient.name}</span>
                    <span className="shrink-0 text-sm text-zinc-500">
                      {[formatAmount(ingredient.amount), ingredient.unit].filter(Boolean).join(" ") || "—"}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </DetailSection>

          <DetailSection title="Dụng cụ">
            {recipe.recipeTools.length === 0 ? (
              <p className="text-sm text-zinc-500">Chưa có dụng cụ.</p>
            ) : (
              <ul className="space-y-3">
                {recipe.recipeTools.map((tool) => (
                  <li key={tool.id} className="flex justify-between gap-4 text-sm">
                    <span className="min-w-0 break-words text-zinc-800">{tool.name}</span>
                    {tool.amount != null && (
                      <span className="shrink-0 text-zinc-500">× {formatAmount(tool.amount)}</span>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </DetailSection>
        </div>

        <div className="space-y-6">
          <DetailSection title="Cách thực hiện">
            {recipe.steps.length === 0 ? (
              <p className="text-sm text-zinc-500">Chưa có hướng dẫn thực hiện.</p>
            ) : (
              <ol className="space-y-6">
                {recipe.steps.map((step) => (
                  <li key={step.id}>
                    <h3 className="mb-2 text-sm font-semibold text-zinc-950">Bước {step.stepOrder}</h3>
                    <p className="whitespace-pre-wrap break-words text-sm leading-7 text-zinc-600">
                      {step.description}
                    </p>
                  </li>
                ))}
              </ol>
            )}
          </DetailSection>

          <DetailSection title="Ghi chú">
            {recipe.recipeNotes.length === 0 ? (
              <p className="text-sm text-zinc-500">Chưa có ghi chú.</p>
            ) : (
              <ul className="list-disc space-y-3 pl-5 text-sm leading-7 text-zinc-600">
                {recipe.recipeNotes.map((note) => (
                  <li key={note.id} className="whitespace-pre-wrap break-words">{note.content}</li>
                ))}
              </ul>
            )}
          </DetailSection>
        </div>
      </div>
    </article>
  );
}
