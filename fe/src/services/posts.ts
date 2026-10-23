import type {
	Post,
	PostComment,
	PostCursor,
	PostFeedDirection,
	PostFeedPage,
	PostLikeStatus,
	PostCreatePayload,
	PostReport,
	PostSaveStatus,
	PostSearchParams,
	PostUpdatePayload,
	PostsPage,
	SessionUser,
} from '@/types/post';
import request, { ApiError } from '@/lib/api';

type PostsApiResponse = {
	data: {
		data: Post[];
		cursor: PostCursor | null;
	};
};

type PageOptions = {
	cursor?: PostCursor | null;
	signal?: AbortSignal;
};

type PostFeedBaseOptions = {
	direction: PostFeedDirection;
	search?: PostSearchParams;
	signal?: AbortSignal;
};

export type PostFeedOptions =
	| (PostFeedBaseOptions & { direction: 'initial' })
	| (PostFeedBaseOptions & {
			direction: 'newer' | 'older';
			newest: PostCursor;
			oldest: PostCursor;
	  });

function toCursorQuery(cursor?: PostCursor | null) {
	return cursor ? { createdAt: cursor.createdAt, id: cursor.id } : {};
}

function toPostsPage(response: PostsApiResponse): PostsPage {
	const payload = response.data;

	if (!payload || !Array.isArray(payload.data)) {
		throw new Error('Dữ liệu bài viết trả về không đúng định dạng.');
	}

	return {
		posts: payload.data,
		cursor: payload.cursor,
	};
}

function isPostSummary(value: unknown): value is Post {
	if (typeof value !== 'object' || value === null) {
		return false;
	}

	const post = value as Partial<Post>;
	return (
		typeof post.id === 'string' &&
		typeof post.createdAt === 'string' &&
		typeof post.title === 'string'
	);
}

function toPostFeedPage(response: { data: unknown }): PostFeedPage {
	if (typeof response.data !== 'object' || response.data === null) {
		throw new Error('Dữ liệu bảng tin trả về không đúng định dạng.');
	}

	const page = response.data as Partial<PostFeedPage>;
	if (
		!Array.isArray(page.newerPosts) ||
		!page.newerPosts.every(isPostSummary) ||
		!Array.isArray(page.olderPosts) ||
		!page.olderPosts.every(isPostSummary) ||
		page.pageSize !== 10 ||
		typeof page.hasMoreNewer !== 'boolean' ||
		typeof page.hasMoreOlder !== 'boolean' ||
		page.newerPosts.length + page.olderPosts.length > page.pageSize
	) {
		throw new Error('Dữ liệu bảng tin trả về không đúng định dạng.');
	}

	return {
		newerPosts: page.newerPosts,
		olderPosts: page.olderPosts,
		pageSize: page.pageSize,
		hasMoreNewer: page.hasMoreNewer,
		hasMoreOlder: page.hasMoreOlder,
	};
}

export async function getPostFeedPage(
	options: PostFeedOptions,
): Promise<PostFeedPage> {
	const cursorQuery = options.direction === 'initial'
		? {}
		: {
				newestCreatedAt: options.newest.createdAt,
				newestId: options.newest.id,
				oldestCreatedAt: options.oldest.createdAt,
				oldestId: options.oldest.id,
			};
	const response = await request<{ data: unknown }>(
		'/posts/feed',
		{ method: 'GET', signal: options.signal },
		{
			direction: options.direction,
			q: options.search?.q || undefined,
			tag: options.search?.tag || undefined,
			...cursorQuery,
		},
	);

	return toPostFeedPage(response);
}

export async function getPosts({
	cursor,
	signal,
}: PageOptions = {}): Promise<PostsPage> {
	const response = await request<PostsApiResponse>(
		'/posts',
		{ method: 'GET', signal },
		toCursorQuery(cursor),
	);

	return toPostsPage(response);
}

export async function searchPosts(
	params: PostSearchParams,
	{ cursor, signal }: PageOptions = {},
): Promise<PostsPage> {
	const response = await request<PostsApiResponse>(
		'/posts/search',
		{ method: 'GET', signal },
		{
			q: params.q || undefined,
			tag: params.tag || undefined,
			...toCursorQuery(cursor),
		},
	);

	return toPostsPage(response);
}

export async function getMyPosts({
	cursor,
	signal,
}: PageOptions = {}): Promise<PostsPage> {
	const response = await request<PostsApiResponse>(
		'/posts/mine',
		{ method: 'GET', signal },
		toCursorQuery(cursor),
	);

	return toPostsPage(response);
}

export async function getSavedPosts({
	cursor,
	signal,
}: PageOptions = {}): Promise<PostsPage> {
	const response = await request<PostsApiResponse>(
		'/posts/saved',
		{ method: 'GET', signal },
		toCursorQuery(cursor),
	);

	return toPostsPage(response);
}

export async function getPostById(
	id: string,
	{ signal }: { signal?: AbortSignal } = {},
): Promise<Post> {
	const response = await request<{ data: Post }>(
		`/posts/${encodeURIComponent(id)}`,
		{ method: 'GET', signal },
	);

	return response.data;
}

export async function createPost(payload: PostCreatePayload): Promise<Post> {
	const response = await request<{ data: Post }>('/posts', {
		method: 'POST',
		body: JSON.stringify(payload),
	});

	return response.data;
}

export async function updatePost(
	id: string,
	payload: PostUpdatePayload,
): Promise<Post> {
	const response = await request<{ data: Post }>(
		`/posts/${encodeURIComponent(id)}`,
		{
			method: 'PATCH',
			body: JSON.stringify(payload),
		},
	);

	return response.data;
}

export async function deletePost(id: string): Promise<void> {
	await request<{ data: Post }>(`/posts/${encodeURIComponent(id)}`, {
		method: 'DELETE',
	});
}

export async function likePost(id: string): Promise<PostLikeStatus> {
	const response = await request<{ data: PostLikeStatus }>(
		`/posts/${encodeURIComponent(id)}/like`,
		{ method: 'POST' },
	);

	return response.data;
}

export async function unlikePost(id: string): Promise<PostLikeStatus> {
	const response = await request<{ data: PostLikeStatus }>(
		`/posts/${encodeURIComponent(id)}/like`,
		{ method: 'DELETE' },
	);

	return response.data;
}

export async function savePost(id: string): Promise<PostSaveStatus> {
	const response = await request<{ data: PostSaveStatus }>(
		`/posts/${encodeURIComponent(id)}/save`,
		{ method: 'POST' },
	);

	return response.data;
}

export async function unsavePost(id: string): Promise<PostSaveStatus> {
	const response = await request<{ data: PostSaveStatus }>(
		`/posts/${encodeURIComponent(id)}/save`,
		{ method: 'DELETE' },
	);

	return response.data;
}

export async function reportPost(id: string, reason: string): Promise<PostReport> {
	const response = await request<{ data: PostReport }>(
		`/posts/${encodeURIComponent(id)}/reports`,
		{
			method: 'POST',
			body: JSON.stringify({ reason }),
		},
	);

	return response.data;
}

export async function getPostComments(
	id: string,
	{ signal }: { signal?: AbortSignal } = {},
): Promise<PostComment[]> {
	const response = await request<{ data: PostComment[] }>(
		`/posts/${encodeURIComponent(id)}/comments`,
		{ method: 'GET', signal },
	);

	return response.data;
}

export async function createPostComment(
	id: string,
	content: string,
	parentCommentId: string | null = null,
): Promise<PostComment> {
	const response = await request<{ data: PostComment }>(
		`/posts/${encodeURIComponent(id)}/comments`,
		{
			method: 'POST',
			body: JSON.stringify({ content, parentCommentId }),
		},
	);

	return response.data;
}

export async function deletePostComment(
	id: string,
	commentId: string,
): Promise<void> {
	await request<{ data: PostComment }>(
		`/posts/${encodeURIComponent(id)}/comments/${encodeURIComponent(commentId)}`,
		{ method: 'DELETE' },
	);
}

/**
 * Người đang đăng nhập, hoặc null nếu chưa đăng nhập. Gọi API session cũng giúp
 * làm mới access token đã hết hạn, nhờ vậy isLiked/isSaved của bài viết hiển thị đúng.
 */
export async function getCurrentUser(): Promise<SessionUser | null> {
	try {
		const response = await request<{ data: SessionUser }>('/authen/session');

		return response.data;
	} catch (error) {
		if (error instanceof ApiError && error.status === 401) {
			return null;
		}

		throw error;
	}
}
