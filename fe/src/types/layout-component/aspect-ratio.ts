export const STANDARD_ASPECT_RATIOS = [
  'auto',
  '1:1',
  '4:3',
  '16:9',
  '21:9',
  '9:16',
  '4:5',
  '3:2',
] as const;

export const ASPECT_RATIO_REGEX = /^\d+:\d+$/m;

export type StandardAspectRatio = (typeof STANDARD_ASPECT_RATIOS)[number];

export type AspectRatioValue = StandardAspectRatio | (string & {}) | number;

export type MediaFit = 'cover' | 'contain' | 'fill' | 'none' | 'scale-down';

export type MediaFocalPoint = {
  x: number;
  y: number;
};
