import db from '#/db/index.js';
import type { Knex } from 'knex';
import type {
	AdminRecipeQuery,
	AdminRecipeRow,
	Paginated,
} from '#/models/admin/admin.model.js';
import { paginate } from '#/utils/pagination.js';

type AdminRecipeDbRow = Omit<AdminRecipeRow, 'author'> & {
	userId: string | null;
	authorDisplayName: string | null;
};

/**
 * Public recipes with their author, read-only for admins. Private recipes stay
 * with their owner, and snapshots are seen through the post they belong to.
 */
class AdminRecipeDAO {
	private readonly tableName = 'recipes';
	private db = db;

	public async getPage(
		query: AdminRecipeQuery,
	): Promise<Paginated<AdminRecipeRow>> {
		const filtered = this.publicRecipes();

		if (query.keyword) {
			const pattern = `%${query.keyword}%`;

			filtered.where((builder) => {
				builder
					.whereRaw('unaccent(r.title) ILIKE unaccent(?)', [pattern])
					.orWhereRaw('unaccent(r.description) ILIKE unaccent(?)', [pattern]);
			});
		}

		return paginate<AdminRecipeDbRow, AdminRecipeRow>(
			filtered,
			(page) => this.withRowColumns(page)
				.orderBy('r.createdAt', 'desc')
				.orderBy('r.id', 'desc'),
			query,
			(row) => this.toRow(row),
		);
	}

	public async getById(id: string): Promise<AdminRecipeRow | null> {
		const row: AdminRecipeDbRow | undefined = await this.withRowColumns(
			this.publicRecipes(),
		)
			.where('r.id', id)
			.first();

		return row ? this.toRow(row) : null;
	}

	private publicRecipes(): Knex.QueryBuilder {
		return this.db.instance(`${this.tableName} as r`)
			.where({ 'r.isPublic': true, 'r.isSnapshot': false });
	}

	private withRowColumns(query: Knex.QueryBuilder): Knex.QueryBuilder {
		return query
			.select(
				'r.id',
				'r.title',
				'r.description',
				'r.portion',
				'r.userId',
				'author.displayname as authorDisplayName',
				'r.createdAt',
				'r.updatedAt',
			)
			.leftJoin('users as author', 'author.id', 'r.userId');
	}

	private toRow(row: AdminRecipeDbRow): AdminRecipeRow {
		const { userId, authorDisplayName, ...recipe } = row;

		return {
			...recipe,
			author: userId
				? { id: userId, displayName: authorDisplayName ?? '' }
				: null,
		};
	}
}

export default new AdminRecipeDAO();
