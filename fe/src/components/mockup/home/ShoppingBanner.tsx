import { ButtonLink } from '@/components/ui/Button';
import Container from '@/components/ui/Container';

// Banner mời mua sắm: nền primary đậm, khung nét đứt accent.
export default function ShoppingBanner() {
  return (
    <section className='bg-primary-strong py-10 lg:py-14'>
      <Container size='narrow'>
        <div className='mx-auto flex max-w-196 flex-col items-center justify-center gap-8 rounded-control border-2 border-dashed border-accent px-6 py-12 text-center sm:flex-row sm:gap-16 lg:min-h-60'>
          <p className='max-w-xs text-h1 font-medium text-balance text-on-primary'>
            Mua sắm dễ dàng
          </p>
          <ButtonLink href='#' variant='outline-inverse' size='xl'>
            + Thêm sản phẩm
          </ButtonLink>
        </div>
      </Container>
    </section>
  );
}
