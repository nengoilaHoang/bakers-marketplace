import { useMemo, useState } from 'react';

import VendorLayout from '@/components/layout/VendorLayout';
import VendorScope from '@/components/layout/VendorScope';
import ProductTable from '@/components/product/ProductTable';
import Alert from '@/components/ui/Alert';
import { ButtonLink } from '@/components/ui/Button';
import EmptyState from '@/components/ui/EmptyState';
import { ErrorState } from '@/components/ui/ErrorState';
import Icon from '@/components/ui/Icon';
import Input from '@/components/ui/Input';
import { PanelSkeleton } from '@/components/vendor/Panel';
import VendorPage from '@/components/vendor/VendorPage';
import { useVendorStocks } from '@/hooks/useVendorStocks';
import type { NextPageWithLayout } from '@/pages/_app';
import { productApi } from '@/services/products';
import type { Product } from '@/types/product';

const ProductListPage: NextPageWithLayout = () => {
  // Sản phẩm của vendor đang đăng nhập (kèm tồn kho, tag, bộ sưu tập).
  const { products, isLoading, error, reload } = useVendorStocks();
  const [keyword, setKeyword] = useState('');
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [notice, setNotice] = useState<{
    tone: 'success' | 'danger';
    text: string;
  } | null>(null);

  const visibleProducts = useMemo(() => {
    const normalized = keyword.trim().toLowerCase();
    if (!normalized) return products;

    return products.filter(
      (product) =>
        product.title.toLowerCase().includes(normalized) ||
        product.slug.toLowerCase().includes(normalized) ||
        product.tags.some((tag) => tag.name.toLowerCase().includes(normalized)),
    );
  }, [products, keyword]);

  async function handleDelete(product: Product) {
    if (!confirm(`Xoá sản phẩm "${product.title}"?`)) return;

    setDeletingId(product.id);
    setNotice(null);

    try {
      await productApi.remove(product.id);
      setNotice({ tone: 'success', text: `Đã xoá "${product.title}".` });
      reload();
    } catch (deleteError) {
      setNotice({ tone: 'danger', text: (deleteError as Error).message });
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <VendorPage
      title='Sản phẩm'
      description={
        isLoading || error
          ? undefined
          : `${products.length} sản phẩm trong cửa hàng của bạn.`
      }
      actions={
        <ButtonLink href='/vendors/products/new' size='sm'>
          <Icon name='plus' className='size-4' />
          Tạo sản phẩm
        </ButtonLink>
      }
    >
      {isLoading ? (
        <PanelSkeleton className='h-96' />
      ) : error ? (
        <ErrorState
          title='Không thể tải sản phẩm'
          message={error}
          onRetry={reload}
        />
      ) : products.length === 0 ? (
        <EmptyState
          icon='cart'
          title='Chưa có sản phẩm nào'
          description='Tạo sản phẩm đầu tiên để bắt đầu bán và quản lý tồn kho.'
          action={
            <ButtonLink href='/vendors/products/new'>Tạo sản phẩm</ButtonLink>
          }
        />
      ) : (
        <>
          <div className='w-full sm:w-80'>
            <Input
              type='search'
              value={keyword}
              onChange={(event) => setKeyword(event.target.value)}
              placeholder='Tìm theo tên, slug hoặc tag'
              aria-label='Tìm sản phẩm'
            />
          </div>

          {notice && <Alert tone={notice.tone}>{notice.text}</Alert>}

          {visibleProducts.length === 0 ? (
            <p className='text-body-sm text-ink-muted'>
              Không có sản phẩm nào khớp “{keyword}”.
            </p>
          ) : (
            <ProductTable
              products={visibleProducts}
              onDelete={(product) => void handleDelete(product)}
              deletingId={deletingId}
            />
          )}
        </>
      )}
    </VendorPage>
  );
};

ProductListPage.getLayout = function getLayout(page: React.ReactElement) {
  return (
    <VendorScope>
      <VendorLayout>{page}</VendorLayout>
    </VendorScope>
  );
};

export default ProductListPage;
