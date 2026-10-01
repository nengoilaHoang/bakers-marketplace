import type { Request, Response } from 'express';

import { z } from 'zod';

import asyncHandler from '#/utils/asyncHandler.js';

import postService from '#/services/posts/posts.service.js';
import postCommentService from '#/services/posts/post-comments.service.js';
import postLikeService from '#/services/posts/post-likes.service.js';
import postSaveService from '#/services/posts/post-saves.service.js';
import postReportService from '#/services/posts/post-reports.service.js';

import {
	PostCreateSchema,
	PostCursorSchema,
	PostUpdateSchema,
	type PostCursor,
} from '#/models/posts/posts.model.js';
import { PostCommentCreateSchema } from '#/models/posts/post-comments.model.js';
import { PostReportCreateSchema } from '#/models/posts/post-reports.model.js';

const PostIdParamsSchema = z.object({
	id: z.uuidv4(),
});

const UserIdParamsSchema = z.object({
	userId: z.uuidv4(),
});

const CommentParamsSchema = PostIdParamsSchema.extend({
	commentId: z.uuidv4(),
});

type AuthenticatedRequest = Request & {
	userId: string;
};

type OptionalAuthenticatedRequest = Request & {
	userId?: string;
};

function readQueryString(value: unknown): string {
	return typeof value === 'string' ? value : '';
}

function readCursor(query: Request['query']): PostCursor | undefined {
	const { createdAt, id } = query;

	if (createdAt === undefined && id === undefined) {
		return undefined;
	}

	return PostCursorSchema.parse({ createdAt, id });
}

class PostController {
	private postService = postService;
	private postCommentService = postCommentService;
	private postLikeService = postLikeService;
	private postSaveService = postSaveService;
	private postReportService = postReportService;

	public getPosts = asyncHandler(
		async (req: OptionalAuthenticatedRequest, res: Response): Promise<void> => {
			const posts = await this.postService.getPosts(
				readCursor(req.query),
				req.userId,
			);

			res.status(200).json({ data: posts });
		},
	);

	public search = asyncHandler(
		async (req: OptionalAuthenticatedRequest, res: Response): Promise<void> => {
			const posts = await this.postService.search(
				readQueryString(req.query.q),
				readQueryString(req.query.tag),
				readCursor(req.query),
				req.userId,
			);

			res.status(200).json({ data: posts });
		},
	);

	public getMine = asyncHandler(
		async (req: AuthenticatedRequest, res: Response): Promise<void> => {
			const posts = await this.postService.getByAuthorId(
				req.userId,
				readCursor(req.query),
				req.userId,
			);

			res.status(200).json({ data: posts });
		},
	);

	public getSaved = asyncHandler(
		async (req: AuthenticatedRequest, res: Response): Promise<void> => {
			const posts = await this.postService.getSaved(
				req.userId,
				readCursor(req.query),
			);

			res.status(200).json({ data: posts });
		},
	);

	public getByUserId = asyncHandler(
		async (req: OptionalAuthenticatedRequest, res: Response): Promise<void> => {
			const { userId } = UserIdParamsSchema.parse(req.params);

			const posts = await this.postService.getByAuthorId(
				userId,
				readCursor(req.query),
				req.userId,
			);

			res.status(200).json({ data: posts });
		},
	);

	public getById = asyncHandler(
		async (req: OptionalAuthenticatedRequest, res: Response): Promise<void> => {
			const { id } = PostIdParamsSchema.parse(req.params);

			const post = await this.postService.getById(id, req.userId);

			if (!post) {
				res.status(404).json({ message: 'Post not found' });

				return;
			}

			res.status(200).json({ data: post });
		},
	);

	public create = asyncHandler(
		async (req: AuthenticatedRequest, res: Response): Promise<void> => {
			const input = PostCreateSchema.parse(req.body);

			const post = await this.postService.create(req.userId, input);

			res.status(201).json({ data: post });
		},
	);

	public update = asyncHandler(
		async (req: AuthenticatedRequest, res: Response): Promise<void> => {
			const { id } = PostIdParamsSchema.parse(req.params);
			const input = PostUpdateSchema.parse(req.body);

			const post = await this.postService.update(req.userId, id, input);

			res.status(200).json({ data: post });
		},
	);

	public delete = asyncHandler(
		async (req: AuthenticatedRequest, res: Response): Promise<void> => {
			const { id } = PostIdParamsSchema.parse(req.params);

			const post = await this.postService.delete(req.userId, id);

			res.status(200).json({ data: post });
		},
	);

	// ---------- likes ----------

	public like = asyncHandler(
		async (req: AuthenticatedRequest, res: Response): Promise<void> => {
			const { id } = PostIdParamsSchema.parse(req.params);

			const status = await this.postLikeService.like(req.userId, id);

			res.status(200).json({ data: status });
		},
	);

	public unlike = asyncHandler(
		async (req: AuthenticatedRequest, res: Response): Promise<void> => {
			const { id } = PostIdParamsSchema.parse(req.params);

			const status = await this.postLikeService.unlike(req.userId, id);

			res.status(200).json({ data: status });
		},
	);

	// ---------- saves ----------

	public save = asyncHandler(
		async (req: AuthenticatedRequest, res: Response): Promise<void> => {
			const { id } = PostIdParamsSchema.parse(req.params);

			const status = await this.postSaveService.save(req.userId, id);

			res.status(200).json({ data: status });
		},
	);

	public unsave = asyncHandler(
		async (req: AuthenticatedRequest, res: Response): Promise<void> => {
			const { id } = PostIdParamsSchema.parse(req.params);

			const status = await this.postSaveService.unsave(req.userId, id);

			res.status(200).json({ data: status });
		},
	);

	// ---------- reports ----------

	public report = asyncHandler(
		async (req: AuthenticatedRequest, res: Response): Promise<void> => {
			const { id } = PostIdParamsSchema.parse(req.params);
			const input = PostReportCreateSchema.parse(req.body);

			const report = await this.postReportService.report(
				req.userId,
				id,
				input,
			);

			res.status(201).json({ data: report });
		},
	);

	// ---------- comments ----------

	public getComments = asyncHandler(
		async (req: Request, res: Response): Promise<void> => {
			const { id } = PostIdParamsSchema.parse(req.params);

			const comments = await this.postCommentService.getAllByPostId(id);

			res.status(200).json({ data: comments });
		},
	);

	public createComment = asyncHandler(
		async (req: AuthenticatedRequest, res: Response): Promise<void> => {
			const { id } = PostIdParamsSchema.parse(req.params);
			const input = PostCommentCreateSchema.parse(req.body);

			const comment = await this.postCommentService.create(
				req.userId,
				id,
				input,
			);

			res.status(201).json({ data: comment });
		},
	);

	public deleteComment = asyncHandler(
		async (req: AuthenticatedRequest, res: Response): Promise<void> => {
			const { id, commentId } = CommentParamsSchema.parse(req.params);

			const comment = await this.postCommentService.delete(
				req.userId,
				id,
				commentId,
			);

			res.status(200).json({ data: comment });
		},
	);
}

export default new PostController();
