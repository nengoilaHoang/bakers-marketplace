import { z } from 'zod';

import type { PostTag } from '#/models/posts/post-tags.model.js';

export const PostStatusSchema = z.enum(['VISIBLE', 'REMOVED']);

export const PostSchema = z.object({
	id: z.uuidv4().optional(),
	authorId: z.uuidv4().nullable().optional(),
	title: z.string().trim().min(1).max(255),
	content: z.string().trim().min(1).max(10000),
	status: PostStatusSchema.optional(),
	createdAt: z.date().optional(),
	updatedAt: z.date().optional(),
});

const PostTagsSchema = z.array(z.string().trim().min(1).max(50)).max(10);

/**
 * `recipeId` picks one of the author's own recipes (not a snapshot). The server
 * copies it into a snapshot and appends a [[recipe:<snapshot id>]] token to the
 * content, so later edits to the original recipe do not change the post.
 */
export const PostCreateSchema = PostSchema.pick({
	title: true,
	content: true,
}).extend({
	tags: PostTagsSchema.optional(),
	recipeId: z.uuidv4().optional(),
});

/**
 * The attached recipe is a snapshot, so it cannot be changed after creation:
 * the content may keep its recipe token or leave it out (it is appended again).
 */
export const PostUpdateSchema = PostSchema.pick({
	title: true,
	content: true,
}).extend({
	tags: PostTagsSchema.optional(),
}).partial();

export const PostCursorSchema = z.object({
	createdAt: z.coerce.date(),
	id: z.uuidv4(),
});

export type PostStatus = z.infer<typeof PostStatusSchema>;
export type PostData = z.infer<typeof PostSchema>;
export type PostCreate = z.infer<typeof PostCreateSchema>;
export type PostUpdate = z.infer<typeof PostUpdateSchema>;
export type PostCursor = z.infer<typeof PostCursorSchema>;

export type PostFilters = {
	authorId?: string;
	savedByUserId?: string;
	keyword?: string;
	tag?: string;
};

export type PostAuthor = {
	id: string;
	displayName: string;
};

export type PostRecipeSummary = {
	id: string;
	title: string;
	coverImgUrl: string | null;
};

export type PostView = Post & {
	author: PostAuthor | null;
	recipe: PostRecipeSummary | null;
	likeCount: number;
	commentCount: number;
	isLiked: boolean;
	isSaved: boolean;
};

export type PostWithDetails = PostView & {
	tags: PostTag[];
};

export type GetPostsResult = {
	data: PostWithDetails[];
	cursor: PostCursor | null;
};

export class Post implements PostData {
	id!: string;
	authorId?: string | null;
	title!: string;
	content!: string;
	status?: PostStatus;
	createdAt?: Date;
	updatedAt?: Date;

	constructor(data?: Partial<PostData>) {
		if (data) {
			Object.assign(this, data);
		}
	}
}
