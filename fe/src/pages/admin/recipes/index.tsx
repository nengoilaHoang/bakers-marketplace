import Link from 'next/link';

import KeywordSearch from '@/components/admin/KeywordSearch';
import Pagination from '@/components/admin/Pagination';
import { PanelSkeleton } from '@/components/dashboard/Panel';
import DashboardPage from '@/components/dashboard/DashboardPage';
import AdminLayout from '@/components/layout/AdminLayout';
import { ButtonLink } from '@/components/ui/Button';
import EmptyState from '@/components/ui/EmptyState';
import { ErrorState } from '@/components/ui/ErrorState';
import Icon from '@/components/ui/Icon';
import Table, { Td, Th } from '@/components/ui/Table';
import { useAdminData } from '@/hooks/useAdminData';
import { readPage, readString, useUrlFilters } from '@/hooks/useUrlFilters';
import type { NextPageWithLayout } from '@/pages/_app';
import { getAdminRecipes } from '@/services/admin';
import { formatDate } from '@/utils/format';

const AdminRecipesPage: NextPageWithLayout = () => {
  const { query, isReady, update } = useUrlFilters();
  const keyword = readString(query.keyword);
  const page = readPage(query.page);

  const { data, isLoading, error, reload } = useAdminData(
    (signal) => getAdminRecipes({ keyword, page }, { signal }),
    `${keyword}|${page}`,
    isReady,
  );

  return (
    <DashboardPage
      title='Công thức'
      description='Xem các công thức công khai và người tạo. Công thức riêng tư không hiện ở đây.'
    >
      <div className='flex flex-wrap items-center gap-3'>
        {isReady && (
          <KeywordSearch
            value={keyword ?? ''}
            placeholder='Tìm theo tên, mô tả'
            onSearch={(value) => update({ keyword: value })}
          />
        )}
      </div>

      {isLoading ? (
        <PanelSkeleton className='h-80' />
      ) : error || !data ? (
        <ErrorState
          title='Không thể tải công thức'
          message={error ?? 'Đã có lỗi xảy ra.'}
          onRetry={reload}
        />
      ) : data.data.length === 0 ? (
        <EmptyState icon='chef-hat' title='Không có công thức nào khớp từ khoá.' />
      ) : (
        <>
          <Table caption='Danh sách công thức'>
            <thead>
              <tr>
                <Th>Công thức</Th>
                <Th>Người tạo</Th>
                <Th>Ngày tạo</Th>
                <Th>
                  <span className='sr-only'>Chi tiết</span>
                </Th>
              </tr>
            </thead>
            <tbody>
              {data.data.map((recipe) => (
                <tr key={recipe.id} className='hover:bg-surface-soft/60'>
                  <Td className='max-w-96'>
                    <Link
                      href={`/admin/recipes/${recipe.id}`}
                      className='block truncate font-medium text-ink hover:underline'
                    >
                      {recipe.title}
                    </Link>
                    {recipe.description && (
                      <span className='block truncate text-ink-muted'>{recipe.description}</span>
                    )}
                  </Td>
                  <Td className='whitespace-nowrap'>
                    {recipe.author ? (
                      <Link href={`/admin/users/${recipe.author.id}`} className='hover:underline'>
                        {recipe.author.displayName}
                      </Link>
                    ) : (
                      <span className='text-ink-subtle'>Tài khoản đã xoá</span>
                    )}
                  </Td>
                  <Td className='whitespace-nowrap text-ink-muted'>
                    {formatDate(recipe.createdAt)}
                  </Td>
                  <Td align='right'>
                    <ButtonLink href={`/admin/recipes/${recipe.id}`} variant='ghost' size='sm'>
                      Xem
                      <Icon name='chevron-right' className='size-4' />
                    </ButtonLink>
                  </Td>
                </tr>
              ))}
            </tbody>
          </Table>
          <Pagination
            pagination={data.pagination}
            onPageChange={(next) => update({ page: next })}
          />
        </>
      )}
    </DashboardPage>
  );
};

AdminRecipesPage.getLayout = function getLayout(page: React.ReactElement) {
  return <AdminLayout>{page}</AdminLayout>;
};

export default AdminRecipesPage;
