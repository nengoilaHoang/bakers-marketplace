import Link from 'next/link';

import DashboardPage from '@/components/dashboard/DashboardPage';
import { PanelSkeleton } from '@/components/dashboard/Panel';
import VendorLayout from '@/components/layout/VendorLayout';
import VendorScope from '@/components/layout/VendorScope';
import { StatusBadge, VENDOR_PART_STATUS } from '@/components/orders/OrderStatus';
import { describeSchedule, preOrderCode, PreOrderStatusBadge } from '@/components/pre-orders/PreOrderStatus';
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
import { getVendorPreOrders, type VendorPreOrderQuery } from '@/services/preOrders';
import { formatDate, formatDateTime, formatMoney } from '@/utils/format';

const VIEWS = [
  'all',
  'awaiting',
  'APPROVED',
  'ACTIVE',
  'COMPLETED',
  'DECLINED',
  'EXPIRED',
  'CANCELLED',
] as const;
type View = (typeof VIEWS)[number];

const VIEW_LABELS: Record<View, string> = {
  all: 'Tất cả',
  awaiting: 'Cần tiệm duyệt',
  APPROVED: 'Chờ bắt đầu',
  ACTIVE: 'Đang giao định kỳ',
  COMPLETED: 'Đã xong',
  DECLINED: 'Bị từ chối',
  EXPIRED: 'Quá hạn duyệt',
  CANCELLED: 'Khách đã huỷ',
};

function toQuery(view: View): VendorPreOrderQuery {
  if (view === 'all') return {};
  if (view === 'awaiting') return { awaiting: true };
  return { status: view };
}

// Yêu cầu đặt định kỳ có sản phẩm của tiệm. Tiệm duyệt một lần, sau đó mỗi kỳ hệ thống tự tạo đơn (hiện ở mục Đơn hàng).
const VendorPreOrdersPage: NextPageWithLayout = () => {
  const { query, isReady, update } = useUrlFilters();
  const view = readEnum(query.view, VIEWS) ?? 'all';
  const page = readPage(query.page);

  const { data, isLoading, error, reload } = useApiData(
    (signal) => getVendorPreOrders({ ...toQuery(view), page }, { signal }),
    `${view}|${page}`,
    isReady,
  );

  return (
    <DashboardPage
      title='Đặt định kỳ'
      description='Baker đặt hàng lặp lại theo tháng. Tiệm duyệt một lần cho cả đợt; tới mỗi kỳ hệ thống tự tạo đơn đã xác nhận ở mục Đơn hàng.'
    >
      <div className='flex flex-wrap items-center gap-3'>
        <Select
          aria-label='Lọc đặt định kỳ'
          value={view}
          onChange={(event) => update({ view: event.target.value })}
        >
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
        <ErrorState
          title='Không thể tải đặt định kỳ'
          message={error ?? 'Đã có lỗi xảy ra.'}
          onRetry={reload}
        />
      ) : data.data.length === 0 ? (
        <EmptyState
          icon='repeat'
          title={
            view === 'awaiting' ? 'Không có yêu cầu nào chờ tiệm duyệt' : 'Chưa có yêu cầu đặt định kỳ nào'
          }
        />
      ) : (
        <>
          <Table caption='Danh sách đặt định kỳ'>
            <thead>
              <tr>
                <Th>Yêu cầu</Th>
                <Th>Khách hàng</Th>
                <Th>Phần của tiệm</Th>
                <Th>Trạng thái</Th>
                <Th>Tiền mỗi kỳ</Th>
                <Th>Kỳ tới</Th>
                <Th>
                  <span className='sr-only'>Chi tiết</span>
                </Th>
              </tr>
            </thead>
            <tbody>
              {data.data.map((preOrder) => {
                const href = `/vendors/pre-orders/${preOrder.id}`;
                const needsAnswer = preOrder.currentStatus === 'PENDING' && preOrder.myStatus === 'PENDING';

                return (
                  <tr key={preOrder.id} className='hover:bg-surface-soft/60'>
                    <Td className='whitespace-nowrap'>
                      <Link href={href} className='font-medium text-ink hover:underline'>
                        {preOrderCode(preOrder.id)}
                      </Link>
                      <p className='text-ink-muted'>{describeSchedule(preOrder)}</p>
                    </Td>
                    <Td className='whitespace-nowrap'>
                      {preOrder.customer?.displayName ?? (
                        <span className='text-ink-subtle'>Tài khoản đã xoá</span>
                      )}
                    </Td>
                    <Td className='whitespace-nowrap'>
                      <span className='flex items-center gap-2'>
                        <StatusBadge style={VENDOR_PART_STATUS[preOrder.myStatus]} />
                        <span className='text-ink-muted'>{preOrder.myItemCount} món</span>
                      </span>
                      {needsAnswer && preOrder.approvalDeadline && (
                        <p className='mt-1 text-ink-muted'>
                          Hạn duyệt: {formatDateTime(preOrder.approvalDeadline)}
                        </p>
                      )}
                    </Td>
                    <Td>
                      <PreOrderStatusBadge status={preOrder.currentStatus} />
                    </Td>
                    <Td className='whitespace-nowrap'>
                      {formatMoney(preOrder.mySubtotal, preOrder.currency)}
                    </Td>
                    <Td className='whitespace-nowrap text-ink-muted'>
                      {preOrder.nextCycleAt ? formatDate(preOrder.nextCycleAt) : '—'}
                    </Td>
                    <Td align='right'>
                      <ButtonLink href={href} variant='ghost' size='sm'>
                        {needsAnswer ? 'Duyệt' : 'Chi tiết'}
                        <Icon name='chevron-right' className='size-4' />
                      </ButtonLink>
                    </Td>
                  </tr>
                );
              })}
            </tbody>
          </Table>
          <Pagination pagination={data.pagination} onPageChange={(next) => update({ page: next })} />
        </>
      )}
    </DashboardPage>
  );
};

VendorPreOrdersPage.getLayout = function getLayout(page: React.ReactElement) {
  return (
    <VendorScope>
      <VendorLayout>{page}</VendorLayout>
    </VendorScope>
  );
};

export default VendorPreOrdersPage;
