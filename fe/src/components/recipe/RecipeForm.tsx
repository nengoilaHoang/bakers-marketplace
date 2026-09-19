import Link from "next/link";
import { type FormEvent, type ReactNode, useState } from "react";

import SortableTextList, {
  type SortableTextListItem,
} from "@/components/recipe/form/SortableTextList";
import type {
  RecipeDetail,
  RecipeFormValues,
  RecipeIngredientFormValue,
  RecipeMutationPayload,
  RecipeTagFormValue,
  RecipeToolFormValue,
} from "@/types/recipe";
import {
  buildRecipeMutationPayload,
  recipeDetailToFormValues,
} from "@/utils/recipeMutation";

type RecipeFormProps = {
  initialRecipe?: RecipeDetail;
  submitLabel: string;
  cancelHref: string;
  onSubmit: (values: RecipeMutationPayload) => Promise<void>;
};

type KeyedItem = {
  readonly key: string;
};

type IngredientDraft = Omit<RecipeIngredientFormValue, "amount"> &
  KeyedItem & {
    amount: string;
  };

type ToolDraft = Omit<RecipeToolFormValue, "amount"> &
  KeyedItem & {
    amount: string;
  };

type TagDraft = RecipeTagFormValue & KeyedItem;

type OrderedTextDraft = SortableTextListItem & {
  id?: string;
};

const EMPTY_FORM_VALUES: RecipeFormValues = {
  title: "",
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
  return value == null ? "" : String(value);
}

function parseOptionalAmount(value: string) {
  if (value === "") return null;
  const amount = Number(value);
  return Number.isFinite(amount) ? amount : Number.NaN;
}

function FormSection({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: ReactNode;
}) {
  return (
    <section className="border-t border-zinc-200 pt-8 first:border-t-0 first:pt-0">
      <div className="mb-5">
        <h2 className="text-lg font-semibold text-zinc-950">{title}</h2>
        {description && (
          <p className="mt-1 text-sm leading-6 text-zinc-500">{description}</p>
        )}
      </div>
      {children}
    </section>
  );
}

function AddButton({ label, onClick, disabled }: {
  label: string;
  onClick: () => void;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="mt-4 inline-flex min-h-10 items-center justify-center gap-2 rounded-full border border-zinc-300 bg-white px-4 text-sm font-medium text-zinc-800 transition hover:border-zinc-500 hover:bg-zinc-100 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-zinc-950 disabled:cursor-not-allowed disabled:opacity-50"
    >
      <span aria-hidden="true" className="text-lg leading-none">+</span>
      {label}
    </button>
  );
}

function RemoveButton({ label, onClick, disabled }: {
  label: string;
  onClick: () => void;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      className="inline-flex size-10 shrink-0 items-center justify-center rounded-lg text-zinc-500 transition hover:bg-red-50 hover:text-red-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-zinc-950 disabled:cursor-not-allowed disabled:opacity-40"
    >
      <svg
        aria-hidden="true"
        viewBox="0 0 20 20"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.75"
        className="size-4"
      >
        <path d="M4 5.5h12M8 3.5h4M6.5 5.5l.65 11h5.7l.65-11M8.5 8.5v5M11.5 8.5v5" />
      </svg>
    </button>
  );
}

function EmptyCollection({ children }: { children: ReactNode }) {
  return (
    <p className="rounded-xl border border-dashed border-zinc-300 bg-zinc-50 px-4 py-5 text-center text-sm text-zinc-500">
      {children}
    </p>
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
  const [description, setDescription] = useState(initialValues.description ?? "");
  const [portion, setPortion] = useState(
    initialValues.portion == null ? "" : String(initialValues.portion),
  );
  const [isPublic, setIsPublic] = useState(initialValues.isPublic);
  const [ingredients, setIngredients] = useState<IngredientDraft[]>(() =>
    initialValues.recipeIngredients.map((ingredient, index) => ({
      ...ingredient,
      key: loadedKey("ingredient", ingredient.id, index),
      amount: formatAmountForInput(ingredient.amount),
    })),
  );
  const [tools, setTools] = useState<ToolDraft[]>(() =>
    initialValues.recipeTools.map((tool, index) => ({
      ...tool,
      key: loadedKey("tool", tool.id, index),
      amount: formatAmountForInput(tool.amount),
    })),
  );
  const [tags, setTags] = useState<TagDraft[]>(() =>
    initialValues.recipeTags.map((tag, index) => ({
      ...tag,
      key: loadedKey("tag", tag.id, index),
    })),
  );
  const [steps, setSteps] = useState<OrderedTextDraft[]>(() =>
    initialValues.steps.map((step, index) => ({
      id: step.id,
      key: loadedKey("step", step.id, index),
      text: step.description,
    })),
  );
  const [notes, setNotes] = useState<OrderedTextDraft[]>(() =>
    initialValues.recipeNotes.map((note, index) => ({
      id: note.id,
      key: loadedKey("note", note.id, index),
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
    const parsedPortion = portion === "" ? null : Number(portion);

    if (!title.trim()) {
      setError("Vui lòng nhập tên công thức.");
      return null;
    }

    if (
      parsedPortion !== null &&
      (!Number.isInteger(parsedPortion) || parsedPortion <= 0)
    ) {
      setError("Khẩu phần phải là một số nguyên lớn hơn 0.");
      return null;
    }

    if (tags.some((tag) => !tag.name.trim())) {
      setError("Mỗi nhãn cần có tên. Hãy nhập tên hoặc xóa hàng trống.");
      return null;
    }

    const normalizedTagNames = tags.map((tag) => tag.name.trim());
    if (new Set(normalizedTagNames).size !== normalizedTagNames.length) {
      setError("Các nhãn trong công thức không được trùng nhau.");
      return null;
    }

    if (ingredients.some((ingredient) => !ingredient.name.trim())) {
      setError("Mỗi nguyên liệu cần có tên. Hãy nhập tên hoặc xóa hàng trống.");
      return null;
    }

    if (tools.some((tool) => !tool.name.trim())) {
      setError("Mỗi dụng cụ cần có tên. Hãy nhập tên hoặc xóa hàng trống.");
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
      setError("Số lượng nguyên liệu phải là số lớn hơn hoặc bằng 0.");
      return null;
    }

    if (
      toolAmounts.some(
        (amount) => Number.isNaN(amount) || (amount !== null && amount < 0),
      )
    ) {
      setError("Số lượng dụng cụ phải là số lớn hơn hoặc bằng 0.");
      return null;
    }

    if (steps.some((step) => !step.text.trim())) {
      setError("Mỗi bước thực hiện cần có nội dung.");
      return null;
    }

    if (notes.some((note) => !note.text.trim())) {
      setError("Mỗi ghi chú cần có nội dung.");
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
          : "Không thể lưu công thức. Vui lòng thử lại.",
      );
      setIsSubmitting(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-2xl border border-zinc-200 bg-white p-6 sm:p-8"
    >
      <div className="space-y-8">
        <FormSection
          title="Thông tin cơ bản"
          description="Tên, mô tả và khẩu phần của công thức."
        >
          <div className="space-y-6">
            <div>
              <label htmlFor="recipe-title" className="block text-sm font-medium text-zinc-800">
                Tên công thức <span className="text-red-600">*</span>
              </label>
              <input
                id="recipe-title"
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                required
                maxLength={255}
                disabled={isSubmitting}
                className="mt-2 block w-full rounded-xl border border-zinc-300 bg-white px-3 py-2.5 text-zinc-950 outline-none transition placeholder:text-zinc-400 focus:border-zinc-950 focus:ring-2 focus:ring-zinc-950/10 disabled:cursor-not-allowed disabled:bg-zinc-100"
                placeholder="Ví dụ: Bánh cookie chocolate"
              />
            </div>

            <div>
              <label htmlFor="recipe-description" className="block text-sm font-medium text-zinc-800">
                Mô tả
              </label>
              <textarea
                id="recipe-description"
                value={description}
                onChange={(event) => setDescription(event.target.value)}
                rows={5}
                disabled={isSubmitting}
                className="mt-2 block w-full resize-y rounded-xl border border-zinc-300 bg-white px-3 py-2.5 text-zinc-950 outline-none transition placeholder:text-zinc-400 focus:border-zinc-950 focus:ring-2 focus:ring-zinc-950/10 disabled:cursor-not-allowed disabled:bg-zinc-100"
                placeholder="Mô tả ngắn về công thức của bạn"
              />
            </div>

            <div className="max-w-xs">
              <label htmlFor="recipe-portion" className="block text-sm font-medium text-zinc-800">
                Khẩu phần
              </label>
              <input
                id="recipe-portion"
                type="number"
                min="1"
                step="1"
                value={portion}
                onChange={(event) => setPortion(event.target.value)}
                disabled={isSubmitting}
                className="mt-2 block w-full rounded-xl border border-zinc-300 bg-white px-3 py-2.5 text-zinc-950 outline-none transition placeholder:text-zinc-400 focus:border-zinc-950 focus:ring-2 focus:ring-zinc-950/10 disabled:cursor-not-allowed disabled:bg-zinc-100"
                placeholder="Ví dụ: 4"
              />
            </div>

            <label className="flex w-fit cursor-pointer items-center gap-3 text-sm text-zinc-700">
              <input
                type="checkbox"
                checked={isPublic}
                onChange={(event) => setIsPublic(event.target.checked)}
                disabled={isSubmitting}
                className="size-4 rounded border-zinc-300 text-zinc-950 focus:ring-zinc-950 disabled:cursor-not-allowed"
              />
              Công khai công thức này
            </label>
          </div>
        </FormSection>

        <FormSection
          title="Nhãn"
          description="Thêm các nhãn để dễ phân loại và tìm kiếm công thức."
        >
          <fieldset disabled={isSubmitting}>
            <legend className="sr-only">Danh sách nhãn</legend>
            {tags.length === 0 ? (
              <EmptyCollection>Chưa có nhãn nào.</EmptyCollection>
            ) : (
              <ul className="space-y-3">
                {tags.map((tag, index) => (
                  <li key={tag.key} className="flex items-center gap-2 rounded-xl border border-zinc-200 p-3">
                    <label htmlFor={`recipe-tag-${tag.key}`} className="sr-only">
                      Nhãn {index + 1}
                    </label>
                    <input
                      id={`recipe-tag-${tag.key}`}
                      value={tag.name}
                      onChange={(event) => updateTag(tag.key, event.target.value)}
                      required
                      className="min-w-0 flex-1 rounded-lg border border-zinc-300 px-3 py-2 text-sm text-zinc-950 outline-none transition placeholder:text-zinc-400 focus:border-zinc-950 focus:ring-2 focus:ring-zinc-950/10 disabled:cursor-not-allowed disabled:bg-zinc-100"
                      placeholder="Ví dụ: Món chay"
                    />
                    <RemoveButton
                      label={`Xóa nhãn ${index + 1}`}
                      onClick={() => setTags((current) => current.filter((item) => item.key !== tag.key))}
                    />
                  </li>
                ))}
              </ul>
            )}
            <AddButton
              label="Thêm nhãn"
              onClick={() => setTags((current) => [
                ...current,
                { key: createClientKey("tag"), name: "" },
              ])}
            />
          </fieldset>
        </FormSection>

        <FormSection
          title="Nguyên liệu"
          description="Khai báo tên, số lượng và đơn vị cho từng nguyên liệu."
        >
          <fieldset disabled={isSubmitting}>
            <legend className="sr-only">Danh sách nguyên liệu</legend>
            {ingredients.length === 0 ? (
              <EmptyCollection>Chưa có nguyên liệu nào.</EmptyCollection>
            ) : (
              <ul className="space-y-3">
                {ingredients.map((ingredient, index) => (
                  <li
                    key={ingredient.key}
                    className="grid gap-3 rounded-xl border border-zinc-200 p-3 sm:grid-cols-[minmax(0,1fr)_8rem_10rem_auto] sm:items-end"
                  >
                    <div>
                      <label htmlFor={`ingredient-name-${ingredient.key}`} className="block text-xs font-medium text-zinc-600">
                        Tên nguyên liệu {index + 1}
                      </label>
                      <input
                        id={`ingredient-name-${ingredient.key}`}
                        value={ingredient.name}
                        onChange={(event) => updateIngredient(ingredient.key, { name: event.target.value })}
                        required
                        className="mt-1.5 block w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm text-zinc-950 outline-none transition placeholder:text-zinc-400 focus:border-zinc-950 focus:ring-2 focus:ring-zinc-950/10 disabled:cursor-not-allowed disabled:bg-zinc-100"
                        placeholder="Bột mì"
                      />
                    </div>
                    <div>
                      <label htmlFor={`ingredient-amount-${ingredient.key}`} className="block text-xs font-medium text-zinc-600">
                        Số lượng
                      </label>
                      <input
                        id={`ingredient-amount-${ingredient.key}`}
                        type="number"
                        min="0"
                        step="0.001"
                        value={ingredient.amount}
                        onChange={(event) => updateIngredient(ingredient.key, { amount: event.target.value })}
                        className="mt-1.5 block w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm text-zinc-950 outline-none transition placeholder:text-zinc-400 focus:border-zinc-950 focus:ring-2 focus:ring-zinc-950/10 disabled:cursor-not-allowed disabled:bg-zinc-100"
                        placeholder="100"
                      />
                    </div>
                    <div>
                      <label htmlFor={`ingredient-unit-${ingredient.key}`} className="block text-xs font-medium text-zinc-600">
                        Đơn vị
                      </label>
                      <input
                        id={`ingredient-unit-${ingredient.key}`}
                        value={ingredient.unit ?? ""}
                        onChange={(event) => updateIngredient(ingredient.key, { unit: event.target.value })}
                        className="mt-1.5 block w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm text-zinc-950 outline-none transition placeholder:text-zinc-400 focus:border-zinc-950 focus:ring-2 focus:ring-zinc-950/10 disabled:cursor-not-allowed disabled:bg-zinc-100"
                        placeholder="g, ml, muỗng..."
                      />
                    </div>
                    <RemoveButton
                      label={`Xóa nguyên liệu ${index + 1}`}
                      onClick={() => setIngredients((current) => current.filter((item) => item.key !== ingredient.key))}
                    />
                  </li>
                ))}
              </ul>
            )}
            <AddButton
              label="Thêm nguyên liệu"
              onClick={() => setIngredients((current) => [
                ...current,
                {
                  key: createClientKey("ingredient"),
                  name: "",
                  amount: "",
                  unit: null,
                  coverImgId: null,
                },
              ])}
            />
          </fieldset>
        </FormSection>

        <FormSection
          title="Dụng cụ"
          description="Liệt kê các dụng cụ và số lượng cần chuẩn bị."
        >
          <fieldset disabled={isSubmitting}>
            <legend className="sr-only">Danh sách dụng cụ</legend>
            {tools.length === 0 ? (
              <EmptyCollection>Chưa có dụng cụ nào.</EmptyCollection>
            ) : (
              <ul className="space-y-3">
                {tools.map((tool, index) => (
                  <li
                    key={tool.key}
                    className="grid gap-3 rounded-xl border border-zinc-200 p-3 sm:grid-cols-[minmax(0,1fr)_8rem_auto] sm:items-end"
                  >
                    <div>
                      <label htmlFor={`tool-name-${tool.key}`} className="block text-xs font-medium text-zinc-600">
                        Tên dụng cụ {index + 1}
                      </label>
                      <input
                        id={`tool-name-${tool.key}`}
                        value={tool.name}
                        onChange={(event) => updateTool(tool.key, { name: event.target.value })}
                        required
                        className="mt-1.5 block w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm text-zinc-950 outline-none transition placeholder:text-zinc-400 focus:border-zinc-950 focus:ring-2 focus:ring-zinc-950/10 disabled:cursor-not-allowed disabled:bg-zinc-100"
                        placeholder="Khuôn bánh"
                      />
                    </div>
                    <div>
                      <label htmlFor={`tool-amount-${tool.key}`} className="block text-xs font-medium text-zinc-600">
                        Số lượng
                      </label>
                      <input
                        id={`tool-amount-${tool.key}`}
                        type="number"
                        min="0"
                        step="0.001"
                        value={tool.amount}
                        onChange={(event) => updateTool(tool.key, { amount: event.target.value })}
                        className="mt-1.5 block w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm text-zinc-950 outline-none transition placeholder:text-zinc-400 focus:border-zinc-950 focus:ring-2 focus:ring-zinc-950/10 disabled:cursor-not-allowed disabled:bg-zinc-100"
                        placeholder="1"
                      />
                    </div>
                    <RemoveButton
                      label={`Xóa dụng cụ ${index + 1}`}
                      onClick={() => setTools((current) => current.filter((item) => item.key !== tool.key))}
                    />
                  </li>
                ))}
              </ul>
            )}
            <AddButton
              label="Thêm dụng cụ"
              onClick={() => setTools((current) => [
                ...current,
                {
                  key: createClientKey("tool"),
                  name: "",
                  amount: "",
                  coverImgId: null,
                },
              ])}
            />
          </fieldset>
        </FormSection>

        <FormSection title="Các bước thực hiện">
          <SortableTextList
            label="Thứ tự các bước"
            itemLabel="Bước"
            items={steps}
            createItem={() => ({
              key: createClientKey("step"),
              text: "",
            })}
            onChange={setSteps}
            addLabel="Thêm bước"
            emptyMessage="Chưa có bước thực hiện nào."
            placeholder="Mô tả chi tiết bước này"
            required
            disabled={isSubmitting}
          />
        </FormSection>

        <FormSection title="Ghi chú">
          <SortableTextList
            label="Thứ tự ghi chú"
            itemLabel="Ghi chú"
            items={notes}
            createItem={() => ({
              key: createClientKey("note"),
              text: "",
            })}
            onChange={setNotes}
            addLabel="Thêm ghi chú"
            emptyMessage="Chưa có ghi chú nào."
            placeholder="Ví dụ: Có thể thay bơ bằng dầu dừa"
            rows={2}
            required
            disabled={isSubmitting}
          />
        </FormSection>
      </div>

      {error && (
        <p className="mt-8 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700" role="alert">
          {error}
        </p>
      )}

      <div className="mt-8 flex flex-col-reverse gap-3 border-t border-zinc-200 pt-6 sm:flex-row sm:justify-end">
        <Link
          href={cancelHref}
          aria-disabled={isSubmitting}
          tabIndex={isSubmitting ? -1 : undefined}
          className={`inline-flex min-h-11 items-center justify-center rounded-full border border-zinc-300 bg-white px-5 text-sm font-medium text-zinc-800 transition hover:border-zinc-500 hover:bg-zinc-100 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-zinc-950 ${
            isSubmitting ? "pointer-events-none opacity-50" : ""
          }`}
        >
          Hủy
        </Link>
        <button
          type="submit"
          disabled={isSubmitting}
          className="inline-flex min-h-11 items-center justify-center rounded-full bg-zinc-950 px-5 text-sm font-medium text-white transition hover:bg-zinc-700 disabled:cursor-not-allowed disabled:bg-zinc-400 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-zinc-950"
        >
          {isSubmitting ? "Đang lưu..." : submitLabel}
        </button>
      </div>
    </form>
  );
}
