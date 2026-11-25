import {
  STANDARD_ASPECT_RATIOS,
  StandardAspectRatio,
} from '@/types/layout-component/aspect-ratio';

const RATIO_LABELS: Record<StandardAspectRatio, string> = {
  auto: 'Auto',
  '1:1': '1:1 (Square)',
  '4:3': '4:3',
  '16:9': '16:9',
  '21:9': '21:9 (Ultrawide)',
  '9:16': '9:16 (Vertical)',
  '4:5': '4:5 (Portrait)',
  '3:2': '3:2',
};

export const RATIO_OPTIONS: Record<StandardAspectRatio, string> =
  Object.fromEntries(
    STANDARD_ASPECT_RATIOS.map((ratio) => [ratio, RATIO_LABELS[ratio]]),
  ) as Record<StandardAspectRatio, string>;
