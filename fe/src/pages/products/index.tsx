import AppLayout from '@/components/layout/AppLayout';
import Container from '@/components/ui/Container';
import EmptyState from '@/components/ui/EmptyState';
import { ErrorState } from '@/components/ui/ErrorState';
import PageTitle from '@/components/ui/PageTitle';
import ProductCard, { ProductCardSkeleton } from '@/components/ui/ProductCard';
import { useApiData } from '@/hooks/useApiData';
import { getProducts } from '@/services/products';
import { productImageUrl } from '@/utils/shop';

const GRID_CLASSES = 'grid gap-x-7.5 gap-y-10 sm:grid-cols-2 lg:grid-cols-4';

export default function ProductsPage() {
  const { data: products, error, reload } = useApiData(
    () => getProducts().then((response) => response.data),
    'products',
  );

  return (
    <>
      <PageTitle
        title='Cửa hàng'
        description='Bánh ngọt và đồ nướng từ các tiệm bánh trên Bakers Marketplace.'
      />

      <Container className='pt-14 pb-20'>
        <h1 className='font-heading text-h1 font-semibold text-ink'>Cửa hàng</h1>
        <p className='mt-2 text-body font-light text-ink-muted'>
          Bánh ngọt và đồ nướng từ các tiệm bánh. Bỏ vào giỏ món của nhiều tiệm và đặt một lần.
        </p>

        <div className='mt-10'>
          {error ? (
            <ErrorState title='Không thể tải sản phẩm' message={error} onRetry={reload} />
          ) : !products ? (
            <ul aria-label='Đang tải sản phẩm' className={GRID_CLASSES}>
              {Array.from({ length: 8 }, (_, index) => (
                <li key={index}>
                  <ProductCardSkeleton />
                </li>
              ))}
            </ul>
          ) : products.length === 0 ? (
            <EmptyState
              icon='cart'
              title='Chưa có sản phẩm nào'
              description='Các tiệm bánh chưa đăng bán sản phẩm. Quay lại sau nhé!'
            />
          ) : (
            <ul className={GRID_CLASSES}>
              {products.map((product) => (
                <li key={product.id}>
                  <ProductCard
                    className='h-full'
                    product={{
                      title: product.title,
                      href: `/products/${product.slug}`,
                      imageUrl: productImageUrl(product),
                      unitPrice: product.unitPrice,
                      currency: product.currency,
                      unit: product.unit,
                      stock: product.stock?.stock ?? null,
                      description: product.description,
                      brandName: product.brand?.name,
                    }}
                  />
                </li>
              ))}
            </ul>
          )}
        </div>
      </Container>
    </>
  );
}

ProductsPage.getLayout = function getLayout(page: React.ReactElement) {
  return <AppLayout>{page}</AppLayout>;
};
