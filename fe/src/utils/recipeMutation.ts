import type {
  RecipeDetail,
  RecipeFormValues,
  RecipeIngredient,
  RecipeIngredientFormValue,
  RecipeIngredientMutationFields,
  RecipeMutationPayload,
  RecipeNote,
  RecipeNoteFormValue,
  RecipeNoteMutationFields,
  RecipeRelationMutation,
  RecipeStep,
  RecipeStepFormValue,
  RecipeStepMutationFields,
  RecipeTag,
  RecipeTagFormValue,
  RecipeTagMutationFields,
  RecipeTool,
  RecipeToolFormValue,
  RecipeToolMutationFields,
} from "@/types/recipe";

type FormRelation = { id?: string };
type PersistedRelation = { id: string };

function normalizeRequiredText(value: string): string {
  return value.trim();
}

function normalizeNullableText(value: string | null | undefined): string | null {
  const normalized = value?.trim();
  return normalized ? normalized : null;
}

function normalizeAmount(
  value: number | string | null | undefined,
): number | null {
  if (value === null || value === undefined || value === "") {
    return null;
  }

  const normalized = typeof value === "number" ? value : Number(value);
  return Number.isFinite(normalized) ? normalized : null;
}

function fieldsAreEqual<TFields extends object>(
  current: TFields,
  original: TFields,
): boolean {
  const currentEntries = Object.entries(current);
  const originalEntries = Object.entries(original);

  return (
    currentEntries.length === originalEntries.length &&
    currentEntries.every(([key, value]) => original[key as keyof TFields] === value)
  );
}

function buildRelationMutation<
  TForm extends FormRelation,
  TOriginal extends PersistedRelation,
  TFields extends object,
>(
  currentRows: TForm[],
  originalRows: TOriginal[] | undefined,
  currentFields: (row: TForm, index: number) => TFields,
  originalFields: (row: TOriginal) => TFields,
): RecipeRelationMutation<TFields> {
  if (!originalRows) {
    return {
      create: currentRows.map(currentFields),
      update: [],
      delete: [],
    };
  }

  const originalById = new Map(originalRows.map((row) => [row.id, row]));
  const currentIds = new Set(
    currentRows.flatMap((row) => (row.id ? [row.id] : [])),
  );
  const create: TFields[] = [];
  const update: Array<TFields & { id: string }> = [];

  currentRows.forEach((row, index) => {
    const fields = currentFields(row, index);

    if (!row.id) {
      create.push(fields);
      return;
    }

    const original = originalById.get(row.id);

    // Only IDs from the original recipe may be updated. If a locally restored
    // row carries an unknown ID, treat it as a new row instead of forwarding an
    // untrusted child ID to the API.
    if (!original) {
      create.push(fields);
      return;
    }

    if (!fieldsAreEqual(fields, originalFields(original))) {
      update.push({ id: row.id, ...fields });
    }
  });

  return {
    create,
    update,
    delete: originalRows
      .filter((row) => !currentIds.has(row.id))
      .map((row) => row.id),
  };
}

function ingredientFields(
  ingredient: RecipeIngredientFormValue | RecipeIngredient,
): RecipeIngredientMutationFields {
  return {
    name: normalizeRequiredText(ingredient.name),
    amount: normalizeAmount(ingredient.amount),
    unit: normalizeNullableText(ingredient.unit),
    coverImgId: normalizeNullableText(ingredient.coverImgId),
  };
}

function toolFields(
  tool: RecipeToolFormValue | RecipeTool,
): RecipeToolMutationFields {
  return {
    name: normalizeRequiredText(tool.name),
    amount: normalizeAmount(tool.amount),
    coverImgId: normalizeNullableText(tool.coverImgId),
  };
}

function stepFormFields(
  step: RecipeStepFormValue,
  index: number,
): RecipeStepMutationFields {
  return {
    stepOrder: index + 1,
    description: normalizeRequiredText(step.description),
  };
}

function stepOriginalFields(step: RecipeStep): RecipeStepMutationFields {
  return {
    stepOrder: step.stepOrder,
    description: normalizeRequiredText(step.description),
  };
}

function noteFormFields(
  note: RecipeNoteFormValue,
  index: number,
): RecipeNoteMutationFields {
  return {
    noteOrder: index + 1,
    content: normalizeRequiredText(note.content),
  };
}

function noteOriginalFields(note: RecipeNote): RecipeNoteMutationFields {
  return {
    noteOrder: note.noteOrder,
    content: normalizeRequiredText(note.content),
  };
}

function tagFields(tag: RecipeTagFormValue | RecipeTag): RecipeTagMutationFields {
  return { name: normalizeRequiredText(tag.name) };
}

export function recipeDetailToFormValues(recipe: RecipeDetail): RecipeFormValues {
  return {
    title: recipe.title,
    description: recipe.description ?? null,
    portion: recipe.portion ?? null,
    isPublic: recipe.isPublic ?? false,
    coverImgId: recipe.coverImgId ?? null,
    recipeIngredients: recipe.recipeIngredients.map((ingredient) => ({
      id: ingredient.id,
      name: ingredient.name,
      amount: normalizeAmount(ingredient.amount),
      unit: ingredient.unit ?? null,
      coverImgId: ingredient.coverImgId ?? null,
    })),
    recipeTools: recipe.recipeTools.map((tool) => ({
      id: tool.id,
      name: tool.name,
      amount: normalizeAmount(tool.amount),
      coverImgId: tool.coverImgId ?? null,
    })),
    steps: [...recipe.steps]
      .sort((left, right) => left.stepOrder - right.stepOrder)
      .map((step) => ({ id: step.id, description: step.description })),
    recipeNotes: [...recipe.recipeNotes]
      .sort((left, right) => left.noteOrder - right.noteOrder)
      .map((note) => ({ id: note.id, content: note.content })),
    recipeTags: recipe.recipeTags.map((tag) => ({
      id: tag.id,
      name: tag.name,
    })),
  };
}

export function buildRecipeMutationPayload(
  values: RecipeFormValues,
  original?: RecipeDetail | null,
): RecipeMutationPayload {
  return {
    title: normalizeRequiredText(values.title),
    description: normalizeNullableText(values.description),
    portion: values.portion,
    isPublic: values.isPublic,
    coverImgId: normalizeNullableText(values.coverImgId),
    recipeIngredients: buildRelationMutation(
      values.recipeIngredients,
      original?.recipeIngredients,
      ingredientFields,
      ingredientFields,
    ),
    recipeTools: buildRelationMutation(
      values.recipeTools,
      original?.recipeTools,
      toolFields,
      toolFields,
    ),
    steps: buildRelationMutation(
      values.steps,
      original?.steps,
      stepFormFields,
      stepOriginalFields,
    ),
    recipeNotes: buildRelationMutation(
      values.recipeNotes,
      original?.recipeNotes,
      noteFormFields,
      noteOriginalFields,
    ),
    recipeTags: buildRelationMutation(
      values.recipeTags,
      original?.recipeTags,
      tagFields,
      tagFields,
    ),
  };
}
