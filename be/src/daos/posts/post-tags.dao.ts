import db from '#/db/index.js';
import type { Knex } from 'knex';
import { PostTag } from '#/models/posts/post-tags.model.js';

class PostTagDAO {
	private readonly tableName = 'post_tags';
	private db = db;

	public async getAllByPostIds(postIds: string[]): Promise<PostTag[]> {
		if (postIds.length === 0) {
			return [];
		}

		const data = await this.db.instance<PostTag>(this.tableName)
			.whereIn('postId', postIds)
			.orderBy('name', 'asc');

		return data.map((tag) => new PostTag(tag));
	}

	public async replaceByPostId(
		postId: string,
		names: string[],
		trx?: Knex.Transaction,
	): Promise<PostTag[]> {
		if (trx) {
			await trx(this.tableName).where('postId', postId).del();

			if (names.length === 0) {
				return [];
			}

			const created = await trx<PostTag>(this.tableName)
				.insert(names.map((name) => ({ postId, name })))
				.returning('*');

			return created.map((tag) => new PostTag(tag));
		}

		return this.db.instance.transaction(
			(transaction) => this.replaceByPostId(postId, names, transaction),
		);
	}
}

export default new PostTagDAO();
