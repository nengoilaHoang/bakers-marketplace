import useLayoutComponent from '@/hooks/storefront/useLayoutComponent';
import useStorefrontCanvasContext from '@/hooks/storefront/useStorefrontCanvasContext';
import { cn } from '@/lib/cn';
import { HeroBannerCommerceComponent } from '@/types/layout-component/commerce-component';
import { CONTENT_POSITION_MAP, getTextStyle } from '@/utils/layoutClasses';
import Image from 'next/image';
import { useMemo } from 'react';

//TODO: Fix the overlay covering the image

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
        <div className='relative size-full min-h-[300px] flex-1'>
          <Image
            src={
              breakpoint === 'mobile' && mobileMediaUrl
                ? mobileMediaUrl
                : desktopMediaUrl
            }
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
          'pointer-events-none absolute inset-0 z-20 flex flex-col p-6 sm:p-10 md:p-14',
          positionClasses,
        )}
      >
        <div className='max-w-2xl space-y-2 pointer-events-auto'>
          {eyebrow?.value && (
            <p
              className='text-sm uppercase tracking-wider'
              style={getTextStyle(eyebrow)}
            >
              {eyebrow.value}
            </p>
          )}

          {title?.value && (
            <h1
              className='text-3xl font-bold sm:text-4xl md:text-5xl leading-tight'
              style={getTextStyle(title)}
            >
              {title.value}
            </h1>
          )}

          {subtitle?.value && (
            <p
              className='text-base sm:text-lg md:text-xl text-ink-muted'
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
