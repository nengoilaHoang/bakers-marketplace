import { ProductCardBodyItem } from '@/types/layout-component/commerce-component';
import { SectionId } from '../../ComponentInspector';
import ConfigInput from '../ConfigInput';
import ConfigLabel from '../ConfigLabel';
import ConfigSectionWrapper from '../ConfigSectionWrapper';
import DataPlaceholderPicker from '../inputs/DataPlaceholderPicker';
import TextConfigGroup, { DEFAULT_TEXT_CONFIG } from '../TextConfigGroup';
import { SAMPLE_PRODUCT_SOURCE } from './sampleProductSource';

const RATING_TYPE_OPTIONS = {
  stars: 'Stars',
  numeral: 'Numeral',
} as const;

const UNIT_SEPARATOR_OPTIONS = {
  '/': '/ (slash)',
  '.': '. (dot)',
  per: 'per',
} as const;

const QUICK_PALETTE = [
  '#EAB308',
  '#F59E0B',
  '#18181B',
  '#52525B',
  '#B91C1C',
];

const DEFAULT_BODY_ITEMS: Record<
  ProductCardBodyItem['type'],
  ProductCardBodyItem
> = {
  description: {
    type: 'description',
    value: '{{ product.description }}',
    style: {
      textColor: '#52525B',
      textAlign: 'left',
      fontWeight: 400,
      fontStyle: 'normal',
      decoration: 'none',
    },
  },
  ratings: {
    type: 'ratings',
    value: '4.9',
    ratingType: 'stars',
    color: '#EAB308',
  },
  priceTag: {
    type: 'priceTag',
    value: '{{ product.unitPrice }}',
    currency: '{{ product.currency }}',
    unit: '{{ product.unit }}',
    format: {
      showCurrency: true,
      showUnit: true,
      unitSeparator: '/',
    },
  },
};

type ProductCardBodySectionProps = {
  isOpen: boolean;
  toggleSection: () => void;
  body: ProductCardBodyItem[];
  onUpdate: (pathname: string, value: unknown) => void;
  onActiveSectionChange: (isActive: boolean) => void;
  zIndex: number;
};

const ProductCardBodySection = ({
  isOpen,
  toggleSection,
  body,
  onUpdate,
  onActiveSectionChange,
  zIndex,
}: ProductCardBodySectionProps) => {
  const id: SectionId = 'product-card-body';

  const existingTypes = new Set(body.map((item) => item.type));

  const handleAddItem = (type: ProductCardBodyItem['type']) => {
    if (existingTypes.has(type)) return;
    onUpdate('content.body', [...body, DEFAULT_BODY_ITEMS[type]]);
  };

  const handleRemoveItem = (index: number) => {
    onUpdate(
      'content.body',
      body.filter((_, idx) => idx !== index),
    );
  };

  const makeStyleProxyUpdate =
    (index: number) => (pathname: string, value: unknown) => {
      const key = pathname.split('.').pop();
      if (!key) return;
      if (key === 'value') {
        onUpdate(`content.body.${index}.value`, value);
        return;
      }
      const styleKey = key === 'txtColor' ? 'textColor' : key;
      onUpdate(`content.body.${index}.style.${styleKey}`, value);
    };

  return (
    <ConfigSectionWrapper
      id={id}
      title='Product Card Body'
      description='Configure the description, ratings, and price tag shown in the card body.'
      isOpen={isOpen}
      onToggle={toggleSection}
      zIndex={zIndex}
    >
      <div className='flex flex-col gap-3'>
        {body.map((item, index) => {
          if (item.type === 'description') {
            return (
              <div key={item.type} className='flex flex-col gap-2'>
                <div className='flex justify-end'>
                  <button
                    type='button'
                    onClick={() => handleRemoveItem(index)}
                    className='text-[11px] font-medium text-zinc-500 hover:text-zinc-900'
                  >
                    Remove Description
                  </button>
                </div>
                <TextConfigGroup
                  label='Description'
                  fieldPrefix={`body-desc-${index}`}
                  item={{ value: item.value, ...item.style }}
                  defaultColor='#52525B'
                  dataSource={SAMPLE_PRODUCT_SOURCE}
                  onUpdate={makeStyleProxyUpdate(index)}
                  onActiveSectionChange={onActiveSectionChange}
                />
              </div>
            );
          }

          if (item.type === 'ratings') {
            return (
              <div
                key={item.type}
                className='flex flex-col gap-3 rounded-lg border border-zinc-200 bg-zinc-50/60 p-3'
              >
                <div className='flex items-center justify-between'>
                  <span className='text-xs font-semibold uppercase tracking-wide text-zinc-800'>
                    Ratings
                  </span>
                  <button
                    type='button'
                    onClick={() => handleRemoveItem(index)}
                    className='text-[11px] font-medium text-zinc-500 hover:text-zinc-900'
                  >
                    Remove
                  </button>
                </div>

                <div className='flex flex-col gap-1.5'>
                  <ConfigLabel
                    label='Value'
                    forId={`pc-ratings-value-${index}`}
                  />
                  <DataPlaceholderPicker
                    id={`pc-ratings-value-${index}`}
                    name={`content.body.${index}.value`}
                    currentValue={item.value}
                    source={SAMPLE_PRODUCT_SOURCE}
                    onValueChange={(val) =>
                      onUpdate(`content.body.${index}.value`, val)
                    }
                    onOpenStateChange={onActiveSectionChange}
                  />
                </div>

                <div className='flex flex-col gap-1.5'>
                  <ConfigLabel
                    label='Display Type'
                    forId={`pc-ratings-type-${index}`}
                  />
                  <ConfigInput
                    id={`pc-ratings-type-${index}`}
                    name={`content.body.${index}.ratingType`}
                    inputType='select'
                    selectOptions={RATING_TYPE_OPTIONS}
                    currentValue={item.ratingType}
                    onValueChange={(val) => {
                      if (val === 'stars') {
                        onUpdate(`content.body.${index}`, {
                          type: 'ratings',
                          value: item.value,
                          ratingType: 'stars',
                          color: '#EAB308',
                        });
                      } else if (val === 'numeral') {
                        const { value: _v, ...defaultStyle } =
                          DEFAULT_TEXT_CONFIG;
                        onUpdate(`content.body.${index}`, {
                          type: 'ratings',
                          value: item.value,
                          ratingType: 'numeral',
                          style: defaultStyle,
                        });
                      }
                    }}
                    onOpenStateChange={onActiveSectionChange}
                  />
                </div>

                {item.ratingType === 'stars' ? (
                  <div className='flex flex-col gap-1.5'>
                    <ConfigLabel
                      label='Star Color'
                      forId={`pc-ratings-color-${index}`}
                    />
                    <ConfigInput
                      id={`pc-ratings-color-${index}`}
                      name={`content.body.${index}.color`}
                      inputType='color'
                      presets={QUICK_PALETTE}
                      currentValue={item.color}
                      onValueChange={(val) =>
                        onUpdate(`content.body.${index}.color`, val)
                      }
                      onOpenStateChange={onActiveSectionChange}
                    />
                  </div>
                ) : (
                  <TextConfigGroup
                    label='Numeral Style'
                    fieldPrefix={`body-ratings-${index}`}
                    item={{ value: item.value, ...item.style }}
                    dataSource={SAMPLE_PRODUCT_SOURCE}
                    onUpdate={makeStyleProxyUpdate(index)}
                    onActiveSectionChange={onActiveSectionChange}
                  />
                )}
              </div>
            );
          }

          if (item.type === 'priceTag') {
            return (
              <div
                key={item.type}
                className='flex flex-col gap-3 rounded-lg border border-zinc-200 bg-zinc-50/60 p-3'
              >
                <div className='flex items-center justify-between'>
                  <span className='text-xs font-semibold uppercase tracking-wide text-zinc-800'>
                    Price Tag
                  </span>
                  <button
                    type='button'
                    onClick={() => handleRemoveItem(index)}
                    className='text-[11px] font-medium text-zinc-500 hover:text-zinc-900'
                  >
                    Remove
                  </button>
                </div>

                <div className='flex flex-col gap-1.5'>
                  <ConfigLabel
                    label='Price Value'
                    forId={`pc-price-value-${index}`}
                  />
                  <DataPlaceholderPicker
                    id={`pc-price-value-${index}`}
                    name={`content.body.${index}.value`}
                    currentValue={item.value}
                    source={SAMPLE_PRODUCT_SOURCE}
                    onValueChange={(val) =>
                      onUpdate(`content.body.${index}.value`, val)
                    }
                    onOpenStateChange={onActiveSectionChange}
                  />
                </div>

                <div className='grid grid-cols-2 gap-2'>
                  <div className='flex flex-col gap-1.5'>
                    <ConfigLabel
                      label='Currency'
                      forId={`pc-price-currency-${index}`}
                    />
                    <DataPlaceholderPicker
                      id={`pc-price-currency-${index}`}
                      name={`content.body.${index}.currency`}
                      currentValue={item.currency}
                      source={SAMPLE_PRODUCT_SOURCE}
                      onValueChange={(val) =>
                        onUpdate(`content.body.${index}.currency`, val)
                      }
                      onOpenStateChange={onActiveSectionChange}
                    />
                  </div>

                  <div className='flex flex-col gap-1.5'>
                    <ConfigLabel
                      label='Unit'
                      forId={`pc-price-unit-${index}`}
                    />
                    <DataPlaceholderPicker
                      id={`pc-price-unit-${index}`}
                      name={`content.body.${index}.unit`}
                      currentValue={item.unit}
                      source={SAMPLE_PRODUCT_SOURCE}
                      onValueChange={(val) =>
                        onUpdate(`content.body.${index}.unit`, val)
                      }
                      onOpenStateChange={onActiveSectionChange}
                    />
                  </div>
                </div>

                <div className='flex flex-col gap-1.5'>
                  <ConfigLabel
                    label='Unit Separator'
                    forId={`pc-price-sep-${index}`}
                  />
                  <ConfigInput
                    id={`pc-price-sep-${index}`}
                    name={`content.body.${index}.format.unitSeparator`}
                    inputType='select'
                    selectOptions={UNIT_SEPARATOR_OPTIONS}
                    currentValue={item.format.unitSeparator}
                    onValueChange={(val) =>
                      onUpdate(
                        `content.body.${index}.format.unitSeparator`,
                        val,
                      )
                    }
                    onOpenStateChange={onActiveSectionChange}
                  />
                </div>

                <div className='flex items-center justify-between'>
                  <ConfigLabel
                    label='Show Currency'
                    forId={`pc-price-show-currency-${index}`}
                  />
                  <ConfigInput
                    id={`pc-price-show-currency-${index}`}
                    name={`content.body.${index}.format.showCurrency`}
                    inputType='checkbox'
                    value={true}
                    currentValue={item.format.showCurrency}
                    onValueChange={(checked) =>
                      onUpdate(
                        `content.body.${index}.format.showCurrency`,
                        checked,
                      )
                    }
                  />
                </div>

                <div className='flex items-center justify-between'>
                  <ConfigLabel
                    label='Show Unit'
                    forId={`pc-price-show-unit-${index}`}
                  />
                  <ConfigInput
                    id={`pc-price-show-unit-${index}`}
                    name={`content.body.${index}.format.showUnit`}
                    inputType='checkbox'
                    value={true}
                    currentValue={item.format.showUnit}
                    onValueChange={(checked) =>
                      onUpdate(`content.body.${index}.format.showUnit`, checked)
                    }
                  />
                </div>
              </div>
            );
          }

          return null;
        })}

        <div className='flex flex-wrap gap-3 pt-1'>
          {!existingTypes.has('description') && (
            <button
              type='button'
              onClick={() => handleAddItem('description')}
              className='text-[11px] font-medium text-zinc-500 hover:text-zinc-900'
            >
              Add Description
            </button>
          )}
          {!existingTypes.has('ratings') && (
            <button
              type='button'
              onClick={() => handleAddItem('ratings')}
              className='text-[11px] font-medium text-zinc-500 hover:text-zinc-900'
            >
              Add Ratings
            </button>
          )}
          {!existingTypes.has('priceTag') && (
            <button
              type='button'
              onClick={() => handleAddItem('priceTag')}
              className='text-[11px] font-medium text-zinc-500 hover:text-zinc-900'
            >
              Add Price Tag
            </button>
          )}
        </div>
      </div>
    </ConfigSectionWrapper>
  );
};

export default ProductCardBodySection;
