import { useRouter } from 'next/router';
import { useState } from 'react';

import AppLayout from '@/components/layout/AppLayout';
import ApprovalCountdown from '@/components/orders/ApprovalCountdown';
import CancelOrderModal from '@/components/orders/CancelOrderModal';
import OrderItemRow from '@/components/orders/OrderItemRow';
import { ORDER_STATUS, OrderStatusBadge, SHIPMENT_STATUS_LABELS } from '@/components/orders/OrderStatus';
import OrderTotals from '@/components/orders/OrderTotals';
import RateItemModal from '@/components/orders/RateItemModal';
import ShipmentStepper from '@/components/orders/ShipmentStepper';
import Timeline from '@/components/orders/Timeline';
import { preOrderCode } from '@/components/pre-orders/PreOrderStatus';
import Alert from '@/components/ui/Alert';
import Breadcrumb from '@/components/ui/Breadcrumb';
import Button, { ButtonLink } from '@/components/ui/Button';
import Container from '@/components/ui/Container';
import EmptyState from '@/components/ui/EmptyState';
import { ErrorState } from '@/components/ui/ErrorState';
import Icon from '@/components/ui/Icon';
import PageTitle from '@/components/ui/PageTitle';
import { useApiData } from '@/hooks/useApiData';
import { addToCart, selectOnly } from '@/hooks/useCart';
import { readString } from '@/hooks/useUrlFilters';
import { ApiError } from '@/lib/api';
import { getOrder, getReorderItems, type OrderDetail, type OrderItem } from '@/services/orders';
import { formatDateTime } from '@/utils/format';

type Notice = { tone: 'success' | 'warning' | 'danger'; text: string; toCart?: boolean };

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className='flex flex-col gap-4'>
      <h2 className='text-h4 font-semibold text-ink'>{title}</h2>
      {children}
    </section>
  );
}

function OrderDetailSkeleton() {
  return (
    <div aria-hidden className='mt-6 flex flex-col gap-6'>
      <div className='h-10 w-1/2 animate-pulse rounded-media bg-surface-soft' />
      <div className='h-64 animate-pulse rounded-panel bg-surface' />
    </div>
  );
}

export default function OrderDetailPage() {
  const router = useRouter();
  const id = readString(router.query.id);
  const justPlaced = router.query.placed === '1';
  const { data, isLoading, error, reload, setData } = useApiData(
    (signal) =>
      getOrder(id!, { signal })
        .then((response) => response.data)
        .catch((requestError) => {
          if (requestError instanceof ApiError && requestError.status === 404) return null;
          throw requestError;
        }),
    id ?? '',
    Boolean(id),
  );
  const [isCancelOpen, setIsCancelOpen] = useState(false);
  const [ratingItem, setRatingItem] = useState<OrderItem | null>(null);
  const [notice, setNotice] = useState<Notice | null>(null);
  const [isReordering, setIsReordering] = useState(false);

  function showUpdated(order: OrderDetail, text: string) {
    setData(order);
    setNotice({ tone: 'success', text });
  }

  async function reorder(order: OrderDetail) {
    setIsReordering(true);
    setNotice(null);

    try {
      const { data: result } = await getReorderItems(order.id);
      for (const item of result.items) {
        addToCart(item);
      }
      // Giỏ chỉ chọn sẵn các món vừa đặt lại
      selectOnly(result.items.map((item) => item.productId));

      const skipped = result.skipped.map((entry) =>
        entry.reason === 'DELETED' ? `${entry.productTitle} (ngừng bán)` : `${entry.productTitle} (hết hàng)`,
      );
      if (result.items.length === 0) {
        setNotice({ tone: 'warning', text: `Không món nào còn mua được: ${skipped.join(', ')}.` });
      } else {
        setNotice({
          tone: skipped.length > 0 ? 'warning' : 'success',
          text:
            `Đã thêm ${result.items.length} món vào giỏ theo giá hiện tại.` +
            (skipped.length > 0 ? ` Bỏ qua: ${skipped.join(', ')}.` : ''),
          toCart: true,
        });
      }
    } catch {
      setNotice({ tone: 'danger', text: 'Không đặt lại được. Vui lòng thử lại.' });
    } finally {
      setIsReordering(false);
    }
  }

  const order = data;
  const canCancel = order?.currentStatus === 'PENDING';
  const canRate = order?.currentStatus === 'COMPLETED';

  return (
    <>
      <PageTitle title={order ? `Đơn ${order.orderNumber}` : 'Chi tiết đơn hàng'} />

      <Container size='content' className='pt-6 pb-20'>
        <Breadcrumb
          className='-ml-2'
          items={[
            { label: 'Đơn hàng của tôi', href: '/orders' },
            { label: order ? `Đơn ${order.orderNumber}` : 'Chi tiết' },
          ]}
        />

        {!id || isLoading ? (
          <OrderDetailSkeleton />
        ) : error ? (
          <div className='mt-8'>
            <ErrorState title='Không thể tải đơn hàng' message={error} onRetry={reload} />
          </div>
        ) : !order ? (
          <EmptyState
            icon='search'
            className='mt-8'
            title='Không tìm thấy đơn hàng'
            description='Đơn này không tồn tại hoặc không phải của bạn.'
            action={<ButtonLink href='/orders'>Xem đơn của tôi</ButtonLink>}
          />
        ) : (
          <>
            <div className='mt-6 flex flex-wrap items-start justify-between gap-4'>
              <div className='flex flex-col gap-2'>
                <div className='flex flex-wrap items-center gap-3'>
                  <h1 className='font-heading text-h2 font-semibold text-ink'>Đơn {order.orderNumber}</h1>
                  <OrderStatusBadge status={order.currentStatus} />
                </div>
                <p className='text-body-sm font-light text-ink-muted'>Đặt lúc {formatDateTime(order.placedAt)}</p>
              </div>
              <div className='flex flex-wrap gap-3'>
                {canCancel && (
                  <Button variant='danger' onClick={() => setIsCancelOpen(true)}>
                    Huỷ đơn
                  </Button>
                )}
                <Button variant='outline' disabled={isReordering} onClick={() => void reorder(order)}>
                  <Icon name='refresh' className='size-4' />
                  {isReordering ? 'Đang thêm...' : 'Đặt lại'}
                </Button>
              </div>
            </div>

            <div className='mt-6 flex flex-col gap-3'>
              {canCancel && order.approvalDeadline && (
                <ApprovalCountdown
                  deadline={order.approvalDeadline}
                  onExpire={reload}
                  hint='Hết giờ mà tiệm nào chưa duyệt thì món của tiệm đó bị bỏ khỏi đơn.'
                />
              )}
              {order.preOrder && (
                <Alert
                  tone='info'
                  action={
                    <ButtonLink href={`/pre-orders/${order.preOrder.requestId}`} variant='outline' size='sm'>
                      Xem đặt định kỳ
                    </ButtonLink>
                  }
                >
                  Đơn tạo tự động cho kỳ {order.preOrder.cycleNumber}/{order.preOrder.cycleCount} của đặt định kỳ{' '}
                  {preOrderCode(order.preOrder.requestId)}.
                </Alert>
              )}
              {justPlaced && !notice && (
                <Alert tone='success' title='Đặt hàng thành công!'>
                  Đơn đang chờ các tiệm xác nhận. Bạn có thể huỷ khi đơn còn ở trạng thái chờ xác nhận.
                </Alert>
              )}
              {order.currentStatus === 'EXPIRED' && (
                <Alert tone='warning'>
                  Các tiệm không duyệt đơn trước hạn nên đơn đã hết hạn. Bạn có thể bấm Đặt lại để đặt đơn mới.
                </Alert>
              )}
              {notice && (
                <Alert
                  tone={notice.tone}
                  action={
                    notice.toCart && (
                      <ButtonLink href='/cart' variant='outline' size='sm'>
                        Xem giỏ hàng
                      </ButtonLink>
                    )
                  }
                >
                  {notice.text}
                </Alert>
              )}
            </div>

            <div className='mt-8 grid items-start gap-10 lg:grid-cols-3'>
              <div className='flex flex-col gap-10 lg:col-span-2'>
                <Section title={`Sản phẩm (${order.items.length})`}>
                  <ul className='flex flex-col divide-y divide-line rounded-panel bg-surface px-5 sm:px-6'>
                    {order.items.map((item) => (
                      <OrderItemRow
                        key={item.id}
                        item={item}
                        currency={order.currency}
                        linkToProduct
                        showDecision={order.currentStatus === 'PENDING'}
                        // Chỉ món tiệm đã duyệt (đã giao) mới đánh giá được
                        onRate={
                          canRate && item.status === 'APPROVED' ? () => setRatingItem(item) : undefined
                        }
                      />
                    ))}
                  </ul>
                </Section>

                {order.shipment ? (
                  <Section title='Theo dõi giao hàng'>
                    <div className='flex flex-col gap-5 rounded-panel border border-line px-5 py-5 sm:px-6'>
                      <ShipmentStepper
                        currentStatus={order.shipment.currentStatus}
                        events={order.shipment.events}
                        className='border-b border-line pb-5'
                      />
                      <dl className='grid gap-3 text-body-sm sm:grid-cols-2'>
                        <div>
                          <dt className='text-ink-muted'>Đơn vị vận chuyển</dt>
                          <dd className='font-medium text-ink'>{order.shipment.carrier}</dd>
                        </div>
                        {order.shipment.trackingNumber && (
                          <div>
                            <dt className='text-ink-muted'>Mã vận đơn</dt>
                            <dd className='font-medium text-ink'>{order.shipment.trackingNumber}</dd>
                          </div>
                        )}
                        <div>
                          <dt className='text-ink-muted'>Trạng thái</dt>
                          <dd className='font-medium text-ink'>
                            {SHIPMENT_STATUS_LABELS[order.shipment.currentStatus]}
                          </dd>
                        </div>
                        {order.shipment.estimatedDelivery && (
                          <div>
                            <dt className='text-ink-muted'>
                              {order.shipment.currentStatus === 'DELIVERED' ? 'Đã giao lúc' : 'Dự kiến giao'}
                            </dt>
                            <dd className='font-medium text-ink'>
                              {formatDateTime(order.shipment.estimatedDelivery)}
                            </dd>
                          </div>
                        )}
                      </dl>
                      {order.shipment.events.length > 0 && (
                        <Timeline
                          highlightFirst
                          entries={order.shipment.events.map((event) => ({
                            id: event.id,
                            title: SHIPMENT_STATUS_LABELS[event.status],
                            description: [event.description, event.locationName].filter(Boolean).join(' · '),
                            timestamp: event.timestamp,
                          }))}
                        />
                      )}
                    </div>
                  </Section>
                ) : (
                  order.currentStatus === 'APPROVED' && (
                    <Alert tone='info'>Các tiệm đã xác nhận đơn và đang chuẩn bị hàng.</Alert>
                  )
                )}

                <Section title='Lịch sử đơn hàng'>
                  <Timeline
                    highlightFirst
                    entries={[...order.statusHistory].reverse().map((entry) => ({
                      id: entry.id,
                      title: ORDER_STATUS[entry.status].label,
                      description: entry.note ? `Ghi chú: ${entry.note}` : undefined,
                      timestamp: entry.timestamp,
                    }))}
                  />
                </Section>
              </div>

              <aside className='flex flex-col gap-6'>
                <OrderTotals
                  subtotal={order.subtotal}
                  deliveryFee={order.deliveryFee}
                  totalAmount={order.totalAmount}
                  currency={order.currency}
                />
                <div className='flex flex-col gap-1 rounded-panel bg-surface px-6 py-5 text-body-sm'>
                  <h2 className='text-meta font-semibold text-ink uppercase'>Giao tới</h2>
                  <p className='mt-1 font-medium text-ink'>{order.shippingAddress.recipientName}</p>
                  <p className='text-ink'>{order.shippingAddress.phone}</p>
                  <p className='text-ink-muted'>
                    {order.shippingAddress.streetAddress}, {order.shippingAddress.ward},{' '}
                    {order.shippingAddress.province}
                  </p>
                  {order.shippingAddress.note && (
                    <p className='mt-1 font-light text-ink-muted'>Ghi chú: {order.shippingAddress.note}</p>
                  )}
                </div>
              </aside>
            </div>

            <CancelOrderModal
              orderId={order.id}
              open={isCancelOpen}
              onClose={() => setIsCancelOpen(false)}
              onCancelled={(updated) => {
                setIsCancelOpen(false);
                showUpdated(updated, 'Đã huỷ đơn hàng.');
              }}
            />
            <RateItemModal
              orderId={order.id}
              item={ratingItem}
              onClose={() => setRatingItem(null)}
              onRated={(updated) => {
                setRatingItem(null);
                showUpdated(updated, 'Cảm ơn bạn đã đánh giá!');
              }}
            />
          </>
        )}
      </Container>
    </>
  );
}

OrderDetailPage.getLayout = function getLayout(page: React.ReactElement) {
  return <AppLayout>{page}</AppLayout>;
};
