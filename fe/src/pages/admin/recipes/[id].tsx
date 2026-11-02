import Link from 'next/link';
import { useRouter } from 'next/router';

import {
  IngredientList,
  NoteList,
  StepList,
  TagList,
  ToolList,
} from '@/components/admin/RecipeLists';
import DashboardPage from '@/components/dashboard/DashboardPage';
import Panel, { PanelSkeleton } from '@/components/dashboard/Panel';
import AdminLayout from '@/components/layout/AdminLayout';
import { ButtonLink } from '@/components/ui/Button';
import { ErrorState } from '@/components/ui/ErrorState';
import Icon from '@/components/ui/Icon';
import { useAdminData } from '@/hooks/useAdminData';
import { readString } from '@/hooks/useUrlFilters';
import type { NextPageWithLayout } from '@/pages/_app';
import { getAdminRecipe } from '@/services/admin';
import { formatDateTime } from '@/utils/format';

// Admin chỉ xem công thức và người tạo, không sửa hay xoá.
const AdminRecipeDetailPage: NextPageWithLayout = () => {
  const router = useRouter();
  const id = readString(router.query.id);
  const { data, isLoading, error, reload } = useAdminData(
    (signal) => getAdminRecipe(id!, { signal }).then((response) => response.data),
    id ?? '',
    Boolean(id),
  );

  const breadcrumb = [
    { label: 'Công thức', href: '/admin/recipes' },
    { label: data?.title ?? 'Chi tiết' },
  ];

  if (isLoading || !id) {
    return (
      <DashboardPage title='Công thức' breadcrumb={breadcrumb}>
        <PanelSkeleton className='h-96' />
      </DashboardPage>
    );
  }

  if (error || !data) {
    return (
      <DashboardPage title='Công thức' breadcrumb={breadcrumb}>
        <ErrorState
          title='Không thể tải công thức'
          message={error ?? 'Đã có lỗi xảy ra.'}
          onRetry={reload}
        />
      </DashboardPage>
    );
  }

  return (
    <DashboardPage
      title={data.title}
      description={`Tạo lúc ${formatDateTime(data.createdAt)} · Cập nhật ${formatDateTime(data.updatedAt)}`}
      breadcrumb={breadcrumb}
      actions={
        <ButtonLink href={`/recipes/${data.id}`} variant='outline' size='sm'>
          Xem trang công thức
          <Icon name='arrow-right' className='size-4' />
        </ButtonLink>
      }
    >
      <div className='grid items-start gap-6 lg:grid-cols-3'>
        <div className='flex flex-col gap-6 lg:col-span-2'>
          <Panel
            title='Giới thiệu'
            description={data.portion ? `Khẩu phần: ${data.portion}` : undefined}
          >
            <p className='text-body whitespace-pre-line text-ink'>
              {data.description || <span className='text-ink-muted'>Không có mô tả.</span>}
            </p>
            {data.recipeTags.length > 0 && (
              <div className='mt-4'>
                <TagList items={data.recipeTags} />
              </div>
            )}
          </Panel>

          <div className='grid gap-6 sm:grid-cols-2'>
            <Panel title={`Nguyên liệu (${data.recipeIngredients.length})`}>
              <IngredientList items={data.recipeIngredients} />
            </Panel>

            <Panel title={`Dụng cụ (${data.recipeTools.length})`}>
              <ToolList items={data.recipeTools} />
            </Panel>
          </div>

          <Panel title={`Các bước (${data.steps.length})`}>
            <StepList items={data.steps} />
          </Panel>

          {data.recipeNotes.length > 0 && (
            <Panel title='Ghi chú'>
              <NoteList items={data.recipeNotes} />
            </Panel>
          )}
        </div>

        <Panel title='Người tạo'>
          {data.author ? (
            <div className='flex flex-col items-start gap-3'>
              <Link
                href={`/admin/users/${data.author.id}`}
                className='font-medium text-ink hover:underline'
              >
                {data.author.displayName}
              </Link>
              <ButtonLink href={`/admin/users/${data.author.id}`} variant='outline' size='sm'>
                Xem tài khoản
                <Icon name='chevron-right' className='size-4' />
              </ButtonLink>
            </div>
          ) : (
            <p className='text-body-sm text-ink-muted'>Tài khoản đã bị xoá.</p>
          )}
        </Panel>
      </div>
    </DashboardPage>
  );
};

AdminRecipeDetailPage.getLayout = function getLayout(page: React.ReactElement) {
  return <AdminLayout>{page}</AdminLayout>;
};

export default AdminRecipeDetailPage;
