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

export interface BaseLeafComponent<
  TConfig = BaseLayoutComponentConfig<unknown>,
> extends BaseLayoutComponent<TConfig> {
  type: 'LEAF';
  componentType: LeafComponentType;
}

export interface UpdateBaseLeafComponent<
  TConfig = BaseLayoutComponentConfig<unknown>,
> extends BaseLeafComponent<TConfig> {
  type: 'LEAF';
  componentType: LeafComponentType;
}

export interface CreateBaseLeafComponent<
  TConfig = BaseLayoutComponentConfig<unknown>,
> extends BaseLeafComponent<TConfig> {
  type: 'LEAF';
  componentType: LeafComponentType;
}

export type RichTextConfig = {
  content: {
    body: string | Record<string, never>;
    format: 'html' | 'json' | 'markdown';
  };
};

export interface RichTextLeafComponent extends BaseLeafComponent<RichTextConfig> {
  componentType: 'RICH_TEXT';
}

export interface UpdateRichTextLeafComponent extends UpdateBaseLeafComponent<RichTextConfig> {
  componentType: 'RICH_TEXT';
}

export interface CreateRichTextLeafComponent extends CreateBaseLeafComponent<RichTextConfig> {
  componentType: 'RICH_TEXT';
}

export type LeafComponent = RichTextLeafComponent;

export type UpdateLeafComponent = UpdateRichTextLeafComponent;

export type CreateLeafComponent = CreateRichTextLeafComponent;
