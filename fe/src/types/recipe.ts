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
