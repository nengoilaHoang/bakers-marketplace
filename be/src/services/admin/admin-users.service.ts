import db from '#/db/index.js';
import adminUserDAO from '#/daos/admin/admin-users.dao.js';
import adminPostDAO from '#/daos/admin/admin-posts.dao.js';
import reportDAO from '#/daos/reports/reports.dao.js';
import userDAO from '#/daos/users/users.dao.js';
import sessionDAO from '#/daos/users/sessions.dao.js';
import warningDAO from '#/daos/users/warnings.dao.js';
import takedownDAO from '#/daos/takedowns/takedowns.dao.js';
import {
	BadRequestError,
	ConflictError,
	ForbiddenError,
	NotFoundError,
} from '#/utils/http-errors.js';
import type {
	AdminUserDetail,
	AdminUserQuery,
	AdminUserRow,
	AdminVendorQuery,
	AdminVendorRow,
	Paginated,
} from '#/models/admin/admin.model.js';
import type { UserInfo } from '#/models/users/users.model.js';
import type { WarningCreate } from '#/models/users/warnings.model.js';

class AdminUserService {
	private adminUserDAO = adminUserDAO;
	private reportDAO = reportDAO;

	public async getPage(query: AdminUserQuery): Promise<Paginated<AdminUserRow>> {
		return this.adminUserDAO.getUserPage(query);
	}

	public async getVendorPage(
		query: AdminVendorQuery,
	): Promise<Paginated<AdminVendorRow>> {
		return this.adminUserDAO.getVendorPage(query);
	}

	public async getById(id: string): Promise<AdminUserDetail> {
		const user = await this.getExistingUser(id);
		const [reports, warnings, bans] = await Promise.all([
			this.reportDAO.getByTargetUserId(id),
			warningDAO.getByUserId(id),
			takedownDAO.getBansByUserId(id),
		]);

		return { ...user, reports, warnings, bans };
	}

	/**
	 * With postId (warning from a post page), it settles every pending report about
	 * that post. Without it, it settles the pending reports about this user.
	 */
	public async warn(
		adminId: string,
		id: string,
		payload: WarningCreate,
	): Promise<AdminUserDetail> {
		await this.getModeratableUser(id);

		const { reason, postId } = payload;

		if (postId) {
			await this.assertPostAuthor(postId, id);
		}

		await db.instance.transaction(async (trx) => {
			const warning = await warningDAO.create(
				{ userId: id, issuedBy: adminId, reason },
				trx,
			);
			const reportIds = postId
				? await this.reportDAO.handlePendingForPost(
						postId,
						'RESOLVED',
						adminId,
						reason,
						trx,
					)
				: await this.reportDAO.handlePendingForUser(
						id,
						'RESOLVED',
						adminId,
						reason,
						trx,
					);

			// Remember exactly which reports this warning settled
			await warningDAO.linkReports(warning.id, reportIds, trx);
		});

		return this.getById(id);
	}

	/** Blocks the account, records the ban, signs it out everywhere and settles the reports about it. */
	public async ban(
		adminId: string,
		id: string,
		reason: string,
	): Promise<AdminUserDetail> {
		await this.getModeratableUser(id);

		await db.instance.transaction(async (trx) => {
			// The status switch is the guard: two admins cannot ban the same account twice
			if (!(await userDAO.updateStatus(id, 'BANNED', trx))) {
				throw new ConflictError('User is already banned');
			}

			await takedownDAO.createUserBan(id, adminId, reason, trx);
			await sessionDAO.deleteByUserId(id, trx);
			await this.reportDAO.handlePendingForUser(
				id,
				'RESOLVED',
				adminId,
				reason,
				trx,
			);
		});

		return this.getById(id);
	}

	public async unban(adminId: string, id: string): Promise<AdminUserDetail> {
		const user = await this.getExistingUser(id);

		// Checked up front so an unverified account is never switched to ACTIVE here
		if (user.status !== 'BANNED') {
			throw new ConflictError('User is not banned');
		}

		await db.instance.transaction(async (trx) => {
			if (!(await userDAO.updateStatus(id, 'ACTIVE', trx))) {
				throw new ConflictError('User is not banned');
			}

			await takedownDAO.revokeUserBan(id, adminId, trx);
		});

		return this.getById(id);
	}

	public async dismissReports(
		adminId: string,
		id: string,
		note?: string,
	): Promise<{ dismissed: number }> {
		await this.getExistingUser(id);

		const dismissedIds = await this.reportDAO.handlePendingForUser(
			id,
			'DISMISSED',
			adminId,
			note,
		);

		return { dismissed: dismissedIds.length };
	}

	/** A warning given from a post page must be about one of this user's posts. */
	private async assertPostAuthor(postId: string, userId: string): Promise<void> {
		const post = await adminPostDAO.getById(postId);

		if (!post) {
			throw new NotFoundError('Post not found');
		}

		if (post.author?.id !== userId) {
			throw new BadRequestError('Post is not by this user');
		}
	}

	/** Admins cannot be warned or banned, which also keeps an admin from locking themselves out. */
	private async getModeratableUser(id: string): Promise<UserInfo> {
		const user = await this.getExistingUser(id);

		if (user.role === 'ADMIN') {
			throw new ForbiddenError('Admin accounts cannot be moderated');
		}

		return user;
	}

	private async getExistingUser(id: string): Promise<UserInfo> {
		const user = await userDAO.getById(id);

		if (!user) {
			throw new NotFoundError('User not found');
		}

		return user;
	}
}

export default new AdminUserService();
