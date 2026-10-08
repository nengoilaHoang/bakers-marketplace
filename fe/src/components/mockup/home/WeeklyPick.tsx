import Link from 'next/link';

import Container from '@/components/ui/Container';
import ImagePlaceholder from '@/components/ui/ImagePlaceholder';
import RatingStars from '@/components/ui/RatingStars';

// Thẻ "Lựa chọn của tuần": ảnh lớn trái, tên món + mô tả phải, khung viền mực.
export default function WeeklyPick() {
  return (
    <Container as='section'>
      <article className='relative grid gap-2 border border-ink p-2 md:grid-cols-[830fr_790fr]'>
        <ImagePlaceholder
          iconSize='lg'
          label='Ảnh món của tuần'
          className='aspect-830/486 w-full'
        />
        <div className='flex flex-col items-center gap-2 px-3 py-4 text-center'>
          <p className='w-full border-b border-line pb-2 text-h4 font-medium text-ink'>
            Lựa chọn của tuần
          </p>
          <h2 className='text-h3 font-bold text-ink-muted'>
            <Link
              href='/mockup/recipe'
              className='outline-none after:absolute after:inset-0 focus-visible:underline'
            >
              Bánh su kem
            </Link>
          </h2>
          <RatingStars value={5} count={18} />
          <p className='mt-2 text-left text-h4 font-normal text-ink'>
            Lớp vỏ choux vàng giòn, nhân kem trứng vani mát lạnh. Công thức được
            cộng đồng bình chọn nhiều nhất tuần này — dễ làm, nguyên liệu quen
            thuộc và luôn được cả nhà khen ngợi.
          </p>
        </div>
      </article>
    </Container>
  );
}
