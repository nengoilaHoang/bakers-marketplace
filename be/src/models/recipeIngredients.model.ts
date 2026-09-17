import { z } from 'zod';

export const RecipeIngredientSchema = z.object({
  id: z.uuidv4().optional(),
  recipeId: z.uuidv4(),
  coverImgId: z.uuidv4().nullable().optional(),
  name: z.string().trim().min(1),
  amount: z.number().nonnegative().nullable().optional(),
  unit: z.string().trim().min(1).nullable().optional(),
  createdAt: z.date().optional(),
});

export const RecipeIngredientCreateSchema = RecipeIngredientSchema.omit({
  id: true,
  createdAt: true,
});

export const RecipeIngredientUpdateSchema = RecipeIngredientSchema.omit({
  id: true,
  recipeId: true,
  createdAt: true,
}).partial();

export type RecipeIngredientData = z.infer<typeof RecipeIngredientSchema>;
export type RecipeIngredientCreate = z.infer<typeof RecipeIngredientCreateSchema>;
export type RecipeIngredientUpdate = z.infer<typeof RecipeIngredientUpdateSchema>;

export class RecipeIngredient implements RecipeIngredientData {
  id?: string;
  recipeId!: string;
  coverImgId?: string | null;
  name!: string;
  amount?: number | null;
  unit?: string | null;
  createdAt?: Date;

  constructor(data?: Partial<RecipeIngredientData>) {
    if (data) {
      Object.assign(this, data);
    }
  }
}