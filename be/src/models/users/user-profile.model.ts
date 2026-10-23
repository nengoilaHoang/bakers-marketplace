import { z } from 'zod';
import { UserSchema } from '#/models/users/users.model.js';

export const UserProfileUpdateSchema = UserSchema.pick({ displayName: true }).strict();
export type UserProfileUpdate = z.infer<typeof UserProfileUpdateSchema>;

const NormalizedEmailSchema = z.string().trim().toLowerCase().pipe(z.email().max(255));
export const ChangeEmailRequestSchema = z.object({ newEmail: NormalizedEmailSchema }).strict();
export const ChangeEmailTokenSchema = z.object({ token: z.string().regex(/^[a-f0-9]{64}$/) }).strict();
export const ChangeEmailConfirmationSchema = ChangeEmailTokenSchema.extend({ newEmail: NormalizedEmailSchema });

export const PendingEmailChangeSchema = z.object({
  userId: z.uuidv4(),
  currentEmail: z.email().max(255),
  newEmail: NormalizedEmailSchema,
  stage: z.enum(['WAITING_CURRENT_CONFIRMATION', 'WAITING_NEW_CONFIRMATION']),
});
export type PendingEmailChange = z.infer<typeof PendingEmailChangeSchema>;
