import { createContext } from "react";
import { LayoutState } from "./useStorefrontReducer";
import { DeviceBreakpoint } from "@/types/canvas";

export interface StorefrontContextValue {
  state: LayoutState;
  updateConfig: (
    targetComponentId: string,
    config: Record<string, unknown>,
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

const StorefrontContext = createContext<StorefrontContextValue | null>(null);
export default StorefrontContext;
