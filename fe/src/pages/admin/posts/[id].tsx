import Link from 'next/link';
import { useRouter } from 'next/router';
import { useState } from 'react';

import ReasonForm from '@/components/admin/ReasonForm';
import {
  IngredientList,
  NoteList,
  StepList,
  TagList,
  ToolList,
} from '@/components/admin/RecipeLists';
import ReportTable from '@/components/admin/ReportTable';
import TakedownHistory from '@/components/admin/TakedownHistory';
import { PostStatusBadge } from '@/components/admin/StatusBadges';
import AdminLayout from '@/components/layout/AdminLayout';
import Alert from '@/components/ui/Alert';
import Button from '@/components/ui/Button';
import { ErrorState } from '@/components/ui/ErrorState';
import ApiErrorAlert from '@/components/dashboard/ApiErrorAlert';
import Panel, { PanelSkeleton } from '@/components/dashboard/Panel';
import DashboardPage from '@/components/dashboard/DashboardPage';
import { useAdminData } from '@/hooks/useAdminData';
import { readString } from '@/hooks/useUrlFilters';
import type { NextPageWithLayout } from '@/pages/_app';
import {
  dismissPostReports,
  getAdminPost,
  removePost,
  restorePost,
  warnUser,
} from '@/services/admin';
import { formatDateTime } from '@/utils/format';
import { stripRecipeToken } from '@/utils/postContent';

function RecipeSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section>
      <h3 className='mb-3 text-meta font-semibold text-ink-muted uppercase'>{title}</h3>
      {children}
    </section>
  );
}

const AdminPostDetailPage: NextPageWithLayout = () => {
  const router = useRouter();
  const id = readString(router.query.id);
  const { data, isLoading, error, reload } = useAdminData(
    (signal) => getAdminPost(id!, { signal }).then((response) => response.data),
    id ?? '',
    Boolean(id),
  );
  const [notice, setNotice] = useState<string | null>(null);
  const [actionError, setActionError] = useState<unknown>(null);
  const [isRestoring, setIsRestoring] = useState(false);

  function done(message: string) {
    setActionError(null);
    setNotice(message);
    reload();
  }

  const breadcrumb = [{ label: 'Bài viết', href: '/admin/posts' }, { label: data?.title ?? 'Chi tiết' }];

  if (isLoading || !id) {
    return (
      <DashboardPage title='Bài viết' breadcrumb={breadcrumb}>
        <PanelSkeleton className='h-96' />
      </DashboardPage>
    );
  }

  if (error || !data) {
    return (
      <DashboardPage title='Bài viết' breadcrumb={breadcrumb}>
        <ErrorState
          title='Không thể tải bài viết'
          message={error ?? 'Đã có lỗi xảy ra.'}
          onRetry={reload}
        />
      </DashboardPage>
    );
  }

  const pendingCount = data.reports.filter((report) => report.status === 'PENDING').length;
  const activeRemoval = data.removals.find((removal) => removal.revokedAt === null);

  async function restore() {
    setIsRestoring(true);

    try {
      await restorePost(data!.id);
      done('Đã khôi phục bài viết.');
    } catch (restoreError) {
      setActionError(restoreError);
    } finally {
      setIsRestoring(false);
    }
  }

  return (
    <DashboardPage
      title={data.title}
      heading={
        <span className='flex flex-wrap items-center gap-3'>
          {data.title}
          <PostStatusBadge status={data.status} />
        </span>
      }
      description={
        <>
          {data.author ? (
            <Link href={`/admin/users/${data.author.id}`} className='hover:underline'>
              {data.author.displayName}
            </Link>
          ) : (
            'Tài khoản đã xoá'
          )}
          {' · '}
          {formatDateTime(data.createdAt)}
        </>
      }
      breadcrumb={breadcrumb}
    >
      {notice && <Alert tone='success'>{notice}</Alert>}
      {actionError !== null && <ApiErrorAlert error={actionError} />}

      {data.status === 'REMOVED' && (
        <Alert
          tone='warning'
          title='Bài viết đã bị gỡ'
          action={
            <Button variant='outline' size='sm' disabled={isRestoring} onClick={() => void restore()}>
              Khôi phục bài
            </Button>
          }
        >
          {activeRemoval
            ? `${activeRemoval.issuedBy?.displayName ?? 'Quản trị viên'} gỡ lúc ${formatDateTime(activeRemoval.issuedAt)}. Lý do: ${activeRemoval.reason}`
            : 'Không tìm thấy lần gỡ đang có hiệu lực.'}
        </Alert>
      )}

      <div className='grid items-start gap-6 lg:grid-cols-3'>
        <div className='flex flex-col gap-6 lg:col-span-2'>
          <Panel title='Nội dung'>
            <p className='text-body whitespace-pre-line text-ink'>
              {stripRecipeToken(data.content)}
            </p>
          </Panel>

          {/* Bản snapshot gắn vào bài, không có trong mục Công thức nên không link sang đó */}
          {data.recipe && (
            <Panel
              title={`Công thức đính kèm: ${data.recipe.title}`}
              description='Bản lưu cùng bài lúc đăng (snapshot), không đổi khi tác giả sửa công thức trong kho.'
            >
              <div className='flex flex-col gap-6'>
                {(data.recipe.description || data.recipe.portion) && (
                  <div className='flex flex-col gap-1'>
                    {data.recipe.description && (
                      <p className='text-body whitespace-pre-line text-ink'>
                        {data.recipe.description}
                      </p>
                    )}
                    {data.recipe.portion && (
                      <p className='text-body-sm text-ink-muted'>
                        Khẩu phần: {data.recipe.portion}
                      </p>
                    )}
                  </div>
                )}

                {data.recipe.recipeTags.length > 0 && <TagList items={data.recipe.recipeTags} />}

                <div className='grid gap-6 sm:grid-cols-2'>
                  <RecipeSection title={`Nguyên liệu (${data.recipe.recipeIngredients.length})`}>
                    <IngredientList items={data.recipe.recipeIngredients} />
                  </RecipeSection>
                  <RecipeSection title={`Dụng cụ (${data.recipe.recipeTools.length})`}>
                    <ToolList items={data.recipe.recipeTools} />
                  </RecipeSection>
                </div>

                <RecipeSection title={`Các bước (${data.recipe.steps.length})`}>
                  <StepList items={data.recipe.steps} />
                </RecipeSection>

                {data.recipe.recipeNotes.length > 0 && (
                  <RecipeSection title='Ghi chú'>
                    <NoteList items={data.recipe.recipeNotes} />
                  </RecipeSection>
                )}
              </div>
            </Panel>
          )}

          <Panel
            title={`Báo cáo (${data.reports.length})`}
            description={
              pendingCount > 0 ? `${pendingCount} báo cáo đang chờ xử lý.` : undefined
            }
          >
            <ReportTable
              reports={data.reports}
              onChanged={() => done('Đã bỏ qua báo cáo.')}
              onError={setActionError}
            />
          </Panel>

          {data.removals.length > 0 && (
            <Panel title={`Lịch sử gỡ (${data.removals.length})`}>
              <TakedownHistory
                items={data.removals}
                issuedLabel='Gỡ'
                revokedLabel='Khôi phục'
                emptyText='Chưa bị gỡ lần nào.'
              />
            </Panel>
          )}
        </div>

        <div className='flex flex-col gap-6'>
          {data.status === 'VISIBLE' && (
            <ReasonForm
              title='Gỡ bài'
              description='Bài bị ẩn khỏi mọi trang, các báo cáo đang chờ được đánh dấu đã xử lý.'
              label='Lý do gỡ'
              placeholder='Ví dụ: Spam quảng cáo'
              submitLabel='Gỡ bài viết'
              variant='danger'
              onSubmit={async (reason) => {
                await removePost(data.id, reason);
                done('Đã gỡ bài viết.');
              }}
            />
          )}

          {data.author && (
            <ReasonForm
              title='Cảnh cáo tác giả'
              description={`Ghi một lần cảnh cáo cho ${data.author.displayName}. Các báo cáo đang chờ của bài được đánh dấu đã xử lý.`}
              label='Lý do cảnh cáo'
              submitLabel='Gửi cảnh cáo'
              variant='outline'
              onSubmit={async (reason) => {
                await warnUser(data.author!.id, reason, data.id);
                done(`Đã cảnh cáo ${data.author!.displayName}.`);
              }}
            />
          )}

          {pendingCount > 0 && (
            <ReasonForm
              title='Bỏ qua báo cáo'
              description='Bài không vi phạm: đánh dấu bỏ qua mọi báo cáo đang chờ.'
              label='Ghi chú'
              required={false}
              submitLabel={`Bỏ qua ${pendingCount} báo cáo`}
              variant='ghost'
              onSubmit={async (note) => {
                await dismissPostReports(data.id, note || undefined);
                done('Đã bỏ qua các báo cáo đang chờ.');
              }}
            />
          )}
        </div>
      </div>
    </DashboardPage>
  );
};

AdminPostDetailPage.getLayout = function getLayout(page: React.ReactElement) {
  return <AdminLayout>{page}</AdminLayout>;
};

export default AdminPostDetailPage;
