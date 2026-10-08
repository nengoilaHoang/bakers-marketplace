import Avatar from '@/components/ui/Avatar';
import Container from '@/components/ui/Container';
import PillTabs from '@/components/ui/PillTabs';

type ProfileHeaderProps = Readonly<{
  title: string;
  active: 'profile' | 'saved';
  showBio?: boolean;
}>;

// Đầu trang hồ sơ: tiêu đề, ảnh đại diện + tên, tab chuyển trang.
export default function ProfileHeader({ title, active, showBio = false }: ProfileHeaderProps) {
  return (
    <div className='border-b-2 border-line'>
      <Container size='narrow' className='pt-14 pb-9'>
        <h1 className='text-h2 font-semibold text-ink'>{title}</h1>
        <div className='mt-4 flex items-center gap-6'>
          <Avatar size='lg' editable />
          <div>
            <p className='text-h4 font-medium text-ink'>June Jacob</p>
            {showBio && (
              <p className='text-body-sm text-ink'>Hãy giới thiệu đôi chút về bạn</p>
            )}
          </div>
        </div>
        <PillTabs
          label='Mục hồ sơ'
          className='mt-8'
          items={[
            { label: 'Hồ sơ', href: '/mockup/profile', active: active === 'profile' },
            { label: 'Công thức đã lưu', href: '/mockup/saved', active: active === 'saved' },
          ]}
        />
      </Container>
    </div>
  );
}
