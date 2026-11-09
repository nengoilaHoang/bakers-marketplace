import { LayoutComponent } from '@/types/layout-component';
import { CommerceComponent } from '@/types/layout-component/commerce-component/commerce-component';
import { CompositeComponent } from '@/types/layout-component/composite-component';
import { LeafComponent } from '@/types/layout-component/leaf-component';
import { RepeaterComponent } from '@/types/layout-component/repeater-component';

export type FlattenCompositeComponent = Omit<CompositeComponent, 'children'> & {
	children: string[] | undefined;
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
      const visitedChildIds = new Set<string>();

      const { children, ...rest } = component;
      const composite: FlattenCompositeComponent = {
        ...rest,
				children: children.length > 0 ? children.map((child) => child.id) : undefined,
      };
      if (!component.slots) {
        flattenComponents.push(composite);
        break;
      }
      component.children.forEach((child) => {
        if (child && !visitedChildIds.has(child.id)) {
          visitedChildIds.add(child.id);
          flattenComponents.push(...flattenLayout(child));
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
