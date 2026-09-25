import { DeviceBreakpointWithFluid } from "@/types/canvas";
import { createContext } from "react";

type StorefrontCanvasContextType = {
  zoom: number;
  setZoom: (zoom: number) => void;
  breakpoint: DeviceBreakpointWithFluid;
  setBreakpoint: (breakpoint: DeviceBreakpointWithFluid) => void;
  isPreview: boolean;
  setIsPreview: (isPreview: boolean) => void;
  isDragging: boolean;
  setIsDragging: (isDragging: boolean) => void;
  isResizing: boolean;
  setIsResizing: (isResizing: boolean) => void;
  selectedComponentId: string | null;
  selectComponent: (id: string | null) => void;
};

const StorefrontCanvasContext =
  createContext<StorefrontCanvasContextType | null>(null);

export default StorefrontCanvasContext;
