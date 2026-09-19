import { z } from 'zod';

export const RecipeTagSchema = z.object({
  id: z.uuidv4().optional(),
  recipeId: z.uuidv4(),
  name: z.string().trim().min(1),
  createdAt: z.date().optional(),
});

export const RecipeTagCreateSchema = RecipeTagSchema.omit({
  id: true,
  createdAt: true,
});

export const RecipeTagUpdateSchema = RecipeTagSchema.omit({
  id: true,
  recipeId: true,
  createdAt: true,
}).partial();

export type RecipeTagData = z.infer<typeof RecipeTagSchema>;
export type RecipeTagCreate = z.infer<typeof RecipeTagCreateSchema>;
export type RecipeTagUpdate = z.infer<typeof RecipeTagUpdateSchema>;

export class RecipeTag implements RecipeTagData {
  id?: string;
  recipeId!: string;
  name!: string;
  createdAt?: Date;

  constructor(data?: Partial<RecipeTagData>) {
    if (data) {
      Object.assign(this, data);
    }
  }
}