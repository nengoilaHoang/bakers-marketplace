import db from '#/db/index.js';
import type { Knex } from 'knex';
import type {
	AdminPostQuery,
	AdminPostRow,
	Paginated,
} from '#/models/admin/admin.model.js';
import type { PostStatus } from '#/models/posts/posts.model.js';
import { paginate } from '#/utils/pagination.js';

type AdminPostDbRow = {
	id: string;
	title: string;
	content: string;
	status: PostStatus;
	authorId: string | null;
	authorDisplayName: string | null;
	pendingReportCount: number;
	reportCount: number;
	lastReportedAt: Date | null;
	createdAt: Date;
};

const HAS_PENDING_REPORT_SQL = `EXISTS (
	SELECT 1 FROM post_reports pr JOIN reports r ON r.id = pr.id
	WHERE pr.post_id = p.id AND r.status = 'PENDING'
)`;

/** Posts as admins see them: every status, with report counts. */
class AdminPostDAO {
	private readonly tableName = 'posts';
	private db = db;

	public async getPage(query: AdminPostQuery): Promise<Paginated<AdminPostRow>> {
		const filtered = this.db.instance(`${this.tableName} as p`);

		if (query.status) {
			filtered.where('p.status', query.status);
		}

		if (query.reported !== undefined) {
			filtered.whereRaw(query.reported ? HAS_PENDING_REPORT_SQL : `NOT ${HAS_PENDING_REPORT_SQL}`);
		}

		if (query.keyword) {
			const pattern = `%${query.keyword}%`;

			filtered.where((builder) => {
				builder
					.whereRaw('unaccent(p.title) ILIKE unaccent(?)', [pattern])
					.orWhereRaw('unaccent(p.content) ILIKE unaccent(?)', [pattern]);
			});
		}

		return paginate<AdminPostDbRow, AdminPostRow>(
			filtered,
			(page) => {
				const rows = this.withRowColumns(page);

				// Most reported first when the admin is going through reports
				return query.reported
					? rows.orderByRaw('pending_report_count DESC, last_reported_at DESC, p.id DESC')
					: rows.orderBy('p.createdAt', 'desc').orderBy('p.id', 'desc');
			},
			query,
			(row) => this.toRow(row),
		);
	}

	public async getById(id: string): Promise<AdminPostRow | null> {
		const row: AdminPostDbRow | undefined = await this.withRowColumns(
			this.db.instance(`${this.tableName} as p`),
		)
			.where('p.id', id)
			.first();

		return row ? this.toRow(row) : null;
	}

	/** Returns false when the post is missing or already has this status. */
	public async updateStatus(
		id: string,
		status: PostStatus,
		trx?: Knex.Transaction,
	): Promise<boolean> {
		const updated = await (trx ?? this.db.instance)(this.tableName)
			.where('id', id)
			.whereNot('status', status)
			.update({ status });

		return updated > 0;
	}

	private withRowColumns(query: Knex.QueryBuilder): Knex.QueryBuilder {
		const knex = this.db.instance;

		return query
			.select(
				'p.id',
				'p.title',
				'p.content',
				'p.status',
				'p.authorId',
				'author.displayname as authorDisplayName',
				'p.createdAt',
				knex.raw(`(
					SELECT count(*) FROM post_reports pr JOIN reports r ON r.id = pr.id
					WHERE pr.post_id = p.id AND r.status = 'PENDING'
				)::int AS pending_report_count`),
				knex.raw(
					'(SELECT count(*) FROM post_reports pr WHERE pr.post_id = p.id)::int AS report_count',
				),
				knex.raw(`(
					SELECT max(r.created_at) FROM post_reports pr JOIN reports r ON r.id = pr.id
					WHERE pr.post_id = p.id
				) AS last_reported_at`),
			)
			.leftJoin('users as author', 'author.id', 'p.authorId');
	}

	private toRow(row: AdminPostDbRow): AdminPostRow {
		const { authorId, authorDisplayName, ...post } = row;

		return {
			...post,
			author: authorId
				? { id: authorId, displayName: authorDisplayName ?? '' }
				: null,
		};
	}
}

export default new AdminPostDAO();
