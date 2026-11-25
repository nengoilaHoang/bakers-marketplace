import Icon, { type IconName } from '@/components/ui/Icon';
import { cn } from '@/lib/cn';
import type { ShipmentStatus, TrackingEvent } from '@/types/order';
import { formatDate, formatDayMonth, formatTime } from '@/utils/format';

import { SHIPMENT_STATUS_LABELS, SHIPMENT_STEPS } from './OrderStatus';

const STEP_ICONS: Record<ShipmentStatus, IconName> = {
  LABEL_CREATED: 'clipboard',
  PICKED_UP: 'package',
  IN_TRANSIT: 'truck',
  OUT_FOR_DELIVERY: 'location',
  DELIVERED: 'package-check',
};

type ShipmentStepperProps = Readonly<{
  currentStatus: ShipmentStatus;
  // Mốc theo dõi (mới nhất trước): lấy giờ của từng bước đã qua.
  events: TrackingEvent[];
  className?: string;
}>;

// Thanh 5 bước giao hàng: bước đã qua tô màu kèm giờ, bước hiện tại nổi bật, bước sau để xám.
export default function ShipmentStepper({ currentStatus, events, className }: ShipmentStepperProps) {
  const currentIndex = SHIPMENT_STEPS.indexOf(currentStatus);

  return (
    <ol className={cn('grid grid-cols-5', className)} aria-label='Tiến trình giao hàng'>
      {SHIPMENT_STEPS.map((step, index) => {
        const isReached = index <= currentIndex;
        const isCurrent = index === currentIndex;
        const event = events.find((item) => item.status === step);

        return (
          <li
            key={step}
            aria-current={isCurrent ? 'step' : undefined}
            className='relative flex flex-col items-center gap-2 px-1 text-center'
          >
            {index < SHIPMENT_STEPS.length - 1 && (
              <span
                aria-hidden
                className={cn(
                  'absolute top-5 left-1/2 h-0.5 w-full sm:top-6',
                  index < currentIndex ? 'bg-primary' : 'bg-line',
                )}
              />
            )}
            <span
              className={cn(
                'relative flex size-10 items-center justify-center rounded-full border-2 sm:size-12',
                isReached ? 'border-primary bg-primary text-on-primary' : 'border-line bg-page text-ink-subtle',
                isCurrent && 'ring-4 ring-primary/20',
              )}
            >
              <Icon name={STEP_ICONS[step]} className='size-5 sm:size-6' />
            </span>
            <span
              className={cn(
                'text-caption font-medium sm:text-body-sm',
                isReached ? 'text-ink' : 'text-ink-subtle',
              )}
            >
              {SHIPMENT_STATUS_LABELS[step]}
            </span>
            {isReached && event && (
              // Giờ và ngày xuống 2 dòng; điện thoại bỏ năm cho vừa cột hẹp
              <span className='flex flex-col text-micro font-light whitespace-nowrap text-ink-muted sm:text-caption'>
                <span>{formatTime(event.timestamp)}</span>
                <span className='sm:hidden'>{formatDayMonth(event.timestamp)}</span>
                <span className='hidden sm:inline'>{formatDate(event.timestamp)}</span>
              </span>
            )}
          </li>
        );
      })}
    </ol>
  );
}
