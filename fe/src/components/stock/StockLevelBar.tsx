import { cn } from '@/lib/cn';
import type { StockAlert } from '@/types/product';
import type { StockStatus } from '@/types/stock';
import { STOCK_ALERT_LABELS, STOCK_ALERT_TYPES } from '@/utils/stockStatus';

type StockLevelBarProps = Readonly<{
  stock: number;
  unit: string;
  alerts: Pick<StockAlert, 'alertType' | 'threshold'>[];
  status: StockStatus;
}>;

const FILL: Record<StockStatus, string> = {
  OUT: 'bg-danger',
  MINIMUM: 'bg-danger',
  REORDER: 'bg-warning',
  MAXIMUM: 'bg-info',
  NORMAL: 'bg-success',
};

// Thanh mức tồn kho, có vạch đánh dấu các mốc MIN / REORDER / MAX.
export default function StockLevelBar({ stock, unit, alerts, status }: StockLevelBarProps) {
  const thresholds = STOCK_ALERT_TYPES.flatMap((alertType) => {
    const alert = alerts.find((item) => item.alertType === alertType);
    return alert ? [{ alertType, threshold: alert.threshold }] : [];
  });

  // Thang đo: dư thêm 20% để vạch cao nhất không dính mép phải.
  const scale = Math.max(stock, ...thresholds.map((item) => item.threshold), 1) * 1.2;
  const percent = (value: number) => `${Math.min((value / scale) * 100, 100)}%`;

  return (
    <div>
      <div
        role='meter'
        aria-label='Mức tồn kho'
        aria-valuemin={0}
        aria-valuemax={Math.round(scale)}
        aria-valuenow={stock}
        aria-valuetext={`${stock} ${unit}`}
        className='relative h-3 rounded-full bg-surface-soft'
      >
        <div
          className={cn('h-full rounded-full transition-[width]', FILL[status])}
          style={{ width: percent(stock) }}
        />
        {thresholds.map(({ alertType, threshold }) => (
          <span
            key={alertType}
            aria-hidden
            className='absolute -top-1 h-5 w-0.5 -translate-x-1/2 rounded-full bg-ink'
            style={{ left: percent(threshold) }}
          />
        ))}
      </div>

      {thresholds.length > 0 && (
        <ul className='mt-3 flex flex-wrap gap-x-5 gap-y-1 text-caption text-ink-muted'>
          {thresholds.map(({ alertType, threshold }) => (
            <li key={alertType}>
              {STOCK_ALERT_LABELS[alertType]}:{' '}
              <span className='font-semibold text-ink'>
                {threshold} {unit}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
