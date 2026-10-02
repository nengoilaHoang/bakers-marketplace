import db from '#/db/index.js';

class PostSaveDAO {
	private readonly tableName = 'post_saves';
	private db = db;

	public async create(postId: string, userId: string): Promise<void> {
		await this.db.instance(this.tableName)
			.insert({ postId, userId })
			.onConflict(['user_id', 'post_id'])
			.ignore();
	}

	public async delete(postId: string, userId: string): Promise<boolean> {
		const deleted = await this.db.instance(this.tableName)
			.where({ postId, userId })
			.del();

		return deleted > 0;
	}
}

export default new PostSaveDAO();
