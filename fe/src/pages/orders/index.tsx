import AppLayout from '@/components/layout/AppLayout';
import OrderCard from '@/components/orders/OrderCard';
import { ORDER_STATUS } from '@/components/orders/OrderStatus';
import { ButtonLink } from '@/components/ui/Button';
import Chip from '@/components/ui/Chip';
import Container from '@/components/ui/Container';
import EmptyState from '@/components/ui/EmptyState';
import { ErrorState } from '@/components/ui/ErrorState';
import PageTitle from '@/components/ui/PageTitle';
import Pagination from '@/components/ui/Pagination';
import { useApiData } from '@/hooks/useApiData';
import { readEnum, readPage, useUrlFilters } from '@/hooks/useUrlFilters';
import { getMyOrders, type OrderStatus } from '@/services/orders';

// REFUNDED gắn với thanh toán, chưa dùng nên không có tab riêng.
const FILTERS: OrderStatus[] = ['PENDING', 'APPROVED', 'COMPLETED', 'CANCELLED', 'DECLINED'];
const PAGE_SIZE = 10;

export default function MyOrdersPage() {
  const { query, isReady, update } = useUrlFilters();
  const status = readEnum(query.status, FILTERS);
  const page = readPage(query.page);

  const { data, isLoading, error, reload } = useApiData(
    (signal) => getMyOrders({ status, page, pageSize: PAGE_SIZE }, { signal }),
    `${status}|${page}`,
    isReady,
  );

  return (
    <>
      <PageTitle title='Đơn hàng của tôi' />

      <Container size='narrow' className='pt-14 pb-20'>
        <h1 className='font-heading text-h1 font-semibold text-ink'>Đơn hàng của tôi</h1>

        <nav aria-label='Lọc theo trạng thái' className='mt-6'>
          <ul className='flex flex-wrap gap-2'>
            <li>
              <Chip href='/orders' active={!status} scroll={false}>
                Tất cả
              </Chip>
            </li>
            {FILTERS.map((item) => (
              <li key={item}>
                <Chip href={`/orders?status=${item}`} active={status === item} scroll={false}>
                  {ORDER_STATUS[item].label}
                </Chip>
              </li>
            ))}
          </ul>
        </nav>

        <div className='mt-8'>
          {!isReady || isLoading ? (
            <ul aria-label='Đang tải đơn hàng' className='flex flex-col gap-4'>
              {Array.from({ length: 3 }, (_, index) => (
                <li key={index} className='h-44 animate-pulse rounded-panel bg-surface' />
              ))}
            </ul>
          ) : error || !data ? (
            <ErrorState title='Không thể tải đơn hàng' message={error ?? 'Đã có lỗi xảy ra.'} onRetry={reload} />
          ) : data.data.length === 0 ? (
            <EmptyState
              icon='cart'
              title={status ? 'Không có đơn nào ở trạng thái này' : 'Bạn chưa có đơn hàng nào'}
              description='Các đơn bạn đặt sẽ hiện ở đây để theo dõi.'
              action={<ButtonLink href='/products'>Đến cửa hàng</ButtonLink>}
            />
          ) : (
            <div className='flex flex-col gap-6'>
              <ul className='flex flex-col gap-4'>
                {data.data.map((order) => (
                  <li key={order.id}>
                    <OrderCard order={order} />
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

MyOrdersPage.getLayout = function getLayout(page: React.ReactElement) {
  return <AppLayout>{page}</AppLayout>;
};
