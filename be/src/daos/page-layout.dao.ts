import { CompositeComponent } from '#/models/layout-components/composite/composite-components.model.js';
import { Knex } from 'knex';
import layoutComponentDao, {
	LayoutComponentDao,
} from './layout-components.dao.js';
import database from '#/db/index.js';

export class PageLayoutDao {
	constructor(
		private readonly knex: Knex,
		private readonly layoutComponentDao: LayoutComponentDao,
	) {}

	public transaction = async (trx?: Knex.Transaction) => {
		return trx ?? (await this.knex.transaction());
	};

	public checkIfExists = async (
		pageId: string,
		releaseId?: string,
		storeId?: string,
	) => {
		const existsQuery = this.knex('page_layouts').where({
			id: pageId,
		});

		if (releaseId) {
			existsQuery.where({ storefrontReleaseId: releaseId });
		}

		if (storeId) {
			existsQuery.join(
				'storefront_releases',
				'storefront_releases.id',
				'=',
				'page_layouts.storefrontReleaseId',
			);
		}

		const exists = await existsQuery;
		return !!exists;
	};

	public updatePageLayout = async (
		pageId: string,
		root: CompositeComponent,
		trx?: Knex.Transaction,
	) => {
		return await this.knex.transaction(async (trx) => {
			const rootId = await this.layoutComponentDao.upsertLayoutComponent(
				root,
				trx,
			);

			// Attach root component to the page layout
			await trx('page_layouts')
				.where({ id: pageId })
				.update({ rootComponentId: rootId });

			return rootId;
		});
	};
}

const pageLayoutDao = new PageLayoutDao(database.instance, layoutComponentDao);
export default pageLayoutDao;
