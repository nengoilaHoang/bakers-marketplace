import Modal from '@/components/ui/Modal';
import useReleaseSummaryPages from '@/hooks/storefront/useReleaseSummaryPages';
import useVendorStorefrontContext from '@/hooks/storefront/useVendorStorefrontContext';
import useFetchStorefrontProducts from '@/hooks/useFetchStorefrontProduct';
import useVendorCollections from '@/hooks/useVendorCollections';
import { cn } from '@/lib/cn';
import type { Collection } from '@/types/collection';
import type { PageLayoutSummary } from '@/types/page-layout';
import { Product } from '@/types/product';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import ConfigInput from '../ConfigInput';
import ConfigLabel from '../ConfigLabel';

type UrlTargetType = 'page' | 'collection' | 'product';
type ProductTargetType = 'direct' | 'filters';

type UrlPickerProps = {
  id: string;
  name: string;
  currentValue: string;
  onValueChange: (value: string) => void;
  onOpenStateChange?: (isOpen: boolean) => void;
};

const CATEGORY_OPTIONS: Record<string, string> = {
  '': 'All Categories',
  bread: 'Bread',
  pastry: 'Pastry',
  cake: 'Cake',
};

const SORT_OPTIONS: Record<string, string> = {
  '': 'Default',
  price_asc: 'Price: Low to High',
  price_desc: 'Price: High to Low',
  newest: 'Newest',
};

const UrlPicker = ({
  id,
  name,
  currentValue,
  onValueChange,
  onOpenStateChange,
}: UrlPickerProps) => {
  const { storefront, currentRelease } = useVendorStorefrontContext();
  const {
    collections,
    isLoading: isLoadingCollections,
    error: collectionsError,
  } = useVendorCollections(true);
  const {
    pages,
    isLoading: isLoadingPages,
    error: pagesError,
  } = useReleaseSummaryPages(currentRelease?.id);

  const [isModalOpen, setIsModalOpen] = useState(false);

  const [productOptions, setProductOptions] = useState<Product[]>([]);
  const [collectionOptions, setCollectionOptions] = useState<Collection[]>([]);
  const [pageOptions, setPageOptions] = useState<PageLayoutSummary[]>([]);

  const [productPage, setProductPage] = useState(1);
  const [productCursor, setProductCursor] = useState('');

  const productsSentinelRef = useRef<HTMLDivElement>(null);

  const [urlType, setUrlType] = useState<UrlTargetType>('page');
  const [selectedPage, setSelectedPage] = useState('/');
  const [selectedCollection, setSelectedCollection] = useState('');

  const [productTargetType, setProductTargetType] =
    useState<ProductTargetType>('direct');
  const [selectedProduct, setSelectedProduct] = useState('');

  const [filterCategory, setFilterCategory] = useState('');
  const [filterMinPrice, setFilterMinPrice] = useState('');
  const [filterMaxPrice, setFilterMaxPrice] = useState('');
  const [filterInStock, setFilterInStock] = useState(false);
  const [filterSort, setFilterSort] = useState('');

  const builtUrl = useMemo(() => {
    if (urlType === 'page') return selectedPage;
    if (urlType === 'collection') return selectedCollection;
    if (productTargetType === 'direct') return selectedProduct;

    const params = new URLSearchParams();
    if (filterCategory) params.set('category', filterCategory);
    if (filterMinPrice) params.set('minPrice', filterMinPrice);
    if (filterMaxPrice) params.set('maxPrice', filterMaxPrice);
    if (filterInStock) params.set('inStock', 'true');
    if (filterSort) params.set('sort', filterSort);

    const query = params.toString();
    return query ? `/products?${query}` : '/products';
  }, [
    urlType,
    selectedPage,
    selectedCollection,
    productTargetType,
    selectedProduct,
    filterCategory,
    filterMinPrice,
    filterMaxPrice,
    filterInStock,
    filterSort,
  ]);

  const openModal = () => {
    setIsModalOpen(true);
    onOpenStateChange?.(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    onOpenStateChange?.(false);
  };

  const handleApply = () => {
    onValueChange(builtUrl);
    closeModal();
  };

  const {
    products: fetchedProducts,
    nextCursor,
    hasNextPage,
    fetchedPage: fetchedProductPage,
    isFetching: isFetchingProducts,
    error,
  } = useFetchStorefrontProducts({
    filters: {
      brand: storefront?.brand.domain,
    },
    page: productPage,
    limit: 10,
    cursor: productCursor,
  });

  useEffect(() => {
    if (
      !fetchedProducts.length ||
      isFetchingProducts ||
      fetchedProductPage !== productPage ||
      error
    )
      return;

    queueMicrotask(() => {
      setProductOptions((prev) => {
        const seen = new Set(prev.map((p) => p.id ?? p.slug));
        const next = fetchedProducts.filter((p) => !seen.has(p.id ?? p.slug));
        return next.length ? [...prev, ...next] : prev;
      });
    });
  }, [
    error,
    fetchedProductPage,
    fetchedProducts,
    isFetchingProducts,
    productPage,
  ]);

  const loadProductNextPage = useCallback(() => {
    if (isFetchingProducts || !hasNextPage) return;
    setProductCursor(nextCursor ?? '');
    setProductPage((p) => p + 1);
  }, [hasNextPage, isFetchingProducts, nextCursor]);

  useEffect(() => {
    if (!collections.length || isLoadingCollections || collectionsError) return;

    queueMicrotask(() => {
      setCollectionOptions((prev) => {
        const seen = new Set(prev.map((c) => c.id ?? c.slug));
        const next = collections.filter((c) => !seen.has(c.id ?? c.slug));
        return next.length ? [...prev, ...next] : prev;
      });
    });
  }, [collections, collectionsError, isLoadingCollections]);

  useEffect(() => {
    if (!pages.length || isLoadingPages || pagesError) return;

    queueMicrotask(() => {
      setPageOptions((prev) => {
        const seen = new Set(prev.map((p) => p.id ?? p.slug));
        const next = pages.filter((p) => !seen.has(p.id ?? p.slug));
        return next.length ? [...prev, ...next] : prev;
      });
    });
  }, [isLoadingPages, pages, pagesError]);

  useEffect(() => {
    if (isFetchingProducts || !hasNextPage) return;

    const sentinel = productsSentinelRef.current;
    if (!sentinel) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          loadProductNextPage();
        }
      },
      { threshold: 0.1 },
    );

    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [hasNextPage, isFetchingProducts, loadProductNextPage]);

  const productSelectableOptions = useMemo(
    () =>
      Object.fromEntries(
        productOptions.map((p) => [`/products/${p.slug}`, p.title]),
      ),
    [productOptions],
  );

  const collectionSelectableOptions = useMemo(
    () =>
      Object.fromEntries(
        collectionOptions.map((c) => [`/collections/${c.slug}`, c.name]),
      ),
    [collectionOptions],
  );

  const pageSelectableOptions = useMemo(
    () =>
      Object.fromEntries(
        pageOptions.map((p) => {
          const href =
            p.type === 'HOME' ? '/' : `/${p.slug.replace(/^\/+/, '')}`;
          return [href, `${p.name} (${href})`];
        }),
      ),
    [pageOptions],
  );

  return (
    <>
      <ConfigInput
        id={id}
        name={name}
        inputType='readonly'
        currentValue={currentValue}
        onOpenStateChange={(open) => {
          if (open) openModal();
        }}
      />

      <Modal
        open={isModalOpen}
        onClose={closeModal}
        title='URL Picker'
        size='content'
      >
        <div className='flex flex-col gap-4'>
          {/* 1. URL Type */}
          <div className='flex flex-col gap-1.5'>
            <ConfigLabel label='URL Type' size='md' />
            <div className='grid grid-cols-3 gap-1.5 rounded-lg bg-zinc-100 p-1'>
              {(['page', 'collection', 'product'] as const).map((type) => (
                <button
                  key={type}
                  type='button'
                  onClick={() => setUrlType(type)}
                  className={cn(
                    'rounded-md px-3 py-1.5 text-xs font-medium capitalize transition',
                    urlType === type
                      ? 'bg-white text-zinc-900 shadow-xs'
                      : 'text-zinc-600 hover:text-zinc-900',
                  )}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>

          {/* 2. Page Dropdown */}
          {urlType === 'page' && (
            <div className='flex flex-col gap-1.5'>
              <ConfigLabel
                label='Select Page'
                forId={`${id}-page-select`}
                size='md'
              />
              <ConfigInput
                id={`${id}-page-select`}
                name={`${name}.page`}
                inputType='select'
                selectOptions={pageSelectableOptions}
                currentValue={selectedPage}
                onValueChange={(val) => setSelectedPage(String(val))}
              />
            </div>
          )}

          {/* 3. Collection Dropdown */}
          {urlType === 'collection' && (
            <div className='flex flex-col gap-1.5'>
              <ConfigLabel
                label='Select Collection'
                forId={`${id}-collection-select`}
                size='md'
              />
              <ConfigInput
                id={`${id}-collection-select`}
                name={`${name}.collection`}
                inputType='select'
                selectOptions={collectionSelectableOptions}
                currentValue={selectedCollection}
                onValueChange={(val) => setSelectedCollection(String(val))}
              />
            </div>
          )}

          {/* 4. Product Target */}
          {urlType === 'product' && (
            <div className='flex flex-col gap-4'>
              <div className='flex flex-col gap-1.5'>
                <ConfigLabel label='Product Target Type' size='md' />
                <div className='grid grid-cols-2 gap-1.5 rounded-lg bg-zinc-100 p-1'>
                  {(
                    [
                      { id: 'direct', label: 'Direct Target' },
                      { id: 'filters', label: 'Filters Target' },
                    ] as const
                  ).map((option) => (
                    <button
                      key={option.id}
                      type='button'
                      onClick={() => setProductTargetType(option.id)}
                      className={cn(
                        'rounded-md px-3 py-1.5 text-xs font-medium transition',
                        productTargetType === option.id
                          ? 'bg-white text-zinc-900 shadow-xs'
                          : 'text-zinc-600 hover:text-zinc-900',
                      )}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>

              {productTargetType === 'direct' ? (
                <div className='flex flex-col gap-1.5'>
                  <ConfigLabel
                    label='Select Product'
                    forId={`${id}-product-select`}
                    size='md'
                  />
                  <ConfigInput
                    id={`${id}-product-select`}
                    name={`${name}.product`}
                    inputType='select'
                    selectOptions={productSelectableOptions}
                    currentValue={selectedProduct}
                    onValueChange={(val) => setSelectedProduct(String(val))}
                    footer={
                      hasNextPage && (
                        <div
                          ref={productsSentinelRef}
                          className='h-1 w-full'
                          aria-hidden='true'
                        />
                      )
                    }
                  />
                </div>
              ) : (
                <div className='grid grid-cols-2 gap-3 rounded-lg border border-zinc-200 bg-zinc-50/60 p-3'>
                  <div className='col-span-2 flex flex-col gap-1'>
                    <ConfigLabel
                      label='Category'
                      forId={`${id}-filter-category`}
                      size='md'
                    />
                    <ConfigInput
                      id={`${id}-filter-category`}
                      name={`${name}.filterCategory`}
                      inputType='select'
                      selectOptions={CATEGORY_OPTIONS}
                      currentValue={filterCategory}
                      onValueChange={(val) => setFilterCategory(String(val))}
                    />
                  </div>

                  <div className='flex flex-col gap-1'>
                    <ConfigLabel
                      label='Min Price'
                      forId={`${id}-filter-min-price`}
                      size='md'
                    />
                    <ConfigInput
                      id={`${id}-filter-min-price`}
                      name={`${name}.filterMinPrice`}
                      inputType='number'
                      min={0}
                      step={1_000}
                      suffix='VND'
                      currentValue={Number(filterMinPrice) || 0}
                      onValueChange={(val) =>
                        setFilterMinPrice(val > 0 ? String(val) : '')
                      }
                    />
                  </div>

                  <div className='flex flex-col gap-1'>
                    <ConfigLabel
                      label='Max Price'
                      forId={`${id}-filter-max-price`}
                      size='md'
                    />
                    <ConfigInput
                      id={`${id}-filter-max-price`}
                      name={`${name}.filterMaxPrice`}
                      inputType='number'
                      min={0}
                      step={1_000}
                      currentValue={Number(filterMaxPrice) || 0}
                      suffix='VND'
                      onValueChange={(val) =>
                        setFilterMaxPrice(val > 0 ? String(val) : '')
                      }
                    />
                  </div>

                  <div className='flex flex-col gap-1'>
                    <ConfigLabel
                      label='Sort By'
                      forId={`${id}-filter-sort`}
                      size='md'
                    />
                    <ConfigInput
                      id={`${id}-filter-sort`}
                      name={`${name}.filterSort`}
                      inputType='select'
                      selectOptions={SORT_OPTIONS}
                      currentValue={filterSort}
                      onValueChange={(val) => setFilterSort(String(val))}
                    />
                  </div>

                  <label className='flex items-center gap-2 self-end pb-1.5 text-xs text-zinc-700'>
                    <input
                      type='checkbox'
                      checked={filterInStock}
                      onChange={(e) => setFilterInStock(e.target.checked)}
                    />
                    In stock only
                  </label>
                </div>
              )}
            </div>
          )}

          {/* Resulting URL Preview */}
          <div className='flex flex-col gap-1 rounded-md border border-zinc-200 bg-zinc-50 px-3 py-2'>
            <span className='text-[11px] font-medium text-zinc-500'>
              Generated URL
            </span>
            <code className='break-all text-xs text-zinc-800'>{builtUrl}</code>
          </div>

          {/* Actions */}
          <div className='flex justify-end gap-2 pt-1'>
            <button
              type='button'
              onClick={closeModal}
              className='rounded-md border border-zinc-200 bg-white px-3 py-1.5 text-xs font-medium text-zinc-700 transition hover:bg-zinc-50'
            >
              Cancel
            </button>
            <button
              type='button'
              onClick={handleApply}
              className='rounded-md bg-zinc-900 px-3 py-1.5 text-xs font-medium text-white transition hover:bg-zinc-800'
            >
              Apply URL
            </button>
          </div>
        </div>
      </Modal>
    </>
  );
};

export default UrlPicker;
