import { LayoutComponent } from '@/types/layout-component';
import { CommerceComponent } from '@/types/layout-component/commerce-component';
import {
	CompositeComponent,
	ResponsiveValue,
} from '@/types/layout-component/composite-component';
import { LeafComponent } from '@/types/layout-component/leaf-component';
import { RepeaterComponent } from '@/types/layout-component/repeater-component';

export type FlattenCompositeComponent = Omit<CompositeComponent, 'children'> & {
	children: ResponsiveValue<Record<number, string>>;
};

export type FlattenRepeaterComponent = Omit<
	RepeaterComponent,
	'itemTemplate'
> & {
	itemTemplate: string | null;
};

export type FlattenComponent =
	| FlattenCompositeComponent
	| FlattenRepeaterComponent
	| LeafComponent
	| CommerceComponent;

const flattenLayout = (component: LayoutComponent): FlattenComponent[] => {
	const flattenComponents: FlattenComponent[] = [];
	switch (component.type) {
		case 'COMPOSITE': {
			const transformedChildren = Object.fromEntries(
				Object.entries(component.children).map(([bp, value]) => [
					bp,
					Object.fromEntries(
						Object.entries(value ?? {}).map(([slot, child]) => [
							slot,
							child.id,
						]),
					),
				]),
			) as ResponsiveValue<Record<number, string>>;

			const visitedChildIds = new Set<string>();

			const composite: FlattenCompositeComponent = {
				...component,
				children: transformedChildren,
			};
			Object.values(component.children).forEach((slots) => {
				if (slots) {
					Object.values(slots).forEach((child) => {
						if (child && !visitedChildIds.has(child.id)) {
							visitedChildIds.add(child.id);
							flattenComponents.push(...flattenLayout(child));
						}
					});
				}
			});

			flattenComponents.push(composite);
			break;
		}
		case 'REPEATER': {
			const repeater: FlattenRepeaterComponent = {
				...component,
				itemTemplate: component.itemTemplate?.id ?? null,
			};
			if (component.itemTemplate) {
				flattenComponents.push(...flattenLayout(component.itemTemplate));
			}
			flattenComponents.push(repeater);
			break;
		}
		case 'COMMERCE': {
			flattenComponents.push(component as CommerceComponent);
			break;
		}
		case 'LEAF': {
			flattenComponents.push(component as LeafComponent);
			break;
		}
		default:
			break;
	}

	return flattenComponents;
};

export default flattenLayout;
