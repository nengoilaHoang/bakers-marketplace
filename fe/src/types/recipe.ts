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
