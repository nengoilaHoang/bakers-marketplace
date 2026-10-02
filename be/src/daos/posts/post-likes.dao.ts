import db from '#/db/index.js';

class PostLikeDAO {
	private readonly tableName = 'post_likes';
	private db = db;

	public async create(postId: string, userId: string): Promise<void> {
		await this.db.instance(this.tableName)
			.insert({ postId, userId })
			.onConflict(['post_id', 'user_id'])
			.ignore();
	}

	public async delete(postId: string, userId: string): Promise<boolean> {
		const deleted = await this.db.instance(this.tableName)
			.where({ postId, userId })
			.del();

		return deleted > 0;
	}

	public async countByPostId(postId: string): Promise<number> {
		const row = await this.db.instance(this.tableName)
			.count('* as count')
			.where('postId', postId)
			.first<{ count: string | number }>();

		return Number(row?.count ?? 0);
	}
}

export default new PostLikeDAO();
