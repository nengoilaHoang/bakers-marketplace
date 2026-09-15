import { z } from 'zod';

export const StepSchema = z.object({
  id: z.uuidv4().optional(),
  recipeId: z.uuidv4(),
  stepOrder: z.int().positive(),
  description: z.string().trim().min(1),
});

export const StepCreateSchema = StepSchema.omit({
  id: true,
});

export const StepUpdateSchema = StepSchema.omit({
  id: true,
  recipeId: true,
}).partial();

export type StepData = z.infer<typeof StepSchema>;
export type StepCreate = z.infer<typeof StepCreateSchema>;
export type StepUpdate = z.infer<typeof StepUpdateSchema>;

export class Step implements StepData {
  id?: string;
  recipeId!: string;
  stepOrder!: number;
  description!: string;

  constructor(data?: Partial<StepData>) {
    if (data) {
      Object.assign(this, data);
    }
  }
}