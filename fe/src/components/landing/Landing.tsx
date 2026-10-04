import Head from 'next/head';
import Link from 'next/link';

import LandingRecipeCard from '@/components/landing/LandingRecipeCard';
import LandingRecipeCardSkeleton from '@/components/landing/LandingRecipeCardSkeleton';
import { ErrorState } from '@/components/ui/ErrorState';
import { useLatestPosts } from '@/hooks/useLatestPosts';
import { useLatestRecipes } from '@/hooks/useLatestRecipes';
import { stripRecipeToken } from '@/utils/postContent';

const topics = [
  'Bánh mì',
  'Bánh kem',
  'Cookie',
  'Chocolate',
  'Healthy',
  'Dễ làm',
];

export default function Landing() {
  const { recipes, isLoading, error, retry } = useLatestRecipes(12);
  const latestPosts = useLatestPosts(3);

  return (
    <>
      <Head>
        <title>Bakers Marketplace | Cộng đồng làm bánh</title>
        <meta
          name='description'
          content='Tìm công thức, học hỏi từ cộng đồng và chuẩn bị nguyên liệu cho món bánh tiếp theo.'
        />
      </Head>

      <section className='overflow-hidden rounded-3xl border border-zinc-200 bg-white px-6 py-14 sm:px-10 sm:py-20 lg:px-16'>
        <p className='text-sm font-medium uppercase tracking-[0.18em] text-zinc-500'>
          Bakers Marketplace
        </p>
        <h1 className='mt-4 max-w-3xl text-4xl font-semibold tracking-tight text-zinc-950 sm:text-5xl'>
          Khám phá thế giới làm bánh
        </h1>
        <p className='mt-5 max-w-2xl text-base leading-7 text-zinc-600 sm:text-lg'>
          Tìm công thức, học hỏi từ cộng đồng và chuẩn bị nguyên liệu cho món
          bánh tiếp theo.
        </p>
        <div className='mt-8 flex flex-col gap-3 sm:flex-row'>
          <Link
            href='/recipes'
            className='inline-flex min-h-11 items-center justify-center rounded-full bg-zinc-950 px-5 text-sm font-medium text-white transition hover:bg-zinc-700 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-zinc-950'
          >
            Khám phá công thức
          </Link>
          <Link
            href='/authen/register'
            className='inline-flex min-h-11 items-center justify-center rounded-full border border-zinc-300 bg-white px-5 text-sm font-medium text-zinc-800 transition hover:border-zinc-500 hover:bg-zinc-100 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-zinc-950'
          >
            Tạo tài khoản
          </Link>
        </div>
      </section>

      <section
        id='latest-recipes'
        className='mt-16 scroll-mt-8'
        aria-labelledby='latest-recipes-title'
      >
        <div className='flex flex-col justify-between gap-4 sm:flex-row sm:items-end'>
          <div>
            <p className='text-sm font-medium uppercase tracking-[0.18em] text-zinc-500'>
              Từ cộng đồng
            </p>
            <h2
              id='latest-recipes-title'
              className='mt-2 text-3xl font-semibold tracking-tight text-zinc-950'
            >
              Công thức mới nhất
            </h2>
          </div>
          <Link
            href='/recipes'
            className='w-fit text-sm font-medium text-zinc-700 underline decoration-zinc-300 underline-offset-4 transition hover:text-zinc-950 hover:decoration-zinc-950 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-zinc-950'
          >
            Xem thêm
          </Link>
        </div>

        <div className='mt-8'>
          {isLoading ? (
            <div
              className='grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'
              aria-busy='true'
            >
              {Array.from({ length: 8 }, (_, index) => (
                <LandingRecipeCardSkeleton key={index} />
              ))}
            </div>
          ) : error ? (
            <ErrorState
              title='Không thể tải công thức mới nhất'
              message={error}
              onRetry={retry}
            />
          ) : recipes.length === 0 ? (
            <div className='rounded-2xl border border-dashed border-zinc-300 bg-white px-6 py-12 text-center text-sm text-zinc-600'>
              Chưa có công thức nào để hiển thị.
            </div>
          ) : (
            <div className='grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'>
              {recipes.map((recipe) => (
                <LandingRecipeCard key={recipe.id} recipe={recipe} />
              ))}
            </div>
          )}
        </div>
      </section>

      <section
        id='featured-posts'
        className='mt-16 scroll-mt-8'
        aria-labelledby='featured-posts-title'
      >
        <p className='text-sm font-medium uppercase tracking-[0.18em] text-zinc-500'>
          Diễn đàn
        </p>
        <h2
          id='featured-posts-title'
          className='mt-2 text-3xl font-semibold tracking-tight text-zinc-950'
        >
          Bài viết nổi bật
        </h2>

        <div className='mt-8'>
          {latestPosts.isLoading ? (
            <p className='text-sm text-zinc-500' aria-busy='true'>
              Đang tải bài viết...
            </p>
          ) : latestPosts.hasError || latestPosts.posts.length === 0 ? (
            <div className='rounded-2xl border border-dashed border-zinc-300 bg-white px-6 py-12 text-center text-sm text-zinc-600'>
              Chưa có bài viết nào để hiển thị.
            </div>
          ) : (
            <ul className='grid grid-cols-1 gap-5 lg:grid-cols-3'>
              {latestPosts.posts.map((post) => (
                <li key={post.id}>
                  <Link
                    href={`/posts/${post.id}`}
                    className='flex h-full flex-col rounded-2xl border border-zinc-200 bg-white p-5 transition hover:border-zinc-400 hover:shadow-sm focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-zinc-950'
                  >
                    <span className='text-base font-semibold text-zinc-950'>
                      {post.title}
                    </span>
                    <span className='mt-1 text-sm text-zinc-500'>
                      {post.author?.displayName ?? 'Người dùng đã xoá'}
                    </span>
                    <span className='mt-3 line-clamp-3 text-sm leading-6 text-zinc-600'>
                      {stripRecipeToken(post.content)}
                    </span>
                    <span className='mt-auto pt-4 text-xs text-zinc-500'>
                      {post.likeCount} lượt thích · {post.commentCount} bình luận
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>

      <section className='mt-16' aria-labelledby='topics-title'>
        <p className='text-sm font-medium uppercase tracking-[0.18em] text-zinc-500'>
          Bắt đầu từ sở thích
        </p>
        <h2
          id='topics-title'
          className='mt-2 text-3xl font-semibold tracking-tight text-zinc-950'
        >
          Khám phá theo chủ đề
        </h2>
        <div className='mt-8 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6'>
          {topics.map((topic) => (
            <div
              key={topic}
              className='rounded-2xl border border-zinc-200 bg-white px-4 py-6 text-center text-sm font-medium text-zinc-800'
            >
              {topic}
            </div>
          ))}
        </div>
      </section>

      <section
        id='join-community'
        className='mt-16 rounded-3xl bg-zinc-950 px-6 py-14 text-white sm:px-10 sm:py-16 lg:px-16'
      >
        <h2 className='text-3xl font-semibold tracking-tight sm:text-4xl'>
          Chia sẻ công thức của bạn
        </h2>
        <p className='mt-4 max-w-2xl leading-7 text-zinc-300'>
          Tạo tài khoản để đăng công thức, thảo luận trên diễn đàn và lưu lại
          những bài viết bạn yêu thích.
        </p>
        <Link
          href='/authen/register'
          className='mt-8 inline-flex min-h-11 items-center justify-center rounded-full bg-white px-5 text-sm font-medium text-zinc-950 transition hover:bg-zinc-200 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white'
        >
          Tạo tài khoản
        </Link>
      </section>
    </>
  );
}
