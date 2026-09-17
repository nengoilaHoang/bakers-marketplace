import { z } from 'zod';

export const RecipeSchema = z.object({
  id: z.uuidv4().optional(),
  coverImgId: z.uuidv4().nullable().optional(),
  userId: z.uuidv4().nullable().optional(),
  title: z.string().trim().min(1),
  description: z.string().nullable().optional(),
  portion: z.int().positive().nullable().optional(),
  isPublic: z.boolean().optional(),
  isSnapshot: z.boolean().optional(),
  createdAt: z.date().optional(),
  updatedAt: z.date().optional(),
});

export const RecipeCreateSchema = RecipeSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const RecipeUpdateSchema = RecipeSchema.omit({
  createdAt: true,
  updatedAt: true,
}).partial();

export type RecipeData = z.infer<typeof RecipeSchema>;
export type RecipeCreate = z.infer<typeof RecipeCreateSchema>;
export type RecipeUpdate = z.infer<typeof RecipeUpdateSchema>;

export type RecipeCursor = {
  createdAt: Date | undefined;
  id: string | undefined;
};
export type GetRecipesResult = {
  data: Recipe[];
  cursor: RecipeCursor | null;
};

export class Recipe implements RecipeData {
  id?: string;
  coverImgId?: string | null;
  userId?: string | null;
  title!: string;
  description?: string | null;
  portion?: number | null;
  isPublic?: boolean;
  isSnapshot?: boolean;
  createdAt?: Date;
  updatedAt?: Date;

  constructor(data?: Partial<RecipeData>) {
    if (data) {
      Object.assign(this, data);
    }
  }
}