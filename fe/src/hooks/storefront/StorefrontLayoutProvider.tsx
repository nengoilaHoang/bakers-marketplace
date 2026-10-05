import { DeviceBreakpoint } from '@/types/canvas';
import { FlattenComponent } from '@/utils/flattenLayout';
import React, { useCallback, useMemo } from 'react';
import StorefrontLayoutContext, {
  StorefrontLayoutContextValue,
} from './StorefrontLayoutContext';
import useLayoutReducer, { LayoutState } from './useLayoutReducer';

const StorefrontLayoutProvider = ({
  children,
  initialState,
}: {
  children:
    | React.ReactNode
    | React.ReactNode[]
    | ((props: { root: FlattenComponent }) => React.ReactNode);
  initialState: LayoutState;
}) => {
  const { state, dispatch } = useLayoutReducer(initialState);

  const updateConfig = useCallback(
    (targetComponentId: string, pathname: string, value: unknown) => {
      dispatch({
        type: 'UPDATE_CONFIG',
        payload: { targetComponentId, pathname, value },
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
        type: 'MOVE_COMPONENT',
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
        type: 'REMOVE_COMPONENT',
        payload: { parentId, slot, targetComponentId },
      });
    },
    [dispatch],
  );

  const value: StorefrontLayoutContextValue = useMemo(
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
    <StorefrontLayoutContext.Provider value={value}>
      {typeof children === 'function' ? children(extraProps) : children}
    </StorefrontLayoutContext.Provider>
  );
};

export default StorefrontLayoutProvider;
