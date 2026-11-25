import { DeviceBreakpoint } from '@/types/canvas';
import { PageLayoutType } from '@/types/page-layout';
import {
	FlattenComponent,
	FlattenCompositeComponent,
	NewFlattenComponent,
} from '@/utils/flattenLayout';
import { useReducer } from 'react';

type LayoutAction =
  | {
      type: 'MOVE_COMPONENT';
      payload: {
        breakpoint: 'mobile' | 'desktop' | 'tablet';
        sourceParentId: string;
        sourceSlot: number;
        targetParentId: string;
        targetSlot: number;
      };
    }
  | {
      type: 'UPDATE_CONFIG';
      payload: {
        targetComponentId: string;
        pathname: string;
        value: unknown;
        bp?: string;
      };
    }
  | {
      type: 'NEW_COMPONENT';
      payload: {
        targetParentId: string;
        newComponent: NewFlattenComponent;
        breakpoint: DeviceBreakpoint;
        slot: number;
      };
    }
  | {
      type: 'REMOVE_COMPONENT';
      payload: {
        parentId: string;
        targetComponentId: string;
      };
    }
  | {
      type: 'REMOVE_BREAKPOINT_COMPONENT';
      payload: {
        parentId: string;
        breakpoint: DeviceBreakpoint;
        slot: number;
      };
    }
  | { type: 'UNDO' }
  | { type: 'REDO' };

type LayoutHistoryState = {
  past: LayoutState[];
  present: LayoutState;
  future: LayoutState[];
};

const MAX_HISTORY_STEPS = 50;

export type LayoutState = {
  id: string;
  type: PageLayoutType;
  rootId: string;
  components: Record<string, FlattenComponent>;
  newComponents: Set<string>; // Created in FE, not yet in DB
  dirtyComponents: Set<string>; // Existing DB components modified in FE
  removedComponents: Set<string>; // Existing DB components deleted in FE
  revision: number;
  // unplacedComponents: {
  //   desktop: Set<string>;
  //   tablet: Set<string>;
  //   mobile: Set<string>;
  // };
};

const layoutReducer = (
  state: LayoutState,
  action: LayoutAction,
): LayoutState => {
  switch (action.type) {
    case 'NEW_COMPONENT': {
      const { targetParentId, newComponent, breakpoint, slot } = action.payload;
      const { components } = state;
      const parent = components[targetParentId];
      if (parent?.type !== 'COMPOSITE') return state;
      if (parent.slots?.[breakpoint]?.[slot]) return state;

      const nextComponents = { ...state.components };
      const nextNewComponents = new Set(state.newComponents);

      const isBentoParent =
        parent.componentType === 'GRID' && parent.config.layout === 'BENTO';

      const newComponentWithId = {
        ...newComponent,
        id: window.crypto.randomUUID(), // Generate new ID to replace preview ID
        config: isBentoParent
          ? {
              ...newComponent.config,
              w:
                newComponent.config.w === 'auto'
                  ? 'full'
                  : newComponent.config.w,
              colSpan: { desktop: 1, tablet: 1, mobile: 1 },
              rowSpan: { desktop: 1, tablet: 1, mobile: 1 },
            }
          : newComponent.config,
      } as FlattenComponent;

      nextComponents[newComponentWithId.id] = newComponentWithId;
      nextNewComponents.add(newComponentWithId.id);

      const nextChildren = Array.from(
        new Set([...(parent.children ?? []), newComponentWithId.id]),
      );

      const existingSlots = parent.slots ?? {
        desktop: {},
        mobile: {},
        tablet: {},
      };

      // Get the next unoccupied slot if not empty, recursively
      const getUnoccupiedSlot = (
        bp: DeviceBreakpoint,
        targetSlot: number,
      ): number => {
        const occupied = Boolean(existingSlots[bp]?.[targetSlot]);
        return occupied ? getUnoccupiedSlot(bp, targetSlot + 1) : targetSlot;
      };

      const nextSlots = {
        desktop: {
          ...existingSlots.desktop,
          [getUnoccupiedSlot('desktop', slot)]: newComponentWithId.id,
        },
        tablet: {
          ...existingSlots.tablet,
          [getUnoccupiedSlot('tablet', slot)]: newComponentWithId.id,
        },
        mobile: {
          ...existingSlots.mobile,
          [getUnoccupiedSlot('mobile', slot)]: newComponentWithId.id,
        },
      };

      nextComponents[targetParentId] = {
        ...parent,
        children: nextChildren,
        slots: nextSlots,
      };

      // Mark the parent as dirty
      const nextDirtyComponents = new Set(state.dirtyComponents);
      if (!nextNewComponents.has(targetParentId)) {
        nextDirtyComponents.add(targetParentId);
      }

      return {
        ...state,
        components: nextComponents,
        newComponents: nextNewComponents,
        dirtyComponents: nextDirtyComponents,
      };
    }
    case 'UPDATE_CONFIG': {
      const { targetComponentId, pathname, value, bp } = action.payload;
      const { components, newComponents } = state;

      const { config } = components[targetComponentId];
      const keys = pathname.split('.');

      const update = (current: unknown, index: number): unknown => {
        if (index === keys.length) {
          // If a breakpoint is specified, we want to update the value for that specific breakpoint.
          if (bp) {
            const currentObj =
              typeof current === 'object' && current !== null
                ? (current as Record<string, unknown>)
                : {};
            return {
              ...currentObj,
              [bp]: value,
            };
          }
          return value;
        }

        const key = keys[index];
        if (Array.isArray(current)) {
          const itemIndex = Number(key);
          const nextCurrent = current[itemIndex] ?? {};
          const nextArr = [...current];
          nextArr[itemIndex] = update(nextCurrent, index + 1);
          return nextArr;
        }

        const currentObj =
          current && typeof current === 'object'
            ? (current as Record<string, unknown>)
            : {};
        const nextCurrent = currentObj[key] ?? {};
        return {
          ...currentObj,
          [key]: update(nextCurrent, index + 1),
        };
      };

      const targetComponent = components[targetComponentId];
      const nextComponents: Record<string, FlattenComponent> = {
        ...state.components,
        [targetComponentId]: {
          ...targetComponent,
          config: {
            ...(update(config, 0) as typeof config),
          },
        } as FlattenComponent,
      };

      const nextDirtyComponents = new Set(state.dirtyComponents);
      if (!newComponents.has(targetComponentId)) {
        nextDirtyComponents.add(targetComponentId);
      }

      // Update children config if layout is BENTO and vice versa
      if (targetComponent.componentType === 'GRID' && pathname === 'layout') {
        const childIds = targetComponent.children ?? [];
        const defaultSpan = { desktop: 1, tablet: 1, mobile: 1 };

        for (const childId of childIds) {
          const child = nextComponents[childId];
          if (!child) continue;

          if (value === 'BENTO') {
            let hConfig = {};
            if ('h' in child.config) {
              hConfig = {
                h: child.config.h === 'auto' ? 'full' : child.config.h,
              };
            }

            nextComponents[childId] = {
              ...child,
              config: {
                ...child.config,
                w: child.config.w === 'auto' ? 'full' : child.config.w,
                ...hConfig,
                colSpan: { ...defaultSpan, ...child.config.colSpan },
                rowSpan: { ...defaultSpan, ...child.config.rowSpan },
              },
            } as FlattenComponent;
          } else {
            const restConfig = { ...child.config };
            Reflect.deleteProperty(restConfig, 'colSpan');
            Reflect.deleteProperty(restConfig, 'rowSpan');
            nextComponents[childId] = {
              ...child,
              config: restConfig,
            } as FlattenComponent;
          }

          // Mark the child as dirty
          if (!newComponents.has(childId)) {
            nextDirtyComponents.add(childId);
          }
        }
      }

      return {
        ...state,
        components: nextComponents,
        dirtyComponents: nextDirtyComponents,
      };
    }
    case 'MOVE_COMPONENT': {
      const {
        breakpoint,
        sourceParentId,
        sourceSlot,
        targetParentId,
        targetSlot,
      } = action.payload;
      const { components, newComponents, dirtyComponents } = state;

      if (sourceParentId === targetParentId && sourceSlot === targetSlot)
        return state;
      const sourceParent = components[sourceParentId];
      const targetParent = components[targetParentId];

      if (
        sourceParent?.type !== 'COMPOSITE' ||
        targetParent?.type !== 'COMPOSITE'
      ) {
        return state;
      }

      // If the source parent doesn't have a slot map for the specified breakpoint, we can't move anything.
      // This is just to satisfy TS, since you can't trigger this action if the slot map doesn't exist.
      if (!sourceParent.slots?.[breakpoint] || !sourceParent.children) {
        return state;
      }

      const draggedComponentId = sourceParent.slots[breakpoint][sourceSlot];
      if (!draggedComponentId) {
        return state;
      }

      const isSelfOrDescendant = (
        rootId: string,
        candidateId: string,
        breakpoint: 'mobile' | 'tablet' | 'desktop',
      ) => {
        const stack = [rootId];
        const seen = new Set<string>();
        while (stack.length > 0) {
          const currentId = stack.pop() as string;
          if (currentId === candidateId) return true;
          if (seen.has(currentId)) continue;
          seen.add(currentId);
          const node = state.components[currentId];
          if (node?.type === 'COMPOSITE') {
            // Add all children of the composite to the stack for further exploration.
            if (node.slots?.[breakpoint]) {
              stack.push(...Object.values(node.slots[breakpoint]));
            }
          } else if (node?.type === 'REPEATER' && node.itemTemplate) {
            stack.push(node.itemTemplate);
          }
        }
        return false;
      };

      // Dropping a container into itself / one of its own descendants would
      // create a cycle and detach that whole subtree from the root.
      if (isSelfOrDescendant(draggedComponentId, targetParentId, breakpoint)) {
        return state;
      }

      // If the occupant is an ancestor of the source parent, that
      // would also create a cycle.
      const occupantId = targetParent.slots?.[breakpoint]?.[targetSlot];
      if (
        occupantId &&
        isSelfOrDescendant(occupantId, sourceParentId, breakpoint)
      )
        return state;

      // Mark component as dirty
      const nextDirtyComponents = new Set(dirtyComponents);
      if (!newComponents.has(targetParentId)) {
        nextDirtyComponents.add(targetParentId);
      }

      // 1. Moving in the same container
      if (targetParentId === sourceParentId) {
        const nextBreakpointSlots = { ...sourceParent.slots[breakpoint] };

        // Swap if there is an occupant
        if (occupantId) {
          nextBreakpointSlots[sourceSlot] = occupantId;
        } else {
          delete nextBreakpointSlots[sourceSlot];
        }
        nextBreakpointSlots[targetSlot] = draggedComponentId;

        return {
          ...state,
          components: {
            ...state.components,
            [sourceParentId]: {
              ...sourceParent,
              slots: {
                desktop: sourceParent.slots.desktop ?? {},
                mobile: sourceParent.slots.mobile ?? {},
                tablet: sourceParent.slots.tablet ?? {},
                [breakpoint]: nextBreakpointSlots,
              },
            },
          },
          dirtyComponents: nextDirtyComponents,
        };
      }

      // 2. Moving to another container
      const newSourceSlots = { ...sourceParent.slots[breakpoint] };
      const newTargetSlots = { ...targetParent.slots?.[breakpoint] };

      if (occupantId) {
        newSourceSlots[sourceSlot] = occupantId;
      } else {
        delete newSourceSlots[sourceSlot];
      }
      newTargetSlots[targetSlot] = draggedComponentId;

      const newSourceChildren = sourceParent.children.filter(
        (childId) => childId !== draggedComponentId,
      );
      const newTargetChildren = [
        ...(targetParent.children || []),
        draggedComponentId,
      ];

      // Mark both parents as dirty if they are not new components
      if (!newComponents.has(targetParentId)) {
        nextDirtyComponents.add(sourceParentId);
      }
      if (!newComponents.has(sourceParentId)) {
        nextDirtyComponents.add(targetParentId);
      }

      // Mark the dragged component as dirty if it is not a new component
      if (!newComponents.has(draggedComponentId)) {
        nextDirtyComponents.add(draggedComponentId);
      }

      // If the target parent is a Bento grid, we need to update the children's config too
      const isBentoTargetParent =
        targetParent.componentType === 'GRID' &&
        targetParent.config.layout === 'BENTO';

      const draggedComponent = components[draggedComponentId];

      let nextDraggedHeightConfig = {};
      if ('h' in draggedComponent.config) {
        nextDraggedHeightConfig = {
          h:
            isBentoTargetParent && draggedComponent.config.h === 'auto'
              ? 'full'
              : draggedComponent.config.h,
        };
      }
      const nextDraggedComponent = {
        ...draggedComponent,
        config: isBentoTargetParent
          ? {
              ...draggedComponent.config,
              ...nextDraggedHeightConfig,
              w:
                draggedComponent.config.w === 'auto'
                  ? 'full'
                  : draggedComponent.config.w,
            }
          : {
              ...draggedComponent.config,
              colSpan: undefined,
              rowSpan: undefined,
            },
      } as FlattenComponent;

      let nextComponents = {
        ...components,
        [draggedComponentId]: nextDraggedComponent,
        [sourceParentId]: {
          ...sourceParent,
          children: newSourceChildren,
          slots: {
            desktop: sourceParent.slots.desktop,
            mobile: sourceParent.slots.mobile,
            tablet: sourceParent.slots.tablet,
            [breakpoint]: newSourceSlots,
          },
        },
        [targetParentId]: {
          ...targetParent,
          children: newTargetChildren,
          slots: targetParent.slots
            ? {
                desktop: targetParent.slots.desktop,
                mobile: targetParent.slots.mobile,
                tablet: targetParent.slots.tablet,
                [breakpoint]: newTargetSlots,
              }
            : {
                desktop: newTargetSlots,
                mobile: undefined,
                tablet: undefined,
                [breakpoint]: newTargetSlots,
              },
        },
      } as Record<string, FlattenComponent>;

      if (!occupantId)
        return {
          ...state,
          components: nextComponents,
          dirtyComponents: nextDirtyComponents,
        };
      else {
        // Mark the occupant as dirty if it is not a new component
        if (!newComponents.has(occupantId)) {
          nextDirtyComponents.add(occupantId);
        }

        // If the source parent is a Bento grid, we need to update the occupant's config too
        const isBentoSourceParent =
          sourceParent.componentType === 'GRID' &&
          sourceParent.config.layout === 'BENTO';
        const occupant = components[occupantId];
        let nextOccupantHeightConfig = {};
        if ('h' in occupant.config) {
          nextOccupantHeightConfig = {
            h:
              isBentoSourceParent && occupant.config.h === 'auto'
                ? 'full'
                : occupant.config.h,
          };
        }

        const nextOccupant = {
          ...occupant,
          config: isBentoSourceParent
            ? {
                ...occupant.config,
                ...nextOccupantHeightConfig,
                w: occupant.config.w === 'auto' ? 'full' : occupant.config.w,
              }
            : {
                ...occupant.config,
                colSpan: undefined,
                rowSpan: undefined,
              },
        } as FlattenComponent;

        nextComponents = {
          ...nextComponents,
          [occupantId]: nextOccupant,
        };

        return {
          ...state,
          components: nextComponents,
          dirtyComponents: nextDirtyComponents,
        };
      }
    }
    case 'REMOVE_COMPONENT': {
      const { parentId, targetComponentId } = action.payload;
      const { components, dirtyComponents, newComponents } = state;
      const parent = components[parentId];
      const targetComponent = components[targetComponentId];
      if (!parent || !targetComponent) return state;

      const componentsToRemove = new Set<string>();

      // Delete every child in a composite/repeater.
      // Delete on any bp means delete on every bp.
      const traverseDeleteChildren = (
        parent: FlattenComponent,
        components: Record<string, FlattenComponent>,
      ) => {
        if (parent.type === 'COMPOSITE') {
          const composite = components[parent.id] as FlattenCompositeComponent;
          const childIds = composite.children;
          if (!childIds || childIds.length === 0) return;

          for (const childId of childIds) {
            traverseDeleteChildren(components[childId], components);
            delete components[childId];
            componentsToRemove.add(childId);
          }
        } else if (parent.type === 'REPEATER') {
          const itemTemplateId = parent.itemTemplate;
          if (itemTemplateId) {
            const component = components[itemTemplateId];
            traverseDeleteChildren(component, components);
            delete components[component.id];
            componentsToRemove.add(component.id);
            parent.itemTemplate = null;
          }
        }
      };

      // Mark parent component as dirty
      const nextDirtyComponents = new Set(dirtyComponents);
      if (!newComponents.has(parentId)) {
        nextDirtyComponents.add(parentId);
      }

      switch (parent.type) {
        case 'COMPOSITE': {
          const newComponents = { ...state.components };
          const newChildren = parent.children?.filter(
            (id) => id !== targetComponentId,
          );
          const newSlots = parent.slots
            ? {
                desktop: Object.fromEntries(
                  Object.entries(parent.slots.desktop ?? {}).filter(
                    ([, id]) => id !== targetComponentId,
                  ),
                ),
                mobile: parent.slots.mobile
                  ? Object.fromEntries(
                      Object.entries(parent.slots.mobile).filter(
                        ([, id]) => id !== targetComponentId,
                      ),
                    )
                  : undefined,
                tablet: parent.slots.tablet
                  ? Object.fromEntries(
                      Object.entries(parent.slots.tablet).filter(
                        ([, id]) => id !== targetComponentId,
                      ),
                    )
                  : undefined,
              }
            : undefined;
          traverseDeleteChildren(targetComponent, newComponents);

          return {
            ...state,
            removedComponents: new Set([
              ...state.removedComponents,
              ...componentsToRemove,
              targetComponentId,
            ]),
            components: {
              ...newComponents,
              [parentId]: {
                ...parent,
                children: newChildren,
                slots: newSlots,
              },
            },
            dirtyComponents: nextDirtyComponents,
          };
        }
        case 'REPEATER': {
          const newComponents = { ...state.components };
          traverseDeleteChildren(targetComponent, newComponents);
          return {
            ...state,
            removedComponents: new Set([
              ...state.removedComponents,
              ...componentsToRemove,
              targetComponentId,
            ]),
            components: {
              ...newComponents,
              [parentId]: {
                ...parent,
                itemTemplate: null,
              },
            },
            dirtyComponents: nextDirtyComponents,
          };
        }
        default:
          return state;
      }
    }
    case 'REMOVE_BREAKPOINT_COMPONENT': {
      const { slot, parentId, breakpoint } = action.payload;
      const { components, dirtyComponents, newComponents } = state;
      const parent = components[parentId];
      if (!parent) return state;

      if (parent.type !== 'COMPOSITE') return state;

      const breakpointSlots = { ...parent.slots?.[breakpoint] };
      delete breakpointSlots[slot];

      // Mark parent component as dirty
      const nextDirtyComponents = new Set(dirtyComponents);
      if (!newComponents.has(parentId)) {
        nextDirtyComponents.add(parentId);
      }

      return {
        ...state,
        components: {
          ...state.components,
          [parentId]: {
            ...parent,
            slots: parent.slots
              ? {
                  ...parent.slots,
                  [breakpoint]: breakpointSlots,
                }
              : undefined,
          },
        },
        dirtyComponents: nextDirtyComponents,
      };
    }
    default:
      return state;
  }
};

const historyLayoutReducer = (
  history: LayoutHistoryState,
  action: LayoutAction,
): LayoutHistoryState => {
  switch (action.type) {
    case 'UNDO': {
      if (history.past.length === 0) return history;
      const previous = history.past.at(-1) ?? history.present;
      return {
        past: history.past.slice(0, -1),
        present: previous,
        future: [history.present, ...history.future],
      };
    }
    case 'REDO': {
      if (history.future.length === 0) return history;
      const [next, ...remainingFuture] = history.future;
      return {
        past: [...history.past, history.present],
        present: next,
        future: remainingFuture,
      };
    }
    default: {
      const nextPresent = layoutReducer(history.present, action);
      if (nextPresent === history.present) return history;
      return {
        past: [
          ...history.past.slice(-(MAX_HISTORY_STEPS - 1)),
          history.present,
        ],
        present: nextPresent,
        future: [],
      };
    }
  }
};

const useLayoutReducer = (initialState: LayoutState) => {
  const [history, dispatch] = useReducer(historyLayoutReducer, {
    past: [],
    present: initialState,
    future: [],
  });

  return {
    state: history.present,
    canUndo: history.past.length > 0,
    canRedo: history.future.length > 0,
    dispatch,
  };
};
export default useLayoutReducer;
