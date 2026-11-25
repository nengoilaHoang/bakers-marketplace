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
import { StatusBadge, VENDOR_PART_STATUS } from '@/components/orders/OrderStatus';
import Timeline from '@/components/orders/Timeline';
import PreOrderCycleList from '@/components/pre-orders/PreOrderCycleList';
import {
  describeSchedule,
  formatPlainDate,
  PRE_ORDER_STATUS,
  preOrderCode,
  PreOrderStatusBadge,
} from '@/components/pre-orders/PreOrderStatus';
import Alert from '@/components/ui/Alert';
import Button from '@/components/ui/Button';
import { ErrorState } from '@/components/ui/ErrorState';
import { useApiData } from '@/hooks/useApiData';
import { readString } from '@/hooks/useUrlFilters';
import { ApiError } from '@/lib/api';
import type { NextPageWithLayout } from '@/pages/_app';
import { approveVendorPreOrder, declineVendorPreOrder, getVendorPreOrder } from '@/services/preOrders';
import { formatDateTime, formatMoney } from '@/utils/format';

function getActionError(error: unknown): unknown {
  if (error instanceof ApiError && error.code === 'PRE_ORDER_NOT_PENDING') {
    return new Error('Yêu cầu không còn chờ duyệt (khách đã huỷ hoặc đã được chốt).');
  }
  if (error instanceof ApiError && error.code === 'APPROVAL_EXPIRED') {
    return new Error('Đã quá hạn duyệt yêu cầu này. Các món chưa duyệt sẽ được bỏ ra.');
  }
  if (error instanceof ApiError && error.code === 'ALREADY_ANSWERED') {
    return new Error('Tiệm đã trả lời yêu cầu này rồi.');
  }
  return error;
}

const VendorPreOrderDetailPage: NextPageWithLayout = () => {
  const router = useRouter();
  // Không đặt tên `id`: VendorScope coi `query.id` của mọi trang /vendors là id bản phát hành storefront.
  const id = readString(router.query.preOrderId);
  const { data, isLoading, error, reload, setData } = useApiData(
    (signal) => getVendorPreOrder(id!, { signal }).then((response) => response.data),
    id ?? '',
    Boolean(id),
  );
  const [notice, setNotice] = useState<string | null>(null);
  const [actionError, setActionError] = useState<unknown>(null);
  const [isApproving, setIsApproving] = useState(false);

  const code = data ? preOrderCode(data.id) : null;
  const breadcrumb = [{ label: 'Đặt định kỳ', href: '/vendors/pre-orders' }, { label: code ?? 'Chi tiết' }];

  async function approve() {
    if (!data) return;
    setIsApproving(true);
    setActionError(null);

    try {
      const { data: updated } = await approveVendorPreOrder(data.id);
      setData(updated);
      setNotice('Đã duyệt các món của tiệm cho cả đợt.');
    } catch (requestError) {
      setActionError(getActionError(requestError));
      reload();
    } finally {
      setIsApproving(false);
    }
  }

  if (!id || isLoading) {
    return (
      <DashboardPage title='Đặt định kỳ' breadcrumb={breadcrumb}>
        <PanelSkeleton className='h-80' />
      </DashboardPage>
    );
  }

  if (error || !data) {
    return (
      <DashboardPage title='Đặt định kỳ' breadcrumb={breadcrumb}>
        <ErrorState
          title='Không thể tải đặt định kỳ'
          message={error ?? 'Đã có lỗi xảy ra.'}
          onRetry={reload}
        />
      </DashboardPage>
    );
  }

  const canAnswer = data.currentStatus === 'PENDING' && data.myStatus === 'PENDING';

  return (
    <DashboardPage
      title={`Đặt định kỳ ${code}`}
      heading={
        <span className='flex flex-wrap items-center gap-3'>
          Đặt định kỳ {code}
          <PreOrderStatusBadge status={data.currentStatus} />
        </span>
      }
      description={`Gửi lúc ${formatDateTime(data.requestedAt)} · ${data.customer?.displayName ?? 'Tài khoản đã xoá'}`}
      breadcrumb={breadcrumb}
    >
      {notice && <Alert tone='success'>{notice}</Alert>}
      {actionError !== null && <ApiErrorAlert error={actionError} />}

      <div className='grid items-start gap-6 lg:grid-cols-3'>
        <div className='flex flex-col gap-6 lg:col-span-2'>
          <Panel
            title={`Món của tiệm mỗi kỳ (${data.items.length})`}
            description={
              data.otherVendorItemCount > 0
                ? `Yêu cầu còn ${data.otherVendorItemCount} món của tiệm khác, tiệm khác tự duyệt phần của họ.`
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
              <span className='text-ink-muted'>Tiền phần của tiệm mỗi kỳ</span>
              <span className='font-semibold text-ink'>{formatMoney(data.mySubtotal, data.currency)}</span>
            </p>
          </Panel>

          <Panel
            title='Lịch giao'
            description={`${describeSchedule(data)} · từ ${formatPlainDate(data.startDate)} đến ${formatPlainDate(data.endDate)}`}
          >
            <PreOrderCycleList cycles={data.cycles} orderHref={(orderId) => `/vendors/orders/${orderId}`} />
          </Panel>

          <Panel title='Lịch sử'>
            <Timeline
              highlightFirst
              entries={[...data.statusHistory].reverse().map((entry) => ({
                id: entry.id,
                title: PRE_ORDER_STATUS[entry.status].label,
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
                title='Duyệt đặt định kỳ'
                description={`Nhận làm các món của tiệm cho cả ${data.cycleCount} kỳ. Mỗi kỳ hệ thống tự tạo đơn đã xác nhận, tiệm không cần duyệt lại.`}
              >
                {data.approvalDeadline && (
                  <ApprovalCountdown
                    deadline={data.approvalDeadline}
                    onExpire={reload}
                    hint='Quá hạn thì các món của tiệm bị bỏ khỏi đặt định kỳ.'
                    className='mb-4'
                  />
                )}
                <Button block disabled={isApproving} onClick={() => void approve()}>
                  {isApproving ? 'Đang duyệt...' : 'Duyệt cho cả đợt'}
                </Button>
              </Panel>
              <ReasonForm
                title='Từ chối'
                description='Các món của tiệm bị bỏ khỏi mọi kỳ. Món của tiệm khác vẫn giữ.'
                label='Lý do từ chối'
                placeholder='Ví dụ: Tiệm không nhận đơn định kỳ số lượng này'
                submitLabel='Từ chối các món của tiệm'
                variant='danger'
                onSubmit={async (reason) => {
                  try {
                    const { data: updated } = await declineVendorPreOrder(data.id, reason);
                    setData(updated);
                    setActionError(null);
                    setNotice('Đã từ chối các món của tiệm.');
                  } catch (requestError) {
                    reload();
                    throw getActionError(requestError);
                  }
                }}
              />
            </>
          ) : data.myStatus === 'EXPIRED' ? (
            <Alert tone='warning'>Tiệm không duyệt trước hạn nên các món của tiệm đã bị bỏ ra.</Alert>
          ) : (
            data.currentStatus === 'PENDING' && (
              <Alert tone='info'>Tiệm đã trả lời. Yêu cầu đang chờ các tiệm khác.</Alert>
            )
          )}

          <Panel title='Giao tới'>
            <div className='flex flex-col gap-1 text-body-sm'>
              <p className='font-medium text-ink'>{data.shippingAddress.recipientName}</p>
              <p className='text-ink'>{data.shippingAddress.phone}</p>
              <p className='text-ink-muted'>
                {data.shippingAddress.streetAddress}, {data.shippingAddress.ward},{' '}
                {data.shippingAddress.province}
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

VendorPreOrderDetailPage.getLayout = function getLayout(page: React.ReactElement) {
  return (
    <VendorScope>
      <VendorLayout>{page}</VendorLayout>
    </VendorScope>
  );
};

export default VendorPreOrderDetailPage;
