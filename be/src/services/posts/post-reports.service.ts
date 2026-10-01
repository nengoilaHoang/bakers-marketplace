import postReportDAO from '#/daos/posts/post-reports.dao.js';
import postService from '#/services/posts/posts.service.js';
import { BadRequestError, ConflictError } from '#/utils/http-errors.js';
import type {
	PostReport,
	PostReportCreate,
} from '#/models/posts/post-reports.model.js';

class PostReportService {
	private postReportDAO = postReportDAO;

	public async report(
		userId: string,
		postId: string,
		payload: PostReportCreate,
	): Promise<PostReport> {
		await postService.assertPostExists(postId);

		if (await postService.checkPostOwner(userId, postId)) {
			throw new BadRequestError('You cannot report your own post');
		}

		if (await this.postReportDAO.hasReported(postId, userId)) {
			throw new ConflictError('You have already reported this post');
		}

		return this.postReportDAO.create(postId, userId, payload.reason);
	}
}

export default new PostReportService();
