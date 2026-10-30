import useLayoutComponent from '@/hooks/storefront/useLayoutComponent';
import useStorefrontCanvasContext from '@/hooks/storefront/useStorefrontCanvasContext';
import { cn } from '@/lib/cn';
import { HeroBannerCommerceComponent } from '@/types/layout-component/commerce-component';
import {
  CONTENT_POSITION_MAP,
  getTextStyle,
  HERO_TYPOGRAPHY_PRESETS,
} from '@/utils/layoutClasses';
import Image from 'next/image';
import { useMemo } from 'react';

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
    mediaType,
    mobileMediaUrl,
    desktopMediaUrl,
    altText,
    eyebrow,
    title,
    subtitle,
    contentPosition,
    overlay,
    primaryCta,
    secondaryCta,
    ctaPosition,
  } = config;

  const positionClasses = useMemo(
    () =>
      CONTENT_POSITION_MAP[contentPosition] ??
      'justify-center items-center text-center',
    [contentPosition],
  );

  const contentSizeClasses = useMemo(
    () => HERO_TYPOGRAPHY_PRESETS[config.contentSize] || '',
    [config.contentSize],
  );

  return (
    <div
      id={id}
      tabIndex={tabIndex}
      className={cn(
        'relative flex overflow-hidden w-full min-h-[300px]',
        baseClasses,
      )}
      style={baseStyle}
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
        <div className='relative size-full min-h-75 flex-1'>
          <Image
            src={
              breakpoint === 'mobile' && mobileMediaUrl
                ? mobileMediaUrl
                : desktopMediaUrl
            }
            draggable={false}
            alt={altText}
            fill
            className='object-cover'
            priority
          />
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
