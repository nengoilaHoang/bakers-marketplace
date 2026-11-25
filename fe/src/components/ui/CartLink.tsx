import { useCart } from '@/hooks/useCart';

import Icon from './Icon';
import { IconLink } from './IconButton';

// Icon giỏ hàng trên header, kèm số món đang có trong giỏ.
export default function CartLink() {
  const { count } = useCart();
  const label = count > 0 ? `Giỏ hàng (${count} món)` : 'Giỏ hàng';

  return (
    <IconLink href='/cart' label={label} variant='ghost' className='relative'>
      <Icon name='cart' className='size-6.5' />
      {count > 0 && (
        <span
          aria-hidden
          className='absolute -top-0.5 -right-0.5 grid h-4.5 min-w-4.5 place-items-center rounded-full bg-accent px-1 text-micro font-semibold text-on-accent'
        >
          {count > 99 ? '99+' : count}
        </span>
      )}
    </IconLink>
  );
}
