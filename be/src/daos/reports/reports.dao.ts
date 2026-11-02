import db from '#/db/index.js';
import type { Knex } from 'knex';
import type {
	ReportStatus,
	ReportTarget,
	ReportView,
} from '#/models/reports/reports.model.js';

type ReportViewRow = {
	id: string;
	reason: string;
	status: ReportStatus;
	reporterId: string | null;
	reporterDisplayName: string | null;
	handledBy: string | null;
	handlerDisplayName: string | null;
	handledAt: Date | null;
	note: string | null;
	createdAt: Date;
};

type HandledStatus = Exclude<ReportStatus, 'PENDING'>;

/** Reads and handles reports of every kind (post_reports and user_reports share this table). */
class ReportDAO {
	private readonly tableName = 'reports';
	private db = db;

	public async getTargetById(id: string): Promise<ReportTarget | null> {
		const row: ReportTarget | undefined = await this.db.instance(`${this.tableName} as r`)
			.select('r.id', 'r.status', 'pr.postId', 'ur.targetUserId')
			.leftJoin('post_reports as pr', 'pr.id', 'r.id')
			.leftJoin('user_reports as ur', 'ur.id', 'r.id')
			.where('r.id', id)
			.first();

		return row ?? null;
	}

	public async getByPostId(postId: string): Promise<ReportView[]> {
		const rows: ReportViewRow[] = await this.selectViews()
			.join('post_reports as pr', 'pr.id', 'r.id')
			.where('pr.postId', postId);

		return rows.map((row) => this.toView(row));
	}

	public async getByTargetUserId(userId: string): Promise<ReportView[]> {
		const rows: ReportViewRow[] = await this.selectViews()
			.join('user_reports as ur', 'ur.id', 'r.id')
			.where('ur.targetUserId', userId);

		return rows.map((row) => this.toView(row));
	}

	/** Returns false when the report is not pending anymore. */
	public async handle(
		id: string,
		status: HandledStatus,
		handledBy: string,
		note?: string,
		trx?: Knex.Transaction,
	): Promise<boolean> {
		const updated = await this.pending(trx)
			.where('id', id)
			.update(this.handledData(status, handledBy, note, trx));

		return updated > 0;
	}

	/** Handles every pending report about a post at once; returns the ids it handled. */
	public async handlePendingForPost(
		postId: string,
		status: HandledStatus,
		handledBy: string,
		note?: string,
		trx?: Knex.Transaction,
	): Promise<string[]> {
		const knex = trx ?? this.db.instance;
		const handled: { id: string }[] = await this.pending(trx)
			.whereIn('id', knex('post_reports').select('id').where('postId', postId))
			.update(this.handledData(status, handledBy, note, trx))
			.returning('id');

		return handled.map(({ id }) => id);
	}

	/** Handles every pending report about a user at once; returns the ids it handled. */
	public async handlePendingForUser(
		targetUserId: string,
		status: HandledStatus,
		handledBy: string,
		note?: string,
		trx?: Knex.Transaction,
	): Promise<string[]> {
		const knex = trx ?? this.db.instance;
		const handled: { id: string }[] = await this.pending(trx)
			.whereIn(
				'id',
				knex('user_reports').select('id').where('targetUserId', targetUserId),
			)
			.update(this.handledData(status, handledBy, note, trx))
			.returning('id');

		return handled.map(({ id }) => id);
	}

	private pending(trx?: Knex.Transaction): Knex.QueryBuilder {
		return (trx ?? this.db.instance)(this.tableName).where('status', 'PENDING');
	}

	private handledData(
		status: HandledStatus,
		handledBy: string,
		note: string | undefined,
		trx?: Knex.Transaction,
	): Record<string, unknown> {
		return {
			status,
			handledBy,
			handledAt: (trx ?? this.db.instance).fn.now(),
			note: note ?? null,
		};
	}

	private selectViews(): Knex.QueryBuilder {
		return this.db.instance(`${this.tableName} as r`)
			.select(
				'r.id',
				'r.reason',
				'r.status',
				'r.reporterId',
				'reporter.displayname as reporterDisplayName',
				'r.handledBy',
				'handler.displayname as handlerDisplayName',
				'r.handledAt',
				'r.note',
				'r.createdAt',
			)
			.leftJoin('users as reporter', 'reporter.id', 'r.reporterId')
			.leftJoin('users as handler', 'handler.id', 'r.handledBy')
			.orderBy('r.createdAt', 'desc')
			.orderBy('r.id', 'desc');
	}

	private toView(row: ReportViewRow): ReportView {
		return {
			id: row.id,
			reason: row.reason,
			status: row.status,
			reporter: row.reporterId
				? { id: row.reporterId, displayName: row.reporterDisplayName ?? '' }
				: null,
			handledBy: row.handledBy
				? { id: row.handledBy, displayName: row.handlerDisplayName ?? '' }
				: null,
			handledAt: row.handledAt,
			note: row.note,
			createdAt: row.createdAt,
		};
	}
}

export default new ReportDAO();
