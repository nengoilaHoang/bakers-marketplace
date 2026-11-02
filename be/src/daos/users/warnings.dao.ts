import db from '#/db/index.js';
import type { Knex } from 'knex';
import {
	Warning,
	type WarningReport,
	type WarningView,
} from '#/models/users/warnings.model.js';

type WarningViewRow = {
	id: string;
	reason: string;
	issuedBy: string | null;
	issuerDisplayName: string | null;
	createdAt: Date;
};

type WarningReportRow = WarningReport & {
	warningId: string;
};

class WarningDAO {
	private readonly tableName = 'warnings';
	private readonly reportsTableName = 'warning_reports';
	private db = db;

	public async create(
		warning: {
			userId: string;
			issuedBy: string;
			reason: string;
		},
		trx?: Knex.Transaction,
	): Promise<Warning> {
		const [created] = await (trx ?? this.db.instance)<Warning>(this.tableName)
			.insert(warning)
			.returning('*');

		return new Warning(created);
	}

	/** Records the reports a warning settled; a report can belong to one warning only. */
	public async linkReports(
		warningId: string,
		reportIds: string[],
		trx?: Knex.Transaction,
	): Promise<void> {
		if (reportIds.length === 0) {
			return;
		}

		await (trx ?? this.db.instance)(this.reportsTableName).insert(
			reportIds.map((reportId) => ({ warningId, reportId })),
		);
	}

	public async getByUserId(userId: string): Promise<WarningView[]> {
		const rows: WarningViewRow[] = await this.db.instance(`${this.tableName} as w`)
			.select(
				'w.id',
				'w.reason',
				'w.issuedBy',
				'issuer.displayname as issuerDisplayName',
				'w.createdAt',
			)
			.leftJoin('users as issuer', 'issuer.id', 'w.issuedBy')
			.where('w.userId', userId)
			.orderBy('w.createdAt', 'desc');

		const reportsByWarning = await this.getReports(rows.map((row) => row.id));

		return rows.map(({ issuedBy, issuerDisplayName, ...warning }) => ({
			...warning,
			issuedBy: issuedBy
				? { id: issuedBy, displayName: issuerDisplayName ?? '' }
				: null,
			reports: reportsByWarning.get(warning.id) ?? [],
		}));
	}

	private async getReports(warningIds: string[]): Promise<Map<string, WarningReport[]>> {
		const reportsByWarning = new Map<string, WarningReport[]>();

		if (warningIds.length === 0) {
			return reportsByWarning;
		}

		const rows: WarningReportRow[] = await this.db.instance(`${this.reportsTableName} as wr`)
			.select(
				'wr.warningId',
				'r.id',
				'r.reason',
				'pr.postId',
				'p.title as postTitle',
			)
			.join('reports as r', 'r.id', 'wr.reportId')
			.leftJoin('post_reports as pr', 'pr.id', 'r.id')
			.leftJoin('posts as p', 'p.id', 'pr.postId')
			.whereIn('wr.warningId', warningIds)
			.orderBy('r.createdAt', 'asc');

		for (const { warningId, ...report } of rows) {
			const reports = reportsByWarning.get(warningId) ?? [];
			reports.push(report);
			reportsByWarning.set(warningId, reports);
		}

		return reportsByWarning;
	}
}

export default new WarningDAO();
