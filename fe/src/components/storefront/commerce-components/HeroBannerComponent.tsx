import useLayoutComponent from '@/hooks/storefront/useLayoutComponent';
import useStorefrontCanvasContext from '@/hooks/storefront/useStorefrontCanvasContext';
import { cn } from '@/lib/cn';
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
} from '@/types/layout-component/commerce-component';
import {
  getTextStyle,
  HERO_POSITION_CLASSES,
  HERO_TYPOGRAPHY_PRESETS,
} from '@/utils/layoutClasses';
import Image from 'next/image';
import { CSSProperties, useMemo } from 'react';

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
  sourceParentId: string;
  sourceSlot: number;
};

const HeroBannerComponent = ({
  component,
  sourceParentId,
  sourceSlot,
}: HeroBannerProps) => {
  const {
    id,
    tabIndex,
    baseClasses,
    baseStyle,
    ref,
    isDragging,
    isSelected,
    handleKeyDown,
    handleMouseDown,
    handleFocus,
  } = useLayoutComponent({ component, sourceParentId, sourceSlot });

  const { breakpoint } = useStorefrontCanvasContext();

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

  const positionClasses = useMemo(() => {
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
      ...baseStyle,
      ...focalPointStyle,
      ...aspectStyles,
    };
  }, [aspect, baseStyle, focalPoint]);

  const containerClassName = useMemo(() => {
    const fitClass = fit ? getFitClass(fit) : '';
    return cn(
      baseClasses,
      'relative flex overflow-hidden',
      'aspect-(--aspect-ratio-mobile) md:aspect-(--aspect-ratio-tablet) lg:aspect-(--aspect-ratio-desktop)',
      fitClass,
    );
  }, [baseClasses, fit]);

  return (
    <div
      id={id}
      tabIndex={tabIndex}
      className={containerClassName}
      style={containerStyle}
      ref={ref}
      role='button'
      data-layout-node='true'
      data-source-parent-id={sourceParentId}
      data-source-slot={sourceSlot}
      aria-controls={sourceParentId}
      aria-busy={isDragging}
      aria-pressed={isSelected || isDragging}
      aria-label='Hero Banner'
      onKeyDown={handleKeyDown}
      onMouseDown={handleMouseDown}
      onFocus={handleFocus}
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
              priority
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
              priority
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
      {/* Content Layer */}
      <div
        className={cn(
          'pointer-events-none absolute inset-0 z-20 flex flex-col',
          positionClasses,
        )}
      >
        <div className='w-full sm:max-w-lg md:max-w-xl lg:max-w-2xl pointer-events-auto space-y-2'>
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
    </div>
  );
};

export default HeroBannerComponent;
