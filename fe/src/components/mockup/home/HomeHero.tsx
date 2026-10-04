import { ButtonLink } from '@/components/ui/Button';
import Container from '@/components/ui/Container';
import ImagePlaceholder from '@/components/ui/ImagePlaceholder';
import { BRAND } from '@/lib/brand';

// Hero trang chủ: hai ảnh chồng lệch bên trái, tiêu đề + mô tả + CTA bên phải.
export default function HomeHero() {
  return (
    <section className='bg-media'>
      <Container className='grid items-center gap-10 py-12 md:grid-cols-2 lg:min-h-116'>
        <div className='relative mx-auto aspect-600/453 w-full max-w-md md:max-w-none'>
          <ImagePlaceholder
            tone='primary-soft'
            className='absolute top-0 left-0 h-[91%] w-[77%] rounded-media'
          />
          <ImagePlaceholder
            tone='primary'
            className='absolute right-0 bottom-0 h-[72%] w-[61%] rounded-media'
          />
        </div>
        <div className='flex flex-col gap-4'>
          <h1 className='text-display font-semibold text-ink'>
            Thưởng thức trọn vị
          </h1>
          <p className='max-w-md text-h4 text-ink'>{BRAND.tagline}</p>
          <ButtonLink href='/mockup/signup' className='self-start uppercase'>
            Đăng nhập / Đăng ký
          </ButtonLink>
        </div>
      </Container>
    </section>
  );
}
