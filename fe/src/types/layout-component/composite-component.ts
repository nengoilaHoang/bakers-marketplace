import {
	BaseLayoutComponent,
	BaseLayoutComponentConfig,
	CreateBaseLayoutComponent,
	CreateLayoutComponent,
	LayoutComponent,
	ResponsiveProp,
	UpdateBaseLayoutComponent,
	UpdateLayoutComponent,
} from '.';

export interface BreakpointSlotMap {
  [order: string]: string;
}

export interface BaseCompositeComponent<
  TConfig = unknown,
> extends BaseLayoutComponent<BaseLayoutComponentConfig<TConfig>> {
  type: 'COMPOSITE';
  componentType: CompositeComponentType;
  children: LayoutComponent[];
  slots?: ResponsiveProp<BreakpointSlotMap> | undefined;
}

export interface BreakpointIndexSlotMap {
  [order: string]: number;
}

export type CompositePutSlot = ResponsiveProp<
  BreakpointSlotMap | BreakpointIndexSlotMap
>;

export interface UpdateBaseCompositeComponent<
  TConfig = unknown,
> extends UpdateBaseLayoutComponent<BaseLayoutComponentConfig<TConfig>> {
  type: 'COMPOSITE';
  componentType: CompositeComponentType;
  children?: (UpdateLayoutComponent | CreateLayoutComponent)[] | undefined;
  slots?: CompositePutSlot | undefined;
}

export interface CreateBaseCompositeComponent<
  TConfig = unknown,
> extends CreateBaseLayoutComponent<BaseLayoutComponentConfig<TConfig>> {
  type: 'COMPOSITE';
  componentType: CompositeComponentType;
  children?: (UpdateLayoutComponent | CreateLayoutComponent)[] | undefined;
  slots?: CompositePutSlot | undefined;
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

export type GridLayoutMode = 'UNIFORM' | 'BENTO';

export type GridCompositeComponentConfig = {
  layout: GridLayoutMode;
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
