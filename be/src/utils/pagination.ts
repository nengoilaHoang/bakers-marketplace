import type { Knex } from 'knex';

import type { PageQuery, Paginated } from '#/models/admin/admin.model.js';

/**
 * Counts the rows of `filtered`, then reads one page of them through `readPage`.
 * `filtered` holds only the table and the filters: no select, join for display, or order.
 */
export async function paginate<Row, Item>(
	filtered: Knex.QueryBuilder,
	readPage: (query: Knex.QueryBuilder) => Knex.QueryBuilder,
	{ page, pageSize }: PageQuery,
	toItem: (row: Row) => Item,
): Promise<Paginated<Item>> {
	const [countRow, rows] = await Promise.all([
		filtered.clone().count({ total: '*' }).first(),
		readPage(filtered.clone())
			.limit(pageSize)
			.offset((page - 1) * pageSize),
	]);

	return {
		data: (rows as Row[]).map(toItem),
		pagination: {
			page,
			pageSize,
			total: Number(countRow?.total ?? 0),
		},
	};
}
