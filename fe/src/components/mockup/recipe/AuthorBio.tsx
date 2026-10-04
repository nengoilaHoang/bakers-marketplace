import Link from 'next/link';

import Avatar from '@/components/ui/Avatar';
import FollowLinks from '@/components/ui/FollowLinks';

// Hộp giới thiệu tác giả cuối trang công thức.
export default function AuthorBio() {
  return (
    <section className='flex flex-col gap-8 bg-surface px-6 py-8 sm:px-8'>
      <div className='flex flex-wrap items-start justify-between gap-6'>
        <div className='flex flex-col items-center gap-3'>
          <Avatar size='md' />
          <p className='text-h1 font-normal text-ink'>
            <Link href='/mockup/author' className='hover:underline'>
              Bếp của Mai
            </Link>
          </p>
        </div>
        <div className='flex flex-col items-center gap-2'>
          <p className='text-meta text-ink'>Theo dõi tôi</p>
          <FollowLinks />
        </div>
      </div>
      <p className='text-h4 leading-[1.4] text-ink'>
        Mai là thợ làm bánh tại gia với hơn 10 năm kinh nghiệm. Cô yêu thích các
        loại bánh Pháp cổ điển và luôn tìm cách biến tấu để phù hợp khẩu vị Việt.
        Mỗi công thức trên trang đều được Mai thử nghiệm ít nhất ba lần trước khi
        chia sẻ.
      </p>
    </section>
  );
}
