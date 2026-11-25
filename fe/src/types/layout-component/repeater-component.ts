import {
	BaseLayoutComponent,
	BaseLayoutComponentConfig,
	LayoutComponent,
	ResponsiveProp,
} from '.';

export type RepeaterComponentType = 'COLLECTION_GRID' | 'COLLECTION_CAROUSEL';

export interface BaseRepeaterComponent<
  TConfig = unknown,
> extends BaseLayoutComponent<BaseLayoutComponentConfig<TConfig>> {
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

export type CollectionDataSource =
  | {
      // Inherits parameters from the active route (/collections/[slug], /products?..., or /products/[slug])
      type: 'route';
      mode: 'route_query' | 'related_products';
    }
  | {
      // Global store merchandising feeds (usable on any page, including HOME)
      type: 'preset';
      preset: 'best_sellers' | 'new_arrivals';
    }
  | {
      // Vendor explicitly picks a collection in the Inspector
      type: 'collection';
      collectionSlug: string;
    }
  | {
      // Static merchandising query (1:1 with UrlPicker filter params)
      type: 'query';
      tag?: string;
      minPrice?: number;
      maxPrice?: number;
      sort?: 'newest' | 'price_asc' | 'price_desc' | 'popular';
      inStockOnly?: boolean;
    };

export type CollectionGridConfig = {
  dataSource: CollectionDataSource;
  cols: ResponsiveProp<number>;
  gap: ResponsiveProp<number>;
} & (
  | {
      layout: 'infinite_scroll';
    }
  | {
      layout: 'pagination';
      pageSize: number;
    }
);

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
