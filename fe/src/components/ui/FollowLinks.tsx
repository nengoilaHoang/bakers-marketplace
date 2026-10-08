import { cn } from '@/lib/cn';

import { ButtonLink } from './Button';
import Icon from './Icon';

export type FollowLink = { label: string; href: string; website?: boolean };

const DEFAULT_LINKS: FollowLink[] = [
  { label: 'Website', href: '#', website: true },
  { label: 'Instagram', href: '#' },
  { label: 'Facebook', href: '#' },
  { label: 'Pinterest', href: '#' },
];

type FollowLinksProps = Readonly<{
  links?: FollowLink[];
  className?: string;
}>;

// Liên kết theo dõi tác giả/cửa hàng: nút viên thuốc chữ (website kèm icon quả địa cầu).
export default function FollowLinks({ links = DEFAULT_LINKS, className }: FollowLinksProps) {
  return (
    <ul className={cn('flex flex-wrap gap-2', className)}>
      {links.map((link) => (
        <li key={link.label}>
          <ButtonLink href={link.href} variant='outline' size='sm'>
            {link.website && <Icon name='globe' className='size-4' />}
            {link.label}
          </ButtonLink>
        </li>
      ))}
    </ul>
  );
}
