// components/storefront/StorefrontEditor.tsx
import StorefrontLayoutProvider from '@/hooks/storefront/StorefrontLayoutProvider';
import { LayoutState } from '@/hooks/storefront/useLayoutReducer';
import useStorefrontCanvasContext from '@/hooks/storefront/useStorefrontCanvasContext';
import useStorefrontLayoutContext from '@/hooks/storefront/useStorefrontLayoutContext';
import { StorefrontRelease } from '@/types/storefront';
import { buildThemeStyle } from '@/utils/buildThemeStyle';
import { PointerActivationConstraints } from '@dnd-kit/dom';
import { DragDropProvider, DragOverlay, PointerSensor } from '@dnd-kit/react';
import { useMemo, useState } from 'react';
import { flushSync } from 'react-dom';
import Icon from '../ui/Icon';
import CanvasStage from './canvas/CanvasStage';
import ComponentInspectorContainer from './ComponentInspectorContainer';
import { COMPONENT_PREVIEWS } from './ComponentLibrary';
import ComponentLibraryContainer from './ComponentLibraryContainer';
import NodeRenderer, { NodeRendererMode } from './NodeRenderer';

type StorefrontEditorProps = {
  layoutState: LayoutState | undefined;
  themeSettings: StorefrontRelease['themeSettings'];
  updateLayout: (nextLayout: LayoutState) => void;
};

// components/storefront/StorefrontEditor.tsx
const DndContainer = ({ children }: { children: React.ReactNode }) => {
  const { moveComponent, addNewComponent: addComponent } =
    useStorefrontLayoutContext();
  const { breakpoint, setIsDragging, selectComponent, selectedComponentId } =
    useStorefrontCanvasContext();
  const [isDraggingPreview, setIsDraggingPreview] = useState(false);

  return (
    <DragDropProvider
      // This fixes the flickering caused by brief miscalculation of measurements of the preview component instead of the pill
      // by setting the state way before the dragging starts
      onBeforeDragStart={({ operation }) => {
        const { source } = operation;
        const isPreview =
          source?.data?.isPreview === true ||
          (source?.element as HTMLElement | undefined)?.dataset.preview ===
            'true';

        // Commit before @dnd-kit initializes Feedback/GrabOffsetModifier
        // This is to make sure that the DragOverlay is rendered before the dragging starts
        flushSync(() => {
          setIsDraggingPreview(isPreview);
        });
      }}
      onDragStart={({ operation }) => {
        setIsDragging(true);
        const { source } = operation;
        if (operation.canceled || !source) return;

        const isPreview =
          source.data?.isPreview === true ||
          (source.element as HTMLElement | undefined)?.dataset.preview ===
            'true';

        if (isPreview) {
          setIsDraggingPreview(true);
          if (selectedComponentId !== null) {
            selectComponent(null);
          }
          return;
        }

        setIsDraggingPreview(false);
        const { componentId } = source.data as {
          componentId: string;
          sourceParentId?: string;
          sourceSlot?: number;
        };
        if (selectedComponentId !== componentId) {
          selectComponent(componentId);
        }
      }}
      onDragEnd={({ operation }) => {
        setIsDragging(false);
        setIsDraggingPreview(false);

        const { source, target } = operation;
        if (operation.canceled || !source || !target) return;

        const { parentId: targetParentId, slot: targetSlot } = target.data as {
          parentId: string;
          slot: number;
        };

        const isPreview =
          source.data?.isPreview === true ||
          (source.element as HTMLElement | undefined)?.dataset.preview ===
            'true';

        if (isPreview) {
          const { componentId: blueprintId } = source.data as {
            componentId: string;
          };
          const blueprint = COMPONENT_PREVIEWS.find(
            (c) => c.id === blueprintId,
          );
          if (!blueprint) return;

          addComponent(
            targetParentId,
            blueprint,
            breakpoint === 'fluid' ? 'desktop' : breakpoint,
            targetSlot,
          );
          return;
        }

        const { sourceParentId, sourceSlot } = source.data as {
          componentId: string;
          sourceParentId?: string;
          sourceSlot?: number;
        };
        if (sourceParentId && sourceSlot) {
          moveComponent(
            breakpoint === 'fluid' ? 'desktop' : breakpoint,
            sourceParentId,
            sourceSlot,
            targetParentId,
            targetSlot,
          );
        }
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
      {/* This is just a hacky way to allow an overlay to appear when dragging a new component from the library.
					This also causes a temporary delay allowing the default view to be dragged for a brief moment, and then
					to be replaced by the below decoration.	But this can be fixed by the above onBeforeDragStart
			 */}
      {isDraggingPreview && (
        <DragOverlay dropAnimation={null}>
          {(source) => {
            if (!source) return null;
            const preview = COMPONENT_PREVIEWS.find(
              (c) => c.id === source.data?.componentId,
            );
            if (!preview) return null;

            return (
              <div className='pointer-events-none inline-flex items-center gap-2 rounded-lg border border-zinc-200 bg-white px-3 py-2 text-xs font-medium text-zinc-800 shadow-lg'>
                <Icon
                  name='file'
                  width={16}
                  height={16}
                  className='shrink-0 text-zinc-600'
                />
                <span>{preview.name}</span>
              </div>
            );
          }}
        </DragOverlay>
      )}
    </DragDropProvider>
  );
};

const StorefrontEditor = ({
  layoutState,
  themeSettings,
  updateLayout,
}: StorefrontEditorProps) => {
  const themeStyle = useMemo(
    () => buildThemeStyle(themeSettings),
    [themeSettings],
  );

  if (!layoutState) return null;

  return (
    <StorefrontLayoutProvider
      key={layoutState.id}
      initialState={layoutState}
      updateLayout={updateLayout}
    >
      {({ root }) => (
        <DndContainer>
          <div style={themeStyle} className='contents'>
            <ComponentLibraryContainer />
          </div>

          <CanvasStage>
            <div
              style={themeStyle}
              className='min-h-screen w-full bg-(--color-background,white) text-(--color-text-primary,#18181b)'
            >
              <NodeRenderer component={root} mode={NodeRendererMode.Editor} />
            </div>
          </CanvasStage>

          <ComponentInspectorContainer />
        </DndContainer>
      )}
    </StorefrontLayoutProvider>
  );
};

export default StorefrontEditor;
