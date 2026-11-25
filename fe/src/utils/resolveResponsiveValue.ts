import { DeviceBreakpoint } from '@/types/canvas';
import { ResponsiveProp } from '@/types/layout-component';

export function resolveResponsiveValue<T>(
  prop: ResponsiveProp<T> | undefined,
  bp: DeviceBreakpoint,
  fallback: T,
): T {
  return prop?.[bp] ?? prop?.desktop ?? fallback;
}
