import db from '#/db/index.js';
import type { Knex } from 'knex';
import type {
	AdminUserQuery,
	AdminUserRow,
	AdminVendorQuery,
	AdminVendorRow,
	Paginated,
} from '#/models/admin/admin.model.js';
import { paginate } from '#/utils/pagination.js';

const HAS_PENDING_REPORT_SQL = `EXISTS (
	SELECT 1 FROM user_reports ur JOIN reports r ON r.id = ur.id
	WHERE ur.target_user_id = u.id AND r.status = 'PENDING'
)`;

/** Users and vendors as admins see them, with moderation counts. */
class AdminUserDAO {
	private db = db;

	public async getUserPage(query: AdminUserQuery): Promise<Paginated<AdminUserRow>> {
		const filtered = this.db.instance('users as u');

		if (query.role) {
			filtered.where('u.role', query.role);
		}

		if (query.status) {
			filtered.where('u.status', query.status);
		}

		if (query.reported !== undefined) {
			filtered.whereRaw(query.reported ? HAS_PENDING_REPORT_SQL : `NOT ${HAS_PENDING_REPORT_SQL}`);
		}

		this.whereKeyword(filtered, query.keyword);

		return paginate<AdminUserRow, AdminUserRow>(
			filtered,
			(page) => {
				const rows = page.select(
					'u.id',
					'u.email',
					'u.displayname as displayName',
					'u.role',
					'u.status',
					'u.createdAt',
					this.db.instance.raw(`(
						SELECT count(*) FROM user_reports ur JOIN reports r ON r.id = ur.id
						WHERE ur.target_user_id = u.id AND r.status = 'PENDING'
					)::int AS pending_report_count`),
					this.db.instance.raw(
						'(SELECT count(*) FROM warnings w WHERE w.user_id = u.id)::int AS warning_count',
					),
				);

				// Most reported first when the admin is going through reports
				return query.reported
					? rows.orderByRaw('pending_report_count DESC, u.id DESC')
					: rows.orderBy('u.createdAt', 'desc').orderBy('u.id', 'desc');
			},
			query,
			(row) => row,
		);
	}

	public async getVendorPage(
		query: AdminVendorQuery,
	): Promise<Paginated<AdminVendorRow>> {
		const filtered = this.db.instance('users as u')
			.join('vendors as v', 'v.id', 'u.id')
			.where('u.role', 'VENDOR');

		if (query.status) {
			filtered.where('u.status', query.status);
		}

		this.whereKeyword(filtered, query.keyword, true);

		return paginate<AdminVendorRow, AdminVendorRow>(
			filtered,
			(page) => page
				.select(
					'u.id',
					'u.email',
					'u.displayname as displayName',
					'u.status',
					this.db.instance.raw('rtrim(v.tax_code) AS tax_code'),
					'v.registeredAt',
					'u.createdAt',
					this.db.instance.raw(
						'(SELECT string_agg(b.name, \', \' ORDER BY b.created_at) FROM brands b WHERE b.vendor_id = u.id) AS brand_name',
					),
				)
				.orderBy('v.registeredAt', 'desc')
				.orderBy('u.id', 'desc'),
			query,
			(row) => row,
		);
	}

	private whereKeyword(
		query: Knex.QueryBuilder,
		keyword: string | undefined,
		includeBrands = false,
	): void {
		if (!keyword) {
			return;
		}

		const pattern = `%${keyword}%`;

		query.where((builder) => {
			builder
				.whereRaw('u.email ILIKE ?', [pattern])
				.orWhereRaw('unaccent(u.displayname) ILIKE unaccent(?)', [pattern]);

			if (includeBrands) {
				builder.orWhereRaw(
					'EXISTS (SELECT 1 FROM brands b WHERE b.vendor_id = u.id AND unaccent(b.name) ILIKE unaccent(?))',
					[pattern],
				);
			}
		});
	}
}

export default new AdminUserDAO();
