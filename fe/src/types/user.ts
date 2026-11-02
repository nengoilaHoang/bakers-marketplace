export type UserRole = 'CUSTOMER' | 'ADMIN' | 'BAKER' | 'VENDOR';
export type UserStatus = 'PENDING_VERIFICATION' | 'ACTIVE' | 'BANNED';

export type User = {
	id: string;
	email: string;
	displayName: string;
	role: UserRole;
	status?: UserStatus;
	createdAt: Date;
}

// Hồ sơ công khai (GET /users/:id): không có email, chỉ số bài viết và công thức công khai.
export type PublicProfile = {
	id: string;
	displayName: string;
	role: UserRole;
	postCount: number;
	recipeCount: number;
	createdAt: string;
};
