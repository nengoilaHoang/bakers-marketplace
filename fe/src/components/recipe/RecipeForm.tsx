import { type FormEvent, type ReactNode, useState } from 'react';

import ListPanel, { AddRowButton, EmptyRows } from '@/components/recipe/form/ListPanel';
import RemoveButton from '@/components/recipe/form/RemoveButton';
import SortableTextList, {
  type SortableTextListItem,
} from '@/components/recipe/form/SortableTextList';
import Alert from '@/components/ui/Alert';
import Button, { ButtonLink } from '@/components/ui/Button';
import Checkbox from '@/components/ui/Checkbox';
import Field from '@/components/ui/Field';
import Input, { Textarea } from '@/components/ui/Input';
import type {
  RecipeDetail,
  RecipeFormValues,
  RecipeIngredientFormValue,
  RecipeMutationPayload,
  RecipeTagFormValue,
  RecipeToolFormValue,
} from '@/types/recipe';
import {
  buildRecipeMutationPayload,
  recipeDetailToFormValues,
} from '@/utils/recipeMutation';

type RecipeFormProps = {
  initialRecipe?: RecipeDetail;
  submitLabel: string;
  cancelHref: string;
  onSubmit: (values: RecipeMutationPayload) => Promise<void>;
};

type KeyedItem = {
  readonly key: string;
};

type IngredientDraft = Omit<RecipeIngredientFormValue, 'amount'> &
  KeyedItem & {
    amount: string;
  };

type ToolDraft = Omit<RecipeToolFormValue, 'amount'> &
  KeyedItem & {
    amount: string;
  };

type TagDraft = RecipeTagFormValue & KeyedItem;

type OrderedTextDraft = SortableTextListItem & {
  id?: string;
};

const EMPTY_FORM_VALUES: RecipeFormValues = {
  title: '',
  description: null,
  portion: null,
  isPublic: false,
  coverImgId: null,
  recipeIngredients: [],
  recipeTools: [],
  steps: [],
  recipeNotes: [],
  recipeTags: [],
};

let clientKeySequence = 0;

function createClientKey(collection: string) {
  clientKeySequence += 1;
  return `${collection}:new:${Date.now()}:${clientKeySequence}`;
}

function persistedKey(collection: string, id: string) {
  return `${collection}:saved:${id}`;
}

function loadedKey(collection: string, id: string | undefined, index: number) {
  return id ? persistedKey(collection, id) : `${collection}:loaded:${index}`;
}

function formatAmountForInput(value: number | null | undefined) {
  return value == null ? '' : String(value);
}

function parseOptionalAmount(value: string) {
  if (value === '') return null;
  const amount = Number(value);
  return Number.isFinite(amount) ? amount : Number.NaN;
}

// Một nhóm danh sách trong form: tiêu đề + gợi ý + khung danh sách.
function ListSection({
  title,
  hint,
  children,
}: {
  title: string;
  hint?: string;
  children: ReactNode;
}) {
  return (
    <section className='flex flex-col gap-3'>
      <div className='flex flex-col gap-0.5'>
        <h2 className='text-lead font-medium text-ink'>{title}</h2>
        {hint && <p className='text-body text-ink-muted/60'>{hint}</p>}
      </div>
      {children}
    </section>
  );
}

export default function RecipeForm({
  initialRecipe,
  submitLabel,
  cancelHref,
  onSubmit,
}: RecipeFormProps) {
  const initialValues = initialRecipe
    ? recipeDetailToFormValues(initialRecipe)
    : EMPTY_FORM_VALUES;
  const [title, setTitle] = useState(initialValues.title);
  const [description, setDescription] = useState(initialValues.description ?? '');
  const [portion, setPortion] = useState(
    initialValues.portion == null ? '' : String(initialValues.portion),
  );
  const [isPublic, setIsPublic] = useState(initialValues.isPublic);
  const [ingredients, setIngredients] = useState<IngredientDraft[]>(() =>
    initialValues.recipeIngredients.map((ingredient, index) => ({
      ...ingredient,
      key: loadedKey('ingredient', ingredient.id, index),
      amount: formatAmountForInput(ingredient.amount),
    })),
  );
  const [tools, setTools] = useState<ToolDraft[]>(() =>
    initialValues.recipeTools.map((tool, index) => ({
      ...tool,
      key: loadedKey('tool', tool.id, index),
      amount: formatAmountForInput(tool.amount),
    })),
  );
  const [tags, setTags] = useState<TagDraft[]>(() =>
    initialValues.recipeTags.map((tag, index) => ({
      ...tag,
      key: loadedKey('tag', tag.id, index),
    })),
  );
  const [steps, setSteps] = useState<OrderedTextDraft[]>(() =>
    initialValues.steps.map((step, index) => ({
      id: step.id,
      key: loadedKey('step', step.id, index),
      text: step.description,
    })),
  );
  const [notes, setNotes] = useState<OrderedTextDraft[]>(() =>
    initialValues.recipeNotes.map((note, index) => ({
      id: note.id,
      key: loadedKey('note', note.id, index),
      text: note.content,
    })),
  );
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  function updateIngredient(key: string, changes: Partial<IngredientDraft>) {
    setIngredients((current) =>
      current.map((ingredient) =>
        ingredient.key === key ? { ...ingredient, ...changes } : ingredient,
      ),
    );
  }

  function updateTool(key: string, changes: Partial<ToolDraft>) {
    setTools((current) =>
      current.map((tool) =>
        tool.key === key ? { ...tool, ...changes } : tool,
      ),
    );
  }

  function updateTag(key: string, name: string) {
    setTags((current) =>
      current.map((tag) => (tag.key === key ? { ...tag, name } : tag)),
    );
  }

  function validateAndBuildValues(): RecipeFormValues | null {
    const parsedPortion = portion === '' ? null : Number(portion);

    if (!title.trim()) {
      setError('Vui lòng nhập tên công thức.');
      return null;
    }

    if (
      parsedPortion !== null &&
      (!Number.isInteger(parsedPortion) || parsedPortion <= 0)
    ) {
      setError('Khẩu phần phải là một số nguyên lớn hơn 0.');
      return null;
    }

    if (tags.some((tag) => !tag.name.trim())) {
      setError('Mỗi nhãn cần có tên. Hãy nhập tên hoặc xóa hàng trống.');
      return null;
    }

    const normalizedTagNames = tags.map((tag) => tag.name.trim());
    if (new Set(normalizedTagNames).size !== normalizedTagNames.length) {
      setError('Các nhãn trong công thức không được trùng nhau.');
      return null;
    }

    if (ingredients.some((ingredient) => !ingredient.name.trim())) {
      setError('Mỗi nguyên liệu cần có tên. Hãy nhập tên hoặc xóa hàng trống.');
      return null;
    }

    if (tools.some((tool) => !tool.name.trim())) {
      setError('Mỗi dụng cụ cần có tên. Hãy nhập tên hoặc xóa hàng trống.');
      return null;
    }

    const ingredientAmounts = ingredients.map((ingredient) =>
      parseOptionalAmount(ingredient.amount),
    );
    const toolAmounts = tools.map((tool) => parseOptionalAmount(tool.amount));

    if (
      ingredientAmounts.some(
        (amount) => Number.isNaN(amount) || (amount !== null && amount < 0),
      )
    ) {
      setError('Số lượng nguyên liệu phải là số lớn hơn hoặc bằng 0.');
      return null;
    }

    if (
      toolAmounts.some(
        (amount) => Number.isNaN(amount) || (amount !== null && amount < 0),
      )
    ) {
      setError('Số lượng dụng cụ phải là số lớn hơn hoặc bằng 0.');
      return null;
    }

    if (steps.some((step) => !step.text.trim())) {
      setError('Mỗi bước thực hiện cần có nội dung.');
      return null;
    }

    if (notes.some((note) => !note.text.trim())) {
      setError('Mỗi ghi chú cần có nội dung.');
      return null;
    }

    return {
      title,
      description,
      portion: parsedPortion,
      isPublic,
      coverImgId: initialValues.coverImgId ?? null,
      recipeIngredients: ingredients.map((ingredient, index) => ({
        id: ingredient.id,
        name: ingredient.name,
        amount: ingredientAmounts[index],
        unit: ingredient.unit ?? null,
        coverImgId: ingredient.coverImgId ?? null,
      })),
      recipeTools: tools.map((tool, index) => ({
        id: tool.id,
        name: tool.name,
        amount: toolAmounts[index],
        coverImgId: tool.coverImgId ?? null,
      })),
      steps: steps.map((step) => ({
        id: step.id,
        description: step.text,
      })),
      recipeNotes: notes.map((note) => ({
        id: note.id,
        content: note.text,
      })),
      recipeTags: tags.map((tag) => ({ id: tag.id, name: tag.name })),
    };
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (isSubmitting) return;

    const values = validateAndBuildValues();

    if (!values) return;

    setError(null);
    setIsSubmitting(true);

    try {
      await onSubmit(buildRecipeMutationPayload(values, initialRecipe));
    } catch (submitError) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : 'Không thể lưu công thức. Vui lòng thử lại.',
      );
      setIsSubmitting(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className='flex flex-col gap-10 overflow-hidden rounded-control bg-page pt-8 pb-12 shadow-raised'
    >
      <div className='flex flex-col gap-8 px-5 sm:px-9'>
        <Field label='Tên công thức' htmlFor='recipe-title' required>
          <Input
            id='recipe-title'
            size='lg'
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            required
            maxLength={255}
            disabled={isSubmitting}
            placeholder='Ví dụ: Bánh cookie chocolate'
          />
        </Field>
        <Field label='Giới thiệu ngắn' htmlFor='recipe-description'>
          <Textarea
            id='recipe-description'
            rows={4}
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            disabled={isSubmitting}
            placeholder='Giới thiệu đôi nét về công thức của bạn!'
          />
        </Field>
      </div>

      <div className='flex flex-col items-center gap-5 bg-surface px-5 py-7 shadow-soft'>
        <Field label='Khẩu phần' htmlFor='recipe-portion' inline>
          <div className='w-60'>
            <Input
              id='recipe-portion'
              type='number'
              min='1'
              step='1'
              tone='accent'
              size='sm'
              value={portion}
              onChange={(event) => setPortion(event.target.value)}
              disabled={isSubmitting}
              placeholder='Số người ăn'
            />
          </div>
        </Field>
        <Checkbox
          label='Công khai công thức này'
          labelClassName='text-lead text-ink'
          checked={isPublic}
          onChange={(event) => setIsPublic(event.target.checked)}
          disabled={isSubmitting}
        />
      </div>

      <div className='flex flex-col gap-10 px-5 sm:px-12'>
        <ListSection title='Nhãn' hint='Thêm các nhãn để dễ phân loại và tìm kiếm công thức'>
          <fieldset disabled={isSubmitting} className='min-w-0'>
            <legend className='sr-only'>Danh sách nhãn</legend>
            <ListPanel>
              {tags.length === 0 ? (
                <EmptyRows>Chưa có nhãn nào.</EmptyRows>
              ) : (
                <ul className='flex flex-col gap-4'>
                  {tags.map((tag, index) => (
                    <li key={tag.key} className='flex items-center gap-3'>
                      <Input
                        id={`recipe-tag-${tag.key}`}
                        aria-label={`Nhãn ${index + 1}`}
                        tone='accent'
                        size='sm'
                        value={tag.name}
                        onChange={(event) => updateTag(tag.key, event.target.value)}
                        required
                        placeholder='Ví dụ: Món chay'
                      />
                      <RemoveButton
                        label={`Xóa nhãn ${index + 1}`}
                        onClick={() => setTags((current) => current.filter((item) => item.key !== tag.key))}
                      />
                    </li>
                  ))}
                </ul>
              )}
              <AddRowButton
                label='Thêm nhãn'
                onClick={() => setTags((current) => [
                  ...current,
                  { key: createClientKey('tag'), name: '' },
                ])}
              />
            </ListPanel>
          </fieldset>
        </ListSection>

        <ListSection title='Nguyên liệu' hint='Tên, số lượng và đơn vị của từng nguyên liệu'>
          <fieldset disabled={isSubmitting} className='min-w-0'>
            <legend className='sr-only'>Danh sách nguyên liệu</legend>
            <ListPanel>
              {ingredients.length === 0 ? (
                <EmptyRows>Chưa có nguyên liệu nào.</EmptyRows>
              ) : (
                <ul className='flex flex-col gap-4'>
                  {ingredients.map((ingredient, index) => (
                    <li
                      key={ingredient.key}
                      className='grid grid-cols-[minmax(0,1fr)_minmax(0,1fr)_auto] items-center gap-3 sm:grid-cols-[minmax(0,1fr)_7rem_8rem_auto]'
                    >
                      <Input
                        id={`ingredient-name-${ingredient.key}`}
                        aria-label={`Tên nguyên liệu ${index + 1}`}
                        tone='accent'
                        size='sm'
                        value={ingredient.name}
                        onChange={(event) => updateIngredient(ingredient.key, { name: event.target.value })}
                        required
                        placeholder='Tên nguyên liệu'
                        className='max-sm:col-span-3'
                      />
                      <Input
                        id={`ingredient-amount-${ingredient.key}`}
                        aria-label={`Số lượng nguyên liệu ${index + 1}`}
                        type='number'
                        min='0'
                        step='0.001'
                        tone='accent'
                        size='sm'
                        value={ingredient.amount}
                        onChange={(event) => updateIngredient(ingredient.key, { amount: event.target.value })}
                        placeholder='Số lượng'
                      />
                      <Input
                        id={`ingredient-unit-${ingredient.key}`}
                        aria-label={`Đơn vị nguyên liệu ${index + 1}`}
                        tone='accent'
                        size='sm'
                        value={ingredient.unit ?? ''}
                        onChange={(event) => updateIngredient(ingredient.key, { unit: event.target.value })}
                        placeholder='g, ml…'
                      />
                      <RemoveButton
                        label={`Xóa nguyên liệu ${index + 1}`}
                        onClick={() => setIngredients((current) => current.filter((item) => item.key !== ingredient.key))}
                      />
                    </li>
                  ))}
                </ul>
              )}
              <AddRowButton
                label='Thêm nguyên liệu'
                onClick={() => setIngredients((current) => [
                  ...current,
                  {
                    key: createClientKey('ingredient'),
                    name: '',
                    amount: '',
                    unit: null,
                    coverImgId: null,
                  },
                ])}
              />
            </ListPanel>
          </fieldset>
        </ListSection>

        <ListSection title='Dụng cụ' hint='Các dụng cụ và số lượng cần chuẩn bị'>
          <fieldset disabled={isSubmitting} className='min-w-0'>
            <legend className='sr-only'>Danh sách dụng cụ</legend>
            <ListPanel>
              {tools.length === 0 ? (
                <EmptyRows>Chưa có dụng cụ nào.</EmptyRows>
              ) : (
                <ul className='flex flex-col gap-4'>
                  {tools.map((tool, index) => (
                    <li
                      key={tool.key}
                      className='grid grid-cols-[minmax(0,1fr)_7rem_auto] items-center gap-3'
                    >
                      <Input
                        id={`tool-name-${tool.key}`}
                        aria-label={`Tên dụng cụ ${index + 1}`}
                        tone='accent'
                        size='sm'
                        value={tool.name}
                        onChange={(event) => updateTool(tool.key, { name: event.target.value })}
                        required
                        placeholder='Tên dụng cụ'
                      />
                      <Input
                        id={`tool-amount-${tool.key}`}
                        aria-label={`Số lượng dụng cụ ${index + 1}`}
                        type='number'
                        min='0'
                        step='0.001'
                        tone='accent'
                        size='sm'
                        value={tool.amount}
                        onChange={(event) => updateTool(tool.key, { amount: event.target.value })}
                        placeholder='Số lượng'
                      />
                      <RemoveButton
                        label={`Xóa dụng cụ ${index + 1}`}
                        onClick={() => setTools((current) => current.filter((item) => item.key !== tool.key))}
                      />
                    </li>
                  ))}
                </ul>
              )}
              <AddRowButton
                label='Thêm dụng cụ'
                onClick={() => setTools((current) => [
                  ...current,
                  {
                    key: createClientKey('tool'),
                    name: '',
                    amount: '',
                    coverImgId: null,
                  },
                ])}
              />
            </ListPanel>
          </fieldset>
        </ListSection>

        <hr className='h-1.5 rounded-full border-0 bg-line' />

        <ListSection title='Các bước' hint='Hướng dẫn từng bước thực hiện'>
          <SortableTextList
            label='Thứ tự các bước'
            itemLabel='Bước'
            items={steps}
            createItem={() => ({
              key: createClientKey('step'),
              text: '',
            })}
            onChange={setSteps}
            addLabel='Thêm bước'
            emptyMessage='Chưa có bước thực hiện nào.'
            placeholder='Hướng dẫn rõ ràng cho người đọc'
            required
            disabled={isSubmitting}
          />
        </ListSection>

        <ListSection title='Ghi chú' hint='Mẹo nhỏ giúp người đọc nấu dễ hơn'>
          <SortableTextList
            label='Thứ tự ghi chú'
            itemLabel='Ghi chú'
            items={notes}
            createItem={() => ({
              key: createClientKey('note'),
              text: '',
            })}
            onChange={setNotes}
            addLabel='Thêm ghi chú'
            emptyMessage='Chưa có ghi chú nào.'
            placeholder='Ví dụ: Có thể thay bơ bằng dầu dừa'
            rows={2}
            required
            disabled={isSubmitting}
          />
        </ListSection>

        {error && <Alert tone='danger'>{error}</Alert>}

        <div className='flex flex-wrap gap-4'>
          <Button type='submit' disabled={isSubmitting} className='min-w-38'>
            {isSubmitting ? 'Đang lưu...' : submitLabel}
          </Button>
          <ButtonLink
            href={cancelHref}
            variant='outline'
            aria-disabled={isSubmitting}
            tabIndex={isSubmitting ? -1 : undefined}
            className={isSubmitting ? 'pointer-events-none opacity-50' : undefined}
          >
            Hủy
          </ButtonLink>
        </div>
      </div>
    </form>
  );
}
