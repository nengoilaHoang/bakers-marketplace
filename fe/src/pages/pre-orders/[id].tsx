import { useRouter } from 'next/router';
import { useState, type FormEvent } from 'react';

import AppLayout from '@/components/layout/AppLayout';
import ApprovalCountdown from '@/components/orders/ApprovalCountdown';
import OrderItemRow from '@/components/orders/OrderItemRow';
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
import Breadcrumb from '@/components/ui/Breadcrumb';
import Button, { ButtonLink } from '@/components/ui/Button';
import Container from '@/components/ui/Container';
import EmptyState from '@/components/ui/EmptyState';
import { ErrorState } from '@/components/ui/ErrorState';
import Field from '@/components/ui/Field';
import { Textarea } from '@/components/ui/Input';
import Modal from '@/components/ui/Modal';
import PageTitle from '@/components/ui/PageTitle';
import { useApiData } from '@/hooks/useApiData';
import { readString } from '@/hooks/useUrlFilters';
import { ApiError } from '@/lib/api';
import {
  cancelPreOrder,
  getPreOrder,
  skipPreOrderCycle,
  type PreOrderCycle,
  type PreOrderDetail,
} from '@/services/preOrders';
import { formatDate, formatDateTime, formatMoney } from '@/utils/format';

type Notice = { tone: 'success' | 'danger'; text: string };

// Yêu cầu còn mở: bỏ qua kỳ và huỷ được.
const OPEN_STATUSES = ['PENDING', 'APPROVED', 'ACTIVE'];

function Section({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <section className='flex flex-col gap-4'>
      <div>
        <h2 className='text-h4 font-semibold text-ink'>{title}</h2>
        {description && <p className='mt-1 text-body-sm font-light text-ink-muted'>{description}</p>}
      </div>
      {children}
    </section>
  );
}

function getActionError(error: unknown): string {
  if (error instanceof ApiError) {
    if (error.code === 'LAST_CYCLE') return 'Đây là kỳ cuối còn lại. Muốn dừng thì huỷ cả đặt định kỳ.';
    if (error.code === 'CYCLE_NOT_SCHEDULED')
      return 'Kỳ này đã tới ngày hoặc đã được xử lý, không bỏ qua được nữa.';
    if (error.code === 'PRE_ORDER_CLOSED') return 'Đặt định kỳ này đã kết thúc.';
  }
  return 'Không thực hiện được. Vui lòng thử lại.';
}

type CancelModalProps = Readonly<{
  preOrderId: string;
  open: boolean;
  onClose: () => void;
  onCancelled: (preOrder: PreOrderDetail) => void;
}>;

// Huỷ cả yêu cầu: các kỳ chưa tới bị huỷ theo, đơn của các kỳ đã tạo vẫn giữ.
function CancelPreOrderModal({ preOrderId, open, onClose, onCancelled }: CancelModalProps) {
  const [reason, setReason] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSending, setIsSending] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSending(true);
    setError(null);

    try {
      const { data } = await cancelPreOrder(preOrderId, reason.trim() || undefined);
      onCancelled(data);
    } catch (requestError) {
      setError(getActionError(requestError));
    } finally {
      setIsSending(false);
    }
  }

  return (
    <Modal open={open} onClose={onClose} title='Huỷ đặt định kỳ?'>
      <form onSubmit={(event) => void handleSubmit(event)} className='flex flex-col gap-5'>
        <p className='text-body-sm text-ink-muted'>
          Mọi kỳ chưa tới sẽ bị huỷ. Đơn của các kỳ đã tạo vẫn giao bình thường. Bạn không thể hoàn tác.
        </p>
        <Field label='Lý do (tuỳ chọn)' htmlFor='cancel-preorder-reason' size='sm'>
          <Textarea
            id='cancel-preorder-reason'
            rows={3}
            maxLength={500}
            value={reason}
            onChange={(event) => setReason(event.target.value)}
            placeholder='Ví dụ: tiệm tạm nghỉ tháng sau'
          />
        </Field>
        {error && <Alert tone='danger'>{error}</Alert>}
        <div className='flex justify-end gap-3'>
          <Button variant='ghost' onClick={onClose} disabled={isSending}>
            Giữ lại
          </Button>
          <Button type='submit' variant='danger' disabled={isSending}>
            {isSending ? 'Đang huỷ...' : 'Huỷ đặt định kỳ'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}

export default function PreOrderDetailPage() {
  const router = useRouter();
  const id = readString(router.query.id);
  const justPlaced = router.query.placed === '1';
  const { data, isLoading, error, reload, setData } = useApiData(
    (signal) =>
      getPreOrder(id!, { signal })
        .then((response) => response.data)
        .catch((requestError) => {
          if (requestError instanceof ApiError && requestError.status === 404) return null;
          throw requestError;
        }),
    id ?? '',
    Boolean(id),
  );
  const [isCancelOpen, setIsCancelOpen] = useState(false);
  const [skipTarget, setSkipTarget] = useState<PreOrderCycle | null>(null);
  const [skippingId, setSkippingId] = useState<string | null>(null);
  const [notice, setNotice] = useState<Notice | null>(null);

  async function skip(cycle: PreOrderCycle) {
    if (!data) return;
    setSkipTarget(null);
    setSkippingId(cycle.id);
    setNotice(null);

    try {
      const { data: updated } = await skipPreOrderCycle(data.id, cycle.id);
      setData(updated);
      setNotice({
        tone: 'success',
        text: `Đã bỏ qua kỳ ${cycle.cycleNumber} (${formatDate(cycle.scheduledAt)}).`,
      });
    } catch (requestError) {
      setNotice({ tone: 'danger', text: getActionError(requestError) });
      reload();
    } finally {
      setSkippingId(null);
    }
  }

  const preOrder = data;
  const isOpen = preOrder ? OPEN_STATUSES.includes(preOrder.currentStatus) : false;
  const title = preOrder ? `Đặt định kỳ ${preOrderCode(preOrder.id)}` : 'Đặt định kỳ';

  return (
    <>
      <PageTitle title={title} />

      <Container size='content' className='pt-6 pb-20'>
        <Breadcrumb
          className='-ml-2'
          items={[
            { label: 'Đặt định kỳ của tôi', href: '/pre-orders' },
            { label: preOrder ? preOrderCode(preOrder.id) : 'Chi tiết' },
          ]}
        />

        {!id || isLoading ? (
          <div aria-hidden className='mt-6 flex flex-col gap-6'>
            <div className='h-10 w-1/2 animate-pulse rounded-media bg-surface-soft' />
            <div className='h-64 animate-pulse rounded-panel bg-surface' />
          </div>
        ) : error ? (
          <div className='mt-8'>
            <ErrorState title='Không thể tải đặt định kỳ' message={error} onRetry={reload} />
          </div>
        ) : !preOrder ? (
          <EmptyState
            icon='search'
            className='mt-8'
            title='Không tìm thấy đặt định kỳ'
            description='Yêu cầu này không tồn tại hoặc không phải của bạn.'
            action={<ButtonLink href='/pre-orders'>Xem đặt định kỳ của tôi</ButtonLink>}
          />
        ) : (
          <>
            <div className='mt-6 flex flex-wrap items-start justify-between gap-4'>
              <div className='flex flex-col gap-2'>
                <div className='flex flex-wrap items-center gap-3'>
                  <h1 className='font-heading text-h2 font-semibold text-ink'>{title}</h1>
                  <PreOrderStatusBadge status={preOrder.currentStatus} />
                </div>
                <p className='text-body-sm font-light text-ink-muted'>
                  Gửi lúc {formatDateTime(preOrder.requestedAt)}
                </p>
              </div>
              {isOpen && (
                <Button variant='danger' onClick={() => setIsCancelOpen(true)}>
                  Huỷ đặt định kỳ
                </Button>
              )}
            </div>

            <div className='mt-6 flex flex-col gap-3'>
              {preOrder.currentStatus === 'PENDING' && preOrder.approvalDeadline && (
                <ApprovalCountdown
                  deadline={preOrder.approvalDeadline}
                  onExpire={reload}
                  hint='Hết giờ mà tiệm nào chưa duyệt thì món của tiệm đó bị bỏ khỏi đặt định kỳ.'
                />
              )}
              {justPlaced && !notice && (
                <Alert tone='success' title='Đã gửi đặt định kỳ!'>
                  Các tiệm sẽ duyệt một lần cho cả đợt. Sau đó mỗi kỳ hệ thống tự tạo đơn, bạn không cần đặt
                  lại.
                </Alert>
              )}
              {preOrder.currentStatus === 'DECLINED' && (
                <Alert tone='warning'>Các tiệm đã từ chối nên đặt định kỳ không bắt đầu được.</Alert>
              )}
              {preOrder.currentStatus === 'EXPIRED' && (
                <Alert tone='warning'>Các tiệm không duyệt trước hạn nên đặt định kỳ đã hết hạn.</Alert>
              )}
              {notice && <Alert tone={notice.tone}>{notice.text}</Alert>}
            </div>

            <div className='mt-8 grid items-start gap-10 lg:grid-cols-3'>
              <div className='flex flex-col gap-10 lg:col-span-2'>
                <Section
                  title='Lịch giao'
                  description={`${describeSchedule(preOrder)} · từ ${formatPlainDate(preOrder.startDate)} đến ${formatPlainDate(preOrder.endDate)}`}
                >
                  <div className='rounded-panel bg-surface px-5 sm:px-6'>
                    <PreOrderCycleList
                      cycles={preOrder.cycles}
                      orderHref={(orderId) => `/orders/${orderId}`}
                      onSkip={isOpen ? setSkipTarget : undefined}
                      skippingId={skippingId}
                    />
                  </div>
                </Section>

                <Section
                  title={`Sản phẩm mỗi kỳ (${preOrder.items.length})`}
                  description='Giá giữ như lúc gửi yêu cầu.'
                >
                  <ul className='flex flex-col divide-y divide-line rounded-panel bg-surface px-5 sm:px-6'>
                    {preOrder.items.map((item) => (
                      <OrderItemRow
                        key={item.id}
                        item={item}
                        currency={preOrder.currency}
                        linkToProduct
                        showDecision={preOrder.currentStatus === 'PENDING'}
                      />
                    ))}
                  </ul>
                </Section>

                <Section title='Lịch sử'>
                  <Timeline
                    highlightFirst
                    entries={[...preOrder.statusHistory].reverse().map((entry) => ({
                      id: entry.id,
                      title: PRE_ORDER_STATUS[entry.status].label,
                      description: entry.note ?? undefined,
                      timestamp: entry.timestamp,
                    }))}
                  />
                </Section>
              </div>

              <aside className='flex flex-col gap-6'>
                <dl className='flex flex-col gap-2 rounded-panel bg-highlight px-6 py-5 text-body-sm'>
                  <div className='flex justify-between gap-4'>
                    <dt className='text-ink-muted'>Mỗi kỳ</dt>
                    <dd className='font-semibold text-ink'>
                      {formatMoney(preOrder.cycleSubtotal, preOrder.currency)}
                    </dd>
                  </div>
                  <div className='flex justify-between gap-4'>
                    <dt className='text-ink-muted'>Kỳ tới</dt>
                    <dd className='text-ink'>
                      {preOrder.nextCycleAt ? formatDate(preOrder.nextCycleAt) : '—'}
                    </dd>
                  </div>
                  <div className='flex justify-between gap-4'>
                    <dt className='text-ink-muted'>Thanh toán</dt>
                    <dd className='text-ink'>Khi nhận mỗi kỳ</dd>
                  </div>
                </dl>
                <div className='flex flex-col gap-1 rounded-panel bg-surface px-6 py-5 text-body-sm'>
                  <h2 className='text-meta font-semibold text-ink uppercase'>Giao tới</h2>
                  <p className='mt-1 font-medium text-ink'>{preOrder.shippingAddress.recipientName}</p>
                  <p className='text-ink'>{preOrder.shippingAddress.phone}</p>
                  <p className='text-ink-muted'>
                    {preOrder.shippingAddress.streetAddress}, {preOrder.shippingAddress.ward},{' '}
                    {preOrder.shippingAddress.province}
                  </p>
                  {preOrder.shippingAddress.note && (
                    <p className='mt-1 font-light text-ink-muted'>Ghi chú: {preOrder.shippingAddress.note}</p>
                  )}
                </div>
              </aside>
            </div>

            <CancelPreOrderModal
              preOrderId={preOrder.id}
              open={isCancelOpen}
              onClose={() => setIsCancelOpen(false)}
              onCancelled={(updated) => {
                setIsCancelOpen(false);
                setData(updated);
                setNotice({ tone: 'success', text: 'Đã huỷ đặt định kỳ.' });
              }}
            />
            <Modal
              open={skipTarget !== null}
              onClose={() => setSkipTarget(null)}
              title={skipTarget ? `Bỏ qua kỳ ${skipTarget.cycleNumber}?` : 'Bỏ qua kỳ?'}
            >
              <div className='flex flex-col gap-5'>
                <p className='text-body-sm text-ink-muted'>
                  Kỳ giao ngày {formatDate(skipTarget?.scheduledAt)} sẽ không tạo đơn. Các kỳ khác vẫn giữ
                  nguyên.
                </p>
                <div className='flex justify-end gap-3'>
                  <Button variant='ghost' onClick={() => setSkipTarget(null)}>
                    Giữ kỳ này
                  </Button>
                  <Button onClick={() => skipTarget && void skip(skipTarget)}>Bỏ qua kỳ này</Button>
                </div>
              </div>
            </Modal>
          </>
        )}
      </Container>
    </>
  );
}

PreOrderDetailPage.getLayout = function getLayout(page: React.ReactElement) {
  return <AppLayout>{page}</AppLayout>;
};
