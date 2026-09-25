import {
	BaseLayoutComponent,
	BaseLayoutComponentConfig,
	LayoutComponent,
} from '.';

export type RepeaterComponentType = 'COLLECTION_GRID' | 'COLLECTION_CAROUSEL';

export type BaseRepeaterComponent<
	TConfig = BaseLayoutComponentConfig<unknown>,
> = BaseLayoutComponent<TConfig> & {
	type: 'REPEATER';
	componentType: RepeaterComponentType;
	itemTemplate: LayoutComponent | null;
};

export type UpdateBaseRepeaterComponent<
	TConfig = BaseLayoutComponentConfig<unknown>,
> = BaseRepeaterComponent<TConfig> & {
	type: 'REPEATER';
	componentType: RepeaterComponentType;
	itemTemplate?: LayoutComponent | null;
};

export type CreateBaseRepeaterComponent<
	TConfig = BaseLayoutComponentConfig<unknown>,
> = BaseRepeaterComponent<TConfig> & {
	type: 'REPEATER';
	componentType: RepeaterComponentType;
	itemTemplate: LayoutComponent | null;
};

export type CollectionGridConfig =
	| {
			layout: 'infinite_scroll';
	  }
	| {
			layout: 'pagination';
			pageSize: number;
	  };

export type CollectionGridRepeaterComponent =
	BaseRepeaterComponent<CollectionGridConfig> & {
		componentType: 'COLLECTION_GRID';
	};
export type UpdateCollectionGridRepeaterComponent =
	UpdateBaseRepeaterComponent<CollectionGridConfig> & {
		componentType: 'COLLECTION_GRID';
	};
export type CreateCollectionGridRepeaterComponent =
	CreateBaseRepeaterComponent<CollectionGridConfig> & {
		componentType: 'COLLECTION_GRID';
	};

export type RepeaterComponent = CollectionGridRepeaterComponent;

export type UpdateRepeaterComponent = UpdateCollectionGridRepeaterComponent;

export type CreateRepeaterComponent = CreateCollectionGridRepeaterComponent;
