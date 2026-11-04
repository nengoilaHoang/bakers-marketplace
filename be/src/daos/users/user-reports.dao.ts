import db from '#/db/index.js';
import { UserReport } from '#/models/users/user-reports.model.js';

type ReportRow = {
	id: string;
	reporterId: string | null;
	reason: string;
	createdAt: Date;
};

class UserReportDAO {
	private readonly reportsTableName = 'reports';
	private readonly tableName = 'user_reports';
	private db = db;

	public async create(
		targetUserId: string,
		reporterId: string,
		reason: string,
	): Promise<UserReport> {
		return this.db.instance.transaction(async (trx) => {
			const [report] = await trx<ReportRow>(this.reportsTableName)
				.insert({ reporterId, reason })
				.returning('*');

			await trx(this.tableName).insert({ id: report.id, targetUserId });

			return new UserReport({ ...report, targetUserId });
		});
	}

	/** A user can report the same person again once the previous report was handled. */
	public async hasPendingReport(
		targetUserId: string,
		reporterId: string,
	): Promise<boolean> {
		return Boolean(
			await this.db.instance(`${this.tableName} as ur`)
				.select('ur.id')
				.join(`${this.reportsTableName} as r`, 'r.id', 'ur.id')
				.where({
					'ur.targetUserId': targetUserId,
					'r.reporterId': reporterId,
					'r.status': 'PENDING',
				})
				.first(),
		);
	}
}

export default new UserReportDAO();
