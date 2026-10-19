import {
	CommerceComponent,
	UpdateCommerceComponent,
} from './commerce-component';
import {
	CompositeComponent,
	UpdateCompositeComponent,
} from './composite-component';
import { LeafComponent, UpdateLeafComponent } from './leaf-component';
import {
	RepeaterComponent,
	UpdateRepeaterComponent,
} from './repeater-component';

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
export type TextStyle = {
  textAlign: TextAlignmentType;
  decoration: 'strikethrough' | 'underline';
  txtColor: string;
  fontWeight: number | 'bold' | 'extra-bold' | 'semi-bold';
  fontStyle: 'italic' | 'normal' | 'oblique';
};

export type BentoItemConfig = {
  colSpan: number;
  rowSpan: number;
};

type SlotPlacementConfig = {
  h: DimensionType;
  w: DimensionType;
  alignSelfX: HorizontalAlignType;
  alignSelfY: VerticalAlignType;
};

type BoxStyleConfig = {
  padding: {
    top: PaddingType;
    bottom: PaddingType;
    left: PaddingType;
    right: PaddingType;
  };
  surfaceTheme: SurfaceTheme;
};

export type BaseLayoutComponentConfig<TConfig = unknown> = (
  | SlotPlacementConfig
  | (SlotPlacementConfig & BoxStyleConfig)
) &
  Partial<BentoItemConfig> & {
    [K in keyof TConfig]: TConfig[K];
  };

export type UpdateBaseLayoutComponentConfig<TConfig = unknown> = Partial<
  BaseLayoutComponentConfig<TConfig>
>;

export type BaseLayoutComponent<TConfig> = {
  id: string;
  name: string;
  type: 'COMPOSITE' | 'LEAF' | 'REPEATER' | 'COMMERCE';
  componentType: string;
  config: BaseLayoutComponentConfig<TConfig>;
};

export type UpdateBaseLayoutComponent<TConfig> = {
  id: string;
  name?: string;
  type: 'COMPOSITE' | 'LEAF' | 'REPEATER' | 'COMMERCE';
  componentType: string;
  config: UpdateBaseLayoutComponentConfig<TConfig>;
};

export type CreateBaseLayoutComponent<TConfig> = {
  name: string;
  type: 'COMPOSITE' | 'LEAF' | 'REPEATER' | 'COMMERCE';
  componentType: string;
  config: BaseLayoutComponentConfig<TConfig>;
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
