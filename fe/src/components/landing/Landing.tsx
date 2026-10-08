import PostCard, { PostCardSkeleton } from '@/components/posts/PostCard';
import { ButtonLink } from '@/components/ui/Button';
import Container from '@/components/ui/Container';
import EmptyState from '@/components/ui/EmptyState';
import { ErrorState } from '@/components/ui/ErrorState';
import PageTitle from '@/components/ui/PageTitle';
import RecipeGrid, { RecipeGridSkeleton } from '@/components/ui/RecipeGrid';
import SectionHeading from '@/components/ui/SectionHeading';
import { useLatestPosts } from '@/hooks/useLatestPosts';
import { useLatestRecipes } from '@/hooks/useLatestRecipes';
import { toRecipeCardData } from '@/utils/recipeCard';

import LandingHero from './LandingHero';
import TopicSection from './TopicSection';

// Trang chủ cho khách: giới thiệu, công thức mới, chủ đề, bài viết diễn đàn, lời mời đăng ký.
export default function Landing() {
  const { recipes, isLoading, error, retry } = useLatestRecipes(8);
  const latestPosts = useLatestPosts(3);

  return (
    <>
      <PageTitle
        title='Cộng đồng làm bánh'
        description='Tìm công thức, học hỏi từ cộng đồng và chuẩn bị nguyên liệu cho món bánh tiếp theo.'
      />

      <LandingHero />

      <Container as='section' className='py-20 lg:py-24'>
        <SectionHeading title='Mới cập nhật' actionHref='/recipes' />
        <div className='mt-4'>
          {isLoading ? (
            <RecipeGridSkeleton />
          ) : error ? (
            <ErrorState title='Không thể tải công thức mới nhất' message={error} onRetry={retry} />
          ) : recipes.length === 0 ? (
            <EmptyState title='Chưa có công thức nào để hiển thị' />
          ) : (
            <RecipeGrid recipes={recipes.map(toRecipeCardData)} savable={false} />
          )}
        </div>
      </Container>

      <TopicSection />

      <section id='featured-posts' className='scroll-mt-8'>
        <Container className='py-20 lg:py-24'>
          <SectionHeading
            title='Từ diễn đàn'
            actionHref='/authen/login?next=%2F'
            actionLabel='Tham gia thảo luận'
          />
          <div className='mx-auto mt-8 max-w-200'>
            {latestPosts.isLoading ? (
              <div role='status' aria-label='Đang tải bài viết' className='flex flex-col gap-7.5'>
                <PostCardSkeleton />
                <PostCardSkeleton />
              </div>
            ) : latestPosts.hasError || latestPosts.posts.length === 0 ? (
              <EmptyState icon='message' title='Chưa có bài viết nào để hiển thị' />
            ) : (
              <ul className='flex flex-col gap-7.5'>
                {latestPosts.posts.map((post) => (
                  <li key={post.id}>
                    <PostCard post={post} />
                  </li>
                ))}
              </ul>
            )}
          </div>
        </Container>
      </section>

      <section className='bg-primary-strong py-10 lg:py-14'>
        <Container size='narrow'>
          <div className='mx-auto flex max-w-196 flex-col items-center justify-center gap-8 rounded-control border-2 border-dashed border-accent px-6 py-12 text-center sm:flex-row sm:gap-16 lg:min-h-60'>
            <p className='max-w-xs text-h1 font-medium text-balance text-on-primary'>
              Chia sẻ công thức của bạn
            </p>
            <ButtonLink href='/authen/register' variant='outline-inverse' size='xl'>
              + Tạo tài khoản
            </ButtonLink>
          </div>
        </Container>
      </section>
    </>
  );
}
