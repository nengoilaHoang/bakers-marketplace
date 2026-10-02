import db from '#/db/index.js';
import { PostReport } from '#/models/posts/post-reports.model.js';

type ReportRow = {
	id: string;
	reporterId: string | null;
	reason: string;
	createdAt: Date;
};

class PostReportDAO {
	private readonly reportsTableName = 'reports';
	private readonly tableName = 'post_reports';
	private db = db;

	public async create(
		postId: string,
		reporterId: string,
		reason: string,
	): Promise<PostReport> {
		return this.db.instance.transaction(async (trx) => {
			const [report] = await trx<ReportRow>(this.reportsTableName)
				.insert({ reporterId, reason })
				.returning('*');

			await trx(this.tableName).insert({ id: report.id, postId });

			return new PostReport({ ...report, postId });
		});
	}

	public async hasReported(
		postId: string,
		reporterId: string,
	): Promise<boolean> {
		return Boolean(
			await this.db.instance(`${this.tableName} as pr`)
				.select('pr.id')
				.join(`${this.reportsTableName} as r`, 'r.id', 'pr.id')
				.where({ 'pr.postId': postId, 'r.reporterId': reporterId })
				.first(),
		);
	}
}

export default new PostReportDAO();
