import db from '#/db/index.js';
import adminPostDAO from '#/daos/admin/admin-posts.dao.js';
import reportDAO from '#/daos/reports/reports.dao.js';
import takedownDAO from '#/daos/takedowns/takedowns.dao.js';
import recipeService from '#/services/recipes/recipes.service.js';
import { ConflictError, NotFoundError } from '#/utils/http-errors.js';
import { extractRecipeIds } from '#/utils/post-content.js';
import type {
	AdminPostDetail,
	AdminPostQuery,
	AdminPostRow,
	Paginated,
} from '#/models/admin/admin.model.js';

/** The recipe attached to a post is its snapshot, with ingredients, steps and so on. */
type AttachedRecipe = Awaited<ReturnType<typeof recipeService.getById>>;

export type AdminPostView = AdminPostDetail & { recipe: AttachedRecipe };

class AdminPostService {
	private adminPostDAO = adminPostDAO;
	private reportDAO = reportDAO;

	public async getPage(query: AdminPostQuery): Promise<Paginated<AdminPostRow>> {
		return this.adminPostDAO.getPage(query);
	}

	public async getById(id: string): Promise<AdminPostView> {
		const post = await this.getExistingPost(id);
		const [recipeId] = extractRecipeIds(post.content);
		const [reports, removals, recipe] = await Promise.all([
			this.reportDAO.getByPostId(id),
			takedownDAO.getRemovalsByPostId(id),
			recipeId ? recipeService.getById(recipeId) : null,
		]);

		return { ...post, reports, removals, recipe };
	}

	/** Hides the post, records the removal and settles every pending report about it. */
	public async remove(
		adminId: string,
		id: string,
		reason: string,
	): Promise<AdminPostView> {
		await this.getExistingPost(id);

		await db.instance.transaction(async (trx) => {
			// The status switch is the guard: two admins cannot remove the same post twice
			if (!(await this.adminPostDAO.updateStatus(id, 'REMOVED', trx))) {
				throw new ConflictError('Post has already been removed');
			}

			await takedownDAO.createPostRemoval(id, adminId, reason, trx);
			await this.reportDAO.handlePendingForPost(
				id,
				'RESOLVED',
				adminId,
				reason,
				trx,
			);
		});

		return this.getById(id);
	}

	/** Lifts the removal in force; the reports it settled stay resolved. */
	public async restore(adminId: string, id: string): Promise<AdminPostView> {
		await this.getExistingPost(id);

		await db.instance.transaction(async (trx) => {
			if (!(await this.adminPostDAO.updateStatus(id, 'VISIBLE', trx))) {
				throw new ConflictError('Post is not removed');
			}

			await takedownDAO.revokePostRemoval(id, adminId, trx);
		});

		return this.getById(id);
	}

	public async dismissReports(
		adminId: string,
		id: string,
		note?: string,
	): Promise<{ dismissed: number }> {
		await this.getExistingPost(id);

		const dismissedIds = await this.reportDAO.handlePendingForPost(
			id,
			'DISMISSED',
			adminId,
			note,
		);

		return { dismissed: dismissedIds.length };
	}

	private async getExistingPost(id: string): Promise<AdminPostRow> {
		const post = await this.adminPostDAO.getById(id);

		if (!post) {
			throw new NotFoundError('Post not found');
		}

		return post;
	}
}

export default new AdminPostService();
