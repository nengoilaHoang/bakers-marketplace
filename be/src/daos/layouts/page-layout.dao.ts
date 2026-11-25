import database from '#/db/index.js';
import {
	InsertPageLayoutRecord,
	PageLayout,
	PageLayoutSchema,
	PageLayoutSummary,
	PageLayoutSummarySchema,
	UpdatePageLayoutRecord,
} from '#/models/storefronts/page-layouts.model.js';
import { Knex } from 'knex';
import z from 'zod';

export class PageLayoutDao {
  constructor(private readonly knex: Knex) {}

  public withTransaction = async <T>(
    action: (trx: Knex.Transaction) => Promise<T>,
    trx?: Knex.Transaction,
  ): Promise<T> => {
    // If an external transaction exists, participate in it without closing it
    if (trx) {
      return action(trx);
    }
    // Otherwise, create a managed transaction that auto-commits and auto-rollbacks
    return this.knex.transaction(action);
  };

  public getReleasePages = async (releaseId: string): Promise<PageLayout[]> => {
    const rawData = await this.knex('page_layouts')
      .select(
        'id',
        'type',
        'name',
        'slug',
        this.knex.raw(`
          CASE 
            WHEN root_component_id IS NOT NULL 
            THEN get_layout_tree_json(root_component_id) 
            ELSE NULL 
          END AS root
        `),
      )
      .where({ storefrontReleaseId: releaseId });

    if (!rawData || rawData.length === 0) return [];

    return z.array(PageLayoutSchema).parse(rawData);
  };

  public getReleaseSummaryPages = async (
    releaseId: string,
  ): Promise<PageLayoutSummary[]> => {
    const rawData = await this.knex('page_layouts')
      .select('id', 'type', 'name', 'slug')
      .where({ storefrontReleaseId: releaseId });

    if (!rawData || rawData.length === 0) return [];

    return z.array(PageLayoutSummarySchema).parse(rawData);
  };

  createPage = async (
    payload: InsertPageLayoutRecord,
    trx?: Knex.Transaction,
  ) => {
    return await this.withTransaction(async (t) => {
      return await t('page_layouts')
        .insert({ ...payload })
        .returning('*');
    }, trx);
  };

  public updatePage = async (
    pageId: string,
    payload: UpdatePageLayoutRecord,
    trx?: Knex.Transaction,
  ) => {
    return await this.withTransaction(async (t) => {
      return await t('page_layouts').where({ id: pageId }).update(payload);
    }, trx);
  };

  public getNavPages = async (domain: string) => {
    const rows = await this.knex('page_layouts as pl')
      .join('storefront_releases as sr', 'sr.id', 'pl.storefrontReleaseId')
      .join('storefronts as s', 's.id', 'sr.storefrontId')
      .join('brands as b', 'b.id', 's.brandId')
      .select('pl.id', 'pl.name', 'pl.slug', 'pl.type')
      .where({ 'b.domain': domain, 'sr.isActive': true });

    return rows.map((row) => ({
      id: row.id as string,
      name: row.name as string,
      slug: row.slug as string,
      type: row.type as string,
    }));
  };
}

const pageLayoutDao = new PageLayoutDao(database.instance);
export default pageLayoutDao;
