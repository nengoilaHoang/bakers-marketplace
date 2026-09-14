import { z } from 'zod';

export const UserRole = z.enum(['CUSTOMER', 'BAKER', 'VENDOR', 'ADMIN']);
export const UserStatus = z.enum(['PENDING_VERIFICATION', 'ACTIVE', 'BANNED']);

export const UserTableSchema = z.object({
	id: z.uuidv4().readonly(),
	email: z.email(),
	phone: z.string().max(15),
	password: z.string().max(255),
	displayName: z.string().max(255),
	role: UserRole.default('CUSTOMER'),
	status: UserStatus,
	createdAt: z.date().readonly(),
	updateAt: z.date(),
});

export const UserSchema = UserTableSchema;

export type User = z.infer<typeof UserSchema>;
export type UserRow = z.infer<typeof UserTableSchema>;
