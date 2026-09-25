import { BaseLayoutComponent, BaseLayoutComponentConfig } from '.';

export type LeafComponentType =
	| 'CARD'
	| 'FORM'
	| 'BUTTON'
	| 'SEARCH_BAR'
	| 'FILTER'
	| 'RICH_TEXT'
	| 'IMAGE'
	| 'GALLERY'
	| 'VIDEO_PLAYER'
	| 'DIVIDER';

export type BaseLeafComponent<TConfig = BaseLayoutComponentConfig<unknown>> =
	BaseLayoutComponent<TConfig> & {
		type: 'LEAF';
		componentType: LeafComponentType;
	};

export type UpdateBaseLeafComponent<
	TConfig = BaseLayoutComponentConfig<unknown>,
> = BaseLeafComponent<TConfig> & {
	type: 'LEAF';
	componentType: LeafComponentType;
};

export type CreateBaseLeafComponent<
	TConfig = BaseLayoutComponentConfig<unknown>,
> = BaseLeafComponent<TConfig> & {
	type: 'LEAF';
	componentType: LeafComponentType;
};

export type RichTextConfig = {
	content: {
		body: string | Record<string, never>;
		format: 'html' | 'json' | 'markdown';
	};
};

export type RichTextLeafComponent = BaseLeafComponent<RichTextConfig> & {
	componentType: 'RICH_TEXT';
};

export type UpdateRichTextLeafComponent =
	UpdateBaseLeafComponent<RichTextConfig> & {
		componentType: 'RICH_TEXT';
	};

export type CreateRichTextLeafComponent =
	CreateBaseLeafComponent<RichTextConfig> & {
		componentType: 'RICH_TEXT';
	};

export type LeafComponent = RichTextLeafComponent;

export type UpdateLeafComponent = UpdateRichTextLeafComponent;

export type CreateLeafComponent = CreateRichTextLeafComponent;
