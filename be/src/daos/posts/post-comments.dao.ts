import db from '#/db/index.js';
import {
	PostComment,
	type PostCommentCreate,
	type PostCommentWithAuthor,
} from '#/models/posts/post-comments.model.js';

type PostCommentRow = PostComment & {
	authorDisplayName: string | null;
};

class PostCommentDAO {
	private readonly tableName = 'post_comments';
	private db = db;

	public async getAllByPostId(
		postId: string,
	): Promise<PostCommentWithAuthor[]> {
		const rows: PostCommentRow[] = await this.selectWithAuthor()
			.where('c.postId', postId)
			.orderBy('c.createdAt', 'asc')
			.orderBy('c.id', 'asc');

		return rows.map((row) => this.toCommentWithAuthor(row));
	}

	public async getById(id: string): Promise<PostCommentWithAuthor | null> {
		const row: PostCommentRow | undefined = await this.selectWithAuthor()
			.where('c.id', id)
			.first();

		if (!row) {
			return null;
		}

		return this.toCommentWithAuthor(row);
	}

	public async create(
		userId: string,
		postId: string,
		comment: PostCommentCreate,
	): Promise<PostComment> {
		const [createdComment] = await this.db.instance<PostComment>(
			this.tableName,
		)
			.insert({
				postId,
				userId,
				parentCommentId: comment.parentCommentId ?? null,
				content: comment.content,
			})
			.returning('*');

		return new PostComment(createdComment);
	}

	public async delete(id: string): Promise<PostComment | null> {
		const [deletedComment] = await this.db.instance<PostComment>(
			this.tableName,
		)
			.where('id', id)
			.del()
			.returning('*');

		if (!deletedComment) {
			return null;
		}

		return new PostComment(deletedComment);
	}

	private selectWithAuthor() {
		return this.db.instance(`${this.tableName} as c`)
			.select('c.*', 'u.displayname as authorDisplayName')
			.leftJoin('users as u', 'u.id', 'c.userId');
	}

	private toCommentWithAuthor(row: PostCommentRow): PostCommentWithAuthor {
		const { authorDisplayName, ...comment } = row;

		return {
			...new PostComment(comment),
			author: comment.userId
				? { id: comment.userId, displayName: authorDisplayName ?? '' }
				: null,
		};
	}
}

export default new PostCommentDAO();
