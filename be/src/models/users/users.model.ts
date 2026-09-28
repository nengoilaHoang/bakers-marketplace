import { z } from 'zod';

export const UserRoleSchema = z.enum(['CUSTOMER', 'BAKER', 'VENDOR', 'ADMIN']);

export const UserSchema = z.object({
	id: z.uuidv4().optional(),
	email: z.email().max(255),
	hashedPassword: z.string().max(255).nullable(),
	displayName: z.string().trim().min(1).max(255),
	role: UserRoleSchema.default('CUSTOMER'),
	createdAt: z.date().optional(),
	updatedAt: z.date().optional(),
});

export const UserInfoSchema = UserSchema.omit({
	hashedPassword: true,
});

export const UserCredentialsSchema = UserSchema.pick({
	id: true,
	email: true,
	hashedPassword: true,
});

export const UserCreateSchema = UserSchema.omit({
	id: true,
	createdAt: true,
	updatedAt: true,
});

export const UserUpdateSchema = UserSchema.omit({
	id: true,
	hashedPassword: true,
	createdAt: true,
	updatedAt: true,
}).partial();

export const UserPasswordUpdateSchema = z.object({
	hashedPassword: z.string().min(1).max(255),
});

export type UserRole = z.infer<typeof UserRoleSchema>;
export type UserData = z.infer<typeof UserSchema>;
export type UserInfo = z.infer<typeof UserInfoSchema>;
export type UserCredentials = z.infer<typeof UserCredentialsSchema>;
export type UserCreate = z.infer<typeof UserCreateSchema>;
export type UserUpdate = z.infer<typeof UserUpdateSchema>;
export type UserPasswordUpdate = z.infer<typeof UserPasswordUpdateSchema>;

export class User implements UserData {
	id?: string;
	email!: string;
	hashedPassword!: string | null;
	displayName!: string;
	role: UserRole = 'CUSTOMER';
	createdAt?: Date;
	updatedAt?: Date;

	constructor(data?: Partial<UserData>) {
		if (data) {
			Object.assign(this, data);
		}
	}
}
