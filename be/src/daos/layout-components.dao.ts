import { Knex } from 'knex';
import {
	CreateLayoutComponent,
	LayoutComponent,
	UpdateLayoutComponent,
} from '#/models/layout-components/layout-components.model.js';
import database from '#/db/index.js';

export type ComponentNode =
	| LayoutComponent
	| CreateLayoutComponent
	| UpdateLayoutComponent;

export class LayoutComponentDao {
	constructor(private readonly knex: Knex) {}

	public transaction = async (trx?: Knex.Transaction) => {
		return trx ?? (await this.knex.transaction());
	};

	public upsertLayoutComponent = async (
		component: ComponentNode,
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
							component.itemTemplate as ComponentNode,
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
						const childEntries =
							component.children instanceof Map
								? Array.from(component.children.entries())
								: Object.entries(component.children);

						const upsertBatch = [];

						for (const [order, child] of childEntries) {
							const childId = await this.upsertLayoutComponent(
								child as ComponentNode,
								t,
							);

							upsertBatch.push({
								compositeId: componentId,
								childId: childId,
								sortOrder: order,
							});
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
}

const layoutComponentDao = new LayoutComponentDao(database.instance);
export default layoutComponentDao;
