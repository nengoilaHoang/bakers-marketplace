import { z } from 'zod';

import type { PostAuthor } from '#/models/posts/posts.model.js';

export const PostCommentSchema = z.object({
	id: z.uuidv4().optional(),
	postId: z.uuidv4(),
	userId: z.uuidv4().nullable().optional(),
	parentCommentId: z.uuidv4().nullable().optional(),
	content: z.string().trim().min(1).max(2000),
	createdAt: z.date().optional(),
});

export const PostCommentCreateSchema = PostCommentSchema.pick({
	parentCommentId: true,
	content: true,
});

export type PostCommentData = z.infer<typeof PostCommentSchema>;
export type PostCommentCreate = z.infer<typeof PostCommentCreateSchema>;

export type PostCommentWithAuthor = PostComment & {
	author: PostAuthor | null;
};

export class PostComment implements PostCommentData {
	id!: string;
	postId!: string;
	userId?: string | null;
	parentCommentId?: string | null;
	content!: string;
	createdAt?: Date;

	constructor(data?: Partial<PostCommentData>) {
		if (data) {
			Object.assign(this, data);
		}
	}
}
