import { z } from 'zod';

export const SessionSchema = z.object({
  id: z.uuidv4().optional(),
  userId: z.uuidv4(),
  refreshTokenHash: z.string().min(1),
  createdAt: z.date().optional(),
  updatedAt: z.date().optional(),
});

export const SessionCreateSchema = SessionSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const SessionUpdateSchema = SessionSchema.omit({
  createdAt: true,
  updatedAt: true,
}).partial();

export type SessionData = z.infer<typeof SessionSchema>;
export type SessionCreate = z.infer<typeof SessionCreateSchema>;
export type SessionUpdate = z.infer<typeof SessionUpdateSchema>;

export class Session implements SessionData {
  id?: string;
  userId!: string;
  refreshTokenHash!: string;
  createdAt?: Date;
  updatedAt?: Date;

  constructor(data?: Partial<SessionData>) {
    if (data) {
      Object.assign(this, data);
    }
  }
}
