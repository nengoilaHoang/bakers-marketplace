import Link from 'next/link';

import CoverImage from '@/components/ui/CoverImage';
import Icon from '@/components/ui/Icon';
import type { PreOrderListItem } from '@/types/preOrder';
import { formatDate, formatMoney } from '@/utils/format';

import { describeSchedule, preOrderCode, PreOrderStatusBadge } from './PreOrderStatus';

const PREVIEW_COUNT = 3;

// Một yêu cầu trong "Đặt định kỳ của tôi": mã, lịch giao, kỳ tới, vài món đầu, tiền mỗi kỳ. Cả thẻ bấm được.
export default function PreOrderCard({ preOrder }: { preOrder: PreOrderListItem }) {
  const [first, ...rest] = preOrder.items;

  return (
    <article className='relative flex flex-col gap-4 rounded-panel bg-surface px-5 py-5 transition-colors focus-within:ring-2 focus-within:ring-accent hover:bg-surface-soft sm:px-6'>
      <div className='flex flex-wrap items-center justify-between gap-2'>
        <div>
          <h2 className='font-medium text-ink'>
            <Link href={`/pre-orders/${preOrder.id}`} className='outline-none after:absolute after:inset-0'>
              Đặt định kỳ {preOrderCode(preOrder.id)}
            </Link>
          </h2>
          <p className='flex items-center gap-1.5 text-caption font-light text-ink-muted'>
            <Icon name='repeat' className='size-3.5' />
            {describeSchedule(preOrder)}
          </p>
        </div>
        <PreOrderStatusBadge status={preOrder.currentStatus} />
      </div>

      <div className='flex items-center gap-4'>
        <ul className='flex shrink-0 -space-x-3' aria-hidden>
          {preOrder.items.slice(0, PREVIEW_COUNT).map((item) => (
            <li key={item.id}>
              <CoverImage
                src={item.imageUrl}
                alt=''
                sizes='56px'
                iconSize='none'
                className='size-14 rounded-media ring-2 ring-surface'
              />
            </li>
          ))}
        </ul>
        <p className='min-w-0 flex-1 text-body-sm text-ink'>
          <span className='line-clamp-1'>{first?.productTitle}</span>
          {rest.length > 0 && <span className='text-ink-muted'>và {rest.length} món khác</span>}
        </p>
      </div>

      <div className='flex flex-wrap items-baseline justify-between gap-3 border-t border-ink/10 pt-3'>
        <p className='flex items-center gap-1.5 text-body-sm text-ink-muted'>
          <Icon name='calendar' className='size-4' />
          {preOrder.nextCycleAt ? `Kỳ tới: ${formatDate(preOrder.nextCycleAt)}` : 'Không còn kỳ nào sắp tới'}
        </p>
        <p className='text-lead font-semibold text-ink'>
          {formatMoney(preOrder.cycleSubtotal, preOrder.currency)}
          <span className='text-body-sm font-normal text-ink-muted'> / kỳ</span>
        </p>
      </div>
    </article>
  );
}
