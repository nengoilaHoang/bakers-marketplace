import type {
  Recipe,
  RecipeCursor,
  RecipeDetail,
  RecipeMutationPayload,
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

function parseRecipeDetail(value: unknown, errorMessage: string): RecipeDetail {
  if (typeof value !== "object" || value === null) {
    throw new Error(errorMessage);
  }

  const recipe = value as Partial<RecipeDetail>;

  if (
    typeof recipe.id !== "string" ||
    typeof recipe.title !== "string" ||
    !Array.isArray(recipe.recipeIngredients) ||
    !Array.isArray(recipe.recipeTools) ||
    !Array.isArray(recipe.steps) ||
    !Array.isArray(recipe.recipeNotes) ||
    !Array.isArray(recipe.recipeTags)
  ) {
    throw new Error(errorMessage);
  }

  return {
    ...recipe,
    id: recipe.id,
    title: recipe.title,
    recipeIngredients: recipe.recipeIngredients,
    recipeTools: recipe.recipeTools,
    steps: [...recipe.steps].sort((a, b) => a.stepOrder - b.stepOrder),
    recipeNotes: [...recipe.recipeNotes].sort(
      (a, b) => a.noteOrder - b.noteOrder,
    ),
    recipeTags: recipe.recipeTags,
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
  return parseRecipeDetail(
    response.data,
    "Dữ liệu chi tiết công thức không đúng định dạng.",
  );
}

export async function getMyRecipes(
  { signal }: { signal?: AbortSignal } = {},
): Promise<Recipe[]> {
  const response = await apiRequest<{ data: Recipe[] }>(
    "/recipes/mine",
    { method: "GET", signal },
  );

  if (!Array.isArray(response.data)) {
    throw new Error("Dữ liệu công thức của bạn không đúng định dạng.");
  }

  return response.data;
}

export async function createRecipe(
  payload: RecipeMutationPayload,
): Promise<RecipeDetail> {
  const response = await apiRequest<{ data: RecipeDetail | null }>("/recipes", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  return parseRecipeDetail(
    response.data,
    "Không thể tạo công thức. Vui lòng thử lại.",
  );
}

export async function updateRecipe(
  id: string,
  payload: RecipeMutationPayload,
): Promise<RecipeDetail> {
  const response = await apiRequest<{ data: RecipeDetail | null }>("/recipes", {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ id, ...payload }),
  });

  return parseRecipeDetail(
    response.data,
    "Không thể cập nhật công thức. Vui lòng thử lại.",
  );
}

export async function deleteRecipe(id: string): Promise<void> {
  await apiRequest<{ data: Recipe }>(`/recipes/${encodeURIComponent(id)}`, {
    method: "DELETE",
  });
}
