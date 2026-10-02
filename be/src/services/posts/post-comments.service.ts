import postCommentDAO from '#/daos/posts/post-comments.dao.js';
import postService from '#/services/posts/posts.service.js';
import {
	BadRequestError,
	ForbiddenError,
	NotFoundError,
} from '#/utils/http-errors.js';
import type {
	PostComment,
	PostCommentCreate,
	PostCommentWithAuthor,
} from '#/models/posts/post-comments.model.js';

class PostCommentService {
	private postCommentDAO = postCommentDAO;

	public async getAllByPostId(
		postId: string,
	): Promise<PostCommentWithAuthor[]> {
		await postService.assertPostExists(postId);

		return this.postCommentDAO.getAllByPostId(postId);
	}

	public async create(
		userId: string,
		postId: string,
		payload: PostCommentCreate,
	): Promise<PostCommentWithAuthor> {
		await postService.assertPostExists(postId);

		if (payload.parentCommentId) {
			const parentComment = await this.postCommentDAO.getById(
				payload.parentCommentId,
			);

			if (!parentComment || parentComment.postId !== postId) {
				throw new BadRequestError(
					'Parent comment does not belong to this post',
				);
			}
		}

		const createdComment = await this.postCommentDAO.create(
			userId,
			postId,
			payload,
		);
		const comment = await this.postCommentDAO.getById(createdComment.id);

		if (!comment) {
			throw new NotFoundError('Comment not found');
		}

		return comment;
	}

	/** The comment author or the post author can delete a comment. */
	public async delete(
		userId: string,
		postId: string,
		commentId: string,
	): Promise<PostComment> {
		const comment = await this.postCommentDAO.getById(commentId);

		if (!comment || comment.postId !== postId) {
			throw new NotFoundError('Comment not found');
		}

		const canDelete = comment.userId === userId
			|| (await postService.checkPostOwner(userId, postId));

		if (!canDelete) {
			throw new ForbiddenError(
				'You do not have permission to delete this comment',
			);
		}

		const deletedComment = await this.postCommentDAO.delete(commentId);

		if (!deletedComment) {
			throw new NotFoundError('Comment not found');
		}

		return deletedComment;
	}
}

export default new PostCommentService();
