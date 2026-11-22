import Link from 'next/link';

import DashboardPage from '@/components/dashboard/DashboardPage';
import { PanelSkeleton } from '@/components/dashboard/Panel';
import AdminLayout from '@/components/layout/AdminLayout';
import { SHIPMENT_STATUS_LABELS, SHIPMENT_STEPS } from '@/components/orders/OrderStatus';
import Badge from '@/components/ui/Badge';
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
import { getAdminShipments } from '@/services/admin';
import type { AdminShipmentView } from '@/types/order';
import { formatDateTime, formatMoney } from '@/utils/format';

const VIEWS: AdminShipmentView[] = ['all', 'active', 'delivered'];

const VIEW_LABELS: Record<AdminShipmentView, string> = {
  all: 'Tất cả vận đơn',
  active: 'Đang giao',
  delivered: 'Đã giao',
};

// Vận đơn do hệ thống tạo khi đơn được các tiệm duyệt xong. Mở một vận đơn để ghi bước giao hàng tiếp theo.
const AdminShipmentsPage: NextPageWithLayout = () => {
  const { query, isReady, update } = useUrlFilters();
  const view = readEnum(query.view, VIEWS) ?? 'all';
  const page = readPage(query.page);

  const { data, isLoading, error, reload } = useApiData(
    (signal) => getAdminShipments({ view, page }, { signal }),
    `${view}|${page}`,
    isReady,
  );

  return (
    <DashboardPage
      title='Giao hàng'
      description='Vận đơn được tạo tự động khi các tiệm duyệt xong đơn. Mở vận đơn để cập nhật bước giao hàng; bước cuối hoàn thành đơn.'
    >
      <div className='flex flex-wrap items-center gap-3'>
        <Select aria-label='Lọc vận đơn' value={view} onChange={(event) => update({ view: event.target.value })}>
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
        <ErrorState title='Không thể tải vận đơn' message={error ?? 'Đã có lỗi xảy ra.'} onRetry={reload} />
      ) : data.data.length === 0 ? (
        <EmptyState icon='truck' title={view === 'active' ? 'Không có đơn nào đang giao' : 'Chưa có vận đơn nào'} />
      ) : (
        <>
          <Table caption='Danh sách vận đơn'>
            <thead>
              <tr>
                <Th>Đơn</Th>
                <Th>Khách hàng</Th>
                <Th>Vận đơn</Th>
                <Th>Bước hiện tại</Th>
                <Th>
                  <span className='sr-only'>Cập nhật</span>
                </Th>
              </tr>
            </thead>
            <tbody>
              {data.data.map((shipment) => {
                const href = `/admin/shipments/${shipment.id}`;
                const step = SHIPMENT_STEPS.indexOf(shipment.currentStatus) + 1;

                return (
                  <tr key={shipment.id} className='hover:bg-surface-soft/60'>
                    <Td className='whitespace-nowrap'>
                      <Link href={href} className='font-medium text-ink hover:underline'>
                        {shipment.orderNumber}
                      </Link>
                      <p className='text-ink-muted'>
                        {shipment.itemCount} món · {formatMoney(shipment.totalAmount, shipment.currency)}
                      </p>
                    </Td>
                    <Td className='whitespace-nowrap'>
                      {shipment.customer?.displayName ?? <span className='text-ink-subtle'>Tài khoản đã xoá</span>}
                    </Td>
                    <Td className='whitespace-nowrap'>
                      <p className='text-ink'>{shipment.carrier}</p>
                      <p className='text-ink-muted'>{shipment.trackingNumber ?? '—'}</p>
                    </Td>
                    <Td className='whitespace-nowrap'>
                      <Badge tone={shipment.currentStatus === 'DELIVERED' ? 'success' : 'info'}>
                        {SHIPMENT_STATUS_LABELS[shipment.currentStatus]}
                      </Badge>
                      <p className='mt-1 text-ink-muted'>
                        Bước {step}/{SHIPMENT_STEPS.length} · {formatDateTime(shipment.updatedAt)}
                      </p>
                    </Td>
                    <Td align='right' className='whitespace-nowrap'>
                      <ButtonLink href={href} size='sm' variant={shipment.currentStatus === 'DELIVERED' ? 'ghost' : 'outline'}>
                        {shipment.currentStatus === 'DELIVERED' ? 'Chi tiết' : 'Cập nhật'}
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

AdminShipmentsPage.getLayout = function getLayout(page: React.ReactElement) {
  return <AdminLayout>{page}</AdminLayout>;
};

export default AdminShipmentsPage;
