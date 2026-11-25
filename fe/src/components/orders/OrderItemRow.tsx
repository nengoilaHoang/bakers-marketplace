import Link from 'next/link';

import Button from '@/components/ui/Button';
import CoverImage from '@/components/ui/CoverImage';
import Icon from '@/components/ui/Icon';
import RatingStars from '@/components/ui/RatingStars';
import { cn } from '@/lib/cn';
import type { OrderItem } from '@/types/order';
import { formatDate, formatMoney } from '@/utils/format';

import { ORDER_ITEM_STATUS, StatusBadge } from './OrderStatus';

type OrderItemRowProps = Readonly<{
  item: OrderItem;
  currency: string;
  // Hiện nhãn chờ duyệt / đã duyệt (khi đơn còn chờ các tiệm trả lời). Món bị bỏ luôn hiện nhãn.
  showDecision?: boolean;
  // Có nút "Đánh giá" (người mua, đơn đã hoàn thành, món chưa đánh giá).
  onRate?: () => void;
  // Link tên món sang trang sản phẩm (phía người mua).
  linkToProduct?: boolean;
}>;

// Một món trong đơn: ảnh, tên, giá × số lượng, thành tiền, ghi chú, trạng thái tiệm duyệt, đánh giá.
export default function OrderItemRow({
  item,
  currency,
  showDecision = false,
  onRate,
  linkToProduct = false,
}: OrderItemRowProps) {
  // Món bị tiệm từ chối hoặc quá hạn duyệt: vẫn hiện trong đơn nhưng không tính tiền
  const isDropped = item.status === 'DECLINED' || item.status === 'EXPIRED';

  return (
    <li className='flex gap-4 py-5'>
      <CoverImage
        src={item.imageUrl}
        alt={`Ảnh ${item.productTitle}`}
        sizes='80px'
        iconSize='sm'
        className={cn('size-16 shrink-0 rounded-media sm:size-20', isDropped && 'opacity-50')}
      />
      <div className='flex min-w-0 flex-1 flex-col gap-2'>
        <div className='flex flex-wrap items-start justify-between gap-x-4 gap-y-1'>
          <div className='min-w-0'>
            {linkToProduct && item.productSlug ? (
              <Link href={`/products/${item.productSlug}`} className='font-medium text-ink hover:underline'>
                {item.productTitle}
              </Link>
            ) : (
              <p className='font-medium text-ink'>
                {item.productTitle}
                {!item.productId && <span className='text-caption text-ink-muted'> (đã ngừng bán)</span>}
              </p>
            )}
            <p className='text-body-sm text-ink-muted'>
              {formatMoney(item.unitPrice, currency)} / {item.unit} × {item.quantity}
            </p>
          </div>
          {/* Món bị bỏ không tính tiền: gạch giá */}
          <p className={cn('font-semibold', isDropped ? 'text-ink-muted line-through' : 'text-ink')}>
            {formatMoney(item.unitPrice * item.quantity, currency)}
          </p>
        </div>

        {(isDropped || showDecision) && (
          <div className='flex flex-col gap-1'>
            <span>
              <StatusBadge style={ORDER_ITEM_STATUS[item.status]} />
            </span>
            {item.status === 'DECLINED' && item.declineReason && (
              <p className='text-body-sm text-ink-muted'>Lý do: {item.declineReason}</p>
            )}
            {item.status === 'EXPIRED' && (
              <p className='text-body-sm text-ink-muted'>Tiệm không duyệt trước hạn nên món này bị bỏ khỏi đơn.</p>
            )}
          </div>
        )}

        {item.note && <p className='text-body-sm font-light text-ink-muted'>Ghi chú: {item.note}</p>}

        {item.rating ? (
          <div className='flex flex-col gap-1 rounded-control bg-highlight-soft px-4 py-3'>
            <RatingStars value={item.rating.rating} valuePosition='none' />
            {item.rating.comment && <p className='text-body-sm text-ink'>{item.rating.comment}</p>}
            <p className='text-caption font-light text-ink-muted'>
              Đánh giá ngày {formatDate(item.rating.ratedAt)}
            </p>
          </div>
        ) : (
          onRate && (
            <div>
              <Button variant='outline' size='sm' onClick={onRate}>
                <Icon name='star' className='size-4' />
                Đánh giá
              </Button>
            </div>
          )
        )}
      </div>
    </li>
  );
}
