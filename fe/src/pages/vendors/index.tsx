import Link from 'next/link';
import { useMemo } from 'react';

import VendorLayout from '@/components/layout/VendorLayout';
import VendorShellLayout from '@/components/layout/VendorShellLayout';
import StockStatusBadge from '@/components/stock/StockStatusBadge';
import { ButtonLink } from '@/components/ui/Button';
import { ErrorState } from '@/components/ui/ErrorState';
import Icon from '@/components/ui/Icon';
import Panel, { PanelSkeleton } from '@/components/vendor/Panel';
import StatCard from '@/components/vendor/StatCard';
import VendorPage from '@/components/vendor/VendorPage';
import { useVendorStocks } from '@/hooks/useVendorStocks';
import useAuth from '@/hooks/user/useAuthContext';
import type { NextPageWithLayout } from '@/pages/_app';
import { STOCK_STATUS_PRIORITY, getStockStatus } from '@/utils/stockStatus';

// Số sản phẩm cần xử lý hiển thị trên trang tổng quan.
const ATTENTION_LIMIT = 5;

const VendorHomePage: NextPageWithLayout = () => {
  const { account } = useAuth();
  const { products, isLoading, error, reload } = useVendorStocks();

  const summary = useMemo(() => {
    const withStatus = products.map((product) => ({
      product,
      status: getStockStatus(product.stock?.stock ?? 0, product.stock?.alerts ?? []),
    }));
    const needAttention = withStatus
      .filter(({ status }) => status !== 'NORMAL')
      .sort((a, b) => STOCK_STATUS_PRIORITY[a.status] - STOCK_STATUS_PRIORITY[b.status]);

    return {
      out: withStatus.filter(({ status }) => status === 'OUT').length,
      low: withStatus.filter(({ status }) => status === 'MINIMUM' || status === 'REORDER').length,
      over: withStatus.filter(({ status }) => status === 'MAXIMUM').length,
      needAttention,
    };
  }, [products]);

  return (
    <VendorPage
      title='Tổng quan'
      description={account ? `Xin chào, ${account.displayName}.` : undefined}
      actions={
        <ButtonLink href='/vendors/products/new' size='sm'>
          <Icon name='plus' className='size-4' />
          Tạo sản phẩm
        </ButtonLink>
      }
    >
      {isLoading ? (
        <>
          <div className='grid gap-4 sm:grid-cols-2 lg:grid-cols-4'>
            <PanelSkeleton className='h-20' />
            <PanelSkeleton className='h-20' />
            <PanelSkeleton className='h-20' />
            <PanelSkeleton className='h-20' />
          </div>
          <PanelSkeleton />
        </>
      ) : error ? (
        <ErrorState title='Không thể tải dữ liệu cửa hàng' message={error} onRetry={reload} />
      ) : (
        <>
          <div className='grid gap-4 sm:grid-cols-2 lg:grid-cols-4'>
            <StatCard label='Sản phẩm' value={products.length} icon='cart' href='/vendors/products' />
            <StatCard
              label='Hết hàng'
              value={summary.out}
              icon='circle-alert'
              tone='danger'
              href='/vendors/stocks'
            />
            <StatCard
              label='Sắp hết, cần nhập'
              value={summary.low}
              icon='refresh'
              tone='warning'
              href='/vendors/stocks'
            />
            <StatCard
              label='Vượt mức tối đa'
              value={summary.over}
              icon='info'
              tone='info'
              href='/vendors/stocks'
            />
          </div>

          <Panel
            title='Cần xử lý'
            description='Sản phẩm hết hàng, sắp hết hoặc tồn quá nhiều.'
            actions={
              <ButtonLink href='/vendors/stocks' variant='ghost' size='sm'>
                Xem tồn kho
                <Icon name='chevron-right' className='size-4' />
              </ButtonLink>
            }
          >
            {summary.needAttention.length === 0 ? (
              <p className='flex items-center gap-2 text-body-sm text-success-strong'>
                <Icon name='circle-check' className='size-5' />
                Tồn kho của mọi sản phẩm đều ổn định.
              </p>
            ) : (
              <ul className='flex flex-col'>
                {summary.needAttention.slice(0, ATTENTION_LIMIT).map(({ product, status }) => (
                  <li
                    key={product.id}
                    className='flex flex-wrap items-center justify-between gap-3 border-b border-line py-3 first:pt-0 last:border-b-0 last:pb-0'
                  >
                    <Link
                      href={`/vendors/stocks/${product.id}`}
                      className='font-medium text-ink hover:underline'
                    >
                      {product.title}
                    </Link>
                    <span className='flex items-center gap-3 text-body-sm text-ink-muted'>
                      {product.stock?.stock ?? 0} {product.unit}
                      <StockStatusBadge status={status} />
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </Panel>
        </>
      )}
    </VendorPage>
  );
};

VendorHomePage.getLayout = function getLayout(page: React.ReactElement) {
  return (
    <VendorShellLayout>
      <VendorLayout>{page}</VendorLayout>
    </VendorShellLayout>
  );
};

export default VendorHomePage;
