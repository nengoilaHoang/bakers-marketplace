// components/storefront/StorefrontEditor.tsx
import StorefrontLayoutProvider from '@/hooks/storefront/StorefrontLayoutProvider';
import { LayoutState } from '@/hooks/storefront/useLayoutReducer';
import useStorefrontCanvasContext from '@/hooks/storefront/useStorefrontCanvasContext';
import useStorefrontLayoutContext from '@/hooks/storefront/useStorefrontLayoutContext';
import { StorefrontReleaseWithLayout } from '@/types/storefront';
import flattenLayout from '@/utils/flattenLayout';
import { PointerActivationConstraints } from '@dnd-kit/dom';
import { DragDropProvider, PointerSensor } from '@dnd-kit/react';
import { useMemo } from 'react';
import CanvasStage from './canvas/CanvasStage';
import ComponentRenderer from './ComponentRenderer';
import StorefrontConfigSidebar from './StorefrontConfigSidebar';
type StorefrontEditorProps = {
  release: StorefrontReleaseWithLayout;
};

const DndContainer = ({ children }: { children: React.ReactNode }) => {
  const { moveComponent } = useStorefrontLayoutContext();
  const { breakpoint, setIsDragging, selectComponent, selectedComponentId } =
    useStorefrontCanvasContext();

  return (
    <div className='relative flex flex-1 w-full min-h-full'>
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
          const { parentId: targetParentId, slot: targetSlot } =
            target.data as { parentId: string; slot: number };
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
        {children}
      </DragDropProvider>
    </div>
  );
};

const StorefrontEditor = ({ release }: StorefrontEditorProps) => {
  const layout = useMemo<LayoutState | undefined>(() => {
    if (!release?.layouts || release.layouts.length === 0) return undefined;

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

  if (!layout) return null;

  return (
    <StorefrontLayoutProvider initialState={layout}>
      {({ root }) => (
        <div className='relative flex flex-1 size-full overflow-hidden'>
          <CanvasStage>
            <DndContainer>
              <ComponentRenderer component={root} />
            </DndContainer>
          </CanvasStage>
          <StorefrontConfigSidebar />
        </div>
      )}
    </StorefrontLayoutProvider>
  );
};

export default StorefrontEditor;
