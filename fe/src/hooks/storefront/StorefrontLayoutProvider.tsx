// hooks/storefront/StorefrontLayoutProvider.tsx
import { saveLayoutComponentsBatch } from '@/services/storefront';
import { DeviceBreakpoint } from '@/types/canvas';
import { FlattenComponent, NewFlattenComponent } from '@/utils/flattenLayout';
import { buildPageLayoutMutationWithUrls } from '@/utils/pageLayoutMutation';
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import StorefrontLayoutContext, {
  StorefrontLayoutContextValue,
} from './StorefrontLayoutContext';
import useLayoutReducer, { LayoutState } from './useLayoutReducer';
import { useOptionalStorefrontCanvasContext } from './useStorefrontCanvasContext';

const StorefrontLayoutProvider = ({
  children,
  initialState,
  onSaved,
}: {
  children:
    | React.ReactNode
    | React.ReactNode[]
    | ((props: { root: FlattenComponent }) => React.ReactNode);
  initialState: LayoutState;
  onSaved?: () => Promise<void> | void;
}) => {
  const baselineStateRef = useRef<LayoutState>(initialState);
  const { state, canUndo, canRedo, dispatch } = useLayoutReducer(initialState);
  const canvasCtx = useOptionalStorefrontCanvasContext();
  const [isSaving, setIsSaving] = useState(false);

  // Clear selection if an undo/redo removes the currently selected component
  useEffect(() => {
    if (
      canvasCtx?.selectedComponentId &&
      !state.components[canvasCtx.selectedComponentId]
    ) {
      canvasCtx.selectComponent(null);
    }
  }, [canvasCtx, state.components]);

  const undo = useCallback(() => {
    dispatch({ type: 'UNDO' });
  }, [dispatch]);

  const redo = useCallback(() => {
    dispatch({ type: 'REDO' });
  }, [dispatch]);

  const registerLayoutHistory = canvasCtx?.registerLayoutHistory;
  useEffect(() => {
    registerLayoutHistory?.({ canUndo, canRedo, undo, redo });
    return () => registerLayoutHistory?.(null);
  }, [registerLayoutHistory, canUndo, canRedo, undo, redo]);

  const hasUnsavedChanges = useMemo(
    () =>
      state.newComponents.size > 0 ||
      state.dirtyComponents.size > 0 ||
      state.removedComponents.size > 0,
    [state.newComponents, state.dirtyComponents, state.removedComponents],
  );

  const saveLayout = useCallback(async () => {
    if (isSaving || !hasUnsavedChanges) return;
    setIsSaving(true);
    try {
      const payload = await buildPageLayoutMutationWithUrls(
        state,
        baselineStateRef.current,
      );
      await saveLayoutComponentsBatch(payload);
      await onSaved?.();
    } finally {
      setIsSaving(false);
    }
  }, [hasUnsavedChanges, isSaving, onSaved, state]);

  const addNewComponent = useCallback(
    (
      targetParentId: string,
      newComponent: NewFlattenComponent,
      breakpoint: DeviceBreakpoint,
      slot: number,
    ) => {
      dispatch({
        type: 'NEW_COMPONENT',
        payload: { targetParentId, newComponent, breakpoint, slot },
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
      hasUnsavedChanges,
      isSaving,
      saveLayout,
      addNewComponent,
      updateConfig,
      moveComponent,
      removeComponent,
      removeComponentInBreakpoint,
      canUndo,
      canRedo,
      undo,
      redo,
    }),
    [
      state,
      hasUnsavedChanges,
      isSaving,
      saveLayout,
      addNewComponent,
      updateConfig,
      moveComponent,
      removeComponent,
      removeComponentInBreakpoint,
      canUndo,
      canRedo,
      undo,
      redo,
    ],
  );

  if (!state?.components) {
    return null;
  }

  const root = state.components[state.rootId];

  return (
    <StorefrontLayoutContext.Provider value={value}>
      {typeof children === 'function' ? children({ root }) : children}
    </StorefrontLayoutContext.Provider>
  );
};

export default StorefrontLayoutProvider;
