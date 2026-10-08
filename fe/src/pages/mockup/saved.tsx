import ProfileHeader from '@/components/mockup/profile/ProfileHeader';
import { COLLECTIONS, RECIPES } from '@/components/mockup/data';
import CollectionCard, { NewCollectionCard } from '@/components/ui/CollectionCard';
import Container from '@/components/ui/Container';
import RecipeGrid from '@/components/ui/RecipeGrid';
import { SeeMoreLink } from '@/components/ui/SectionHeading';
import SiteLayout from '@/components/ui/SiteLayout';

// Mockup: Saved recipes page (Figma node 1:2061)
export default function MockupSavedPage() {
  return (
    <SiteLayout title='Công thức đã lưu'>
      <ProfileHeader title='Công thức đã lưu' active='saved' />

      <Container className='flex flex-col gap-16 py-12 lg:gap-20'>
        <section className='grid gap-6 lg:grid-cols-[13rem_1fr] lg:items-center'>
          <h2 className='text-h3 text-ink'>Tất cả công thức đã lưu</h2>
          <div className='flex flex-col gap-3 lg:max-w-228'>
            <SeeMoreLink href='/mockup/search' className='self-end' />
            <RecipeGrid recipes={RECIPES.slice(0, 3)} columns={3} />
          </div>
        </section>

        <section className='grid gap-6 lg:grid-cols-[13rem_1fr] lg:items-center'>
          <h2 className='text-h3 text-ink'>Bộ sưu tập của tôi</h2>
          <ul className='grid gap-x-8 gap-y-8 sm:grid-cols-2 lg:max-w-228 lg:grid-cols-3'>
            <li>
              <NewCollectionCard />
            </li>
            {COLLECTIONS.map((collection) => (
              <li key={collection.id}>
                <CollectionCard collection={collection} />
              </li>
            ))}
          </ul>
        </section>
      </Container>
    </SiteLayout>
  );
}
