import { useRouter } from 'next/router';
import { useMemo, useState } from 'react';

import AppLayout from '@/components/layout/AppLayout';
import RecipeSearchHero from '@/components/recipe/search/RecipeSearchHero';
import RecipeSearchPanel from '@/components/recipe/search/RecipeSearchPanel';
import RecipeSearchResultCard from '@/components/recipe/search/RecipeSearchResultCard';
import Container from '@/components/ui/Container';
import EmptyState from '@/components/ui/EmptyState';
import { ErrorState } from '@/components/ui/ErrorState';
import PageTitle from '@/components/ui/PageTitle';
import { RecipeGridSkeleton } from '@/components/ui/RecipeGrid';
import SectionHeading from '@/components/ui/SectionHeading';
import Select from '@/components/ui/Select';
import { useRecipeSearch } from '@/hooks/useRecipeSearch';
import type {
  RecipeSearchMatchMode,
  RecipeSearchResult,
} from '@/types/recipe';

type RecipeSearchSort = 'relevance' | 'missing' | 'newest';

function readQueryValue(value: string | string[] | undefined) {
  return typeof value === 'string' ? value : value?.[0] ?? '';
}

function readQueryList(value: string | string[] | undefined) {
  if (Array.isArray(value)) return value;
  return value ? [value] : [];
}

function getMissingCount(result: RecipeSearchResult): number {
  return result.ingredientMatch.missing.length + result.toolMatch.missing.length;
}

function getCreatedAtTime(result: RecipeSearchResult): number {
  const createdAt = result.createdAt
    ? new Date(result.createdAt).getTime()
    : 0;

  return Number.isNaN(createdAt) ? 0 : createdAt;
}

export default function RecipeSearchPage() {
  const router = useRouter();
  const [sort, setSort] = useState<RecipeSearchSort>('relevance');
  const queryText = readQueryValue(router.query.q);
  const selectedTools = readQueryList(router.query.tools);
  const selectedIngredients = readQueryList(router.query.ingredients);
  const matchModeValue = readQueryValue(router.query.matchMode);
  const matchMode: RecipeSearchMatchMode =
    matchModeValue === 'flexible' ? 'flexible' : 'complete';
  const { results, isLoading, error, retry } = useRecipeSearch({
    query: queryText,
    tools: selectedTools,
    ingredients: selectedIngredients,
    matchMode,
    enabled: router.isReady,
  });
  const displayedResults = useMemo(() => {
    const sortedResults = [...results];

    if (sort === 'missing') {
      return sortedResults.sort(
        (first, second) =>
          getMissingCount(first) - getMissingCount(second)
          || second.rankScore - first.rankScore,
      );
    }

    if (sort === 'newest') {
      return sortedResults.sort(
        (first, second) =>
          getCreatedAtTime(second) - getCreatedAtTime(first)
          || second.rankScore - first.rankScore,
      );
    }

    return sortedResults.sort(
      (first, second) => second.rankScore - first.rankScore,
    );
  }, [results, sort]);
  const pageTitle = queryText ? `Kết quả cho “${queryText}”` : 'Kết quả tìm kiếm';

  return (
    <>
      <PageTitle
        title={pageTitle}
        description='Kết quả tìm kiếm công thức theo dụng cụ và nguyên liệu bạn có.'
      />

      <RecipeSearchHero
        breadcrumb={[
          { label: 'Trang chủ', href: '/' },
          { label: 'Công thức', href: '/recipes' },
          { label: 'Kết quả tìm kiếm' },
        ]}
        title='Kết quả tìm kiếm'
        description={
          queryText ? (
            <>
              Các công thức phù hợp với từ khóa{' '}
              <strong className='font-semibold'>“{queryText}”</strong> và bộ lọc của bạn.
            </>
          ) : (
            'Các công thức phù hợp với dụng cụ và nguyên liệu bạn đã chọn.'
          )
        }
      >
        <RecipeSearchPanel
          key={router.isReady ? router.asPath : 'search-loading'}
          initialQuery={queryText}
          initialTools={selectedTools}
          initialIngredients={selectedIngredients}
          initialMatchMode={matchMode}
        />
      </RecipeSearchHero>

      <Container as='section' className='py-16 lg:py-24'>
        <div className='flex flex-col justify-between gap-4 sm:flex-row sm:items-end'>
          <div>
            <SectionHeading title='Công thức dành cho bạn' />
            <p className='mt-1 text-caption font-light text-ink-muted' aria-live='polite'>
              {isLoading
                ? 'Đang tìm công thức phù hợp...'
                : error
                  ? 'Chưa thể tải kết quả'
                  : `${displayedResults.length} kết quả phù hợp`}
            </p>
          </div>
          {!isLoading && !error && displayedResults.length > 0 && (
            <div className='flex items-center gap-2'>
              <label htmlFor='search-sort' className='text-body-sm text-ink-muted'>
                Sắp xếp:
              </label>
              <Select
                id='search-sort'
                tone='plain'
                wrapperClassName='w-56'
                value={sort}
                onChange={(event) => setSort(event.target.value as RecipeSearchSort)}
              >
                <option value='relevance'>Phù hợp nhất</option>
                <option value='missing'>Ít mục còn thiếu nhất</option>
                <option value='newest'>Mới nhất</option>
              </Select>
            </div>
          )}
        </div>

        <div className='mt-8'>
          {isLoading ? (
            <RecipeGridSkeleton columns={3} count={3} />
          ) : error ? (
            <ErrorState
              title='Không thể tải kết quả tìm kiếm'
              message={error}
              onRetry={retry}
            />
          ) : displayedResults.length === 0 ? (
            <EmptyState
              icon='search'
              title='Không tìm thấy công thức phù hợp'
              description='Hãy thử đổi từ khóa, chọn thêm dụng cụ hoặc chuyển sang chế độ khớp linh hoạt.'
            />
          ) : (
            <ul className='grid gap-x-7.5 gap-y-10 md:grid-cols-2 lg:grid-cols-3'>
              {displayedResults.map((result) => (
                <li key={result.id}>
                  <RecipeSearchResultCard result={result} />
                </li>
              ))}
            </ul>
          )}
        </div>
      </Container>
    </>
  );
}

RecipeSearchPage.getLayout = function getLayout(page: React.ReactElement) {
  return <AppLayout>{page}</AppLayout>;
};
