import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';

import AppLayout from '@/components/layout/AppLayout';
import Badge from '@/components/ui/Badge';
import Breadcrumb from '@/components/ui/Breadcrumb';
import Button, { ButtonLink } from '@/components/ui/Button';
import Container from '@/components/ui/Container';
import CoverImage from '@/components/ui/CoverImage';
import EmptyState from '@/components/ui/EmptyState';
import Icon from '@/components/ui/Icon';
import { ErrorState } from '@/components/ui/ErrorState';
import PageTitle from '@/components/ui/PageTitle';
import QuantityStepper from '@/components/ui/QuantityStepper';
import { useApiData } from '@/hooks/useApiData';
import { addToCart, selectOnly, useCart } from '@/hooks/useCart';
import { readString } from '@/hooks/useUrlFilters';
import { ApiError } from '@/lib/api';
import { getProductBySlug } from '@/services/products';
import { formatMoney } from '@/utils/format';
import { productImageUrl, productStock, toCartItem } from '@/utils/shop';

function ProductDetailSkeleton() {
  return (
    <div aria-hidden className='mt-6 grid gap-10 md:grid-cols-2'>
      <div className='aspect-square w-full animate-pulse rounded-media bg-media' />
      <div className='flex flex-col gap-4'>
        <div className='h-10 w-3/4 animate-pulse rounded-media bg-surface-soft' />
        <div className='h-8 w-1/3 animate-pulse rounded-media bg-surface-soft' />
        <div className='h-24 w-full animate-pulse rounded-panel bg-surface-soft' />
      </div>
    </div>
  );
}

export default function ProductDetailPage() {
  const router = useRouter();
  const slug = readString(router.query.slug);
  const { data: product, isLoading, error, reload } = useApiData(
    // Không tìm thấy thì trả null thay vì báo lỗi, để hiện trạng thái "không có sản phẩm".
    () =>
      getProductBySlug(slug!)
        .then((response) => response.data)
        .catch((requestError) => {
          if (requestError instanceof ApiError && requestError.status === 404) return null;
          throw requestError;
        }),
    slug ?? '',
    Boolean(slug),
  );
  const { items } = useCart();
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);

  // Badge "Đã thêm" nổi trên nút "Thêm vào giỏ" thoáng qua rồi ẩn
  useEffect(() => {
    if (!added) return;
    const timer = window.setTimeout(() => setAdded(false), 1200);
    return () => window.clearTimeout(timer);
  }, [added]);

  const stock = product ? productStock(product) : 0;
  const inCart = product ? (items.find((item) => item.productId === product.id)?.quantity ?? 0) : 0;
  // Không cho bỏ vào giỏ nhiều hơn số còn lại sau khi trừ phần đã có trong giỏ.
  const canAdd = Math.max(stock - inCart, 0);

  function add(goToCart: boolean) {
    if (!product || canAdd === 0) return;

    addToCart(toCartItem(product, Math.min(quantity, canAdd)));
    setQuantity(1);

    if (goToCart) {
      // Mua ngay: giỏ chỉ chọn sẵn món này, các món khác vẫn còn trong giỏ
      selectOnly([product.id]);
      void router.push('/cart');
    } else {
      setAdded(true);
    }
  }

  return (
    <>
      <PageTitle
        title={product?.title ?? 'Sản phẩm'}
        description={product?.description ?? 'Chi tiết sản phẩm trên Bakers Marketplace.'}
      />

      <Container size='content' className='pt-6 pb-20'>
        <Breadcrumb
          className='-ml-2'
          items={[
            { label: 'Cửa hàng', href: '/products' },
            { label: product?.title ?? 'Sản phẩm' },
          ]}
        />

        {!slug || isLoading ? (
          <ProductDetailSkeleton />
        ) : error ? (
          <div className='mt-8'>
            <ErrorState title='Không thể tải sản phẩm' message={error} onRetry={reload} />
          </div>
        ) : !product ? (
          <EmptyState
            icon='search'
            className='mt-8'
            title='Không tìm thấy sản phẩm'
            description='Sản phẩm này không tồn tại hoặc đã ngừng bán.'
            action={<ButtonLink href='/products'>Xem sản phẩm khác</ButtonLink>}
          />
        ) : (
          <div className='mt-6 grid items-start gap-10 md:grid-cols-2'>
            <CoverImage
              src={productImageUrl(product)}
              alt={`Ảnh ${product.title}`}
              sizes='(min-width: 768px) 45vw, 100vw'
              iconSize='lg'
              className='aspect-square w-full rounded-media'
            />

            <div className='flex flex-col gap-6'>
              <div className='flex flex-col gap-3'>
                {product.brand && (
                  <p className='flex items-center gap-2 text-meta font-medium text-ink-muted uppercase'>
                    <Icon name='store' className='size-4' />
                    {product.brand.name}
                  </p>
                )}
                <h1 className='font-heading text-h1 font-semibold text-ink'>{product.title}</h1>
                <p className='text-h3 font-semibold text-ink'>
                  {formatMoney(product.unitPrice, product.currency)}
                  <span className='text-body font-light text-ink-muted'> / {product.unit}</span>
                </p>
                <span>
                  {stock > 0 ? (
                    <Badge tone='success'>Còn {stock} {product.unit}</Badge>
                  ) : (
                    <Badge tone='neutral'>Hết hàng</Badge>
                  )}
                </span>
              </div>

              {product.description && (
                <p className='text-body font-light whitespace-pre-line text-ink-muted'>
                  {product.description}
                </p>
              )}

              {stock > 0 && (
                <div className='flex flex-col gap-3'>
                  <div className='flex flex-wrap items-center gap-3'>
                    <QuantityStepper
                      label={product.title}
                      value={Math.min(quantity, Math.max(canAdd, 1))}
                      max={Math.max(canAdd, 1)}
                      disabled={canAdd === 0}
                      onChange={(value) => {
                        setQuantity(value);
                        setAdded(false);
                      }}
                    />
                    {/* Badge đặt tuyệt đối trên góc nút nên không đẩy phần tử nào */}
                    <span className='relative inline-flex'>
                      <Button size='lg' disabled={canAdd === 0} onClick={() => add(false)} className='uppercase'>
                        Thêm vào giỏ
                      </Button>
                      {added && (
                        <span aria-hidden className='pointer-events-none absolute -top-3 right-3 rounded-full shadow-soft'>
                          <Badge tone='success'>
                            <Icon name='check' className='mr-1 size-3' />
                            Đã thêm
                          </Badge>
                        </span>
                      )}
                    </span>
                    <span role='status' className='sr-only'>
                      {added ? 'Đã thêm vào giỏ hàng' : ''}
                    </span>
                    <Button
                      size='lg'
                      variant='outline'
                      disabled={canAdd === 0}
                      onClick={() => add(true)}
                      className='uppercase'
                    >
                      Mua ngay
                    </Button>
                  </div>
                  {inCart > 0 && (
                    <p className='text-body-sm font-light text-ink-muted'>
                      {canAdd === 0
                        ? `Bạn đã bỏ vào giỏ toàn bộ ${inCart} ${product.unit} còn lại.`
                        : `Đã có ${inCart} ${product.unit} trong giỏ.`}
                    </p>
                  )}
                </div>
              )}

              {product.notes.length > 0 && (
                <div className='rounded-panel bg-highlight px-6 py-5'>
                  <h2 className='text-meta font-semibold text-ink uppercase'>Lưu ý</h2>
                  <ul className='mt-2 flex list-disc flex-col gap-1 pl-5 text-body-sm text-ink'>
                    {product.notes.map((note) => (
                      <li key={note.id}>{note.content}</li>
                    ))}
                  </ul>
                </div>
              )}

              {product.tags.length > 0 && (
                <ul className='flex flex-wrap gap-2' aria-label='Thẻ'>
                  {product.tags.map((tag) => (
                    <li key={tag.id}>
                      <Badge tone='secondary'>#{tag.name}</Badge>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        )}
      </Container>
    </>
  );
}

ProductDetailPage.getLayout = function getLayout(page: React.ReactElement) {
  return <AppLayout>{page}</AppLayout>;
};
