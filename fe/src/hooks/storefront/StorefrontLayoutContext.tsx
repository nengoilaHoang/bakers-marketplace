import { DeviceBreakpoint } from '@/types/canvas';
import { createContext } from 'react';
import { LayoutState } from './useLayoutReducer';

export interface StorefrontLayoutContextValue {
  state: LayoutState;
  updateConfig: (
    targetComponentId: string,
    pathname: string,
    value: unknown,
  ) => void;
  moveComponent: (
    breakpoint: DeviceBreakpoint,
    sourceParentId: string,
    sourceSlot: number,
    targetParentId: string,
    targetSlot: number,
  ) => void;
  removeComponent: (
    parentId: string,
    slot: number,
    targetComponentId: string,
  ) => void;
}

const StorefrontLayoutContext =
  createContext<StorefrontLayoutContextValue | null>(null);
export default StorefrontLayoutContext;
