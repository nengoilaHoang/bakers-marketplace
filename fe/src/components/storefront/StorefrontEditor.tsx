import StorefrontProvider from '@/hooks/storefront/StorefrontProvider';
import { StorefrontRelease } from '@/types/storefront';
import flattenLayout, { FlattenComponent } from '@/utils/flattenLayout';
import { DragDropProvider } from '@dnd-kit/react';
import { useMemo } from 'react';
import ComponentRenderer from './ComponentRenderer';
import { PointerSensor, PointerActivationConstraints } from '@dnd-kit/dom';
import useStorefrontContext from '@/hooks/storefront/useStorefrontContext';
import { LayoutState } from '@/hooks/storefront/useStorefrontReducer';
import useStorefront from '@/hooks/storefront/useStorefront';
import CanvasStage from './canvas/CanvasStage';
import useStorefrontCanvasContext from '@/hooks/storefront/useStorefrontCanvasContext';
import StorefrontConfigSidebar from './StorefrontConfigSidebar';

type StorefrontEditorProps = {
  storeId: string;
  releaseId?: string;
};

type StorefrontEditorContentProps = {
  release: StorefrontRelease;
};

const StorefrontDndContainer = ({ root }: { root: FlattenComponent }) => {
  const { moveComponent } = useStorefrontContext();
  const {
    breakpoint,
    zoom,
    isPreview,
    setIsDragging,
    selectComponent,
    selectedComponentId,
  } = useStorefrontCanvasContext();

  return (
    <DragDropProvider
      onDragStart={({ operation }) => {
        setIsDragging(true);
        const { source } = operation;
        if (operation.canceled || !source) return;

        const { componentId } = source.data as {
          componentId: string;
          sourceParentId: string;
          sourceSlot: number;
        };

        if (selectedComponentId !== componentId) {
          selectComponent(componentId);
        }
      }}
      onDragEnd={({ operation }) => {
        setIsDragging(false);
        const { source, target } = operation;
        if (operation.canceled || !source || !target) return;

        const { sourceParentId, sourceSlot } = source.data as {
          componentId: string;
          sourceParentId: string;
          sourceSlot: number;
        };
        const { parentId: targetParentId, slot: targetSlot } = target.data as {
          parentId: string;
          slot: number;
        };

        moveComponent(
          breakpoint === 'fluid' ? 'desktop' : breakpoint,
          sourceParentId,
          sourceSlot,
          targetParentId,
          targetSlot,
        );
      }}
      sensors={(defaults) => [
        ...defaults.filter((sensor) => sensor !== PointerSensor),
        PointerSensor.configure({
          activationConstraints: [
            new PointerActivationConstraints.Distance({ value: 8 }),
            new PointerActivationConstraints.Delay({
              value: 200,
              tolerance: 10,
            }),
          ],
        }),
      ]}
    >
      <div className='relative flex flex-1 size-full overflow-hidden'>
        <CanvasStage
          currentBreakpoint={breakpoint}
          zoom={zoom}
          isPreview={isPreview}
        >
          <ComponentRenderer component={root}></ComponentRenderer>
        </CanvasStage>

        {selectedComponentId !== null ? <StorefrontConfigSidebar /> : null}
      </div>
    </DragDropProvider>
  );
};

const StorefrontEditorContent = ({ release }: StorefrontEditorContentProps) => {
  const layout = useMemo<LayoutState | undefined>(() => {
    if (!release?.layouts || release.layouts.length === 0) {
      return undefined;
    }

    const flattenedLayouts = release.layouts.map((item) => {
      const flattenedRoot = flattenLayout(item.root);

      return {
        id: item.id,
        type: item.type,
        rootId: item.root.id,
        components: flattenedRoot,
      };
    });

    const layoutStates = flattenedLayouts.map((item) => ({
      id: item.id,
      type: item.type,
      rootId: item.rootId,
      components: Object.fromEntries(item.components.map((c) => [c.id, c])),
      removedComponents: new Set<string>(),
    }));

    return layoutStates.find((item) => item.type === 'HOME') ?? layoutStates[0];
  }, [release.layouts]);

  if (!layout) {
    return null;
  }

  return (
    <StorefrontProvider initialState={layout}>
      {({ root }) => <StorefrontDndContainer root={root} />}
    </StorefrontProvider>
  );
};

const StorefrontEditor = ({ storeId, releaseId }: StorefrontEditorProps) => {
  const { release, isLoading } = useStorefront(storeId, releaseId);

  if (isLoading || !release) {
    return null;
  }

  return <StorefrontEditorContent release={release} />;
};

export default StorefrontEditor;
