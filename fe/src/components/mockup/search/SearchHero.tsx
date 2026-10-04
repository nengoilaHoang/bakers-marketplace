import Breadcrumb from '@/components/ui/Breadcrumb';
import Container from '@/components/ui/Container';
import ImagePlaceholder from '@/components/ui/ImagePlaceholder';
import SearchBar from '@/components/ui/SearchBar';

// Dải primary đầu trang tìm kiếm: breadcrumb + ô tìm kiếm lớn + 3 ảnh khuyến mãi.
export default function SearchHero() {
  return (
    <section className='bg-primary'>
      <Container className='flex flex-col gap-4 pt-3 pb-8 lg:flex-row lg:items-start lg:justify-between lg:gap-10'>
        <div className='flex flex-col gap-3 lg:w-120'>
          <Breadcrumb
            tone='inverse'
            items={[{ label: 'Trang chủ', href: '/mockup/home' }, { label: 'Tìm kiếm' }]}
            className='-ml-2'
          />
          <SearchBar variant='hero' id='search-hero' formClassName='lg:ml-14' />
        </div>
        <ul className='grid grid-cols-3 gap-3 sm:gap-5 lg:w-164 lg:pt-5'>
          {[1, 2, 3].map((index) => (
            <li key={index}>
              <ImagePlaceholder
                iconSize='sm'
                tone='primary-soft'
                label={`Ảnh khuyến mãi ${index}`}
                className='aspect-273/145 w-full'
              />
            </li>
          ))}
        </ul>
      </Container>
    </section>
  );
}
