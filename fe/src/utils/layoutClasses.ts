import {
	DimensionType,
	HorizontalAlignType,
	PaddingType,
	SurfaceTheme,
	TextStyle,
	VerticalAlignType,
} from '@/types/layout-component';
import { HeroBannerContentPosition } from '@/types/layout-component/commerce-component';
import { CSSProperties } from 'react';
import { FlattenComponent } from './flattenLayout';

const DIMENSION_MAP: Record<'h' | 'w', Record<DimensionType, string>> = {
  w: { full: 'w-full', auto: 'w-auto', sm: 'w-1/4', md: 'w-1/2', lg: 'w-3/4' },
  h: { full: 'h-full', auto: 'h-auto', sm: 'h-1/4', md: 'h-1/2', lg: 'h-3/4' },
};

export const CONTENT_POSITION_MAP: Record<HeroBannerContentPosition, string> = {
  'top-left': 'justify-start items-start text-left',
  'top-center': 'justify-start items-center text-center',
  'top-right': 'justify-start items-end text-right',
  'middle-left': 'justify-center items-start text-left',
  'middle-center': 'justify-center items-center text-center',
  'middle-right': 'justify-center items-end text-right',
  'bottom-left': 'justify-end items-start text-left',
  'bottom-center': 'justify-end items-center text-center',
  'bottom-right': 'justify-end items-end text-right',
};

const SURFACE_THEME_MAP: Record<SurfaceTheme, string> = {
  default: 'bg-page text-ink',
  surface: 'bg-surface text-ink',
  primary: 'bg-primary text-on-primary',
  secondary: 'bg-secondary text-on-secondary',
  accent: 'bg-accent text-on-accent',
};

export const PADDING_MAP: Record<
  't' | 'l' | 'r' | 'b',
  Record<'none' | 'sm' | 'md' | 'lg', string>
> = {
  t: { none: 'pt-0', sm: 'pt-2', md: 'pt-4', lg: 'pt-8' },
  l: { none: 'pl-0', sm: 'pl-2', md: 'pl-4', lg: 'pl-8' },
  r: { none: 'pr-0', sm: 'pr-2', md: 'pr-4', lg: 'pr-8' },
  b: { none: 'pb-0', sm: 'pb-2', md: 'pb-4', lg: 'pb-8' },
};

function getPaddingClass(
  side: 't' | 'b' | 'l' | 'r',
  padding?: PaddingType,
): string | CSSProperties {
  if (padding === undefined) return '';

  if (typeof padding === 'number') {
    switch (side) {
      case 't':
        return {
          paddingTop: `${padding}px`,
        };
      case 'b':
        return {
          paddingBottom: `${padding}px`,
        };
      case 'l':
        return {
          paddingLeft: `${padding}px`,
        };
      case 'r':
        return {
          paddingRight: `${padding}px`,
        };
      default:
        return '';
    }
  }

  return PADDING_MAP[side][padding] ?? '';
}

const getDimensionClass = (
  prefix: 'h' | 'w',
  value?: DimensionType,
): string | CSSProperties => {
  if (!value) return '';

  if (typeof value === 'number') {
    switch (prefix) {
      case 'h':
        return {
          height: `${value}px`,
        };
      case 'w':
        return {
          width: `${value}px`,
        };
      default:
        return '';
    }
  }

  return DIMENSION_MAP[prefix][value] ?? '';
};

export function getSurfaceThemeClass(theme?: SurfaceTheme): string {
  if (!theme) return '';
  return SURFACE_THEME_MAP[theme] ?? 'bg-page text-ink';
}

function getAlignXClass(alignX?: HorizontalAlignType): string {
  switch (alignX) {
    case 'left':
      return 'justify-self-start';
    case 'center':
      return 'justify-self-center';
    case 'right':
      return 'justify-self-end';
    case 'stretch':
      return 'justify-self-stretch';
    default:
      return '';
  }
}

function getAlignYClass(alignY?: VerticalAlignType): string {
  switch (alignY) {
    case 'top':
      return 'self-start';
    case 'center':
      return 'self-center';
    case 'bottom':
      return 'self-end';
    case 'stretch':
      return 'self-stretch';
    default:
      return '';
  }
}

export function getTextStyle(style: TextStyle): CSSProperties {
  const fontWeight = {
    'semi-bold': 600,
    bold: 700,
    'extra-bold': 800,
  };
  let textDecoration = 'none';

  if (style.decoration === 'strikethrough') {
    textDecoration = 'line-through';
  } else if (style.decoration === 'underline') {
    textDecoration = 'underline';
  }

  return {
    color: style.txtColor,
    textAlign: style.textAlign,
    textDecoration,
    fontStyle: style.fontStyle,
    fontWeight:
      typeof style.fontWeight === 'string'
        ? (fontWeight[style.fontWeight] ?? 400)
        : style.fontWeight,
  };
}

export function getBaseLayoutClassesAndStyle(
  config: FlattenComponent['config'],
): [string, CSSProperties] | null {
  if (!config) return null;

  let style: CSSProperties = {};
  const classes: (string | undefined)[] = [];

  const paddingConfig = 'padding' in config ? config.padding : undefined;
  const surfaceThemeConfig =
    'surfaceTheme' in config ? config.surfaceTheme : undefined;

  const objects = [
    // Dimensions
    getDimensionClass('w', config.w),
    getDimensionClass('h', config.h),

    // Alignments
    getAlignXClass(config.alignSelfX),
    getAlignYClass(config.alignSelfY),

    // Paddings
    paddingConfig && getPaddingClass('t', paddingConfig.top),
    paddingConfig && getPaddingClass('b', paddingConfig.bottom),
    paddingConfig && getPaddingClass('l', paddingConfig.left),
    paddingConfig && getPaddingClass('r', paddingConfig.right),

    // Theme token mapping
    surfaceThemeConfig && getSurfaceThemeClass(surfaceThemeConfig),
  ];

  objects.forEach((element) => {
    if (typeof element === 'string') classes.push(element);
    else
      style = {
        ...style,
        ...element,
      };
  });

  return [classes.filter(Boolean).join(' ').trim(), style];
}
