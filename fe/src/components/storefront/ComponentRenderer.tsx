import { FlattenComponent } from '@/utils/flattenLayout';
import HeroBannerComponent from './commerce-components/HeroBannerComponent';
import GridComponent from './composite-components/GridComponent';
import RichTextComponent from './leaf-components/rich-text/RichTextComponent';

type ComponentRendererProps = {
  component: FlattenComponent;
  sourceParentId?: string;
  sourceSlot?: number;
};

const ComponentRenderer = ({
  component,
  sourceParentId,
  sourceSlot,
}: ComponentRendererProps) => {
  switch (component.type) {
    case 'COMPOSITE': {
      switch (component.componentType) {
        case 'GRID':
          return (
            <GridComponent
              component={component}
              sourceParentId={sourceParentId}
              sourceSlot={sourceSlot}
            />
          );
        default:
          return null;
      }
    }
    case 'COMMERCE':
      if (sourceParentId === undefined || sourceSlot === undefined) {
        console.error(
          'Commerce components must have a sourceParentId and sourceSlot.',
        );
        return null;
      }
      switch (component.componentType) {
        case 'HERO_BANNER':
          return (
            <HeroBannerComponent
              component={component}
              sourceParentId={sourceParentId}
              sourceSlot={sourceSlot}
            ></HeroBannerComponent>
          );
      }
      break;
    case 'LEAF':
      if (sourceParentId === undefined || sourceSlot === undefined) {
        console.error(
          'Leaf components must have a sourceParentId and sourceSlot.',
        );
        return null;
      }
      switch (component.componentType) {
        case 'RICH_TEXT':
          return (
            <RichTextComponent
              component={component}
              sourceParentId={sourceParentId}
              sourceSlot={sourceSlot}
            />
          );
        default:
          return null;
      }
    case 'REPEATER':
      break;
    default:
      return null;
  }
};

export default ComponentRenderer;
