import Link from 'next/link';

import CoverImage from '@/components/ui/CoverImage';
import type { OrderListItem } from '@/types/order';
import { formatDateTime, formatMoney } from '@/utils/format';

import { OrderStatusBadge } from './OrderStatus';

const PREVIEW_COUNT = 3;

// Một đơn trong "Đơn hàng của tôi": mã đơn, ngày đặt, trạng thái, vài món đầu, tổng tiền. Cả thẻ bấm được.
export default function OrderCard({ order }: { order: OrderListItem }) {
  const [first, ...rest] = order.items;
  const quantity = order.items.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <article className='relative flex flex-col gap-4 rounded-panel bg-surface px-5 py-5 transition-colors focus-within:ring-2 focus-within:ring-accent hover:bg-surface-soft sm:px-6'>
      <div className='flex flex-wrap items-center justify-between gap-2'>
        <div>
          <h2 className='font-medium text-ink'>
            <Link
              href={`/orders/${order.id}`}
              className='outline-none after:absolute after:inset-0'
            >
              Đơn {order.orderNumber}
            </Link>
          </h2>
          <p className='text-caption font-light text-ink-muted'>Đặt lúc {formatDateTime(order.placedAt)}</p>
        </div>
        <OrderStatusBadge status={order.currentStatus} />
      </div>

      <div className='flex items-center gap-4'>
        <ul className='flex shrink-0 -space-x-3' aria-hidden>
          {order.items.slice(0, PREVIEW_COUNT).map((item) => (
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

      <div className='flex items-baseline justify-between gap-3 border-t border-ink/10 pt-3'>
        <p className='text-body-sm text-ink-muted'>{quantity} sản phẩm</p>
        <p className='text-lead font-semibold text-ink'>{formatMoney(order.totalAmount, order.currency)}</p>
      </div>
    </article>
  );
}
