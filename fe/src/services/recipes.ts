import type {
  Recipe,
  RecipeCursor,
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
