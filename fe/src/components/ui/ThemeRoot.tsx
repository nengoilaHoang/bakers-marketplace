import type { ReactNode } from 'react';

import { cn } from '@/lib/cn';

type ThemeRootProps = Readonly<{
  children: ReactNode;
  className?: string;
  theme?: 'vendor' | 'default';
}>;

// Bọc mọi trang dùng design system: nền, font, cỡ và màu chữ mặc định.
// Biến font được khai báo toàn cục ở pages/_app.tsx.
export default function ThemeRoot({
  children,
  className,
  theme,
}: ThemeRootProps) {
  return (
    <div
      data-theme={theme}
      className={cn(
        'min-h-screen bg-page font-body text-body text-ink antialiased',
        className,
      )}
    >
      {children}
    </div>
  );
}
