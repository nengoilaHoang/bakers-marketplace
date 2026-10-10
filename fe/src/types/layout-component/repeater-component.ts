import {
	BaseLayoutComponent,
	BaseLayoutComponentConfig,
	LayoutComponent,
} from '.';

export type RepeaterComponentType = 'COLLECTION_GRID' | 'COLLECTION_CAROUSEL';

export interface BaseRepeaterComponent<
  TConfig = BaseLayoutComponentConfig<unknown>,
> extends BaseLayoutComponent<TConfig> {
  type: 'REPEATER';
  componentType: RepeaterComponentType;
  itemTemplate: LayoutComponent | null;
}

export interface UpdateBaseRepeaterComponent<
  TConfig = BaseLayoutComponentConfig<unknown>,
> extends Omit<BaseRepeaterComponent<TConfig>, 'itemTemplate'> {
  type: 'REPEATER';
  componentType: RepeaterComponentType;
  itemTemplate?: LayoutComponent | null;
}

export interface CreateBaseRepeaterComponent<
  TConfig = BaseLayoutComponentConfig<unknown>,
> extends BaseRepeaterComponent<TConfig> {
  type: 'REPEATER';
  componentType: RepeaterComponentType;
  itemTemplate: LayoutComponent | null;
}

export type CollectionGridConfig =
  | {
      layout: 'infinite_scroll';
    }
  | {
      layout: 'pagination';
      pageSize: number;
    };

export interface CollectionGridRepeaterComponent extends BaseRepeaterComponent<CollectionGridConfig> {
  componentType: 'COLLECTION_GRID';
}
export interface UpdateCollectionGridRepeaterComponent extends UpdateBaseRepeaterComponent<CollectionGridConfig> {
  componentType: 'COLLECTION_GRID';
}
export interface CreateCollectionGridRepeaterComponent extends CreateBaseRepeaterComponent<CollectionGridConfig> {
  componentType: 'COLLECTION_GRID';
}

export type RepeaterComponent = CollectionGridRepeaterComponent;

export type UpdateRepeaterComponent = UpdateCollectionGridRepeaterComponent;

export type CreateRepeaterComponent = CreateCollectionGridRepeaterComponent;
