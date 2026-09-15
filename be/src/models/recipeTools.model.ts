import { z } from 'zod';

export const RecipeToolSchema = z.object({
  id: z.uuidv4().optional(),
  recipeId: z.uuidv4(),
  coverImgId: z.uuidv4().nullable().optional(),
  name: z.string().trim().min(1),
  amount: z.number().nonnegative().nullable().optional(),
  createdAt: z.date().optional(),
});

export const RecipeToolCreateSchema = RecipeToolSchema.omit({
  id: true,
  createdAt: true,
});

export const RecipeToolUpdateSchema = RecipeToolSchema.omit({
  id: true,
  recipeId: true,
  createdAt: true,
}).partial();

export type RecipeToolData = z.infer<typeof RecipeToolSchema>;
export type RecipeToolCreate = z.infer<typeof RecipeToolCreateSchema>;
export type RecipeToolUpdate = z.infer<typeof RecipeToolUpdateSchema>;

export class RecipeTool implements RecipeToolData {
  id?: string;
  recipeId!: string;
  coverImgId?: string | null;
  name!: string;
  amount?: number | null;
  createdAt?: Date;

  constructor(data?: Partial<RecipeToolData>) {
    if (data) {
      Object.assign(this, data);
    }
  }
}