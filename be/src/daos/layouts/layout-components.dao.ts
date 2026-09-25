import { Knex } from 'knex';
import database from '#/db/index.js';
import { PutLayoutComponent } from '#/models/layout-components/layout-components.model.js';
import { NotFoundError } from '#/utils/http-errors.js';

export class LayoutComponentDao {
	constructor(private readonly knex: Knex) {}

	public transaction = async (trx?: Knex.Transaction) => {
		return trx ?? (await this.knex.transaction());
	};

	public upsertLayoutComponent = async (
		component: PutLayoutComponent,
		trx?: Knex.Transaction,
	): Promise<string> => {
		const execute = async (t: Knex.Transaction): Promise<string> => {
			let componentId = component.id;

			if (componentId) {
				const updatable: Record<string, unknown> = {};
				if (component.name) updatable.name = component.name;
				if (component.description)
					updatable.description = component.description;
				if (component.config) updatable.config = component.config;

				if (Object.keys(updatable).length > 0) {
					await t('layout_components')
						.where({ id: componentId })
						.update(updatable);
				}
			} else {
				const [inserted] = await t('layout_components')
					.insert({
						name: component.name,
						description: component.description,
						config: component.config ?? {},
					})
					.returning('id');
				componentId = inserted.id as string;
			}

			switch (component.type) {
				case 'LEAF': {
					await t('leaf_components')
						.insert({
							id: componentId,
							componentType: component.componentType,
						})
						.onConflict('id')
						.merge();
					break;
				}

				case 'COMMERCE': {
					await t('commerce_components')
						.insert({
							id: componentId,
							componentType: component.componentType,
						})
						.onConflict('id')
						.merge();
					break;
				}

				case 'REPEATER': {
					let templateId: string | null = null;
					if ('itemTemplate' in component && component.itemTemplate) {
						templateId = await this.upsertLayoutComponent(
							component.itemTemplate as PutLayoutComponent,
							trx,
						);
					}

					await t('repeater_components')
						.insert({
							id: componentId,
							componentType: component.componentType,
							itemTemplateId: templateId,
						})
						.onConflict('id')
						.merge();
					break;
				}

				case 'COMPOSITE': {
					await t('composite_components')
						.insert({
							id: componentId,
							componentType: component.componentType,
						})
						.onConflict('id')
						.merge();

					if ('children' in component && component.children) {
						const upsertBatch = [];

						for (const breakpoint of ['desktop', 'tablet', 'mobile'] as const) {
							const breakpointChildren = component.children[breakpoint] ?? {};
							const entries = Object.entries(breakpointChildren);
							for (const [order, child] of entries) {
								const childId = await this.upsertLayoutComponent(
									child as PutLayoutComponent,
									t,
								);

								upsertBatch.push({
									compositeId: componentId,
									childId: childId,
									breakpoint,
									sortOrder: order,
								});
							}
						}

						const activeIds = await t('composite_component_children')
							.insert(upsertBatch)
							.onConflict(['compositeId', 'sortOrder'])
							.merge()
							.returning(['id'])
							.then((array) => array.map((value) => value.id as string));

						if (activeIds.length > 0) {
							await t('composite_component_children')
								.where({ compositeId: componentId })
								.whereNotIn('childId', activeIds)
								.del();
						} else {
							await t('composite_component_children')
								.where({ compositeId: componentId })
								.del();
						}
					}
					break;
				}
			}
			return componentId;
		};

		return await execute(await this.transaction(trx));
	};

	public deleteComponents = async (ids: string[], trx?: Knex.Transaction) => {
		if (ids.length === 0) return;
		const execute = async (t: Knex.Transaction) => {
			const affectedRows = await t('layout_components')
				.whereIn('id', ids)
				.del();

			if (affectedRows !== ids.length) {
				throw new NotFoundError(
					`Failed to delete all components. Expected to delete ${ids.length} but deleted ${affectedRows}`,
				);
			}
		};

		return await execute(await this.transaction(trx));
	};
}

const layoutComponentDao = new LayoutComponentDao(database.instance);
export default layoutComponentDao;
