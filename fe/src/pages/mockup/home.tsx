import CravingSection from '@/components/mockup/home/CravingSection';
import HomeHero from '@/components/mockup/home/HomeHero';
import ShoppingBanner from '@/components/mockup/home/ShoppingBanner';
import WeeklyPick from '@/components/mockup/home/WeeklyPick';
import { ARTICLES, RECIPES } from '@/components/mockup/data';
import ArticleCard from '@/components/ui/ArticleCard';
import Container from '@/components/ui/Container';
import RecipeGrid from '@/components/ui/RecipeGrid';
import SectionHeading from '@/components/ui/SectionHeading';
import SiteLayout from '@/components/ui/SiteLayout';

// Mockup: Homepage (Figma node 1:1110)
export default function MockupHomePage() {
  return (
    <SiteLayout title='Trang chủ' headerVariant='guest' activeHref='/mockup/home'>
      <HomeHero />

      <Container as='section' className='pt-20 lg:pt-24'>
        <SectionHeading title='Mới cập nhật' actionHref='/mockup/search' />
        <RecipeGrid recipes={RECIPES.slice(0, 4)} className='mt-4' />
      </Container>

      <div className='py-20 lg:py-28'>
        <WeeklyPick />
      </div>

      <CravingSection />

      <Container as='section' className='pt-20 lg:pt-28'>
        <SectionHeading title='Đang được yêu thích' actionHref='/mockup/search' />
        <RecipeGrid recipes={RECIPES.slice(4, 8)} className='mt-4' />
      </Container>

      <Container as='section' className='py-16 lg:py-20'>
        <SectionHeading title='Làm nhanh' actionHref='/mockup/search' />
        <RecipeGrid recipes={RECIPES.slice(8, 12)} className='mt-4' />
      </Container>

      <ShoppingBanner />

      <Container as='section' className='py-20 lg:py-24'>
        <SectionHeading title='Bài viết mới nhất' actionHref='#' />
        <ul className='mx-auto mt-8 flex max-w-200 flex-col gap-7.5'>
          {ARTICLES.map((article) => (
            <li key={article.id}>
              <ArticleCard article={article} />
            </li>
          ))}
        </ul>
      </Container>
    </SiteLayout>
  );
}
