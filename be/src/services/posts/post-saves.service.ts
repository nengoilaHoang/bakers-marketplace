import postSaveDAO from '#/daos/posts/post-saves.dao.js';
import postService from '#/services/posts/posts.service.js';

export type PostSaveStatus = {
	saved: boolean;
};

class PostSaveService {
	private postSaveDAO = postSaveDAO;

	public async save(userId: string, postId: string): Promise<PostSaveStatus> {
		await postService.assertPostExists(postId);
		await this.postSaveDAO.create(postId, userId);

		return { saved: true };
	}

	public async unsave(
		userId: string,
		postId: string,
	): Promise<PostSaveStatus> {
		await postService.assertPostExists(postId);
		await this.postSaveDAO.delete(postId, userId);

		return { saved: false };
	}
}

export default new PostSaveService();
