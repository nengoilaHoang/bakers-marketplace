import { WithBase } from '@/utils/tsHelper';
import {
	CommerceComponent,
	CreateCommerceComponent,
	UpdateCommerceComponent,
} from './commerce-component/commerce-component';
import {
	CompositeComponent,
	CreateCompositeComponent,
	UpdateCompositeComponent,
} from './composite-component';
import {
	CreateLeafComponent,
	LeafComponent,
	UpdateLeafComponent,
} from './leaf-component';
import {
	CreateRepeaterComponent,
	RepeaterComponent,
	UpdateRepeaterComponent,
} from './repeater-component';

export type ResponsiveProp<T> = {
  desktop: T;
  mobile: T | undefined;
  tablet: T | undefined;
};

export type TextAlignmentType = 'center' | 'justify' | 'left' | 'right';
export type DimensionType = number | 'auto' | 'full' | 'lg' | 'md' | 'sm';
export type PaddingType = number | 'lg' | 'md' | 'none' | 'sm';
export type HorizontalAlignType = 'center' | 'left' | 'right' | 'stretch';
export type VerticalAlignType = 'bottom' | 'center' | 'stretch' | 'top';
export type SurfaceTheme =
  | 'default'
  | 'surface'
  | 'primary'
  | 'secondary'
  | 'accent';
export type TextConfig = {
  textAlign: TextAlignmentType;
  decoration: 'strikethrough' | 'underline' | 'none';
  textColor: string;
  fontWeight: number | 'bold' | 'extra-bold' | 'semi-bold';
  fontStyle: 'italic' | 'normal' | 'oblique';
};

export type BentoItemConfig = {
  colSpan: ResponsiveProp<number>;
  rowSpan: ResponsiveProp<number>;
};

export type BasePlacementConfig = {
  w: DimensionType;
  alignSelfX: HorizontalAlignType;
  alignSelfY: VerticalAlignType;
};

export type SlotPlacementConfig = BasePlacementConfig & { h: DimensionType };

type BoxStyleConfig = {
  padding: {
    top: PaddingType;
    bottom: PaddingType;
    left: PaddingType;
    right: PaddingType;
  };
  surfaceTheme: SurfaceTheme;
};

export type BaseLayoutComponentConfig<TConfig = unknown> = WithBase<
  BasePlacementConfig | SlotPlacementConfig,
  BoxStyleConfig
> &
  Partial<BentoItemConfig> & {
    [K in keyof TConfig]: TConfig[K];
  };

export type UpdateBaseLayoutComponentConfig<TConfig = unknown> = Partial<
  BaseLayoutComponentConfig<TConfig>
>;

export type BaseLayoutComponent<TConfig = BaseLayoutComponentConfig<unknown>> =
  {
    id: string;
    name: string;
    type: 'COMPOSITE' | 'LEAF' | 'REPEATER' | 'COMMERCE';
    componentType: string;
    config: TConfig;
  };

export type UpdateBaseLayoutComponent<
  TConfig = BaseLayoutComponentConfig<unknown>,
> = {
  id: string;
  name?: string;
  type: 'COMPOSITE' | 'LEAF' | 'REPEATER' | 'COMMERCE';
  componentType: string;
  config?: Partial<TConfig>;
};

export type CreateBaseLayoutComponent<
  TConfig = BaseLayoutComponentConfig<unknown>,
> = {
  name: string;
  type: 'COMPOSITE' | 'LEAF' | 'REPEATER' | 'COMMERCE';
  componentType: string;
  config: TConfig;
};

export type LayoutComponent =
  | CompositeComponent
  | LeafComponent
  | RepeaterComponent
  | CommerceComponent;

export type UpdateLayoutComponent =
  | UpdateCompositeComponent
  | UpdateLeafComponent
  | UpdateRepeaterComponent
  | UpdateCommerceComponent;

export type CreateLayoutComponent =
  | CreateCompositeComponent
  | CreateLeafComponent
  | CreateRepeaterComponent
  | CreateCommerceComponent;

export type PutLayoutComponent = CreateLayoutComponent | UpdateLayoutComponent;
