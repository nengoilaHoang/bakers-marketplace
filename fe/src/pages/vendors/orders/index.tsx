import Link from 'next/link';

import { OrderStatusBadge, StatusBadge, VENDOR_PART_STATUS } from '@/components/orders/OrderStatus';
import DashboardPage from '@/components/dashboard/DashboardPage';
import { PanelSkeleton } from '@/components/dashboard/Panel';
import VendorLayout from '@/components/layout/VendorLayout';
import VendorScope from '@/components/layout/VendorScope';
import { ButtonLink } from '@/components/ui/Button';
import EmptyState from '@/components/ui/EmptyState';
import { ErrorState } from '@/components/ui/ErrorState';
import Icon from '@/components/ui/Icon';
import Pagination from '@/components/ui/Pagination';
import Select from '@/components/ui/Select';
import Table, { Td, Th } from '@/components/ui/Table';
import { useApiData } from '@/hooks/useApiData';
import { readEnum, readPage, useUrlFilters } from '@/hooks/useUrlFilters';
import type { NextPageWithLayout } from '@/pages/_app';
import { getVendorOrders, type VendorOrderQuery } from '@/services/orders';
import { formatDateTime, formatMoney } from '@/utils/format';

const VIEWS = ['all', 'awaiting', 'APPROVED', 'COMPLETED', 'DECLINED', 'EXPIRED', 'CANCELLED'] as const;
type View = (typeof VIEWS)[number];

const VIEW_LABELS: Record<View, string> = {
  all: 'Tất cả đơn',
  awaiting: 'Cần tiệm duyệt',
  APPROVED: 'Đã xác nhận',
  COMPLETED: 'Hoàn thành',
  DECLINED: 'Bị từ chối',
  EXPIRED: 'Quá hạn duyệt',
  CANCELLED: 'Khách đã huỷ',
};

function toQuery(view: View): VendorOrderQuery {
  if (view === 'all') return {};
  if (view === 'awaiting') return { awaiting: true };
  return { status: view };
}

// Đơn có sản phẩm của tiệm. Mỗi đơn có thể có món của tiệm khác: tiệm chỉ trả lời phần của mình.
const VendorOrdersPage: NextPageWithLayout = () => {
  const { query, isReady, update } = useUrlFilters();
  const view = readEnum(query.view, VIEWS) ?? 'all';
  const page = readPage(query.page);

  const { data, isLoading, error, reload } = useApiData(
    (signal) => getVendorOrders({ ...toQuery(view), page }, { signal }),
    `${view}|${page}`,
    isReady,
  );

  return (
    <DashboardPage
      title='Đơn hàng'
      description='Đơn có sản phẩm của tiệm. Tiệm duyệt hoặc từ chối các món của mình; món bị từ chối được bỏ khỏi đơn.'
    >
      <div className='flex flex-wrap items-center gap-3'>
        <Select aria-label='Lọc đơn hàng' value={view} onChange={(event) => update({ view: event.target.value })}>
          {VIEWS.map((item) => (
            <option key={item} value={item}>
              {VIEW_LABELS[item]}
            </option>
          ))}
        </Select>
      </div>

      {isLoading ? (
        <PanelSkeleton className='h-80' />
      ) : error || !data ? (
        <ErrorState title='Không thể tải đơn hàng' message={error ?? 'Đã có lỗi xảy ra.'} onRetry={reload} />
      ) : data.data.length === 0 ? (
        <EmptyState
          icon='cart'
          title={view === 'awaiting' ? 'Không có đơn nào chờ tiệm duyệt' : 'Chưa có đơn hàng nào'}
        />
      ) : (
        <>
          <Table caption='Danh sách đơn hàng'>
            <thead>
              <tr>
                <Th>Đơn</Th>
                <Th>Khách hàng</Th>
                <Th>Phần của tiệm</Th>
                <Th>Trạng thái đơn</Th>
                <Th>Tiền phần của tiệm</Th>
                <Th>Ngày đặt</Th>
                <Th>
                  <span className='sr-only'>Chi tiết</span>
                </Th>
              </tr>
            </thead>
            <tbody>
              {data.data.map((order) => (
                <tr key={order.id} className='hover:bg-surface-soft/60'>
                  <Td className='whitespace-nowrap'>
                    <Link href={`/vendors/orders/${order.id}`} className='font-medium text-ink hover:underline'>
                      {order.orderNumber}
                    </Link>
                  </Td>
                  <Td className='whitespace-nowrap'>
                    {order.customer?.displayName ?? <span className='text-ink-subtle'>Tài khoản đã xoá</span>}
                  </Td>
                  <Td className='whitespace-nowrap'>
                    <span className='flex items-center gap-2'>
                      <StatusBadge style={VENDOR_PART_STATUS[order.myStatus]} />
                      <span className='text-ink-muted'>{order.myItemCount} món</span>
                    </span>
                    {order.currentStatus === 'PENDING' && order.myStatus === 'PENDING' && order.approvalDeadline && (
                      <p className='mt-1 text-ink-muted'>Hạn duyệt: {formatDateTime(order.approvalDeadline)}</p>
                    )}
                  </Td>
                  <Td>
                    <OrderStatusBadge status={order.currentStatus} />
                  </Td>
                  <Td className='whitespace-nowrap'>{formatMoney(order.mySubtotal, order.currency)}</Td>
                  <Td className='whitespace-nowrap text-ink-muted'>{formatDateTime(order.placedAt)}</Td>
                  <Td align='right'>
                    <ButtonLink href={`/vendors/orders/${order.id}`} variant='ghost' size='sm'>
                      {order.currentStatus === 'PENDING' && order.myStatus === 'PENDING' ? 'Duyệt' : 'Chi tiết'}
                      <Icon name='chevron-right' className='size-4' />
                    </ButtonLink>
                  </Td>
                </tr>
              ))}
            </tbody>
          </Table>
          <Pagination pagination={data.pagination} onPageChange={(next) => update({ page: next })} />
        </>
      )}
    </DashboardPage>
  );
};

VendorOrdersPage.getLayout = function getLayout(page: React.ReactElement) {
  return (
    <VendorScope>
      <VendorLayout>{page}</VendorLayout>
    </VendorScope>
  );
};

export default VendorOrdersPage;
