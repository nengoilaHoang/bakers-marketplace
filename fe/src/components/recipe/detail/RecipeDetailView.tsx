import type { ReactNode } from 'react';

import Badge from '@/components/ui/Badge';
import Callout from '@/components/ui/Callout';
import Chip from '@/components/ui/Chip';
import Icon, { type IconName } from '@/components/ui/Icon';
import ImagePlaceholder from '@/components/ui/ImagePlaceholder';
import type { RecipeDetail } from '@/types/recipe';
import { formatDate } from '@/utils/format';

import ChecklistCard from './ChecklistCard';

function formatAmount(amount: number | string | null | undefined) {
  if (amount == null || amount === '') return '';
  const value = Number(amount);
  return Number.isFinite(value) ? value.toLocaleString('vi-VN') : String(amount);
}

type Fact = { label: string; value: string; icon: IconName };

// Hộp thông số: chỉ những gì công thức thật sự có (khẩu phần, số nguyên liệu, dụng cụ, bước).
function RecipeFacts({ recipe }: { recipe: RecipeDetail }) {
  const facts: Fact[] = [
    { label: 'Khẩu phần', value: recipe.portion != null ? `${recipe.portion} người` : '—', icon: 'users' },
    { label: 'Nguyên liệu', value: String(recipe.recipeIngredients.length), icon: 'wheat' },
    { label: 'Dụng cụ', value: String(recipe.recipeTools.length), icon: 'utensils' },
    { label: 'Các bước', value: String(recipe.steps.length), icon: 'cooking-pot' },
  ];

  return (
    <dl className='mx-auto grid w-full max-w-170 grid-cols-2 gap-y-2 rounded-panel bg-highlight px-4 py-5 sm:grid-cols-4 sm:divide-x-2 sm:divide-line'>
      {facts.map((fact) => (
        <div key={fact.label} className='flex flex-col items-center gap-1 px-2 py-2 text-center'>
          <Icon name={fact.icon} strokeWidth={1.5} className='size-10 text-primary' />
          <dt className='text-lead font-medium text-ink'>{fact.label}</dt>
          <dd className='text-lead text-ink-subtle'>{fact.value}</dd>
        </div>
      ))}
    </dl>
  );
}

type RecipeDetailViewProps = Readonly<{
  recipe: RecipeDetail;
  // Nút thao tác của chủ công thức (Sửa / Xoá), đặt dưới ảnh.
  actions?: ReactNode;
}>;

export default function RecipeDetailView({ recipe, actions }: RecipeDetailViewProps) {
  const postedAt = formatDate(recipe.createdAt);
  const ingredients = recipe.recipeIngredients.map((ingredient) => {
    const quantity = [formatAmount(ingredient.amount), ingredient.unit].filter(Boolean).join(' ');
    return quantity ? `${quantity} ${ingredient.name}` : ingredient.name;
  });
  const tools = recipe.recipeTools.map((tool) =>
    tool.amount != null ? `${formatAmount(tool.amount)} ${tool.name}` : tool.name,
  );

  return (
    <article>
      <h1 className='mt-4 text-h1 font-semibold wrap-break-word text-ink italic'>{recipe.title}</h1>
      <p className='mt-1 flex flex-wrap items-center gap-x-2.5 gap-y-1 text-caption font-light text-ink'>
        {postedAt && <time dateTime={recipe.createdAt}>Đăng ngày {postedAt}</time>}
        {recipe.isPublic === false && <Badge tone='highlight'>Riêng tư</Badge>}
      </p>

      <ImagePlaceholder
        iconSize='lg'
        label={`Ảnh món ${recipe.title}`}
        className='mt-8 aspect-1420/730 w-full rounded-media'
      />
      {actions && <div className='mt-7 flex flex-wrap items-center justify-end gap-3'>{actions}</div>}

      <section className='mt-12'>
        <h2 className='text-h2 font-semibold text-ink'>Tổng quan</h2>
        <p className='mt-4 text-body wrap-break-word whitespace-pre-wrap text-ink-muted'>
          {recipe.description?.trim() || 'Công thức chưa có mô tả.'}
        </p>
      </section>

      {recipe.recipeTags.length > 0 && (
        <section className='mt-10'>
          <h2 className='text-h3 font-medium text-ink'>Nhãn</h2>
          <ul className='mt-4 flex flex-wrap gap-3.5'>
            {recipe.recipeTags.map((tag) => (
              <li key={tag.id}>
                <Chip href={{ pathname: '/recipes/search', query: { q: tag.name } }}>{tag.name}</Chip>
              </li>
            ))}
          </ul>
        </section>
      )}

      <section
        aria-labelledby='recipe-guide-title'
        className='mt-12 flex flex-col gap-8 border-3 border-ink px-4 py-10 sm:px-8'
      >
        <h2 id='recipe-guide-title' className='text-center text-h3 text-ink uppercase'>
          {recipe.title}
        </h2>
        <RecipeFacts recipe={recipe} />
        <ChecklistCard title='Nguyên liệu' items={ingredients} emptyText='Chưa có nguyên liệu.' />
        <ChecklistCard title='Dụng cụ' items={tools} emptyText='Chưa có dụng cụ.' />

        <div>
          <h3 className='text-h3 font-medium text-ink'>Cách thực hiện</h3>
          {recipe.steps.length === 0 ? (
            <p className='mt-4 text-body-sm font-light text-ink-muted'>Chưa có hướng dẫn thực hiện.</p>
          ) : (
            <ol className='mt-4 divide-y divide-line border-b border-line'>
              {recipe.steps.map((step) => (
                <li key={step.id} className='flex gap-4 py-3'>
                  <span className='shrink-0 text-h5 font-medium text-ink'>Bước {step.stepOrder}.</span>
                  <p className='text-body wrap-break-word whitespace-pre-wrap text-ink-muted'>
                    {step.description}
                  </p>
                </li>
              ))}
            </ol>
          )}
        </div>
      </section>

      {recipe.recipeNotes.length > 0 && (
        <Callout title='Ghi chú:' className='mx-auto mt-16 max-w-214'>
          <ul className='flex flex-col gap-3'>
            {recipe.recipeNotes.map((note) => (
              <li key={note.id} className='wrap-break-word whitespace-pre-wrap'>
                {note.content}
              </li>
            ))}
          </ul>
        </Callout>
      )}
    </article>
  );
}
