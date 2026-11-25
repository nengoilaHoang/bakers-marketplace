import { CollectionDataSource } from '@/types/layout-component/repeater-component';
import { SectionId } from '../../ComponentInspector';
import ConfigInput from '../ConfigInput';
import ConfigLabel from '../ConfigLabel';
import ConfigSectionWrapper from '../ConfigSectionWrapper';

type CollectionGridDataSourceSectionProps = {
  isOpen: boolean;
  toggleSection: () => void;
  dataSource: CollectionDataSource;
  onUpdate: (pathname: string, value: unknown) => void;
  onActiveSectionChange: (isActive: boolean) => void;
  zIndex: number;
};

const DATA_SOURCE_TYPE_OPTIONS: Record<CollectionDataSource['type'], string> = {
  route: 'Route Context',
  preset: 'Preset Feed',
  collection: 'Collection',
  query: 'Custom Query',
};

const ROUTE_MODE_OPTIONS = {
  route_query: 'Route Query',
  related_products: 'Related Products',
} as const;

const PRESET_OPTIONS = {
  best_sellers: 'Best Sellers',
  new_arrivals: 'New Arrivals',
} as const;

const SORT_OPTIONS = {
  newest: 'Newest',
  price_asc: 'Price: Low to High',
  price_desc: 'Price: High to Low',
  popular: 'Most Popular',
} as const;

const CollectionGridDataSourceSection = ({
  isOpen,
  toggleSection,
  dataSource,
  onUpdate,
  onActiveSectionChange,
  zIndex,
}: CollectionGridDataSourceSectionProps) => {
  const id: SectionId = 'collection-grid-data-source';

  const handleTypeChange = (nextType: string | number) => {
    switch (nextType) {
      case 'route':
        onUpdate('dataSource', { type: 'route', mode: 'route_query' });
        break;
      case 'preset':
        onUpdate('dataSource', { type: 'preset', preset: 'best_sellers' });
        break;
      case 'collection':
        onUpdate('dataSource', { type: 'collection', collectionSlug: '' });
        break;
      case 'query':
        onUpdate('dataSource', { type: 'query', sort: 'newest' });
        break;
    }
  };

  return (
    <ConfigSectionWrapper
      id={id}
      title='Data Source'
      description='Choose where products for this collection grid are loaded from.'
      isOpen={isOpen}
      onToggle={toggleSection}
      zIndex={zIndex}
    >
      <div className='flex flex-col gap-3'>
        <div className='flex flex-col gap-1.5'>
          <ConfigLabel label='Source Type' forId='cg-data-source-type' />
          <ConfigInput
            id='cg-data-source-type'
            name='dataSource.type'
            inputType='select'
            selectOptions={DATA_SOURCE_TYPE_OPTIONS}
            currentValue={dataSource.type}
            onValueChange={handleTypeChange}
            onOpenStateChange={onActiveSectionChange}
          />
        </div>

        {dataSource.type === 'route' && (
          <div className='flex flex-col gap-1.5'>
            <ConfigLabel label='Route Mode' forId='cg-route-mode' />
            <ConfigInput
              id='cg-route-mode'
              name='dataSource.mode'
              inputType='select'
              selectOptions={ROUTE_MODE_OPTIONS}
              currentValue={dataSource.mode}
              onValueChange={(val) => onUpdate('dataSource.mode', val)}
              onOpenStateChange={onActiveSectionChange}
            />
          </div>
        )}

        {dataSource.type === 'preset' && (
          <div className='flex flex-col gap-1.5'>
            <ConfigLabel label='Preset' forId='cg-preset' />
            <ConfigInput
              id='cg-preset'
              name='dataSource.preset'
              inputType='select'
              selectOptions={PRESET_OPTIONS}
              currentValue={dataSource.preset}
              onValueChange={(val) => onUpdate('dataSource.preset', val)}
              onOpenStateChange={onActiveSectionChange}
            />
          </div>
        )}

        {dataSource.type === 'collection' && (
          <div className='flex flex-col gap-1.5'>
            <ConfigLabel label='Collection Slug' forId='cg-collection-slug' />
            <ConfigInput
              id='cg-collection-slug'
              name='dataSource.collectionSlug'
              inputType='text'
              currentValue={dataSource.collectionSlug}
              onValueChange={(val) =>
                onUpdate('dataSource.collectionSlug', val)
              }
            />
          </div>
        )}

        {dataSource.type === 'query' && (
          <div className='flex flex-col gap-3 rounded-lg border border-zinc-100 bg-zinc-50/50 p-3'>
            <div className='flex flex-col gap-1.5'>
              <ConfigLabel label='Tag' forId='cg-query-tag' />
              <ConfigInput
                id='cg-query-tag'
                name='dataSource.tag'
                inputType='text'
                currentValue={dataSource.tag ?? ''}
                onValueChange={(val) =>
                  onUpdate('dataSource.tag', val || undefined)
                }
              />
            </div>

            <div className='flex flex-col gap-1.5'>
              <ConfigLabel label='Sort By' forId='cg-query-sort' />
              <ConfigInput
                id='cg-query-sort'
                name='dataSource.sort'
                inputType='select'
                selectOptions={SORT_OPTIONS}
                currentValue={dataSource.sort ?? 'newest'}
                onValueChange={(val) => onUpdate('dataSource.sort', val)}
                onOpenStateChange={onActiveSectionChange}
              />
            </div>

            <div className='grid grid-cols-2 gap-2'>
              <div className='flex flex-col gap-1.5'>
                <ConfigLabel label='Min Price' forId='cg-query-min-price' />
                <ConfigInput
                  id='cg-query-min-price'
                  name='dataSource.minPrice'
                  inputType='number'
                  min={0}
                  step={1000}
                  currentValue={dataSource.minPrice ?? 0}
                  onValueChange={(val) =>
                    onUpdate(
                      'dataSource.minPrice',
                      val > 0 ? val : undefined,
                    )
                  }
                />
              </div>

              <div className='flex flex-col gap-1.5'>
                <ConfigLabel label='Max Price' forId='cg-query-max-price' />
                <ConfigInput
                  id='cg-query-max-price'
                  name='dataSource.maxPrice'
                  inputType='number'
                  min={0}
                  step={1000}
                  currentValue={dataSource.maxPrice ?? 0}
                  onValueChange={(val) =>
                    onUpdate(
                      'dataSource.maxPrice',
                      val > 0 ? val : undefined,
                    )
                  }
                />
              </div>
            </div>

            <div className='flex items-center justify-between'>
              <ConfigLabel label='In Stock Only' forId='cg-query-in-stock' />
              <ConfigInput
                id='cg-query-in-stock'
                name='dataSource.inStockOnly'
                inputType='checkbox'
                value={true}
                currentValue={Boolean(dataSource.inStockOnly)}
                onValueChange={(checked) =>
                  onUpdate('dataSource.inStockOnly', checked)
                }
              />
            </div>
          </div>
        )}
      </div>
    </ConfigSectionWrapper>
  );
};

export default CollectionGridDataSourceSection;
