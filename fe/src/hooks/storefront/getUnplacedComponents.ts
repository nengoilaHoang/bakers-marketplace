import { DeviceBreakpoint } from '@/types/canvas';
import { FlattenCompositeComponent } from '@/utils/flattenLayout';

const getUnplacedComponents = (
  composite: FlattenCompositeComponent,
  currentBp: DeviceBreakpoint,
) => {
  const activeSlotMap = composite.slots?.[currentBp] ?? {};
  const placedChildIds = new Set(Object.values(activeSlotMap));

  // Find children present in the composite tree but missing in the breakpoint's slots
  const allChildIds = composite.children ?? [];
  return allChildIds.filter((id) => !placedChildIds.has(id)).filter(Boolean);
};

export default getUnplacedComponents;
