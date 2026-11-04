import request from '@/lib/api';
import type {
	AdminPost,
	AdminPostDetail,
	AdminPostQuery,
	AdminRecipe,
	AdminRecipeDetail,
	AdminRecipeQuery,
	AdminUser,
	AdminUserDetail,
	AdminUserQuery,
	AdminVendor,
	AdminVendorQuery,
	Paginated,
} from '@/types/admin';

export type * from '@/types/admin';

type Options = { signal?: AbortSignal };

function post<T>(path: string, body?: object): Promise<T> {
	return request<T>(path, {
		method: 'POST',
		body: body ? JSON.stringify(body) : undefined,
	});
}

// ---------- bài viết ----------

export function getAdminPosts(
	query: AdminPostQuery,
	{ signal }: Options = {},
): Promise<Paginated<AdminPost>> {
	return request<Paginated<AdminPost>>('/admin/posts', { signal }, query);
}

export function getAdminPost(
	id: string,
	{ signal }: Options = {},
): Promise<{ data: AdminPostDetail }> {
	return request<{ data: AdminPostDetail }>(`/admin/posts/${id}`, { signal });
}

/** Ẩn bài và xử lý xong mọi báo cáo đang chờ về bài đó. */
export function removePost(
	id: string,
	reason: string,
): Promise<{ data: AdminPostDetail }> {
	return post(`/admin/posts/${id}/remove`, { reason });
}

export function restorePost(id: string): Promise<{ data: AdminPostDetail }> {
	return post(`/admin/posts/${id}/restore`);
}

export function dismissPostReports(
	id: string,
	note?: string,
): Promise<{ data: { dismissed: number } }> {
	return post(`/admin/posts/${id}/reports/dismiss`, { note });
}

// ---------- công thức ----------

export function getAdminRecipes(
	query: AdminRecipeQuery,
	{ signal }: Options = {},
): Promise<Paginated<AdminRecipe>> {
	return request<Paginated<AdminRecipe>>('/admin/recipes', { signal }, query);
}

export function getAdminRecipe(
	id: string,
	{ signal }: Options = {},
): Promise<{ data: AdminRecipeDetail }> {
	return request<{ data: AdminRecipeDetail }>(`/admin/recipes/${id}`, { signal });
}

// ---------- người dùng ----------

export function getAdminUsers(
	query: AdminUserQuery,
	{ signal }: Options = {},
): Promise<Paginated<AdminUser>> {
	return request<Paginated<AdminUser>>('/admin/users', { signal }, query);
}

export function getAdminUser(
	id: string,
	{ signal }: Options = {},
): Promise<{ data: AdminUserDetail }> {
	return request<{ data: AdminUserDetail }>(`/admin/users/${id}`, { signal });
}

/**
 * postId: cảnh cáo vì bài viết đó (gửi từ trang bài viết), xử lý mọi báo cáo đang chờ của bài.
 * Không có postId: xử lý các báo cáo đang chờ về chính người này.
 */
export function warnUser(
	id: string,
	reason: string,
	postId?: string,
): Promise<{ data: AdminUserDetail }> {
	return post(`/admin/users/${id}/warn`, { reason, postId });
}

export function banUser(
	id: string,
	reason: string,
): Promise<{ data: AdminUserDetail }> {
	return post(`/admin/users/${id}/ban`, { reason });
}

export function unbanUser(id: string): Promise<{ data: AdminUserDetail }> {
	return post(`/admin/users/${id}/unban`);
}

export function dismissUserReports(
	id: string,
	note?: string,
): Promise<{ data: { dismissed: number } }> {
	return post(`/admin/users/${id}/reports/dismiss`, { note });
}

/** Bỏ qua một báo cáo, các báo cáo khác về cùng đối tượng vẫn chờ xử lý. */
export function dismissReport(id: string, note?: string): Promise<void> {
	return post(`/admin/reports/${id}/dismiss`, { note });
}

// ---------- vendor ----------

export function getAdminVendors(
	query: AdminVendorQuery,
	{ signal }: Options = {},
): Promise<Paginated<AdminVendor>> {
	return request<Paginated<AdminVendor>>('/admin/vendors', { signal }, query);
}
