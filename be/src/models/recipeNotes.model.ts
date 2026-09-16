import { z } from 'zod';

export const RecipeNoteSchema = z.object({
  id: z.uuidv4().optional(),
  recipeId: z.uuidv4(),
  noteOrder: z.int().positive(),
  content: z.string().trim().min(1),
  createdAt: z.date().optional(),
});

export const RecipeNoteCreateSchema = RecipeNoteSchema.omit({
  id: true,
  createdAt: true,
});

export const RecipeNoteUpdateSchema = RecipeNoteSchema.omit({
  id: true,
  recipeId: true,
  createdAt: true,
}).partial();

export type RecipeNoteData = z.infer<typeof RecipeNoteSchema>;
export type RecipeNoteCreate = z.infer<typeof RecipeNoteCreateSchema>;
export type RecipeNoteUpdate = z.infer<typeof RecipeNoteUpdateSchema>;

export class RecipeNote implements RecipeNoteData {
  id?: string;
  recipeId!: string;
  noteOrder!: number;
  content!: string;
  createdAt?: Date;

  constructor(data?: Partial<RecipeNoteData>) {
    if (data) {
      Object.assign(this, data);
    }
  }
}