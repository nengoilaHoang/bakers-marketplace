import { z } from 'zod';

export const SessionTableSchema = z.object({
	id: z.uuidv4().readonly(),
	userId: z.uuidv4(),
	refreshTokenHash: z.string(),
	createdAt: z.date().readonly(),
	updatedAt: z.date(),
});

export const SessionSchema = SessionTableSchema;

export type Session = z.infer<typeof SessionSchema>;
export type SessionRow = z.infer<typeof SessionTableSchema>;
