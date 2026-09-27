import { z } from 'zod';

export const AuthProviderSchema = z.enum(['GOOGLE']);

export const AuthAccountTableSchema = z.object({
	id: z.uuidv4().readonly(),
	userId: z.uuidv4(),
	provider: AuthProviderSchema,
	providerUserId: z.string(),
	createdAt: z.date().readonly(),
	updatedAt: z.date(),
});

export const AuthAccountSchema = AuthAccountTableSchema;

export type AuthAccount = z.infer<typeof AuthAccountSchema>;
export type AuthAccountRow = z.infer<typeof AuthAccountTableSchema>;
export type AuthProvider = z.infer<typeof AuthProviderSchema>;
