import { LayoutComponent } from '@/types/layout-component';
import {
	CommerceComponent,
	CreateCommerceComponent,
	UpdateCommerceComponent,
} from '@/types/layout-component/commerce-component/commerce-component';
import {
	CreateGridCompositeComponent,
	GridCompositeComponent,
	UpdateGridCompositeComponent,
} from '@/types/layout-component/composite-component';
import {
	CreateLeafComponent,
	LeafComponent,
	UpdateLeafComponent,
} from '@/types/layout-component/leaf-component';
import {
	CollectionGridRepeaterComponent,
	CreateCollectionGridRepeaterComponent,
	UpdateCollectionGridRepeaterComponent,
} from '@/types/layout-component/repeater-component';

export type FlattenGridCompositeComponent = Omit<
  GridCompositeComponent,
  'children'
> & {
  children: string[] | undefined;
};

export type NewFlattenGridCompositeComponent = Omit<
  CreateGridCompositeComponent,
  'children'
> & {
  children?: string[] | undefined;
};

export type UpdateFlattenGridCompositeComponent = Omit<
  UpdateGridCompositeComponent,
  'children'
> & {
  children?: string[] | undefined;
};

export type FlattenCompositeComponent = FlattenGridCompositeComponent;

export type NewFlattenCompositeComponent = NewFlattenGridCompositeComponent;

export type UpdateFlattenCompositeComponent =
  UpdateFlattenGridCompositeComponent;

export type FlattenCollectionGridRepeaterComponent = Omit<
  CollectionGridRepeaterComponent,
  'itemTemplate'
> & {
  itemTemplate: string | null;
};

export type NewFlattenCollectionGridRepeaterComponent = Omit<
  CreateCollectionGridRepeaterComponent,
  'itemTemplate'
> & {
  itemTemplate?: string | null;
};

export type UpdateFlattenCollectionGridRepeaterComponent = Omit<
  UpdateCollectionGridRepeaterComponent,
  'itemTemplate'
> & {
  itemTemplate?: string | null;
};

export type FlattenRepeaterComponent = FlattenCollectionGridRepeaterComponent;

export type NewFlattenRepeaterComponent =
  NewFlattenCollectionGridRepeaterComponent;

export type UpdateFlattenRepeaterComponent =
  UpdateFlattenCollectionGridRepeaterComponent;

export type FlattenComponent =
  | FlattenCompositeComponent
  | FlattenRepeaterComponent
  | LeafComponent
  | CommerceComponent;

export type NewFlattenComponent =
  | NewFlattenCompositeComponent
  | NewFlattenRepeaterComponent
  | CreateLeafComponent
  | CreateCommerceComponent;

export type UpdateFlattenComponent =
  | UpdateFlattenCompositeComponent
  | UpdateFlattenRepeaterComponent
  | UpdateLeafComponent
  | UpdateCommerceComponent;

export type PutFlattenComponent = UpdateFlattenComponent | NewFlattenComponent;

const flattenLayout = (component: LayoutComponent): FlattenComponent[] => {
  const flattenComponents: FlattenComponent[] = [];
  switch (component.type) {
    case 'COMPOSITE': {
      const visitedChildIds = new Set<string>();

      const { children, ...rest } = component;
      const composite: FlattenCompositeComponent = {
        ...rest,
        children:
          children.length > 0 ? children.map((child) => child.id) : undefined,
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
