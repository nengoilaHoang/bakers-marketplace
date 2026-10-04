import Link from 'next/link';

import { BRAND } from '@/lib/brand';
import { cn } from '@/lib/cn';

import Icon, { type IconName } from './Icon';

type LogoProps = Readonly<{
  href?: string;
  // inverse: đặt trên nền tối (footer). boxed: có khung viền (trang đăng nhập).
  tone?: 'default' | 'inverse';
  boxed?: boolean;
  size?: 'sm' | 'md';
  showWordmark?: boolean;
  className?: string;
}>;

const GLYPHS: Array<IconName | null> = [null, 'chef-hat', 'hand-platter', 'utensils'];

// Logo 4 vòng tròn: vòng trên-trái = accent, 3 vòng còn lại = primary với icon trắng.
export function LogoMark({ size = 'md' }: { size?: 'sm' | 'md' }) {
  return (
    <span
      aria-hidden
      className={cn(
        'grid shrink-0 grid-cols-2 grid-rows-2 gap-[3%]',
        size === 'md' ? 'size-14' : 'size-10',
      )}
    >
      {GLYPHS.map((glyph, index) => (
        <span
          key={index}
          className={cn(
            'grid place-items-center rounded-full',
            index === 0 ? 'bg-accent' : 'bg-primary',
          )}
        >
          {glyph && (
            <Icon name={glyph} strokeWidth={2} className='size-[62%] text-on-primary' />
          )}
        </span>
      ))}
    </span>
  );
}

export default function Logo({
  href = '/',
  tone = 'default',
  boxed = false,
  size = 'md',
  showWordmark = true,
  className,
}: LogoProps) {
  return (
    <Link
      href={href}
      aria-label={`${BRAND.name} — trang chủ`}
      className={cn(
        'inline-flex items-center gap-3 rounded-control outline-none focus-visible:ring-2 focus-visible:ring-accent',
        boxed && 'rounded-modal border-3 border-ink px-3 py-2',
        className,
      )}
    >
      <LogoMark size={size} />
      {showWordmark && (
        <span
          className={cn(
            'font-brand font-bold leading-none whitespace-nowrap',
            size === 'md' ? 'text-h2' : 'text-h5',
            tone === 'inverse' ? 'text-on-primary' : 'text-ink',
          )}
        >
          {BRAND.wordmark}
        </span>
      )}
    </Link>
  );
}
