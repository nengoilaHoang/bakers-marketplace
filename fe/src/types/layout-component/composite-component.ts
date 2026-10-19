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

export interface BaseCompositeComponent<
  TConfig = BaseLayoutComponentConfig<unknown>,
> extends BaseLayoutComponent<TConfig> {
  type: 'COMPOSITE';
  componentType: CompositeComponentType;
  children: ResponsiveValue<Map<number, LayoutComponent>>;
}

export interface UpdateBaseCompositeComponent<
  TConfig = BaseLayoutComponentConfig<unknown>,
> extends UpdateBaseLayoutComponent<TConfig> {
  type: 'COMPOSITE';
  componentType: CompositeComponentType;
  children?: ResponsiveValue<Map<number, LayoutComponent>>;
}

export interface CreateBaseCompositeComponent<
  TConfig = BaseLayoutComponentConfig<unknown>,
> extends CreateBaseLayoutComponent<TConfig> {
  type: 'COMPOSITE';
  componentType: CompositeComponentType;
  children?: ResponsiveValue<Map<number, LayoutComponent>>;
}

export type CompositeComponentType = 'GRID' | 'COLUMN' | 'ROW' | 'CAROUSEL';

export type RowHeightMode =
  | {
      mode: 'fixed';
      baseHeightPx: number;
    }
  | {
      mode: 'aspect_ratio';
      ratio: '1:1' | '4:3' | '16:9';
    }
  | {
      mode: 'auto';
      minHeightPx: number;
    };

export type GridCompositeComponentConfig = {
  layout: 'BENTO' | 'UNIFORM';
  rows?: ResponsiveValue<number> | undefined;
  cols: ResponsiveValue<number>;
  gap: ResponsiveValue<number>;
  borderRadius: string | number | undefined;
  rowHeight: ResponsiveValue<RowHeightMode>;
  densePacking: boolean;
};

export interface GridCompositeComponent extends BaseCompositeComponent<GridCompositeComponentConfig> {
  componentType: 'GRID';
}

export interface UpdateGridCompositeComponent extends UpdateBaseCompositeComponent<GridCompositeComponentConfig> {
  componentType: 'GRID';
}

export interface CreateGridCompositeComponent extends CreateBaseCompositeComponent<GridCompositeComponentConfig> {
  componentType: 'GRID';
}

export type CompositeComponent = GridCompositeComponent;

export type UpdateCompositeComponent = UpdateGridCompositeComponent;

export type CreateCompositeComponent = CreateGridCompositeComponent;
