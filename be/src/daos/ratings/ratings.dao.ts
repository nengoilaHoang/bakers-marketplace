import db from '#/db/index.js';
import type { Knex } from 'knex';

/** Ratings of every kind (order_ratings now, recipe ratings later share this table). */
class RatingDAO {
	private readonly tableName = 'ratings';
	private db = db;

	public async createOrderRating(
		rating: {
			raterId: string;
			orderItemId: string;
			rating: number;
			comment?: string;
		},
		trx?: Knex.Transaction,
	): Promise<string> {
		const run = async (trx: Knex.Transaction) => {
			const { orderItemId, ...data } = rating;
			const [created] = await trx(this.tableName)
				.insert({ ...data, comment: data.comment ?? null })
				.returning('id');

			await trx('order_ratings').insert({ id: created.id, orderItemId });

			return created.id as string;
		};

		return trx ? run(trx) : this.db.instance.transaction(run);
	}
}

export default new RatingDAO();
