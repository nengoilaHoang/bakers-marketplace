// hooks/storefront/StorefrontCanvasContext.ts
import { DeviceBreakpointWithFluid } from '@/types/canvas';
import { createContext } from 'react';

export type LayoutHistoryControls = {
  canUndo: boolean;
  canRedo: boolean;
  undo: () => void;
  redo: () => void;
};

export type StorefrontCanvasContextValue = {
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
  currentPageId: string | null;
  setCurrentPageId: (pageId: string | null) => void;
  selectedComponentId: string | null;
  selectComponent: (id: string | null) => void;
  canUndo: boolean;
  canRedo: boolean;
  undo: () => void;
  redo: () => void;
  registerLayoutHistory: (controls: LayoutHistoryControls | null) => void;
};

const StorefrontCanvasContext =
  createContext<StorefrontCanvasContextValue | null>(null);

export default StorefrontCanvasContext;
