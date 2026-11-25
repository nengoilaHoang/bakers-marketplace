// hooks/storefront/StorefrontLayoutContext.ts
import { DeviceBreakpoint } from '@/types/canvas';
import { NewFlattenComponent } from '@/utils/flattenLayout';
import { createContext } from 'react';
import { LayoutState } from './useLayoutReducer';

export interface StorefrontLayoutContextValue {
  state: LayoutState;
  hasUnsavedChanges: boolean;
  saveLayout: () => Promise<void>;
  addNewComponent: (
    targetParentId: string,
    newComponent: NewFlattenComponent,
    breakpoint: DeviceBreakpoint,
    slot: number,
  ) => void;
  updateConfig: (
    targetComponentId: string,
    pathname: string,
    value: unknown,
    bp?: string,
  ) => void;
  moveComponent: (
    breakpoint: DeviceBreakpoint,
    sourceParentId: string,
    sourceSlot: number,
    targetParentId: string,
    targetSlot: number,
  ) => void;
  removeComponent: (parentId: string, targetComponentId: string) => void;
  removeComponentInBreakpoint: (
    parentId: string,
    breakpoint: DeviceBreakpoint,
    slot: number,
  ) => void;
  canUndo: boolean;
  canRedo: boolean;
  undo: () => void;
  redo: () => void;
}

const StorefrontLayoutContext =
  createContext<StorefrontLayoutContextValue | null>(null);

export default StorefrontLayoutContext;
