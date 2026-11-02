import type {
	RecipeDetail,
	RecipeIngredient,
	RecipeNote,
	RecipeStep,
	RecipeTag,
	RecipeTool,
} from '@/types/recipe';
import type { UserRole, UserStatus } from '@/types/user';

// Kiểu dữ liệu của API /admin/* (BE: be/src/models/admin/admin.model.ts).
// Ngày tháng nhận về dạng chuỗi ISO.

export type PostStatus = 'VISIBLE' | 'REMOVED';
export type ReportStatus = 'PENDING' | 'DISMISSED' | 'RESOLVED';

export type Pagination = {
	page: number;
	pageSize: number;
	total: number;
};

export type Paginated<T> = {
	data: T[];
	pagination: Pagination;
};

export type PageQuery = {
	page?: number;
	pageSize?: number;
};

export type PersonRef = {
	id: string;
	displayName: string;
};

export type AdminReport = {
	id: string;
	reason: string;
	status: ReportStatus;
	reporter: PersonRef | null;
	handledBy: PersonRef | null;
	handledAt: string | null;
	note: string | null;
	createdAt: string;
};

export type AdminPost = {
	id: string;
	title: string;
	content: string;
	status: PostStatus;
	author: PersonRef | null;
	pendingReportCount: number;
	reportCount: number;
	lastReportedAt: string | null;
	createdAt: string;
};

export type AdminPostDetail = AdminPost & {
	reports: AdminReport[];
	// Các lần gỡ bài, mới nhất trước.
	removals: AdminTakedown[];
	// Công thức gắn vào bài: luôn là bản snapshot (isSnapshot = true), không có trong mục Công thức.
	recipe: RecipeDetail | null;
};

export type AdminPostQuery = PageQuery & {
	status?: PostStatus;
	reported?: boolean;
	keyword?: string;
};

export type AdminRecipe = {
	id: string;
	title: string;
	description: string | null;
	portion: number | null;
	author: PersonRef | null;
	createdAt: string;
	updatedAt: string;
};

export type AdminRecipeDetail = AdminRecipe & {
	recipeIngredients: RecipeIngredient[];
	recipeTools: RecipeTool[];
	steps: RecipeStep[];
	recipeNotes: RecipeNote[];
	recipeTags: RecipeTag[];
};

export type AdminRecipeQuery = PageQuery & {
	keyword?: string;
};

export type AdminUser = {
	id: string;
	email: string;
	displayName: string;
	role: UserRole;
	status: UserStatus;
	pendingReportCount: number;
	warningCount: number;
	createdAt: string;
};

// Báo cáo mà lần cảnh cáo đã xử lý; postId/postTitle null nếu là báo cáo về chính người dùng.
export type AdminWarningReport = {
	id: string;
	reason: string;
	postId: string | null;
	postTitle: string | null;
};

export type AdminWarning = {
	id: string;
	reason: string;
	issuedBy: PersonRef | null;
	reports: AdminWarningReport[];
	createdAt: string;
};

// Một lần gỡ bài hoặc khoá tài khoản; revokedAt null nghĩa là còn hiệu lực.
export type AdminTakedown = {
	id: string;
	reason: string;
	issuedBy: PersonRef | null;
	issuedAt: string;
	revokedBy: PersonRef | null;
	revokedAt: string | null;
};

export type AdminUserDetail = {
	id: string;
	email: string;
	displayName: string;
	role: UserRole;
	status: UserStatus;
	createdAt: string;
	reports: AdminReport[];
	warnings: AdminWarning[];
	// Các lần khoá, mới nhất trước.
	bans: AdminTakedown[];
};

export type AdminUserQuery = PageQuery & {
	role?: UserRole;
	status?: UserStatus;
	reported?: boolean;
	keyword?: string;
};

export type AdminVendor = {
	id: string;
	email: string;
	displayName: string;
	status: UserStatus;
	taxCode: string;
	brandName: string | null;
	registeredAt: string | null;
	createdAt: string;
};

export type AdminVendorQuery = PageQuery & {
	status?: UserStatus;
	keyword?: string;
};
