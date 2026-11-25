import Icon from '@/components/ui/Icon';
import { useOptionalRepeaterItem } from '@/hooks/storefront/RepeaterItemContextProvider';
import { cn } from '@/lib/cn';
import {
  DYNAMIC_PLACEHOLDER_REGEX,
  TOKEN_ALLOW_LIST,
} from '@/types/layout-component';
import {
  ProductCardBodyItem,
  ProductCardCommerceComponent,
} from '@/types/layout-component/commerce-component';
import {
  getAspectRatio,
  getImageScaleClass,
  getTextStyle,
} from '@/utils/layoutClasses';
import Image from 'next/image';
import { CSSProperties, useCallback, useId } from 'react';
import CanvasNodeWrapper from '../canvas/CanvasNodeWrapper';
import { NodeRendererMode } from '../NodeRenderer';

type ProductCardComponentProps = {
  component: ProductCardCommerceComponent;
  sourceParentId?: string;
  sourceSlot?: number;
  mode: NodeRendererMode;
};

const ProductCardComponent = ({
  component,
  sourceParentId,
  sourceSlot,
  mode,
}: ProductCardComponentProps) => {
  const repeaterCtx = useOptionalRepeaterItem();
  const product = repeaterCtx?.item;
  const { config } = component;
  const { thumbnail } = config;

  const dynamicPlaceholderResolver = useCallback(
    (value: string) => {
      if (!product) return value;

      let newValue = value;
      const matches = Array.from(value.matchAll(DYNAMIC_PLACEHOLDER_REGEX));
      for (const match of matches) {
        const extracted = match[1];
        if (!TOKEN_ALLOW_LIST.test(extracted)) {
          return value;
        }
        const segments = extracted.split('.').filter(Boolean);
        let current: unknown = { product };
        for (const segment of segments) {
          if (typeof current !== 'object' || current === null) {
            break;
          }
          current = (current as Record<string, unknown>)[segment];
        }
        newValue = newValue.replace(match[0], String(current));
      }

      return newValue;
    },
    [product],
  );

  const aspectRatio = getAspectRatio(thumbnail.ratio);
  const isAutoRatio = !aspectRatio || aspectRatio === 'auto';
  const resolvedThumbnailUrl = dynamicPlaceholderResolver(thumbnail.url);

  return (
    <CanvasNodeWrapper
      mode={mode}
      component={component}
      sourceParentId={sourceParentId}
      sourceSlot={sourceSlot}
    >
      <div className='flex flex-col w-full'>
        {isAutoRatio ? (
          <Image
            unoptimized={true}
            src={resolvedThumbnailUrl}
            alt='Thumbnail Image'
            width={600}
            height={400}
            preload
            sizes='100vw'
            className={cn(
              'w-full h-auto shrink-0',
              getImageScaleClass(thumbnail.fit),
            )}
          />
        ) : (
          <div
            style={{ aspectRatio }}
            className='relative w-full shrink-0 overflow-hidden'
          >
            <Image
              unoptimized={true}
              src={resolvedThumbnailUrl}
              alt='Thumbnail Image'
              fill
              preload
              sizes='100vw'
              className={cn('size-full', getImageScaleClass(thumbnail.fit))}
            />
          </div>
        )}
        <ProductCardSimpleLayout
          config={config}
          resolver={dynamicPlaceholderResolver}
        />
      </div>
    </CanvasNodeWrapper>
  );
};

const ProductCardSimpleLayout = ({
  config,
  resolver,
}: {
  config: ProductCardCommerceComponent['config'];
  resolver: (value: string) => unknown;
}) => {
  const { content } = config;
  const { header, body } = content;
  const { title, subtitle } = header;

  const renderBodyItem = (item: ProductCardBodyItem, index: number) => {
    switch (item.type) {
      case 'description': {
        return (
          <p key={index} className='w-full' style={getTextStyle(item.style)}>
            {String(resolver(item.value))}
          </p>
        );
      }

      case 'ratings': {
        const resolvedValue = resolver(item.value);

        return (
          <div key={index} className='w-full'>
            {item.ratingType === 'stars' ? (
              <StarRating rating={Number(resolvedValue)} color={item.color} />
            ) : (
              <span style={getTextStyle(item.style)}>
                {String(resolvedValue)}
              </span>
            )}
          </div>
        );
      }

      case 'priceTag': {
        const priceConfig = item.style?.color;
        const unitConfig = item.style?.unitColor;
        const priceStyle: CSSProperties | undefined = priceConfig
          ? getTextStyle(priceConfig)
          : undefined;
        const unitStyle: CSSProperties | undefined = unitConfig
          ? getTextStyle(unitConfig)
          : undefined;

        const separator =
          item.format.unitSeparator === 'per'
            ? ' per '
            : item.format.unitSeparator;

        return (
          <div key={index} className='w-full' style={priceStyle}>
            <span>
              {item.format.showCurrency && String(resolver(item.currency))}
              {String(resolver(item.value))}
            </span>
            {item.format.showUnit && item.unit && (
              <span style={unitStyle}>
                {separator}
                {String(resolver(item.unit))}
              </span>
            )}
          </div>
        );
      }

      default:
        return null;
    }
  };

  return (
    <>
      <div className='flex flex-col w-full'>
        <h2 style={getTextStyle(title)}>
          {String(resolver(title.value))}
        </h2>
        {subtitle && (
          <h3 style={getTextStyle(subtitle)}>
            {String(resolver(subtitle.value))}
          </h3>
        )}
      </div>
      <div className='flex flex-col w-full'>
        {body.map((item, index) => renderBodyItem(item, index))}
      </div>
    </>
  );
};

const StarRating = ({ rating, color }: { rating: number; color: string }) => {
  const uid = useId();
  const clamped = Math.max(
    0,
    Math.min(5, Number.isFinite(rating) ? rating : 0),
  );

  return (
    <span
      className='inline-flex items-center gap-0.5'
      aria-label={`${clamped} out of 5 stars`}
    >
      {Array.from({ length: 5 }, (_, idx) => {
        const fillPercent = Math.max(0, Math.min(100, (clamped - idx) * 100));
        const gradientId = `${uid}-star-${idx}`;

        const style = {
          '--star-color': color,
          '--pct': fillPercent,
          background: `linear-gradient(
						to right,
						var(--start-color, yellow) var(--pct, 0),
						var(--start-color, yellow) var(--pct, 0)
					)`,
        } as CSSProperties;

        return <Icon style={style} key={gradientId} name='star' />;
      })}
    </span>
  );
};

export default ProductCardComponent;
