import type {
	Post,
	PostComment,
	PostCursor,
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
