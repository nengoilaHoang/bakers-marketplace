import reportDAO from '#/daos/reports/reports.dao.js';
import { ConflictError, NotFoundError } from '#/utils/http-errors.js';

class AdminReportService {
	private reportDAO = reportDAO;

	/** Dismisses a single report, leaving the other reports about the same target pending. */
	public async dismiss(
		adminId: string,
		id: string,
		note?: string,
	): Promise<void> {
		const report = await this.reportDAO.getTargetById(id);

		if (!report) {
			throw new NotFoundError('Report not found');
		}

		if (!(await this.reportDAO.handle(id, 'DISMISSED', adminId, note))) {
			throw new ConflictError('Report has already been handled');
		}
	}
}

export default new AdminReportService();
