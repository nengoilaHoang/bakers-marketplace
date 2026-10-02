import postLikeDAO from '#/daos/posts/post-likes.dao.js';
import postService from '#/services/posts/posts.service.js';

export type PostLikeStatus = {
	liked: boolean;
	likeCount: number;
};

class PostLikeService {
	private postLikeDAO = postLikeDAO;

	public async like(userId: string, postId: string): Promise<PostLikeStatus> {
		await postService.assertPostExists(postId);
		await this.postLikeDAO.create(postId, userId);

		return {
			liked: true,
			likeCount: await this.postLikeDAO.countByPostId(postId),
		};
	}

	public async unlike(
		userId: string,
		postId: string,
	): Promise<PostLikeStatus> {
		await postService.assertPostExists(postId);
		await this.postLikeDAO.delete(postId, userId);

		return {
			liked: false,
			likeCount: await this.postLikeDAO.countByPostId(postId),
		};
	}
}

export default new PostLikeService();
