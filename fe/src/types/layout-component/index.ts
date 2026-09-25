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
export type TextStyle = {
	textAlign: TextAlignmentType;
	decoration: 'strikethrough' | 'underline';
	txtColor: string;
	fontWeight: number | 'bold' | 'extra-bold' | 'semi-bold';
	fontStyle: 'italic' | 'normal' | 'oblique';
};

type BaseProps = {
	[key: string]:
		| string
		| number
		| boolean
		| undefined
		| Record<string, unknown>;
	h: DimensionType;
	w: DimensionType;
	alignX: HorizontalAlignType;
	alignY: VerticalAlignType;
	padding: {
		top: PaddingType;
		bottom: PaddingType;
		left: PaddingType;
		right: PaddingType;
	};
	colorScheme: 'accent' | 'default' | 'inverted';
	colorPalette:
		| {
				type: 'palette';
				token: 'accent' | 'background' | 'primary' | 'secondary' | 'surface';
		  }
		| {
				type: 'custom';
				bgColor: string;
				txtColor: string;
		  };
	wSpan: number | undefined;
	hSpan: number | undefined;
};

export type BaseLayoutComponentConfig<TConfig = unknown> = BaseProps & {
	[K in keyof TConfig]: TConfig[K];
};

export type UpdateBaseLayoutComponentConfig<TConfig> = Partial<BaseProps> & {
	[K in keyof TConfig]?: TConfig[K];
};

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
