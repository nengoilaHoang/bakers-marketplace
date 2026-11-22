import { useState } from 'react';

import ApiErrorAlert from '@/components/dashboard/ApiErrorAlert';
import DashboardPage from '@/components/dashboard/DashboardPage';
import { PanelSkeleton } from '@/components/dashboard/Panel';
import AdminLayout from '@/components/layout/AdminLayout';
import { SHIPMENT_STATUS_LABELS } from '@/components/orders/OrderStatus';
import Alert from '@/components/ui/Alert';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import EmptyState from '@/components/ui/EmptyState';
import { ErrorState } from '@/components/ui/ErrorState';
import Pagination from '@/components/ui/Pagination';
import Select from '@/components/ui/Select';
import Table, { Td, Th } from '@/components/ui/Table';
import { useApiData } from '@/hooks/useApiData';
import { readEnum, readPage, useUrlFilters } from '@/hooks/useUrlFilters';
import type { NextPageWithLayout } from '@/pages/_app';
import { advanceShipment, getAdminShipments } from '@/services/admin';
import type { AdminShipment, AdminShipmentView, ShipmentStatus } from '@/types/order';
import { formatDateTime, formatMoney } from '@/utils/format';

const VIEWS: AdminShipmentView[] = ['active', 'delivered', 'all'];

const VIEW_LABELS: Record<AdminShipmentView, string> = {
  active: 'Đang giao',
  delivered: 'Đã giao',
  all: 'Tất cả vận đơn',
};

// Thứ tự các bước giao hàng; bấm một lần là sang bước kế tiếp.
const STEPS: ShipmentStatus[] = ['LABEL_CREATED', 'PICKED_UP', 'IN_TRANSIT', 'OUT_FOR_DELIVERY', 'DELIVERED'];

function nextStep(status: ShipmentStatus): ShipmentStatus | undefined {
  return STEPS[STEPS.indexOf(status) + 1];
}

// Vận đơn do hệ thống tạo khi đơn được các tiệm duyệt xong; admin chuyển từng bước tới khi giao xong.
const AdminShipmentsPage: NextPageWithLayout = () => {
  const { query, isReady, update } = useUrlFilters();
  const view = readEnum(query.view, VIEWS) ?? 'active';
  const page = readPage(query.page);

  const { data, isLoading, error, reload } = useApiData(
    (signal) => getAdminShipments({ view, page }, { signal }),
    `${view}|${page}`,
    isReady,
  );
  const [busyId, setBusyId] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [actionError, setActionError] = useState<unknown>(null);

  async function advance(shipment: AdminShipment) {
    const next = nextStep(shipment.currentStatus);
    if (!next) return;

    setBusyId(shipment.id);
    setActionError(null);

    try {
      await advanceShipment(shipment.id);
      setNotice(
        next === 'DELIVERED'
          ? `Đơn ${shipment.orderNumber} đã giao xong và chuyển sang hoàn thành.`
          : `Đơn ${shipment.orderNumber}: ${SHIPMENT_STATUS_LABELS[next].toLowerCase()}.`,
      );
    } catch (requestError) {
      setActionError(requestError);
    } finally {
      setBusyId(null);
      reload();
    }
  }

  return (
    <DashboardPage
      title='Giao hàng'
      description='Vận đơn được tạo tự động khi các tiệm duyệt xong đơn. Bấm để chuyển sang bước giao hàng tiếp theo; bước cuối hoàn thành đơn.'
    >
      {notice && <Alert tone='success'>{notice}</Alert>}
      {actionError !== null && <ApiErrorAlert error={actionError} />}

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
        <EmptyState icon='location' title={view === 'active' ? 'Không có đơn nào đang giao' : 'Chưa có vận đơn nào'} />
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
                  <span className='sr-only'>Chuyển bước</span>
                </Th>
              </tr>
            </thead>
            <tbody>
              {data.data.map((shipment) => {
                const next = nextStep(shipment.currentStatus);

                return (
                  <tr key={shipment.id} className='hover:bg-surface-soft/60'>
                    <Td className='whitespace-nowrap'>
                      <p className='font-medium text-ink'>{shipment.orderNumber}</p>
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
                      <p className='mt-1 text-ink-muted'>{formatDateTime(shipment.updatedAt)}</p>
                    </Td>
                    <Td align='right' className='whitespace-nowrap'>
                      {next && (
                        <Button
                          size='sm'
                          variant='outline'
                          disabled={busyId !== null}
                          onClick={() => void advance(shipment)}
                        >
                          {busyId === shipment.id ? 'Đang cập nhật...' : `→ ${SHIPMENT_STATUS_LABELS[next]}`}
                        </Button>
                      )}
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
