import { cn } from '@/lib/cn';
import { DeviceBreakpoint } from '@/types/canvas';
import { ResponsiveProp } from '@/types/layout-component';
import {
  ASPECT_RATIO_REGEX,
  AspectRatioValue,
  MediaFit,
  STANDARD_ASPECT_RATIOS,
} from '@/types/layout-component/aspect-ratio';
import {
  HeroBannerCommerceComponent,
  HeroBannerContentPosition,
  HeroBannerCta,
  HeroBannerCtaColorScheme,
  HeroBannerCtaSize,
  HeroBannerCtaStyle,
} from '@/types/layout-component/commerce-component';
import {
  getTextStyle,
  HERO_POSITION_CLASSES,
  HERO_TYPOGRAPHY_PRESETS,
} from '@/utils/layoutClasses';
import Image from 'next/image';
import Link from 'next/link';
import { CSSProperties, useCallback, useMemo } from 'react';
import { NodeRendererMode } from '../NodeRenderer';
import CanvasNodeWrapper from '../canvas/CanvasNodeWrapper';

const getAspectRatio = (aspect: AspectRatioValue): string => {
  let aspectRatio = '';
  if (typeof aspect === 'number') {
    aspectRatio = `${aspect}`;
  }

  if (typeof aspect === 'string') {
    if (
      STANDARD_ASPECT_RATIOS.some(
        (standardAspect) => standardAspect === aspect,
      ) ||
      ASPECT_RATIO_REGEX.test(aspect)
    ) {
      // Convert "16:9" -> "16 / 9" for valid CSS syntax
      aspectRatio = aspect.replace(':', ' / ');
    }
  }

  return aspectRatio;
};

const FIT_CLASSES: Record<MediaFit, string> = {
  cover: 'object-cover',
  contain: 'object-contain',
  fill: 'object-fill',
  none: 'object-none',
  'scale-down': 'object-scale-down',
};

const getFitClass = (fit: MediaFit): string => {
  return FIT_CLASSES[fit] || '';
};

const getFocalPointStyle = (focalPoint: {
  x: number;
  y: number;
}): CSSProperties => {
  const { x, y } = focalPoint;
  return {
    objectPosition: `${x * 100}% ${y * 100}%`,
  };
};

type HeroBannerProps = {
  component: HeroBannerCommerceComponent;
  sourceParentId?: string;
  sourceSlot?: number;
  mode: NodeRendererMode;
};

const CTA_STYLE_CLASSES: Record<HeroBannerCtaStyle, string> = {
  solid:
    'border border-transparent shadow-xs hover:opacity-90 active:opacity-85',
  outline:
    'border border-current bg-transparent hover:bg-white/15 active:bg-white/20',
  ghost:
    'border border-transparent bg-transparent underline-offset-4 hover:bg-white/15 hover:underline active:bg-white/20',
};

const CTA_SIZE_CLASSES: Record<
  DeviceBreakpoint,
  Record<HeroBannerCtaSize, string>
> = {
  mobile: {
    sm: 'h-7 px-3 text-[11px] gap-1',
    md: 'h-8 px-4 text-xs gap-1.5',
    lg: 'h-9 px-5 text-sm gap-2',
  },
  tablet: {
    sm: 'md:h-8 md:px-3.5 md:text-xs md:gap-1.5',
    md: 'md:h-9 md:px-5 md:text-sm md:gap-1.5',
    lg: 'md:h-11 md:px-6 md:text-sm md:gap-2',
  },
  desktop: {
    sm: 'lg:h-9 lg:px-4 lg:text-xs lg:gap-1.5',
    md: 'lg:h-11 lg:px-6 lg:text-sm lg:gap-2',
    lg: 'lg:h-13 lg:px-8 lg:text-base lg:gap-2.5',
  },
};

const CTA_SOLID_SCHEMES: Record<HeroBannerCtaColorScheme, string> = {
  primary:
    'bg-(--color-primary,#18181b) text-(--color-primary-foreground,#ffffff)',
  secondary:
    'bg-(--color-secondary,#18181b) text-(--color-secondary-foreground,#ffffff)',
  accent:
    'bg-(--color-accent,#18181b) text-(--color-accent-foreground,#ffffff)',
  neutral: 'bg-(--color-surface,#ffffff) text-(--color-text-primary,#18181b)',
};

const CTA_TEXT_SCHEMES: Record<HeroBannerCtaColorScheme, string> = {
  primary: 'text-(--color-primary,#ffffff)',
  secondary: 'text-(--color-secondary,#ffffff)',
  accent: 'text-(--color-accent,#ffffff)',
  neutral: 'text-(--color-text-primary,#ffffff)',
};

const getCtaColorScheme = (
  colorScheme: HeroBannerCtaColorScheme = 'primary',
  style: HeroBannerCtaStyle = 'solid',
): string => {
  return style === 'solid'
    ? CTA_SOLID_SCHEMES[colorScheme]
    : CTA_TEXT_SCHEMES[colorScheme];
};

type HeroBannerCtaButtonProps = HeroBannerCta & {
  isEditor?: boolean;
};

const HeroBannerCtaButton = ({
  label,
  target,
  style,
  colorScheme = 'primary',
  url,
  size,
  isEditor = false,
}: HeroBannerCtaButtonProps) => {
  const handleClickCapture = useCallback(
    (e: React.MouseEvent<HTMLAnchorElement>) => {
      if (!isEditor) return;

      const isMod = e.ctrlKey || e.metaKey || e.altKey;
      if (!isMod) {
        e.preventDefault();
        e.stopPropagation();
      }
    },
    [isEditor],
  );

  const ctaSizeClasses = useMemo(() => {
    const desktopSize = size?.desktop ?? 'md';
    const tabletSize = size?.tablet ?? desktopSize;
    const mobileSize = size?.mobile ?? tabletSize;
    return [
      CTA_SIZE_CLASSES.mobile[mobileSize],
      CTA_SIZE_CLASSES.tablet[tabletSize],
      CTA_SIZE_CLASSES.desktop[desktopSize],
    ].join(' ');
  }, [size]);

  if (!label?.trim()) return null;

  return (
    <Link
      href={url || '#'}
      target={target}
      rel={target === '_blank' ? 'noopener noreferrer' : undefined}
      tabIndex={isEditor ? -1 : undefined}
      onClickCapture={handleClickCapture}
      onAuxClickCapture={handleClickCapture}
      className={cn(
        'inline-flex shrink-0 items-center justify-center rounded-md font-medium whitespace-nowrap select-none',
        'outline-none focus-visible:ring-2 focus-visible:ring-white/80 focus-visible:ring-offset-2 focus-visible:ring-offset-zinc-900',
        isEditor
          ? 'transition-[top,right,bottom,left,opacity,background-color] duration-150 ease-in-out'
          : 'transition-all duration-150 ease-in-out',
        CTA_STYLE_CLASSES[style],
        getCtaColorScheme(colorScheme, style),
        ctaSizeClasses,
      )}
    >
      {label}
    </Link>
  );
};

const HeroBannerComponent = ({
  component,
  sourceParentId,
  sourceSlot,
  mode,
}: HeroBannerProps) => {
  const isEditor = mode === NodeRendererMode.Editor;
  const { config } = component;
  const {
    aspect,
    fit,
    focalPoint,
    mediaType,
    mobileMediaUrl,
    desktopMediaUrl,
    altText,
    eyebrow,
    title,
    subtitle,
    contentPosition,
    contentSize,
    overlay,
    primaryCta,
    secondaryCta,
    ctaPosition,
  } = config;

  const contentPositionClasses = useMemo(() => {
    const getHeroBannerPositionClasses = (
      contentPosition?: ResponsiveProp<HeroBannerContentPosition>,
    ): string => {
      const desktopPos = contentPosition?.desktop ?? 'middle-center';
      const tabletPos = contentPosition?.tablet ?? desktopPos;
      const mobilePos = contentPosition?.mobile ?? tabletPos;

      return [
        HERO_POSITION_CLASSES.desktop[desktopPos],
        HERO_POSITION_CLASSES.tablet[tabletPos],
        HERO_POSITION_CLASSES.mobile[mobilePos],
      ].join(' ');
    };

    return getHeroBannerPositionClasses(contentPosition);
  }, [contentPosition]);

  const contentSizeClasses = useMemo(
    () => HERO_TYPOGRAPHY_PRESETS[contentSize ?? 'large'],
    [contentSize],
  );

  const ctaPositionClasses = useMemo(() => {
    const getHeroBannerCtaPositionClasses = (
      ctaPosition?: ResponsiveProp<HeroBannerContentPosition>,
    ): string => {
      const desktopPos = ctaPosition?.desktop ?? 'middle-center';
      const tabletPos = ctaPosition?.tablet ?? desktopPos;
      const mobilePos = ctaPosition?.mobile ?? tabletPos;

      return [
        HERO_POSITION_CLASSES.desktop[desktopPos],
        HERO_POSITION_CLASSES.tablet[tabletPos],
        HERO_POSITION_CLASSES.mobile[mobilePos],
      ].join(' ');
    };
    return getHeroBannerCtaPositionClasses(ctaPosition);
  }, [ctaPosition]);

  const containerStyle = useMemo(() => {
    const focalPointStyle = focalPoint ? getFocalPointStyle(focalPoint) : {};

    const aspectStyles = (function () {
      if (!aspect) return {};

      const desktopRatio = getAspectRatio(aspect.desktop);
      const tabletRatio = aspect.tablet
        ? getAspectRatio(aspect.tablet)
        : desktopRatio;
      const mobileRatio = aspect.mobile
        ? getAspectRatio(aspect.mobile)
        : tabletRatio;

      return {
        '--aspect-ratio-mobile': `${mobileRatio}`,
        '--aspect-ratio-tablet': `${tabletRatio}`,
        '--aspect-ratio-desktop': `${desktopRatio}`,
      } as CSSProperties;
    })();

    return {
      ...focalPointStyle,
      ...aspectStyles,
    };
  }, [aspect, focalPoint]);

  const containerClassName = useMemo(() => {
    const fitClass = fit ? getFitClass(fit) : '';
    return cn(
      'relative flex overflow-hidden',
      'aspect-(--aspect-ratio-mobile) md:aspect-(--aspect-ratio-tablet) lg:aspect-(--aspect-ratio-desktop)',
      fitClass,
    );
  }, [fit]);

  const editorProps = {
    'aria-label': 'Hero Banner',
  };

  return (
    <CanvasNodeWrapper
      mode={mode}
      component={component}
      sourceParentId={sourceParentId}
      sourceSlot={sourceSlot}
      className={containerClassName}
      style={containerStyle}
      {...(isEditor ? editorProps : {})}
    >
      {/* Background Media */}
      {mediaType === 'image' && (
        <div className='absolute inset-0 min-h-0 min-w-0'>
          {/* If you have distinct mobile & desktop URLs, render both and toggle visibility with CSS */}
          {mobileMediaUrl && (
            <Image
              src={mobileMediaUrl}
              draggable={false}
              alt={altText || 'Hero Banner'}
              fill
              preload
              sizes='100vw'
              className={cn(
                'object-cover',
                // Show on mobile, hide on md/desktop
                desktopMediaUrl ? 'block md:hidden' : 'block',
              )}
            />
          )}

          {desktopMediaUrl && (
            <Image
              src={desktopMediaUrl}
              draggable={false}
              alt={altText || 'Hero Banner'}
              fill
              preload
              sizes='100vw'
              className={cn(
                'object-cover',
                // Hide on mobile, show on md/desktop
                mobileMediaUrl ? 'hidden md:block' : 'block',
              )}
            />
          )}
        </div>
      )}
      {/* Overlay */}
      {overlay.type !== 'none' && (
        <div
          className='pointer-events-none absolute inset-0 z-10'
          style={{
            backgroundColor:
              overlay.type === 'solid' ? overlay.color : undefined,
            backgroundImage:
              overlay.type === 'gradient'
                ? `linear-gradient(to bottom, transparent, ${overlay.color})`
                : undefined,
            opacity: (overlay.opacity ?? 50) / 100,
          }}
        ></div>
      )}

      <div className='relative w-full h-full z-20'>
        {/* Content Layer */}
        <div
          className={cn(
            'pointer-events-none absolute z-0 flex flex-col w-full px-4 sm:max-w-lg md:max-w-xl lg:max-w-2xl',
            contentPositionClasses,
          )}
        >
          <div className='w-full pointer-events-auto space-y-2'>
            {eyebrow?.value && (
              <p
                className={cn(contentSizeClasses['eyebrow'])}
                style={getTextStyle(eyebrow)}
              >
                {eyebrow.value}
              </p>
            )}

            {title?.value && (
              <h1
                className={cn(contentSizeClasses['title'])}
                style={getTextStyle(title)}
              >
                {title.value}
              </h1>
            )}

            {subtitle?.value && (
              <p
                className={cn(contentSizeClasses['subtitle'])}
                style={getTextStyle(subtitle)}
              >
                {subtitle.value}
              </p>
            )}
          </div>
        </div>
        {/* CTAs */}
        {(primaryCta?.label || secondaryCta?.label) && (
          <div
            className={cn(
              'pointer-events-none absolute transition-all duration-300 ease-in-out',
              ctaPositionClasses,
            )}
          >
            <div className='pointer-events-auto flex flex-wrap items-center gap-3'>
              {primaryCta?.label && (
                <HeroBannerCtaButton
                  key='primary'
                  {...primaryCta}
                  isEditor={isEditor}
                />
              )}
              {secondaryCta?.label && (
                <HeroBannerCtaButton
                  key='secondary'
                  {...secondaryCta}
                  isEditor={isEditor}
                />
              )}
            </div>
          </div>
        )}
      </div>
    </CanvasNodeWrapper>
  );
};

export default HeroBannerComponent;
