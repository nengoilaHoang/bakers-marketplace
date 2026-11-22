import AppLayout from '@/components/layout/AppLayout';
import PreOrderCard from '@/components/pre-orders/PreOrderCard';
import { PRE_ORDER_STATUS } from '@/components/pre-orders/PreOrderStatus';
import { ButtonLink } from '@/components/ui/Button';
import Chip from '@/components/ui/Chip';
import Container from '@/components/ui/Container';
import EmptyState from '@/components/ui/EmptyState';
import { ErrorState } from '@/components/ui/ErrorState';
import PageTitle from '@/components/ui/PageTitle';
import Pagination from '@/components/ui/Pagination';
import { useApiData } from '@/hooks/useApiData';
import { readEnum, readPage, useUrlFilters } from '@/hooks/useUrlFilters';
import { getMyPreOrders, type PreOrderStatus } from '@/services/preOrders';

const FILTERS: PreOrderStatus[] = [
  'PENDING',
  'APPROVED',
  'ACTIVE',
  'COMPLETED',
  'CANCELLED',
  'DECLINED',
  'EXPIRED',
];
const PAGE_SIZE = 10;

// Các yêu cầu đặt định kỳ của Baker.
export default function MyPreOrdersPage() {
  const { query, isReady, update } = useUrlFilters();
  const status = readEnum(query.status, FILTERS);
  const page = readPage(query.page);

  const { data, isLoading, error, reload } = useApiData(
    (signal) => getMyPreOrders({ status, page, pageSize: PAGE_SIZE }, { signal }),
    `${status}|${page}`,
    isReady,
  );

  return (
    <>
      <PageTitle title='Đặt định kỳ của tôi' />

      <Container size='narrow' className='pt-14 pb-20'>
        <h1 className='font-heading text-h1 font-semibold text-ink'>Đặt định kỳ</h1>
        <p className='mt-2 text-body-sm font-light text-ink-muted'>
          Các tiệm duyệt một lần, sau đó mỗi kỳ hệ thống tự tạo đơn cho bạn. Đặt định kỳ ở bước Đặt hàng trong
          giỏ.
        </p>

        <nav aria-label='Lọc theo trạng thái' className='mt-6'>
          <ul className='flex flex-wrap gap-2'>
            <li>
              <Chip href='/pre-orders' active={!status} scroll={false}>
                Tất cả
              </Chip>
            </li>
            {FILTERS.map((item) => (
              <li key={item}>
                <Chip href={`/pre-orders?status=${item}`} active={status === item} scroll={false}>
                  {PRE_ORDER_STATUS[item].label}
                </Chip>
              </li>
            ))}
          </ul>
        </nav>

        <div className='mt-8'>
          {!isReady || isLoading ? (
            <ul aria-label='Đang tải' className='flex flex-col gap-4'>
              {Array.from({ length: 3 }, (_, index) => (
                <li key={index} className='h-44 animate-pulse rounded-panel bg-surface' />
              ))}
            </ul>
          ) : error || !data ? (
            <ErrorState
              title='Không thể tải đặt định kỳ'
              message={error ?? 'Đã có lỗi xảy ra.'}
              onRetry={reload}
            />
          ) : data.data.length === 0 ? (
            <EmptyState
              icon='repeat'
              title={status ? 'Không có yêu cầu nào ở trạng thái này' : 'Bạn chưa đặt định kỳ lần nào'}
              description='Chọn món vào giỏ, tới bước Đặt hàng rồi chọn "Đặt định kỳ".'
              action={<ButtonLink href='/products'>Đến cửa hàng</ButtonLink>}
            />
          ) : (
            <div className='flex flex-col gap-6'>
              <ul className='flex flex-col gap-4'>
                {data.data.map((preOrder) => (
                  <li key={preOrder.id}>
                    <PreOrderCard preOrder={preOrder} />
                  </li>
                ))}
              </ul>
              <Pagination pagination={data.pagination} onPageChange={(next) => update({ page: next })} />
            </div>
          )}
        </div>
      </Container>
    </>
  );
}

MyPreOrdersPage.getLayout = function getLayout(page: React.ReactElement) {
  return <AppLayout>{page}</AppLayout>;
};
