export type Recipe = {
  id: string;
  coverImgId?: string | null;
  userId?: string | null;
  title: string;
  description?: string | null;
  portion?: number | null;
  isPublic?: boolean;
  isSnapshot?: boolean;
  createdAt?: string;
  updatedAt?: string;
};

export type RecipeCursor = {
  createdAt: string;
  id: string;
};

export type RecipesPage = {
  recipes: Recipe[];
  cursor: RecipeCursor | null;
};

export type RecipeIngredient = {
  id: string;
  recipeId: string;
  name: string;
  // PostgreSQL decimal columns may be serialized as strings.
  amount?: number | string | null;
  unit?: string | null;
  coverImgId?: string | null;
};

export type RecipeTool = Omit<RecipeIngredient, "unit">;

export type RecipeStep = {
  id: string;
  recipeId: string;
  stepOrder: number;
  description: string;
};

export type RecipeNote = {
  id: string;
  recipeId: string;
  noteOrder: number;
  content: string;
};

export type RecipeTag = {
  id: string;
  recipeId: string;
  name: string;
};

export type RecipeDetail = Recipe & {
  recipeIngredients: RecipeIngredient[];
  recipeTools: RecipeTool[];
  steps: RecipeStep[];
  recipeNotes: RecipeNote[];
  recipeTags: RecipeTag[];
};

export type RecipeIngredientFormValue = {
  id?: string;
  name: string;
  amount?: number | null;
  unit?: string | null;
  coverImgId?: string | null;
};

export type RecipeToolFormValue = Omit<RecipeIngredientFormValue, "unit">;

export type RecipeStepFormValue = {
  id?: string;
  description: string;
};

export type RecipeNoteFormValue = {
  id?: string;
  content: string;
};

export type RecipeTagFormValue = {
  id?: string;
  name: string;
};

export type RecipeFormValues = {
  title: string;
  description: string | null;
  portion: number | null;
  isPublic: boolean;
  coverImgId?: string | null;
  recipeIngredients: RecipeIngredientFormValue[];
  recipeTools: RecipeToolFormValue[];
  steps: RecipeStepFormValue[];
  recipeNotes: RecipeNoteFormValue[];
  recipeTags: RecipeTagFormValue[];
};

export type RecipeIngredientMutationFields = {
  name: string;
  amount: number | null;
  unit: string | null;
  coverImgId: string | null;
};

export type RecipeToolMutationFields = Omit<
  RecipeIngredientMutationFields,
  "unit"
>;

export type RecipeStepMutationFields = {
  stepOrder: number;
  description: string;
};

export type RecipeNoteMutationFields = {
  noteOrder: number;
  content: string;
};

export type RecipeTagMutationFields = {
  name: string;
};

export type RecipeRelationMutation<TFields> = {
  create: TFields[];
  update: Array<TFields & { id: string }>;
  delete: string[];
};

export type RecipeMutationPayload = {
  title: string;
  description: string | null;
  portion: number | null;
  isPublic: boolean;
  coverImgId: string | null;
  recipeIngredients: RecipeRelationMutation<RecipeIngredientMutationFields>;
  recipeTools: RecipeRelationMutation<RecipeToolMutationFields>;
  steps: RecipeRelationMutation<RecipeStepMutationFields>;
  recipeNotes: RecipeRelationMutation<RecipeNoteMutationFields>;
  recipeTags: RecipeRelationMutation<RecipeTagMutationFields>;
};
