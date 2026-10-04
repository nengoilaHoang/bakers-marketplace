import { cn } from '@/lib/cn';

import Button from './Button';
import Icon, { type IconName } from './Icon';

type ShareAction = 'share' | 'link' | 'mail';

const ACTIONS: Record<ShareAction, { icon: IconName; label: string }> = {
  share: { icon: 'share', label: 'Chia sẻ' },
  link: { icon: 'link', label: 'Sao chép liên kết' },
  mail: { icon: 'mail', label: 'Gửi email' },
};

const DEFAULT_ACTIONS: ShareAction[] = ['share', 'link', 'mail'];

type ShareButtonsProps = Readonly<{
  actions?: ShareAction[];
  size?: 'sm' | 'md';
  className?: string;
}>;

// Hàng nút chia sẻ dạng viên thuốc: icon Lucide + chữ.
export default function ShareButtons({
  actions = DEFAULT_ACTIONS,
  size = 'sm',
  className,
}: ShareButtonsProps) {
  return (
    <ul className={cn('flex flex-wrap items-center gap-3', className)}>
      {actions.map((action) => (
        <li key={action}>
          <Button variant='outline' size={size}>
            <Icon name={ACTIONS[action].icon} className={size === 'sm' ? 'size-4' : 'size-5'} />
            {ACTIONS[action].label}
          </Button>
        </li>
      ))}
    </ul>
  );
}
