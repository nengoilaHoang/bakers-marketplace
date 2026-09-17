import type {
  Recipe,
  RecipeCursor,
  RecipeDetail,
  RecipesPage,
} from "@/types/recipe";
import { apiRequest } from "@/utils/api";

type RecipesApiResponse = {
  data: {
    data: Recipe[];
    cursor: RecipeCursor | null;
  };
};

type GetRecipesOptions = {
  cursor?: RecipeCursor;
  signal?: AbortSignal;
};

function isRecipeCursor(value: unknown): value is RecipeCursor {
  if (typeof value !== "object" || value === null) {
    return false;
  }

  const cursor = value as Partial<RecipeCursor>;
  return typeof cursor.createdAt === "string" && typeof cursor.id === "string";
}

export async function getRecipes({
  cursor,
  signal,
}: GetRecipesOptions = {}): Promise<RecipesPage> {
  const response = await apiRequest<RecipesApiResponse>("/recipes", {
    method: "GET",
    signal,
    query: cursor
      ? {
          createdAt: cursor.createdAt,
          id: cursor.id,
        }
      : undefined,
  });

  const payload = response.data;

  if (
    !payload ||
    !Array.isArray(payload.data) ||
    (payload.cursor !== null && !isRecipeCursor(payload.cursor))
  ) {
    throw new Error("Dữ liệu recipes trả về không đúng định dạng.");
  }

  return {
    recipes: payload.data,
    cursor: payload.cursor,
  };
}

export async function getRecipeById(
  id: string,
  { signal }: { signal?: AbortSignal } = {},
): Promise<RecipeDetail> {
  const response = await apiRequest<{ data: RecipeDetail }>(
    `/recipes/${encodeURIComponent(id)}`,
    { method: "GET", signal },
  );
  const recipe = response.data;

  if (
    !recipe ||
    typeof recipe.id !== "string" ||
    typeof recipe.title !== "string" ||
    !Array.isArray(recipe.recipeIngredients) ||
    !Array.isArray(recipe.recipeTools) ||
    !Array.isArray(recipe.steps) ||
    !Array.isArray(recipe.recipeNotes) ||
    !Array.isArray(recipe.recipeTags)
  ) {
    throw new Error("Dữ liệu chi tiết công thức không đúng định dạng.");
  }

  return {
    ...recipe,
    steps: [...recipe.steps].sort((a, b) => a.stepOrder - b.stepOrder),
    recipeNotes: [...recipe.recipeNotes].sort((a, b) => a.noteOrder - b.noteOrder),
  };
}
