import CategoryCircle from '@/components/ui/CategoryCircle';
import Container from '@/components/ui/Container';

import { CRAVING_CATEGORIES } from '../data';

// Dải màu primary với các ô danh mục tròn.
export default function CravingSection() {
  return (
    <section className='bg-primary py-14 text-on-primary lg:py-16'>
      <Container className='flex flex-col items-center gap-8'>
        <h2 className='text-center text-h3 font-medium uppercase'>
          Hôm nay bạn thèm gì??
        </h2>
        <ul className='grid w-full grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-7'>
          {CRAVING_CATEGORIES.map((category) => (
            <li key={category}>
              <CategoryCircle label={category} href='/mockup/search' />
            </li>
          ))}
          <li>
            <CategoryCircle label='Xem tất cả' href='/mockup/search' withArrow />
          </li>
        </ul>
      </Container>
    </section>
  );
}
