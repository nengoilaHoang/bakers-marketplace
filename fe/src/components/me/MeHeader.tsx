import Avatar from '@/components/ui/Avatar';
import Container from '@/components/ui/Container';
import PillTabs from '@/components/ui/PillTabs';
import type { SessionAccount } from '@/hooks/useSessionUser';

export type MeSection = 'posts' | 'recipes' | 'saved' | 'settings';

const SECTIONS: Array<{ id: MeSection; label: string; href: string }> = [
  { id: 'posts', label: 'Bài viết', href: '/me?tab=posts' },
  { id: 'recipes', label: 'Công thức', href: '/me?tab=recipes' },
  { id: 'saved', label: 'Đã lưu', href: '/me?tab=saved' },
  { id: 'settings', label: 'Cài đặt', href: '/settings' },
];

type MeHeaderProps = Readonly<{
  title: string;
  active: MeSection;
  account: SessionAccount | null;
}>;

// Đầu trang tài khoản: tiêu đề, ảnh đại diện + tên, tab chuyển mục.
export default function MeHeader({ title, active, account }: MeHeaderProps) {
  return (
    <div className='border-b-2 border-line'>
      <Container size='narrow' className='pt-14 pb-9'>
        <h1 className='text-h2 font-semibold text-ink'>{title}</h1>
        <div className='mt-4 flex items-center gap-6'>
          <Avatar size='md' label={account ? `Ảnh đại diện ${account.displayName}` : 'Ảnh đại diện'} />
          <div className='min-w-0'>
            {account ? (
              <>
                <p className='truncate text-h4 font-medium text-ink'>{account.displayName}</p>
                <p className='truncate text-body-sm font-light text-ink-muted'>{account.email}</p>
              </>
            ) : (
              <div aria-hidden className='flex flex-col gap-2 motion-safe:animate-pulse'>
                <div className='h-6 w-40 rounded-media bg-surface-soft' />
                <div className='h-4 w-56 rounded-media bg-surface-soft' />
              </div>
            )}
          </div>
        </div>
        <PillTabs
          label='Mục tài khoản'
          className='mt-8'
          items={SECTIONS.map((section) => ({
            label: section.label,
            href: section.href,
            active: section.id === active,
          }))}
        />
      </Container>
    </div>
  );
}
