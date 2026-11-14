import { FlattenComponent } from '@/utils/flattenLayout';
import HeroBannerComponent from './commerce-components/HeroBannerComponent';
import GridComponent from './composite-components/GridComponent';
import RichTextComponent from './leaf-components/rich-text/RichTextComponent';

export const NodeRendererMode = {
  Preview: 'PREVIEW',
  Editor: 'EDIT',
  Active: 'ACTIVE',
} as const;
export type NodeRendererMode =
  (typeof NodeRendererMode)[keyof typeof NodeRendererMode];

type ComponentRendererProps = {
  component: FlattenComponent;
  sourceParentId?: string;
  sourceSlot?: number;
  mode: NodeRendererMode;
};

const NodeRenderer = ({
  component,
  sourceParentId,
  sourceSlot,
  mode,
}: ComponentRendererProps) => {
  const resolvedSourceParentId = sourceParentId ?? '';
  const resolvedSourceSlot = sourceSlot ?? 0;

  if (component.type === 'COMPOSITE' && component.componentType === 'GRID') {
    return (
      <GridComponent
        component={component}
        sourceParentId={resolvedSourceParentId}
        sourceSlot={resolvedSourceSlot}
        mode={mode}
      />
    );
  }

  if (
    component.type === 'COMMERCE' &&
    component.componentType === 'HERO_BANNER'
  ) {
    return (
      <HeroBannerComponent
        component={component}
        sourceParentId={resolvedSourceParentId}
        sourceSlot={resolvedSourceSlot}
        mode={mode}
      />
    );
  }

  if (component.type === 'LEAF' && component.componentType === 'RICH_TEXT') {
    return (
      <RichTextComponent
        component={component}
        sourceParentId={resolvedSourceParentId}
        sourceSlot={resolvedSourceSlot}
        mode={mode}
      />
    );
  }

  return null;
};

export default NodeRenderer;
