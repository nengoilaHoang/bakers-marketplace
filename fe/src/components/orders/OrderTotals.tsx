import { cn } from '@/lib/cn';
import { formatMoney } from '@/utils/format';

type OrderTotalsProps = Readonly<{
  subtotal: number;
  deliveryFee: number;
  totalAmount: number;
  currency: string;
  className?: string;
}>;

// Hộp tổng tiền (giỏ hàng, đặt hàng, chi tiết đơn). Phí giao hàng chưa tính nên hiện 0 kèm ghi chú.
export default function OrderTotals({
  subtotal,
  deliveryFee,
  totalAmount,
  currency,
  className,
}: OrderTotalsProps) {
  return (
    <dl className={cn('flex flex-col gap-2 rounded-panel bg-highlight px-6 py-5 text-body-sm', className)}>
      <div className='flex justify-between gap-4'>
        <dt className='text-ink-muted'>Tạm tính</dt>
        <dd className='text-ink'>{formatMoney(subtotal, currency)}</dd>
      </div>
      <div className='flex justify-between gap-4'>
        <dt className='text-ink-muted'>Phí giao hàng</dt>
        <dd className='text-ink'>{deliveryFee > 0 ? formatMoney(deliveryFee, currency) : 'Chưa tính'}</dd>
      </div>
      <div className='mt-1 flex items-baseline justify-between gap-4 border-t border-ink/10 pt-3'>
        <dt className='font-medium text-ink'>Tổng cộng</dt>
        <dd className='text-h4 font-semibold text-ink'>{formatMoney(totalAmount, currency)}</dd>
      </div>
    </dl>
  );
}
