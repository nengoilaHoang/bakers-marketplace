import { useRouter } from 'next/router';
import { useId, useState, type FormEvent } from 'react';

import ApiErrorAlert from '@/components/dashboard/ApiErrorAlert';
import DashboardPage from '@/components/dashboard/DashboardPage';
import Panel, { PanelSkeleton } from '@/components/dashboard/Panel';
import AdminLayout from '@/components/layout/AdminLayout';
import OrderItemRow from '@/components/orders/OrderItemRow';
import { OrderStatusBadge, SHIPMENT_STATUS_LABELS } from '@/components/orders/OrderStatus';
import ShipmentStepper from '@/components/orders/ShipmentStepper';
import Timeline from '@/components/orders/Timeline';
import Alert from '@/components/ui/Alert';
import Button from '@/components/ui/Button';
import { ErrorState } from '@/components/ui/ErrorState';
import Field from '@/components/ui/Field';
import Input, { Textarea } from '@/components/ui/Input';
import { useApiData } from '@/hooks/useApiData';
import { readString } from '@/hooks/useUrlFilters';
import { ApiError } from '@/lib/api';
import type { NextPageWithLayout } from '@/pages/_app';
import { advanceShipment, getAdminShipment } from '@/services/admin';
import type { AdminShipmentDetail, ShipmentAdvance } from '@/types/order';
import { formatDateTime, formatMoney } from '@/utils/format';

function getAdvanceError(error: unknown): unknown {
  if (error instanceof ApiError && error.code === 'STEP_CHANGED') {
    return new Error('Vận đơn vừa được cập nhật ở nơi khác. Trang đã tải lại, hãy kiểm tra rồi thử lại.');
  }
  if (error instanceof ApiError && error.code === 'ALREADY_DELIVERED') {
    return new Error('Vận đơn đã giao xong.');
  }
  return error;
}

type NextStepFormProps = Readonly<{
  shipment: AdminShipmentDetail;
  onAdvanced: (updated: AdminShipmentDetail) => void;
  onStale: () => void;
}>;

// Form ghi bước giao hàng kế tiếp: bước tự lấy theo thứ tự, admin sửa địa điểm và mô tả gợi ý sẵn.
function NextStepForm({ shipment, onAdvanced, onStale }: NextStepFormProps) {
  const locationId = useId();
  const descriptionId = useId();
  const next = shipment.nextStep!;
  const [form, setForm] = useState<ShipmentAdvance>(next);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<unknown>(null);
  const isLastStep = next.status === 'DELIVERED';

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      const { data } = await advanceShipment(shipment.shipment.id, {
        status: next.status,
        locationName: form.locationName.trim(),
        description: form.description.trim(),
      });
      onAdvanced(data);
    } catch (submitError) {
      setError(getAdvanceError(submitError));
      if (submitError instanceof ApiError && submitError.status === 409) onStale();
    } finally {
      setIsSubmitting(false);
    }
  }

  const canSubmit = form.locationName.trim() !== '' && form.description.trim() !== '';

  return (
    <Panel
      title='Cập nhật bước tiếp theo'
      description={
        isLastStep
          ? 'Đây là bước cuối: xác nhận xong thì đơn chuyển sang Hoàn thành và khách đánh giá được.'
          : 'Ghi lại kiện hàng đang ở đâu và chuyện gì đã xảy ra. Khách thấy mốc này ở mục theo dõi giao hàng.'
      }
      onSubmit={(event) => void handleSubmit(event)}
    >
      <div className='flex flex-col gap-4'>
        <p className='text-body-sm text-ink-muted'>
          Chuyển sang: <span className='font-semibold text-ink'>{SHIPMENT_STATUS_LABELS[next.status]}</span>
        </p>
        <Field label='Địa điểm' htmlFor={locationId} required size='sm'>
          <Input
            id={locationId}
            value={form.locationName}
            maxLength={255}
            required
            placeholder='Ví dụ: Kho Tân Bình, TP.HCM'
            onChange={(event) => setForm((current) => ({ ...current, locationName: event.target.value }))}
          />
        </Field>
        <Field label='Mô tả' htmlFor={descriptionId} required size='sm'>
          <Textarea
            id={descriptionId}
            rows={3}
            value={form.description}
            maxLength={500}
            required
            placeholder='Ví dụ: Shipper đã lấy hàng tại tiệm'
            onChange={(event) => setForm((current) => ({ ...current, description: event.target.value }))}
          />
        </Field>
        {error !== null && <ApiErrorAlert error={error} />}
        <Button type='submit' block disabled={isSubmitting || !canSubmit}>
          {isSubmitting ? 'Đang cập nhật...' : `Xác nhận: ${SHIPMENT_STATUS_LABELS[next.status]}`}
        </Button>
      </div>
    </Panel>
  );
}

// Chi tiết một vận đơn: thanh tiến trình, các mốc đã ghi, món giao, địa chỉ và form ghi bước kế tiếp.
const AdminShipmentDetailPage: NextPageWithLayout = () => {
  const router = useRouter();
  const id = readString(router.query.id);
  const { data, isLoading, error, reload, setData } = useApiData(
    (signal) => getAdminShipment(id!, { signal }).then((response) => response.data),
    id ?? '',
    Boolean(id),
  );
  const [notice, setNotice] = useState<string | null>(null);

  const breadcrumb = [
    { label: 'Giao hàng', href: '/admin/shipments' },
    { label: data ? `Đơn ${data.orderNumber}` : 'Chi tiết' },
  ];

  if (!id || isLoading) {
    return (
      <DashboardPage title='Vận đơn' breadcrumb={breadcrumb}>
        <PanelSkeleton className='h-80' />
      </DashboardPage>
    );
  }

  if (error || !data) {
    return (
      <DashboardPage title='Vận đơn' breadcrumb={breadcrumb}>
        <ErrorState title='Không thể tải vận đơn' message={error ?? 'Đã có lỗi xảy ra.'} onRetry={reload} />
      </DashboardPage>
    );
  }

  const { shipment } = data;
  const deliveredItems = data.items.filter((item) => item.status === 'APPROVED');
  const isDelivered = shipment.currentStatus === 'DELIVERED';

  return (
    <DashboardPage
      title={`Đơn ${data.orderNumber}`}
      heading={
        <span className='flex flex-wrap items-center gap-3'>
          Đơn {data.orderNumber}
          <OrderStatusBadge status={data.currentStatus} />
        </span>
      }
      description={`${shipment.carrier} · Mã vận đơn ${shipment.trackingNumber ?? '—'}`}
      breadcrumb={breadcrumb}
    >
      {notice && <Alert tone='success'>{notice}</Alert>}

      <Panel title='Tiến trình giao hàng'>
        <ShipmentStepper currentStatus={shipment.currentStatus} events={shipment.events} />
        <p className='mt-6 border-t border-line pt-4 text-body-sm text-ink-muted'>
          {isDelivered ? 'Đã giao lúc ' : 'Dự kiến giao '}
          <span className='font-medium text-ink'>
            {shipment.estimatedDelivery ? formatDateTime(shipment.estimatedDelivery) : '—'}
          </span>
        </p>
      </Panel>

      <div className='grid items-start gap-6 lg:grid-cols-3'>
        <div className='flex flex-col gap-6 lg:col-span-2'>
          <Panel title='Các mốc vận chuyển' description='Mới nhất ở trên. Khách thấy đúng các mốc này.'>
            <Timeline
              highlightFirst
              entries={shipment.events.map((event) => ({
                id: event.id,
                title: SHIPMENT_STATUS_LABELS[event.status],
                description: [event.description, event.locationName].filter(Boolean).join(' · '),
                timestamp: event.timestamp,
              }))}
            />
          </Panel>

          <Panel title={`Món giao (${deliveredItems.length})`}>
            <ul className='flex flex-col divide-y divide-line'>
              {deliveredItems.map((item) => (
                <OrderItemRow key={item.id} item={item} currency={data.currency} />
              ))}
            </ul>
            <p className='mt-4 flex justify-between border-t border-line pt-4 text-body-sm'>
              <span className='text-ink-muted'>Tổng đơn</span>
              <span className='font-semibold text-ink'>{formatMoney(data.totalAmount, data.currency)}</span>
            </p>
          </Panel>
        </div>

        <div className='flex flex-col gap-6'>
          {data.nextStep ? (
            <NextStepForm
              // Sang bước mới thì form tạo lại, điền gợi ý của bước đó
              key={data.nextStep.status}
              shipment={data}
              onStale={reload}
              onAdvanced={(updated) => {
                setData(updated);
                setNotice(
                  updated.shipment.currentStatus === 'DELIVERED'
                    ? 'Đã giao hàng xong, đơn chuyển sang Hoàn thành.'
                    : `Đã chuyển sang bước: ${SHIPMENT_STATUS_LABELS[updated.shipment.currentStatus]}.`,
                );
              }}
            />
          ) : (
            <Alert tone='success'>Vận đơn đã giao xong, đơn đã hoàn thành.</Alert>
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
              <p className='mt-2 text-ink-muted'>
                Tài khoản đặt: {data.customer?.displayName ?? 'Tài khoản đã xoá'}
              </p>
            </div>
          </Panel>
        </div>
      </div>
    </DashboardPage>
  );
};

AdminShipmentDetailPage.getLayout = function getLayout(page: React.ReactElement) {
  return <AdminLayout>{page}</AdminLayout>;
};

export default AdminShipmentDetailPage;
