import type { ReactNode } from 'react';

import Breadcrumb, { type BreadcrumbItem } from '@/components/ui/Breadcrumb';
import Container from '@/components/ui/Container';

type RecipeSearchHeroProps = Readonly<{
  breadcrumb: BreadcrumbItem[];
  title: string;
  description?: ReactNode;
  children: ReactNode;
}>;

// Dải primary đầu trang công thức: breadcrumb, tiêu đề và khung tìm kiếm.
export default function RecipeSearchHero({
  breadcrumb,
  title,
  description,
  children,
}: RecipeSearchHeroProps) {
  return (
    <section className='bg-primary text-on-primary'>
      <Container className='flex flex-col gap-6 pt-3 pb-10 lg:pb-14'>
        <Breadcrumb tone='inverse' items={breadcrumb} className='-ml-2' />
        <div>
          <h1 className='font-heading text-h1 font-semibold'>{title}</h1>
          {description && (
            <p className='mt-2 max-w-2xl text-lead font-light text-on-primary/90'>
              {description}
            </p>
          )}
        </div>
        {children}
      </Container>
    </section>
  );
}
