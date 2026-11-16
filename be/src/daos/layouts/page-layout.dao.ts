import database from '#/db/index.js';
import { PutLayoutComponent } from '#/models/layout-components/layout-components.model.js';
import { PageLayoutSchema } from '#/models/storefronts/page-layouts.model.js';
import { Knex } from 'knex';
import z from 'zod';
import layoutComponentDao, {
	LayoutComponentDao,
} from '../layouts/layout-components.dao.js';

export class PageLayoutDao {
  constructor(
    private readonly knex: Knex,
    private readonly layoutComponentDao: LayoutComponentDao,
  ) {}

  public transaction = async (trx?: Knex.Transaction) => {
    return trx ?? (await this.knex.transaction());
  };

  public getReleaseLayouts = async (releaseId: string) => {
    const rawData = await this.knex('page_layouts')
      .select(
        'id',
        'type',
        'name',
        this.knex.raw(`
          CASE 
            WHEN root_component_id IS NOT NULL 
            THEN get_layout_tree_json(root_component_id) 
            ELSE NULL 
          END AS root
        `),
      )
      .where({ storefrontReleaseId: releaseId });

    if (!rawData || rawData.length === 0) return null;

    return z.array(PageLayoutSchema).parse(rawData);
  };

  public updatePageLayout = async (
    pageId: string,
    root: PutLayoutComponent,
    trx?: Knex.Transaction,
  ) => {
    return await this.layoutComponentDao.withTransaction(async (t) => {
      const rootId = await this.layoutComponentDao.upsertLayoutComponent(
        root,
        t,
      );

      // Attach root component to the page layout
      await t('page_layouts')
        .where({ id: pageId })
        .update({ rootComponentId: rootId });

      return rootId;
    }, trx);
  };

  public getNavPages = async (domain: string) => {
    const rows = await this.knex('page_layouts as pl')
      .join('storefront_releases as sr', 'sr.id', 'pl.storefrontReleaseId')
      .join('storefronts as s', 's.id', 'sr.storefrontId')
      .join('brands as b', 'b.id', 's.brandId')
      .select('pl.id', 'pl.name', 'pl.type')
      .where({ 'b.domain': domain, 'sr.isActive': true });

    return rows.map((row) => ({
      id: row.id as string,
      name: row.name as string,
      slug: row.type === 'HOME' ? '' : (row.name as string),
      type: row.type as string,
    }));
  };
}

const pageLayoutDao = new PageLayoutDao(database.instance, layoutComponentDao);
export default pageLayoutDao;
