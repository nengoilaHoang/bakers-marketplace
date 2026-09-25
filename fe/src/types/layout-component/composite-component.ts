import {
	BaseLayoutComponent,
	BaseLayoutComponentConfig,
	CreateBaseLayoutComponent,
	LayoutComponent,
	UpdateBaseLayoutComponent,
} from '.';

export type ResponsiveValue<T> = {
	mobile: T;
	tablet: T;
	desktop: T;
};

export type BaseCompositeComponent<
	TConfig = BaseLayoutComponentConfig<unknown>,
> = BaseLayoutComponent<TConfig> & {
	type: 'COMPOSITE';
	componentType: CompositeComponentType;
	children: ResponsiveValue<Map<number, LayoutComponent>>;
};

export type UpdateBaseCompositeComponent<
	TConfig = BaseLayoutComponentConfig<unknown>,
> = UpdateBaseLayoutComponent<TConfig> & {
	type: 'COMPOSITE';
	componentType: CompositeComponentType;
	children?: ResponsiveValue<Map<number, LayoutComponent>>;
};

export type CreateBaseCompositeComponent<
	TConfig = BaseLayoutComponentConfig<unknown>,
> = CreateBaseLayoutComponent<TConfig> & {
	type: 'COMPOSITE';
	componentType: CompositeComponentType;
	children?: ResponsiveValue<Map<number, LayoutComponent>>;
};

export type CompositeComponentType = 'GRID' | 'COLUMN' | 'ROW' | 'CAROUSEL';

export type GridCompositeComponentConfig = {
	layout: 'BENTO' | 'UNIFORM';
	rows: ResponsiveValue<number>;
	cols: ResponsiveValue<number>;
	gap: ResponsiveValue<number>;
	borderRadius: string | number | undefined;
};

export type GridCompositeComponent =
	BaseCompositeComponent<GridCompositeComponentConfig> & {
		componentType: 'GRID';
	};

export type UpdateGridCompositeComponent =
	UpdateBaseCompositeComponent<GridCompositeComponentConfig> & {
		componentType: 'GRID';
	};

export type CreateGridCompositeComponent =
	CreateBaseCompositeComponent<GridCompositeComponentConfig> & {
		componentType: 'GRID';
	};

export type CompositeComponent = GridCompositeComponent;

export type UpdateCompositeComponent = UpdateGridCompositeComponent;

export type CreateCompositeComponent = CreateGridCompositeComponent;
