import { useEffect, useRef, useState } from 'react';

import Icon from '@/components/ui/Icon';
import { cn } from '@/lib/cn';
import { formatDateTime } from '@/utils/format';

// Hệ thống chốt đơn quá hạn mỗi 10 giây (BE), nên hết giờ thì tải lại đơn vài giây một lần.
const RELOAD_AFTER_EXPIRY_MS = 5000;

type ApprovalCountdownProps = Readonly<{
  deadline: string;
  // Gọi khi đã hết giờ (lặp lại) để tải lại đơn tới khi đơn được chốt.
  onExpire?: () => void;
  // Lời giải thích dưới đồng hồ (khác nhau cho khách và tiệm).
  hint: string;
  className?: string;
}>;

function pad(value: number): string {
  return String(value).padStart(2, '0');
}

// 75 giây → "01:15"; từ 1 giờ trở lên → "23:59:12".
function formatRemaining(ms: number): string {
  const totalSeconds = Math.max(0, Math.ceil(ms / 1000));
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  return hours > 0 ? `${pad(hours)}:${pad(minutes)}:${pad(seconds)}` : `${pad(minutes)}:${pad(seconds)}`;
}

// Đồng hồ đếm ngược hạn các tiệm phải duyệt đơn.
export default function ApprovalCountdown({ deadline, onExpire, hint, className }: ApprovalCountdownProps) {
  const deadlineMs = new Date(deadline).getTime();
  const [now, setNow] = useState(() => Date.now());
  const remaining = deadlineMs - now;
  const isExpired = remaining <= 0;
  const onExpireRef = useRef(onExpire);

  useEffect(() => {
    onExpireRef.current = onExpire;
  });

  useEffect(() => {
    if (isExpired) return;
    const timer = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(timer);
  }, [isExpired]);

  useEffect(() => {
    if (!isExpired) return;
    const timer = window.setInterval(() => onExpireRef.current?.(), RELOAD_AFTER_EXPIRY_MS);
    return () => window.clearInterval(timer);
  }, [isExpired]);

  return (
    <div
      className={cn(
        'flex items-center gap-4 rounded-panel border px-5 py-4 sm:px-6',
        isExpired ? 'border-line bg-surface' : 'border-warning-border bg-warning-soft',
        className,
      )}
    >
      <span
        className={cn(
          'flex size-12 shrink-0 items-center justify-center rounded-full bg-page',
          isExpired ? 'text-ink-muted' : 'text-warning',
        )}
      >
        <Icon name='timer' className='size-6' />
      </span>
      <div className='flex min-w-0 flex-col gap-1'>
        <p className='text-caption font-medium uppercase text-ink-muted'>
          {isExpired ? 'Đã hết thời gian duyệt' : 'Thời gian chờ tiệm duyệt'}
        </p>
        {isExpired ? (
          <p className='font-medium text-ink'>Đang cập nhật đơn hàng...</p>
        ) : (
          <p
            role='timer'
            aria-label={`Còn ${formatRemaining(remaining)} để các tiệm duyệt đơn`}
            className='text-h2 leading-none font-bold text-warning-strong tabular-nums'
          >
            {formatRemaining(remaining)}
          </p>
        )}
        <p className='text-body-sm font-light text-ink-muted'>
          Hạn duyệt {formatDateTime(deadline)}. {hint}
        </p>
      </div>
    </div>
  );
}
