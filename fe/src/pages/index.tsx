import Head from "next/head";
import Link from "next/link";
import type { CSSProperties } from "react";

import HomeRecipeCard from "@/components/home/HomeRecipeCard";
import HomeRecipeCardSkeleton from "@/components/home/HomeRecipeCardSkeleton";
import RecipesLayout from "@/components/layout/RecipesLayout";
import { ErrorState } from "@/components/ui/ErrorState";
import { useLatestRecipes } from "@/hooks/useLatestRecipes";

const page: CSSProperties = {
  padding: "24px 32px",
  fontFamily: "ui-sans-serif, system-ui, -apple-system, sans-serif",
  fontSize: 14,
  lineHeight: 1.6,
  maxWidth: 620,
  margin: "0 auto",
  background: "#fff",
  color: "#111827",
  minHeight: "100vh",
  colorScheme: "light",
};

const h1: CSSProperties = {
  fontSize: 22,
  fontWeight: 600,
  margin: "12px 0 4px",
};

const h2: CSSProperties = {
  fontSize: 16,
  fontWeight: 600,
  margin: "28px 0 8px",
  paddingBottom: 6,
  borderBottom: "1px solid #e5e7eb",
};

const muted: CSSProperties = { color: "#6b7280", fontSize: 13 };

const card: CSSProperties = {
  display: "block",
  border: "1px solid #e5e7eb",
  borderRadius: 8,
  padding: "14px 16px",
  marginBottom: 12,
  color: "#2563eb",
  textDecoration: "none",
};

const topics = [
  "Bánh mì",
  "Bánh kem",
  "Cookie",
  "Chocolate",
  "Healthy",
  "Dễ làm",
];
const links = [
  {
    group: "Products",
    items: [
      { href: "/products", label: "Danh sách sản phẩm" },
      { href: "/products/new", label: "Tạo sản phẩm" },
      { href: "/products/search", label: "Tìm kiếm sản phẩm" },
    ],
  },
  {
    group: "Collections",
    items: [
      { href: "/collections", label: "Danh sách bộ sưu tập" },
      { href: "/collections/new", label: "Tạo bộ sưu tập" },
    ],
  },
];

export default function Home() {
  const { recipes, isLoading, error, retry } = useLatestRecipes(12);

  return (
    <>
      <Head>
        <title>Recipe Book | Cộng đồng làm bánh</title>
        <meta
          name="description"
          content="Tìm công thức, học hỏi từ cộng đồng và chuẩn bị nguyên liệu cho món bánh tiếp theo."
        />
      </Head>

      {links.map((section) => (
        <div key={section.group}>
          <h2 style={h2}>{section.group}</h2>

          {section.items.map((item) => (
            <Link key={item.href} href={item.href} style={card}>
              {item.label}
              <span style={{ ...muted, marginLeft: 8 }}>{item.href}</span>
            </Link>
          ))}
        </div>
      ))}

      <RecipesLayout>
        <section className="overflow-hidden rounded-3xl border border-zinc-200 bg-white px-6 py-14 sm:px-10 sm:py-20 lg:px-16">
          <p className="text-sm font-medium uppercase tracking-[0.18em] text-zinc-500">
            Recipe Book
          </p>
          <h1 className="mt-4 max-w-3xl text-4xl font-semibold tracking-tight text-zinc-950 sm:text-5xl">
            Khám phá thế giới làm bánh
          </h1>
          <p className="mt-5 max-w-2xl text-base leading-7 text-zinc-600 sm:text-lg">
            Tìm công thức, học hỏi từ cộng đồng và chuẩn bị nguyên liệu cho món
            bánh tiếp theo.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link
              href="/recipes"
              className="inline-flex min-h-11 items-center justify-center rounded-full bg-zinc-950 px-5 text-sm font-medium text-white transition hover:bg-zinc-700 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-zinc-950"
            >
              Khám phá công thức
            </Link>
            <Link
              href="/recipes/mine/new"
              className="inline-flex min-h-11 items-center justify-center rounded-full border border-zinc-300 bg-white px-5 text-sm font-medium text-zinc-800 transition hover:border-zinc-500 hover:bg-zinc-100 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-zinc-950"
            >
              Đăng công thức
            </Link>
          </div>
        </section>

        <section
          id="latest-recipes"
          className="mt-16 scroll-mt-8"
          aria-labelledby="latest-recipes-title"
        >
          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
            <div>
              <p className="text-sm font-medium uppercase tracking-[0.18em] text-zinc-500">
                Từ cộng đồng
              </p>
              <h2
                id="latest-recipes-title"
                className="mt-2 text-3xl font-semibold tracking-tight text-zinc-950"
              >
                Công thức mới nhất
              </h2>
            </div>
            <Link
              href="/recipes"
              className="w-fit text-sm font-medium text-zinc-700 underline decoration-zinc-300 underline-offset-4 transition hover:text-zinc-950 hover:decoration-zinc-950 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-zinc-950"
            >
              Xem thêm
            </Link>
          </div>

          <div className="mt-8">
            {isLoading ? (
              <div
                className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
                aria-busy="true"
              >
                {Array.from({ length: 8 }, (_, index) => (
                  <HomeRecipeCardSkeleton key={index} />
                ))}
              </div>
            ) : error ? (
              <ErrorState
                title="Không thể tải công thức mới nhất"
                message={error}
                onRetry={retry}
              />
            ) : recipes.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-zinc-300 bg-white px-6 py-12 text-center text-sm text-zinc-600">
                Chưa có công thức nào để hiển thị.
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {recipes.map((recipe) => (
                  <HomeRecipeCard key={recipe.id} recipe={recipe} />
                ))}
              </div>
            )}
          </div>

          {!isLoading && !error && recipes.length > 0 && (
            <div className="mt-8 text-center">
              <Link
                href="/recipes"
                className="inline-flex min-h-11 items-center justify-center rounded-full border border-zinc-300 bg-white px-5 text-sm font-medium text-zinc-800 transition hover:border-zinc-500 hover:bg-zinc-100 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-zinc-950"
              >
                Xem thêm
              </Link>
            </div>
          )}
        </section>

        <section className="mt-16" aria-labelledby="topics-title">
          <p className="text-sm font-medium uppercase tracking-[0.18em] text-zinc-500">
            Bắt đầu từ sở thích
          </p>
          <h2
            id="topics-title"
            className="mt-2 text-3xl font-semibold tracking-tight text-zinc-950"
          >
            Khám phá theo chủ đề
          </h2>
          <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
            {topics.map((topic) => (
              <div
                key={topic}
                className="rounded-2xl border border-zinc-200 bg-white px-4 py-6 text-center text-sm font-medium text-zinc-800"
              >
                {topic}
              </div>
            ))}
          </div>
        </section>

        <section
          id="share-recipe"
          className="mt-16 rounded-3xl bg-zinc-950 px-6 py-14 text-white sm:px-10 sm:py-16 lg:px-16"
        >
          <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">
            Chia sẻ công thức của bạn
          </h2>
          <p className="mt-4 max-w-2xl leading-7 text-zinc-300">
            Đăng công thức và cùng xây dựng cộng đồng làm bánh.
          </p>
          <Link
            href="/recipes/mine/new"
            className="mt-8 inline-flex min-h-11 items-center justify-center rounded-full bg-white px-5 text-sm font-medium text-zinc-950 transition hover:bg-zinc-200 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white"
          >
            Đăng công thức
          </Link>
        </section>
      </RecipesLayout>
    </>
  );
}
