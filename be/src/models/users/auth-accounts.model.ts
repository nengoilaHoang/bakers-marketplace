import { z } from 'zod';

export const AuthProviderSchema = z.enum(['GOOGLE']);

export const AuthAccountSchema = z.object({
  id: z.uuidv4().optional(),
  userId: z.uuidv4(),
  provider: AuthProviderSchema,
  providerUserId: z.string().trim().min(1),
  createdAt: z.date().optional(),
  updatedAt: z.date().optional(),
});

export const AuthAccountCreateSchema = AuthAccountSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const AuthAccountUpdateSchema = AuthAccountSchema.omit({
  createdAt: true,
  updatedAt: true,
}).partial();

export type AuthProvider = z.infer<typeof AuthProviderSchema>;
export type AuthAccountData = z.infer<typeof AuthAccountSchema>;
export type AuthAccountCreate = z.infer<typeof AuthAccountCreateSchema>;
export type AuthAccountUpdate = z.infer<typeof AuthAccountUpdateSchema>;

export class AuthAccount implements AuthAccountData {
  id?: string;
  userId!: string;
  provider!: AuthProvider;
  providerUserId!: string;
  createdAt?: Date;
  updatedAt?: Date;

  constructor(data?: Partial<AuthAccountData>) {
    if (data) {
      Object.assign(this, data);
    }
  }
}
