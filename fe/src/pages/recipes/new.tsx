import { useRouter } from 'next/router';

import AppLayout from '@/components/layout/AppLayout';
import RecipeForm from '@/components/recipe/RecipeForm';
import Container from '@/components/ui/Container';
import PageTitle from '@/components/ui/PageTitle';
import { createRecipe } from '@/services/recipes';

export default function CreateRecipePage() {
  const router = useRouter();

  return (
    <>
      <PageTitle title='Thêm công thức' />

      <Container size='narrow' className='pt-14 pb-20'>
        <h1 className='font-heading text-h2 font-bold text-ink [font-variant-caps:small-caps]'>
          Thêm công thức của bạn
        </h1>
        <p className='mt-2 text-body-sm font-light text-ink-muted'>
          Điền nguyên liệu, dụng cụ, các bước và ghi chú cho công thức của bạn.
        </p>

        <div className='mt-5'>
          <RecipeForm
            submitLabel='Tạo công thức'
            cancelHref='/me?tab=recipes'
            onSubmit={async (values) => {
              const recipe = await createRecipe(values);
              await router.replace(`/recipes/${encodeURIComponent(recipe.id)}`);
            }}
          />
        </div>
      </Container>
    </>
  );
}

CreateRecipePage.getLayout = function getLayout(page: React.ReactElement) {
  return <AppLayout>{page}</AppLayout>;
};
