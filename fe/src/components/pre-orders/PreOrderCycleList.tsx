import Link from 'next/link';
import { useState } from 'react';

import { OrderStatusBadge } from '@/components/orders/OrderStatus';
import Button from '@/components/ui/Button';
import { cn } from '@/lib/cn';
import type { PreOrderCycle } from '@/types/preOrder';
import { formatDate } from '@/utils/format';

import { CycleStatusBadge } from './PreOrderStatus';

type PreOrderCycleListProps = Readonly<{
  cycles: PreOrderCycle[];
  // Link tới đơn hệ thống đã tạo cho kỳ (khác nhau cho khách và tiệm).
  orderHref: (orderId: string) => string;
  // Có thì kỳ chưa tới có nút "Bỏ qua kỳ này" (phía khách, yêu cầu còn mở).
  onSkip?: (cycle: PreOrderCycle) => void;
  skippingId?: string | null;
}>;

// Danh sách các kỳ giao: ngày, trạng thái, đơn đã tạo. Kỳ chưa tới gần nhất được đánh dấu "Kỳ tới".
export default function PreOrderCycleList({ cycles, orderHref, onSkip, skippingId }: PreOrderCycleListProps) {
  // Mốc so sánh lấy một lần khi dựng; kỳ vừa tới ngày mà còn nút thì BE vẫn chặn (CYCLE_NOT_SCHEDULED).
  const [now] = useState(() => Date.now());
  const nextId = cycles.find((cycle) => cycle.currentStatus === 'SCHEDULED')?.id;
  // Kỳ cuối còn lại không bỏ qua được (huỷ cả yêu cầu thay vào đó)
  const scheduledCount = cycles.filter((cycle) => cycle.currentStatus === 'SCHEDULED').length;

  return (
    <ol className='flex flex-col divide-y divide-line'>
      {cycles.map((cycle) => {
        const isNext = cycle.id === nextId;
        const canSkip =
          onSkip &&
          cycle.currentStatus === 'SCHEDULED' &&
          new Date(cycle.scheduledAt).getTime() > now &&
          scheduledCount > 1;

        return (
          <li key={cycle.id} className='flex flex-wrap items-center justify-between gap-3 py-4'>
            <div className='flex min-w-0 items-center gap-4'>
              <span
                className={cn(
                  'grid size-10 shrink-0 place-items-center rounded-full border text-body-sm font-semibold',
                  isNext ? 'border-primary bg-primary text-on-primary' : 'border-line bg-page text-ink',
                )}
              >
                {cycle.cycleNumber}
              </span>
              <div className='min-w-0'>
                <p className='font-medium text-ink'>
                  {formatDate(cycle.scheduledAt)}
                  {isNext && (
                    <span className='ml-2 text-caption font-normal text-ink-muted uppercase'>Kỳ tới</span>
                  )}
                </p>
                {cycle.generatedOrder ? (
                  <p className='flex flex-wrap items-center gap-2 text-body-sm text-ink-muted'>
                    <Link href={orderHref(cycle.generatedOrder.id)} className='text-ink hover:underline'>
                      Đơn {cycle.generatedOrder.orderNumber}
                    </Link>
                    <OrderStatusBadge status={cycle.generatedOrder.currentStatus} />
                  </p>
                ) : (
                  cycle.currentStatus === 'SCHEDULED' && (
                    <p className='text-body-sm font-light text-ink-muted'>
                      Đơn được tạo tự động lúc 00:00 ngày này
                    </p>
                  )
                )}
              </div>
            </div>
            <div className='flex items-center gap-3'>
              {canSkip && (
                <Button
                  variant='ghost'
                  size='sm'
                  disabled={skippingId === cycle.id}
                  onClick={() => onSkip(cycle)}
                >
                  {skippingId === cycle.id ? 'Đang bỏ qua...' : 'Bỏ qua kỳ này'}
                </Button>
              )}
              <CycleStatusBadge status={cycle.currentStatus} />
            </div>
          </li>
        );
      })}
    </ol>
  );
}
