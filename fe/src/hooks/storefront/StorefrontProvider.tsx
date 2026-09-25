import React, { useCallback, useMemo } from "react";
import StorefrontContext, { StorefrontContextValue } from "./StorefrontContext";
import useStorefrontReducer, { LayoutState } from "./useStorefrontReducer";
import { DeviceBreakpoint } from "@/types/canvas";
import { FlattenComponent } from "@/utils/flattenLayout";

const StorefrontProvider = ({
  children,
  initialState,
}: {
  children:
    | React.ReactNode
    | React.ReactNode[]
    | ((props: { root: FlattenComponent }) => React.ReactNode);
  initialState: LayoutState;
}) => {
  const { state, dispatch } = useStorefrontReducer(initialState);

  const updateConfig = useCallback(
    (targetComponentId: string, config: Record<string, unknown>) => {
      dispatch({
        type: "UPDATE_CONFIG",
        payload: { targetComponentId, config },
      });
    },
    [dispatch],
  );

  const moveComponent = useCallback(
    (
      breakpoint: DeviceBreakpoint,
      sourceParentId: string,
      sourceSlot: number,
      targetParentId: string,
      targetSlot: number,
    ) => {
      dispatch({
        type: "MOVE_COMPONENT",
        payload: {
          breakpoint,
          sourceParentId,
          sourceSlot,
          targetParentId,
          targetSlot,
        },
      });
    },
    [dispatch],
  );

  const removeComponent = useCallback(
    (parentId: string, slot: number, targetComponentId: string) => {
      dispatch({
        type: "REMOVE_COMPONENT",
        payload: { parentId, slot, targetComponentId },
      });
    },
    [dispatch],
  );

  const value: StorefrontContextValue = useMemo(
    () => ({
      state,
      updateConfig,
      moveComponent,
      removeComponent,
    }),
    [state, updateConfig, moveComponent, removeComponent],
  );

  if (!state?.components) {
    return null;
  }

  const root = state.components[state.rootId];
  const extraProps = { root };

  return (
    <StorefrontContext.Provider value={value}>
      {typeof children === "function" ? children(extraProps) : children}
    </StorefrontContext.Provider>
  );
};

export default StorefrontProvider;
