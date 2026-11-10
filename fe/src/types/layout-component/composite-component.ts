import {
	BaseLayoutComponent,
	BaseLayoutComponentConfig,
	CreateBaseLayoutComponent,
	LayoutComponent,
	ResponsiveProp,
	UpdateBaseLayoutComponent,
} from '.';

export interface BaseCompositeComponent<
  TConfig = unknown,
> extends BaseLayoutComponent<BaseLayoutComponentConfig<TConfig>> {
  type: 'COMPOSITE';
  componentType: CompositeComponentType;
  children: ResponsiveProp<Map<number, LayoutComponent>>;
}

export interface UpdateBaseCompositeComponent<
  TConfig = BaseLayoutComponentConfig<unknown>,
> extends UpdateBaseLayoutComponent<TConfig> {
  type: 'COMPOSITE';
  componentType: CompositeComponentType;
  children?: ResponsiveProp<Map<number, LayoutComponent>>;
}

export interface CreateBaseCompositeComponent<
  TConfig = BaseLayoutComponentConfig<unknown>,
> extends CreateBaseLayoutComponent<TConfig> {
  type: 'COMPOSITE';
  componentType: CompositeComponentType;
  children?: ResponsiveProp<Map<number, LayoutComponent>>;
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
  rows?: ResponsiveProp<number> | undefined;
  cols: ResponsiveProp<number>;
  gap: ResponsiveProp<number>;
  borderRadius: string | number | undefined;
  rowHeight: ResponsiveProp<RowHeightMode>;
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
