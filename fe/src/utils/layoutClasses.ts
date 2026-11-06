import {
	DimensionType,
	HorizontalAlignType,
	PaddingType,
	SurfaceTheme,
	TextConfig,
	VerticalAlignType
} from '@/types/layout-component';
import {
	HeroBannerContentPosition,
	HeroBannerContentSize,
} from '@/types/layout-component/commerce-component';
import { CSSProperties } from 'react';
import { FlattenComponent } from './flattenLayout';

export const HERO_TYPOGRAPHY_PRESETS: Record<
  HeroBannerContentSize,
  { eyebrow: string; title: string; subtitle: string }
> = {
  compact: {
    eyebrow: 'text-xs tracking-wider uppercase',
    title: 'text-2xl sm:text-3xl md:text-4xl leading-tight',
    subtitle: 'text-sm sm:text-base text-ink-muted',
  },
  medium: {
    eyebrow: 'text-xs sm:text-sm tracking-wider uppercase',
    title: 'text-3xl sm:text-4xl md:text-5xl leading-tight',
    subtitle: 'text-base sm:text-lg text-ink-muted',
  },
  large: {
    eyebrow: 'text-sm tracking-widest uppercase',
    title: 'text-4xl sm:text-5xl md:text-6xl leading-tight',
    subtitle: 'text-lg sm:text-xl text-ink-muted',
  },
  impact: {
    eyebrow: 'text-sm sm:text-base tracking-widest uppercase',
    title: 'text-5xl sm:text-6xl md:text-7xl leading-none tracking-tight',
    subtitle: 'text-xl sm:text-2xl text-ink-muted',
  },
};

const DIMENSION_MAP: Record<'h' | 'w', Record<DimensionType, string>> = {
  w: { full: 'w-full', auto: 'w-auto', sm: 'w-1/4', md: 'w-1/2', lg: 'w-3/4' },
  h: { full: 'h-full', auto: 'h-auto', sm: 'h-1/4', md: 'h-1/2', lg: 'h-3/4' },
};

export const HERO_POSITION_CLASSES: Record<
  'mobile' | 'tablet' | 'desktop',
  Record<HeroBannerContentPosition, string>
> = {
  mobile: {
    'top-left': 'justify-start items-start text-left',
    'top-center': 'justify-start items-center text-center',
    'top-right': 'justify-start items-end text-right',
    'middle-left': 'justify-center items-start text-left',
    'middle-center': 'justify-center items-center text-center',
    'middle-right': 'justify-center items-end text-right',
    'bottom-left': 'justify-end items-start text-left',
    'bottom-center': 'justify-end items-center text-center',
    'bottom-right': 'justify-end items-end text-right',
  },
  tablet: {
    'top-left': 'md:justify-start md:items-start md:text-left',
    'top-center': 'md:justify-start md:items-center md:text-center',
    'top-right': 'md:justify-start md:items-end md:text-right',
    'middle-left': 'md:justify-center md:items-start md:text-left',
    'middle-center': 'md:justify-center md:items-center md:text-center',
    'middle-right': 'md:justify-center md:items-end md:text-right',
    'bottom-left': 'md:justify-end md:items-start md:text-left',
    'bottom-center': 'md:justify-end md:items-center md:text-center',
    'bottom-right': 'md:justify-end md:items-end md:text-right',
  },
  desktop: {
    'top-left': 'lg:justify-start lg:items-start lg:text-left',
    'top-center': 'lg:justify-start lg:items-center lg:text-center',
    'top-right': 'lg:justify-start lg:items-end lg:text-right',
    'middle-left': 'lg:justify-center lg:items-start lg:text-left',
    'middle-center': 'lg:justify-center lg:items-center lg:text-center',
    'middle-right': 'lg:justify-center lg:items-end lg:text-right',
    'bottom-left': 'lg:justify-end lg:items-start lg:text-left',
    'bottom-center': 'lg:justify-end lg:items-center lg:text-center',
    'bottom-right': 'lg:justify-end lg:items-end lg:text-right',
  },
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

export function getTextStyle(style: TextConfig): CSSProperties {
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
    color: style.textColor,
    ...(style.textAlign ? { textAlign: style.textAlign } : {}),
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

  const widthConfig = 'w' in config ? config.w : undefined;
  const heightConfig = 'h' in config ? config.h : undefined;
  const paddingConfig = 'padding' in config ? config.padding : undefined;
  const surfaceThemeConfig =
    'surfaceTheme' in config ? config.surfaceTheme : undefined;
  const alignXConfig = 'alignSelfX' in config ? config.alignSelfX : undefined;
  const alignYConfig = 'alignSelfY' in config ? config.alignSelfY : undefined;

  const objects = [
    // Dimensions
    widthConfig && getDimensionClass('w', widthConfig),
    heightConfig && getDimensionClass('h', heightConfig),

    // Alignments
    alignXConfig && getAlignXClass(alignXConfig),
    alignYConfig && getAlignYClass(alignYConfig),

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
