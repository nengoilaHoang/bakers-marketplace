import { DeviceBreakpoint } from '@/types/canvas';
import { FlattenComponent, NewFlattenComponent } from '@/utils/flattenLayout';
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

  const addNewComponent = useCallback(
    (
      targetParentId: string,
      newComponent: NewFlattenComponent,
      breakpoint: DeviceBreakpoint,
      slot: number,
    ) => {
      dispatch({
        type: 'NEW_COMPONENT',
        payload: {
          targetParentId,
          newComponent,
          breakpoint,
          slot,
        },
      });
    },
    [dispatch],
  );

  const updateConfig = useCallback(
    (
      targetComponentId: string,
      pathname: string,
      value: unknown,
      bp?: string,
    ) => {
      dispatch({
        type: 'UPDATE_CONFIG',
        payload: { targetComponentId, pathname, value, bp },
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
    (parentId: string, targetComponentId: string) => {
      dispatch({
        type: 'REMOVE_COMPONENT',
        payload: { parentId, targetComponentId },
      });
    },
    [dispatch],
  );

  const removeComponentInBreakpoint = useCallback(
    (parentId: string, breakpoint: DeviceBreakpoint, slot: number) => {
      dispatch({
        type: 'REMOVE_BREAKPOINT_COMPONENT',
        payload: { parentId, breakpoint, slot },
      });
    },
    [dispatch],
  );

  const value: StorefrontLayoutContextValue = useMemo(
    () => ({
      state,
      addNewComponent,
      updateConfig,
      moveComponent,
      removeComponent,
      removeComponentInBreakpoint,
    }),
    [
      state,
      addNewComponent,
      updateConfig,
      moveComponent,
      removeComponent,
      removeComponentInBreakpoint,
    ],
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
