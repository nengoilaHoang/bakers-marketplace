export type User = {
	id: string;
	email: string;
	displayName: string;
	role: 'CUSTOMER' | 'ADMIN' | 'BAKER' | 'VENDOR';
	createdAt: Date;
}