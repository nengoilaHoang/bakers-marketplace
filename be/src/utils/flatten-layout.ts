import { LayoutComponent } from '#/models/layout-components/layout-components.model.js';
import { FlattenLayoutTree } from '#/services/layout-component.service.js';
import { z } from 'zod';

const flattenTreeLayout = (component: LayoutComponent): FlattenLayoutTree => {
	const result: FlattenLayoutTree = {
		layoutComponents: [],
		leafComponents: [],
		compositeComponents: [],
		compositeComponentChildren: [],
		repeaterComponents: [],
		commerceComponents: [],
	};

	const traverseComponent = (component: LayoutComponent): string => {
		result.layoutComponents.push({
			id: component.id,
			name: component.name,
			description: component.description,
			config: z.json().parse(component.config ?? {}),
		});

		switch (component.type) {
			case 'COMPOSITE': {
				result.compositeComponents.push({
					id: component.id,
					componentType: component.componentType,
				});

				const childEntries =
					component.children instanceof Map
						? component.children.entries()
						: Object.entries(component.children ?? {});

				for (const [order, child] of childEntries) {
					const childId = traverseComponent(child as LayoutComponent);
					result.compositeComponentChildren.push({
						compositeId: component.id,
						childId,
						sortOrder: Number(order),
					});
				}
				break;
			}
			case 'LEAF': {
				result.leafComponents.push({
					id: component.id,
					componentType: component.componentType,
				});
				break;
			}
			case 'REPEATER': {
				let itemTemplateId = null;
				if (component.itemTemplate) {
					itemTemplateId = traverseComponent(
						component.itemTemplate as LayoutComponent,
					);
				}
				result.repeaterComponents.push({
					id: component.id,
					componentType: component.componentType,
					itemTemplateId: itemTemplateId,
				});
				break;
			}
			case 'COMMERCE': {
				result.commerceComponents.push({
					id: component.id,
					componentType: component.componentType,
				});
				break;
			}
		}
		return component.id;
	};

	traverseComponent(component);
	return result;
};

export default flattenTreeLayout;
