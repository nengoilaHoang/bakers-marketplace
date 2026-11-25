import { useRouter } from 'next/router';
import { useState } from 'react';

import ApiErrorAlert from '@/components/dashboard/ApiErrorAlert';
import DashboardPage from '@/components/dashboard/DashboardPage';
import Panel, { PanelSkeleton } from '@/components/dashboard/Panel';
import ReasonForm from '@/components/dashboard/ReasonForm';
import VendorLayout from '@/components/layout/VendorLayout';
import VendorScope from '@/components/layout/VendorScope';
import ApprovalCountdown from '@/components/orders/ApprovalCountdown';
import OrderItemRow from '@/components/orders/OrderItemRow';
import {
  ORDER_STATUS,
  OrderStatusBadge,
  SHIPMENT_STATUS_LABELS,
  StatusBadge,
  VENDOR_PART_STATUS,
} from '@/components/orders/OrderStatus';
import Timeline from '@/components/orders/Timeline';
import { preOrderCode } from '@/components/pre-orders/PreOrderStatus';
import Alert from '@/components/ui/Alert';
import Button, { ButtonLink } from '@/components/ui/Button';
import { ErrorState } from '@/components/ui/ErrorState';
import { useApiData } from '@/hooks/useApiData';
import { readString } from '@/hooks/useUrlFilters';
import { ApiError } from '@/lib/api';
import type { NextPageWithLayout } from '@/pages/_app';
import { approveVendorOrder, declineVendorOrder, getVendorOrder } from '@/services/orders';
import { formatDateTime, formatMoney } from '@/utils/format';

function getActionError(error: unknown): unknown {
  if (error instanceof ApiError && error.code === 'ORDER_NOT_PENDING') {
    return new Error('Đơn không còn chờ duyệt (khách đã huỷ hoặc đơn đã được chốt).');
  }
  if (error instanceof ApiError && error.code === 'APPROVAL_EXPIRED') {
    return new Error('Đã quá hạn duyệt đơn này. Các món chưa duyệt sẽ được bỏ khỏi đơn.');
  }
  if (error instanceof ApiError && error.code === 'ALREADY_ANSWERED') {
    return new Error('Tiệm đã trả lời đơn này rồi.');
  }
  return error;
}

const VendorOrderDetailPage: NextPageWithLayout = () => {
  const router = useRouter();
  // Tham số tên `orderId` (không phải `id`): VendorScope coi `query.id` của mọi trang /vendors là id bản phát hành storefront.
  const id = readString(router.query.orderId);
  const { data, isLoading, error, reload, setData } = useApiData(
    (signal) => getVendorOrder(id!, { signal }).then((response) => response.data),
    id ?? '',
    Boolean(id),
  );
  const [notice, setNotice] = useState<string | null>(null);
  const [actionError, setActionError] = useState<unknown>(null);
  const [isApproving, setIsApproving] = useState(false);

  const breadcrumb = [
    { label: 'Đơn hàng', href: '/vendors/orders' },
    { label: data ? `Đơn ${data.orderNumber}` : 'Chi tiết' },
  ];

  async function approve() {
    if (!data) return;
    setIsApproving(true);
    setActionError(null);

    try {
      const { data: updated } = await approveVendorOrder(data.id);
      setData(updated);
      setNotice('Đã duyệt các món của tiệm trong đơn.');
    } catch (requestError) {
      setActionError(getActionError(requestError));
      reload();
    } finally {
      setIsApproving(false);
    }
  }

  if (!id || isLoading) {
    return (
      <DashboardPage title='Đơn hàng' breadcrumb={breadcrumb}>
        <PanelSkeleton className='h-80' />
      </DashboardPage>
    );
  }

  if (error || !data) {
    return (
      <DashboardPage title='Đơn hàng' breadcrumb={breadcrumb}>
        <ErrorState title='Không thể tải đơn hàng' message={error ?? 'Đã có lỗi xảy ra.'} onRetry={reload} />
      </DashboardPage>
    );
  }

  const canAnswer = data.currentStatus === 'PENDING' && data.myStatus === 'PENDING';

  return (
    <DashboardPage
      title={`Đơn ${data.orderNumber}`}
      heading={
        <span className='flex flex-wrap items-center gap-3'>
          Đơn {data.orderNumber}
          <OrderStatusBadge status={data.currentStatus} />
        </span>
      }
      description={`Đặt lúc ${formatDateTime(data.placedAt)} · ${data.customer?.displayName ?? 'Tài khoản đã xoá'}`}
      breadcrumb={breadcrumb}
    >
      {data.preOrder && (
        <Alert
          tone='info'
          action={
            <ButtonLink href={`/vendors/pre-orders/${data.preOrder.requestId}`} variant='outline' size='sm'>
              Xem đặt định kỳ
            </ButtonLink>
          }
        >
          Đơn tạo tự động cho kỳ {data.preOrder.cycleNumber}/{data.preOrder.cycleCount} của đặt định kỳ{' '}
          {preOrderCode(data.preOrder.requestId)}, tiệm đã duyệt từ đầu nên không cần duyệt lại.
        </Alert>
      )}
      {notice && <Alert tone='success'>{notice}</Alert>}
      {actionError !== null && <ApiErrorAlert error={actionError} />}

      <div className='grid items-start gap-6 lg:grid-cols-3'>
        <div className='flex flex-col gap-6 lg:col-span-2'>
          <Panel
            title={`Món của tiệm (${data.items.length})`}
            description={
              data.otherVendorItemCount > 0
                ? `Đơn còn ${data.otherVendorItemCount} món của tiệm khác, tiệm khác tự duyệt phần của họ.`
                : undefined
            }
            actions={<StatusBadge style={VENDOR_PART_STATUS[data.myStatus]} />}
          >
            <ul className='flex flex-col divide-y divide-line'>
              {data.items.map((item) => (
                <OrderItemRow
                  key={item.id}
                  item={item}
                  currency={data.currency}
                  showDecision={data.currentStatus === 'PENDING'}
                />
              ))}
            </ul>
            <p className='mt-4 flex justify-between border-t border-line pt-4 text-body-sm'>
              <span className='text-ink-muted'>Tiền phần của tiệm</span>
              <span className='font-semibold text-ink'>{formatMoney(data.mySubtotal, data.currency)}</span>
            </p>
          </Panel>

          {data.shipment && (
            <Panel title='Giao hàng'>
              <dl className='grid gap-3 text-body-sm sm:grid-cols-3'>
                <div>
                  <dt className='text-ink-muted'>Đơn vị vận chuyển</dt>
                  <dd className='font-medium text-ink'>{data.shipment.carrier}</dd>
                </div>
                <div>
                  <dt className='text-ink-muted'>Mã vận đơn</dt>
                  <dd className='font-medium text-ink'>{data.shipment.trackingNumber ?? '—'}</dd>
                </div>
                <div>
                  <dt className='text-ink-muted'>Trạng thái</dt>
                  <dd className='font-medium text-ink'>{SHIPMENT_STATUS_LABELS[data.shipment.currentStatus]}</dd>
                </div>
              </dl>
            </Panel>
          )}

          <Panel title='Lịch sử đơn hàng'>
            <Timeline
              highlightFirst
              entries={[...data.statusHistory].reverse().map((entry) => ({
                id: entry.id,
                title: ORDER_STATUS[entry.status].label,
                description: [entry.note, entry.actor?.displayName && `bởi ${entry.actor.displayName}`]
                  .filter(Boolean)
                  .join(' · '),
                timestamp: entry.timestamp,
              }))}
            />
          </Panel>
        </div>

        <div className='flex flex-col gap-6'>
          {canAnswer ? (
            <>
              <Panel
                title='Duyệt đơn'
                description='Nhận làm các món của tiệm trong đơn. Khi mọi tiệm đã trả lời, đơn được xác nhận.'
              >
                {data.approvalDeadline && (
                  <ApprovalCountdown
                    deadline={data.approvalDeadline}
                    onExpire={reload}
                    hint='Quá hạn thì các món của tiệm bị bỏ khỏi đơn.'
                    className='mb-4'
                  />
                )}
                <Button block disabled={isApproving} onClick={() => void approve()}>
                  {isApproving ? 'Đang duyệt...' : 'Duyệt các món của tiệm'}
                </Button>
              </Panel>
              <ReasonForm
                title='Từ chối'
                description='Các món của tiệm bị bỏ khỏi đơn và trả lại tồn kho. Món của tiệm khác vẫn giữ.'
                label='Lý do từ chối'
                placeholder='Ví dụ: Tiệm hết nguyên liệu hôm nay'
                submitLabel='Từ chối các món của tiệm'
                variant='danger'
                onSubmit={async (reason) => {
                  try {
                    const { data: updated } = await declineVendorOrder(data.id, reason);
                    setData(updated);
                    setActionError(null);
                    setNotice('Đã từ chối các món của tiệm trong đơn.');
                  } catch (requestError) {
                    reload();
                    throw getActionError(requestError);
                  }
                }}
              />
            </>
          ) : data.myStatus === 'EXPIRED' ? (
            <Alert tone='warning'>Tiệm không duyệt trước hạn nên các món của tiệm đã bị bỏ khỏi đơn.</Alert>
          ) : (
            data.currentStatus === 'PENDING' && (
              <Alert tone='info'>Tiệm đã trả lời. Đơn đang chờ các tiệm khác.</Alert>
            )
          )}

          <Panel title='Giao tới'>
            <div className='flex flex-col gap-1 text-body-sm'>
              <p className='font-medium text-ink'>{data.shippingAddress.recipientName}</p>
              <p className='text-ink'>{data.shippingAddress.phone}</p>
              <p className='text-ink-muted'>
                {data.shippingAddress.streetAddress}, {data.shippingAddress.ward}, {data.shippingAddress.province}
              </p>
              {data.shippingAddress.note && (
                <p className='mt-1 font-light text-ink-muted'>Ghi chú: {data.shippingAddress.note}</p>
              )}
            </div>
          </Panel>
        </div>
      </div>
    </DashboardPage>
  );
};

VendorOrderDetailPage.getLayout = function getLayout(page: React.ReactElement) {
  return (
    <VendorScope>
      <VendorLayout>{page}</VendorLayout>
    </VendorScope>
  );
};

export default VendorOrderDetailPage;
