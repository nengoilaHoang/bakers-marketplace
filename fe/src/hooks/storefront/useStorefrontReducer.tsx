import { PageLayoutType } from "@/types/page-layout";
import {
  FlattenComponent,
  FlattenCompositeComponent,
} from "@/utils/flattenLayout";
import { useReducer } from "react";

type LayoutAction =
  | {
      type: "MOVE_COMPONENT";
      payload: {
        breakpoint: "mobile" | "desktop" | "tablet";
        sourceParentId: string;
        sourceSlot: number;
        targetParentId: string;
        targetSlot: number;
      };
    }
  | {
      type: "UPDATE_CONFIG";
      payload: {
        targetComponentId: string;
        config: Record<string, unknown>;
      };
    }
  | {
      type: "NEW_COMPONENT";
      payload: {
        targetParentId: string;
        // newComponent
      };
    }
  | {
      type: "REMOVE_COMPONENT";
      payload: {
        parentId: string;
        slot: number;
        targetComponentId: string;
      };
    };

export type LayoutState = {
  id: string;
  type: PageLayoutType;
  rootId: string;
  components: Record<string, FlattenComponent>;
  removedComponents: Set<string>;
  // newComponents
};

const storefrontReducer = (
  state: LayoutState,
  action: LayoutAction,
): LayoutState => {
  switch (action.type) {
    case "UPDATE_CONFIG": {
      const { targetComponentId, config } = action.payload;
      return {
        ...state,
        components: {
          ...state.components,
          [targetComponentId]: {
            ...state.components[targetComponentId],
            config: {
              ...state.components[targetComponentId].config,
              ...config,
            },
          } as FlattenComponent,
        },
      };
    }
    case "REMOVE_COMPONENT": {
      const { parentId, targetComponentId } = action.payload;
      const parent = state.components[parentId];
      const targetComponent = state.components[targetComponentId];
      if (!parent || !targetComponent) return state;

      const componentsToRemove = new Set<string>();

      // Delete every child that in a composite/repeater.
      // Delete on any bp means delete on every bp.
      const traverseDeleteChildren = (
        parent: FlattenComponent,
        components: Record<string, FlattenComponent>,
      ) => {
        if (parent.type === "COMPOSITE") {
          const bps = Object.entries(parent.children);
          bps.forEach(([bp, map]) => {
            const seen = new Set<string>();
            const composite = components[
              parent.id
            ] as FlattenCompositeComponent;
            const childMap = composite.children[
              bp as keyof typeof composite.children
            ] as Record<number, string> | undefined;

            Object.entries(map).forEach(([slot, id]) => {
              if (childMap) {
                delete childMap[Number(slot)];
              }

              const component = components[id];
              if (component) {
                seen.add(id);
                traverseDeleteChildren(component, components);
                componentsToRemove.add(id);
              }
            });
            seen.forEach((value) => delete components[value]);
          });
        } else if (parent.type === "REPEATER") {
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

      switch (parent.type) {
        case "COMPOSITE": {
          const newComponents = { ...state.components };
          const newChildren = Object.fromEntries(
            Object.entries(parent.children).map(([breakpoint, map]) => [
              breakpoint,
              Object.fromEntries(
                Object.entries(map).filter(
                  ([, id]) => id !== targetComponentId,
                ),
              ),
            ]),
          ) as typeof parent.children;

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
              },
            },
          };
        }
        case "REPEATER": {
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
          };
        }
        default:
          return state;
      }
    }
    case "MOVE_COMPONENT": {
      const {
        breakpoint,
        sourceParentId,
        sourceSlot,
        targetParentId,
        targetSlot,
      } = action.payload;

      if (sourceParentId === targetParentId && sourceSlot === targetSlot)
        return state;
      const sourceParent = state.components[sourceParentId];
      const targetParent = state.components[targetParentId];

      if (
        sourceParent?.type !== "COMPOSITE" ||
        targetParent?.type !== "COMPOSITE"
      ) {
        return state;
      }

      const draggedComponentId = sourceParent.children[breakpoint][sourceSlot];
      if (!draggedComponentId) {
        return state;
      }

      const isSelfOrDescendant = (
        rootId: string,
        candidateId: string,
        breakpoint: "mobile" | "tablet" | "desktop",
      ) => {
        const stack = [rootId];
        const seen = new Set<string>();
        while (stack.length > 0) {
          const currentId = stack.pop() as string;
          if (currentId === candidateId) return true;
          if (seen.has(currentId)) continue;
          seen.add(currentId);
          const node = state.components[currentId];
          if (node?.type === "COMPOSITE") {
            stack.push(...Object.values(node.children[breakpoint]));
          } else if (node?.type === "REPEATER" && node.itemTemplate) {
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
      const occupantId = targetParent.children[breakpoint][targetSlot];
      if (
        occupantId &&
        isSelfOrDescendant(occupantId, sourceParentId, breakpoint)
      )
        return state;

      if (targetParentId === sourceParentId) {
        const nextBreakpointSlots = { ...sourceParent.children[breakpoint] };

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
              children: {
                ...sourceParent.children,
                [breakpoint]: nextBreakpointSlots,
              },
            },
          },
        };
      }

      const newSourceSlots = { ...sourceParent.children[breakpoint] };
      const newTargetSlots = { ...targetParent.children[breakpoint] };

      if (occupantId) {
        newSourceSlots[sourceSlot] = occupantId;
      } else {
        delete newSourceSlots[sourceSlot];
      }
      newTargetSlots[targetSlot] = draggedComponentId;

      return {
        ...state,
        components: {
          ...state.components,
          [sourceParentId]: {
            ...sourceParent,
            children: {
              ...sourceParent.children,
              [breakpoint]: newSourceSlots,
            },
          },
          [targetParentId]: {
            ...targetParent,
            children: {
              ...targetParent.children,
              [breakpoint]: newTargetSlots,
            },
          },
        },
      };
    }
    default:
      return state;
  }
};

const useStorefrontReducer = (initialState: LayoutState) => {
  const [state, dispatch] = useReducer(storefrontReducer, initialState);
  return { state, dispatch };
};

export default useStorefrontReducer;
