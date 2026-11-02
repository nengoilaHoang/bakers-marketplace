import userReportDAO from '#/daos/users/user-reports.dao.js';
import userDAO from '#/daos/users/users.dao.js';
import {
	BadRequestError,
	ConflictError,
	NotFoundError,
} from '#/utils/http-errors.js';
import type {
	UserReport,
	UserReportCreate,
} from '#/models/users/user-reports.model.js';

class UserReportService {
	private userReportDAO = userReportDAO;

	public async report(
		reporterId: string,
		targetUserId: string,
		payload: UserReportCreate,
	): Promise<UserReport> {
		if (reporterId === targetUserId) {
			throw new BadRequestError('You cannot report yourself');
		}

		if (!(await userDAO.getById(targetUserId))) {
			throw new NotFoundError('User not found');
		}

		if (await this.userReportDAO.hasPendingReport(targetUserId, reporterId)) {
			throw new ConflictError('You have already reported this user');
		}

		return this.userReportDAO.create(targetUserId, reporterId, payload.reason);
	}
}

export default new UserReportService();
