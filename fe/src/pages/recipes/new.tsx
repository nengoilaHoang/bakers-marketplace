import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";

import AppLayout from "@/components/layout/AppLayout";
import RecipeForm from "@/components/recipe/RecipeForm";
import { createRecipe } from "@/services/recipes";

export default function CreateRecipePage() {
  const router = useRouter();

  return (
    <>
      <Head>
        <title>Tạo công thức | Recipe Book</title>
      </Head>

      <Link
        href="/me?tab=recipes"
        className="mb-6 inline-flex items-center gap-2 rounded text-sm font-medium text-zinc-600 hover:text-zinc-950 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-zinc-950"
      >
        <span aria-hidden="true">←</span>
        Quay lại công thức của tôi
      </Link>
      <header className="mb-8">
        <h1 className="text-3xl font-semibold tracking-tight text-zinc-950 sm:text-4xl">
          Tạo công thức mới
        </h1>
        <p className="mt-3 text-base leading-7 text-zinc-600">
          Điền nguyên liệu, dụng cụ, các bước và ghi chú cho công thức của bạn.
        </p>
      </header>
      <RecipeForm
        submitLabel="Tạo công thức"
        cancelHref="/me?tab=recipes"
        onSubmit={async (values) => {
          const recipe = await createRecipe(values);
          await router.replace(`/recipes/${encodeURIComponent(recipe.id)}`);
        }}
      />
    </>
  );
}

CreateRecipePage.getLayout = function getLayout(page: React.ReactElement) {
  return <AppLayout>{page}</AppLayout>;
};
