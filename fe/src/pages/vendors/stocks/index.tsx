import Link from 'next/link';
import { useMemo, useState } from 'react';

import VendorLayout from '@/components/layout/VendorLayout';
import VendorShellLayout from '@/components/layout/VendorShellLayout';
import StockStatusBadge, { STOCK_STATUS_STYLES } from '@/components/stock/StockStatusBadge';
import Alert from '@/components/ui/Alert';
import { ButtonLink } from '@/components/ui/Button';
import EmptyState from '@/components/ui/EmptyState';
import { ErrorState } from '@/components/ui/ErrorState';
import Icon from '@/components/ui/Icon';
import IconButton from '@/components/ui/IconButton';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import Table, { Td, Th } from '@/components/ui/Table';
import { PanelSkeleton } from '@/components/vendor/Panel';
import StatCard from '@/components/vendor/StatCard';
import VendorPage from '@/components/vendor/VendorPage';
import { useVendorStocks } from '@/hooks/useVendorStocks';
import type { NextPageWithLayout } from '@/pages/_app';
import { productApi } from '@/services/products';
import type { Product } from '@/types/product';
import type { StockStatus } from '@/types/stock';
import {
  STOCK_ALERT_LABELS,
  STOCK_ALERT_TYPES,
  STOCK_STATUS_LABELS,
  STOCK_STATUS_PRIORITY,
  getStockStatus,
} from '@/utils/stockStatus';

const STATUSES = Object.keys(STOCK_STATUS_LABELS) as StockStatus[];

type SortKey = 'status' | 'stock-asc' | 'stock-desc' | 'title';

type Notice = { tone: 'success' | 'danger'; text: string };

function statusOf(product: Product): StockStatus {
  return getStockStatus(product.stock?.stock ?? 0, product.stock?.alerts ?? []);
}

function thresholdOf(product: Product, alertType: (typeof STOCK_ALERT_TYPES)[number]) {
  return product.stock?.alerts.find((alert) => alert.alertType === alertType)?.threshold;
}

// Điều chỉnh nhanh trong bảng: nhập số rồi bấm + (nhập thêm) hoặc − (xuất bớt).
function QuickAdjust({
  product,
  onNotice,
  onDone,
}: {
  product: Product;
  onNotice: (notice: Notice) => void;
  onDone: () => void;
}) {
  const [amount, setAmount] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  async function adjust(sign: 1 | -1) {
    const value = Number(amount);

    if (!Number.isInteger(value) || value <= 0) {
      onNotice({ tone: 'danger', text: `Nhập số nguyên dương để điều chỉnh "${product.title}".` });
      return;
    }

    setIsSaving(true);

    try {
      const response = await productApi.adjustStock(product.id, sign * value);
      setAmount('');
      onNotice({
        tone: 'success',
        text: `${product.title}: ${sign > 0 ? 'nhập thêm' : 'xuất bớt'} ${value} ${product.unit}, còn ${response.data.stock} ${product.unit}.`,
      });
      onDone();
    } catch (error) {
      onNotice({ tone: 'danger', text: (error as Error).message });
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <div className='flex items-center gap-1.5'>
      <div className='w-28'>
        <Input
          type='number'
          min={1}
          size='sm'
          value={amount}
          onChange={(event) => setAmount(event.target.value)}
          placeholder='Số lượng'
          aria-label={`Số lượng điều chỉnh cho ${product.title}`}
        />
      </div>
      <IconButton
        label={`Nhập thêm cho ${product.title}`}
        variant='muted'
        size='sm'
        disabled={isSaving}
        onClick={() => void adjust(1)}
      >
        <Icon name='plus' className='size-4' />
      </IconButton>
      <IconButton
        label={`Xuất bớt cho ${product.title}`}
        variant='muted'
        size='sm'
        disabled={isSaving}
        onClick={() => void adjust(-1)}
      >
        <Icon name='minus' className='size-4' />
      </IconButton>
    </div>
  );
}

const StockListPage: NextPageWithLayout = () => {
  const { products, isLoading, error, reload } = useVendorStocks();
  const [keyword, setKeyword] = useState('');
  const [statusFilter, setStatusFilter] = useState<StockStatus | 'ALL'>('ALL');
  const [sortKey, setSortKey] = useState<SortKey>('status');
  const [notice, setNotice] = useState<Notice | null>(null);

  const counts = useMemo(() => {
    const result = Object.fromEntries(STATUSES.map((status) => [status, 0])) as Record<
      StockStatus,
      number
    >;
    for (const product of products) result[statusOf(product)] += 1;
    return result;
  }, [products]);

  const visibleProducts = useMemo(() => {
    const normalizedKeyword = keyword.trim().toLowerCase();

    return products
      .filter((product) => statusFilter === 'ALL' || statusOf(product) === statusFilter)
      .filter(
        (product) =>
          !normalizedKeyword || product.title.toLowerCase().includes(normalizedKeyword),
      )
      .sort((a, b) => {
        const stockA = a.stock?.stock ?? 0;
        const stockB = b.stock?.stock ?? 0;

        if (sortKey === 'stock-asc') return stockA - stockB;
        if (sortKey === 'stock-desc') return stockB - stockA;
        if (sortKey === 'title') return a.title.localeCompare(b.title, 'vi');
        return STOCK_STATUS_PRIORITY[statusOf(a)] - STOCK_STATUS_PRIORITY[statusOf(b)];
      });
  }, [products, keyword, statusFilter, sortKey]);

  return (
    <VendorPage
      title='Tồn kho'
      description='Theo dõi số lượng từng sản phẩm, lọc theo trạng thái và điều chỉnh nhanh.'
    >
      {isLoading ? (
        <>
          <div className='grid gap-4 sm:grid-cols-2 lg:grid-cols-3'>
            <PanelSkeleton className='h-20' />
            <PanelSkeleton className='h-20' />
            <PanelSkeleton className='h-20' />
          </div>
          <PanelSkeleton className='h-80' />
        </>
      ) : error ? (
        <ErrorState title='Không thể tải tồn kho' message={error} onRetry={reload} />
      ) : products.length === 0 ? (
        <EmptyState
          icon='cart'
          title='Chưa có sản phẩm nào'
          description='Tạo sản phẩm trước, sau đó quay lại đây để quản lý tồn kho.'
          action={<ButtonLink href='/vendors/products/new'>Tạo sản phẩm</ButtonLink>}
        />
      ) : (
        <>
          {/* Tổng quan: bấm vào thẻ để lọc theo trạng thái */}
          <div className='grid gap-4 sm:grid-cols-2 lg:grid-cols-3'>
            <StatCard
              label='Tất cả sản phẩm'
              value={products.length}
              icon='cart'
              active={statusFilter === 'ALL'}
              onClick={() => setStatusFilter('ALL')}
            />
            {STATUSES.map((status) => (
              <StatCard
                key={status}
                label={STOCK_STATUS_LABELS[status]}
                value={counts[status]}
                icon={STOCK_STATUS_STYLES[status].icon}
                tone={STOCK_STATUS_STYLES[status].tone}
                active={statusFilter === status}
                onClick={() => setStatusFilter(status)}
              />
            ))}
          </div>

          <div className='flex flex-wrap items-center gap-3'>
            <div className='w-full sm:w-72'>
              <Input
                type='search'
                value={keyword}
                onChange={(event) => setKeyword(event.target.value)}
                placeholder='Tìm theo tên sản phẩm'
                aria-label='Tìm theo tên sản phẩm'
              />
            </div>
            <Select
              aria-label='Lọc theo trạng thái'
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value as StockStatus | 'ALL')}
            >
              <option value='ALL'>Mọi trạng thái</option>
              {STATUSES.map((status) => (
                <option key={status} value={status}>
                  {STOCK_STATUS_LABELS[status]}
                </option>
              ))}
            </Select>
            <Select
              aria-label='Sắp xếp'
              value={sortKey}
              onChange={(event) => setSortKey(event.target.value as SortKey)}
            >
              <option value='status'>Cần xử lý trước</option>
              <option value='stock-asc'>Tồn kho tăng dần</option>
              <option value='stock-desc'>Tồn kho giảm dần</option>
              <option value='title'>Tên A → Z</option>
            </Select>
          </div>

          {notice && <Alert tone={notice.tone}>{notice.text}</Alert>}

          {visibleProducts.length === 0 ? (
            <p className='text-body-sm text-ink-muted'>Không có sản phẩm nào khớp bộ lọc.</p>
          ) : (
            <Table caption='Tồn kho theo sản phẩm'>
              <thead>
                <tr>
                  <Th>Sản phẩm</Th>
                  <Th align='right'>Tồn kho</Th>
                  <Th>Trạng thái</Th>
                  {STOCK_ALERT_TYPES.map((alertType) => (
                    <Th key={alertType} align='right'>
                      {STOCK_ALERT_LABELS[alertType]}
                    </Th>
                  ))}
                  <Th>Điều chỉnh nhanh</Th>
                  <Th>
                    <span className='sr-only'>Chi tiết</span>
                  </Th>
                </tr>
              </thead>
              <tbody>
                {visibleProducts.map((product) => (
                  <tr key={product.id} className='hover:bg-surface-soft/60'>
                    <Td>
                      <Link
                        href={`/vendors/stocks/${product.id}`}
                        className='font-medium text-ink hover:underline'
                      >
                        {product.title}
                      </Link>
                    </Td>
                    <Td align='right' className='whitespace-nowrap'>
                      <span className='font-semibold'>{product.stock?.stock ?? 0}</span>{' '}
                      <span className='text-ink-muted'>{product.unit}</span>
                    </Td>
                    <Td>
                      <StockStatusBadge status={statusOf(product)} />
                    </Td>
                    {STOCK_ALERT_TYPES.map((alertType) => (
                      <Td key={alertType} align='right' className='text-ink-muted'>
                        {thresholdOf(product, alertType) ?? '—'}
                      </Td>
                    ))}
                    <Td>
                      <QuickAdjust product={product} onNotice={setNotice} onDone={reload} />
                    </Td>
                    <Td align='right'>
                      <ButtonLink href={`/vendors/stocks/${product.id}`} variant='ghost' size='sm'>
                        Chi tiết
                        <Icon name='chevron-right' className='size-4' />
                      </ButtonLink>
                    </Td>
                  </tr>
                ))}
              </tbody>
            </Table>
          )}
        </>
      )}
    </VendorPage>
  );
};

StockListPage.getLayout = function getLayout(page: React.ReactElement) {
  return (
    <VendorShellLayout>
      <VendorLayout>{page}</VendorLayout>
    </VendorShellLayout>
  );
};

export default StockListPage;
