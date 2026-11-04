import { z } from 'zod';

export const UserRoleSchema = z.enum(['CUSTOMER', 'BAKER', 'VENDOR', 'ADMIN']);

export const UserStatusSchema = z.enum(['PENDING_VERIFICATION', 'ACTIVE', 'BANNED']);

export const UserSchema = z.object({
	id: z.uuidv4().optional(),
	email: z.email().max(255),
	hashedPassword: z.string().max(255).nullable(),
	displayName: z.string().trim().min(1).max(255),
	role: UserRoleSchema.default('CUSTOMER'),
	status: UserStatusSchema.default('ACTIVE'),
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
	status: true,
	createdAt: true,
	updatedAt: true,
});

export const UserUpdateSchema = UserSchema.omit({
	id: true,
	hashedPassword: true,
	status: true,
	createdAt: true,
	updatedAt: true,
}).partial();

export const UserPasswordUpdateSchema = z.object({
	hashedPassword: z.string().min(1).max(255),
});

export type UserRole = z.infer<typeof UserRoleSchema>;
export type UserStatus = z.infer<typeof UserStatusSchema>;
export type UserData = z.infer<typeof UserSchema>;
export type UserInfo = z.infer<typeof UserInfoSchema>;

/** What anyone can see about a user: no email, only public activity. */
export type PublicProfile = {
	id: string;
	displayName: string;
	role: UserRole;
	postCount: number;
	recipeCount: number;
	createdAt: Date;
};
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
	status: UserStatus = 'ACTIVE';
	createdAt?: Date;
	updatedAt?: Date;

	constructor(data?: Partial<UserData>) {
		if (data) {
			Object.assign(this, data);
		}
	}
}
