import Link from 'next/link';

import KeywordSearch from '@/components/admin/KeywordSearch';
import Pagination from '@/components/admin/Pagination';
import { PendingCount, PostStatusBadge } from '@/components/admin/StatusBadges';
import AdminLayout from '@/components/layout/AdminLayout';
import { ButtonLink } from '@/components/ui/Button';
import EmptyState from '@/components/ui/EmptyState';
import { ErrorState } from '@/components/ui/ErrorState';
import Icon from '@/components/ui/Icon';
import Select from '@/components/ui/Select';
import Table, { Td, Th } from '@/components/ui/Table';
import { PanelSkeleton } from '@/components/dashboard/Panel';
import DashboardPage from '@/components/dashboard/DashboardPage';
import { useAdminData } from '@/hooks/useAdminData';
import { readEnum, readPage, readString, useUrlFilters } from '@/hooks/useUrlFilters';
import type { NextPageWithLayout } from '@/pages/_app';
import { getAdminPosts } from '@/services/admin';
import type { AdminPostQuery } from '@/types/admin';
import { formatDate } from '@/utils/format';

const VIEWS = ['reported', 'all', 'removed'] as const;
type View = (typeof VIEWS)[number];

const VIEW_LABELS: Record<View, string> = {
  all: 'Tất cả bài viết',
  reported: 'Đang bị báo cáo',
  removed: 'Đã gỡ',
};

const VIEW_QUERIES: Record<View, AdminPostQuery> = {
  reported: { reported: true, status: 'VISIBLE' },
  all: {},
  removed: { status: 'REMOVED' },
};

const EMPTY_MESSAGES: Record<View, string> = {
  reported: 'Không có bài nào đang chờ xử lý.',
  all: 'Không có bài viết nào khớp bộ lọc.',
  removed: 'Chưa có bài nào bị gỡ.',
};

const AdminPostsPage: NextPageWithLayout = () => {
  const { query, isReady, update } = useUrlFilters();
  const view = readEnum(query.view, VIEWS) ?? 'all';
  const keyword = readString(query.keyword);
  const page = readPage(query.page);

  const { data, isLoading, error, reload } = useAdminData(
    (signal) => getAdminPosts({ ...VIEW_QUERIES[view], keyword, page }, { signal }),
    `${view}|${keyword}|${page}`,
    isReady,
  );

  return (
    <DashboardPage
      title='Bài viết'
      description='Xem bài bị báo cáo, gỡ bài vi phạm hoặc bỏ qua báo cáo không đúng.'
    >
      <div className='flex flex-wrap items-center gap-3'>
        {isReady && (
          <KeywordSearch
            value={keyword ?? ''}
            placeholder='Tìm theo tiêu đề, nội dung'
            onSearch={(value) => update({ keyword: value })}
          />
        )}
        <Select
          aria-label='Lọc bài viết'
          value={view}
          onChange={(event) => update({ view: event.target.value })}
        >
          {VIEWS.map((item) => (
            <option key={item} value={item}>
              {VIEW_LABELS[item]}
            </option>
          ))}
        </Select>
      </div>

      {isLoading ? (
        <PanelSkeleton className='h-80' />
      ) : error || !data ? (
        <ErrorState
          title='Không thể tải bài viết'
          message={error ?? 'Đã có lỗi xảy ra.'}
          onRetry={reload}
        />
      ) : data.data.length === 0 ? (
        <EmptyState icon='message' title={EMPTY_MESSAGES[view]} />
      ) : (
        <>
          <Table caption='Danh sách bài viết'>
            <thead>
              <tr>
                <Th>Bài viết</Th>
                <Th>Tác giả</Th>
                <Th>Trạng thái</Th>
                <Th>Báo cáo</Th>
                <Th>Ngày đăng</Th>
                <Th>
                  <span className='sr-only'>Chi tiết</span>
                </Th>
              </tr>
            </thead>
            <tbody>
              {data.data.map((post) => (
                <tr key={post.id} className='hover:bg-surface-soft/60'>
                  <Td className='max-w-80'>
                    <Link
                      href={`/admin/posts/${post.id}`}
                      className='block truncate font-medium text-ink hover:underline'
                    >
                      {post.title}
                    </Link>
                  </Td>
                  <Td className='whitespace-nowrap'>
                    {post.author ? (
                      <Link href={`/admin/users/${post.author.id}`} className='hover:underline'>
                        {post.author.displayName}
                      </Link>
                    ) : (
                      <span className='text-ink-subtle'>Tài khoản đã xoá</span>
                    )}
                  </Td>
                  <Td>
                    <PostStatusBadge status={post.status} />
                  </Td>
                  <Td className='whitespace-nowrap'>
                    <PendingCount count={post.pendingReportCount} />
                    {post.reportCount > post.pendingReportCount && (
                      <span className='ml-2 text-ink-muted'>
                        {post.reportCount} tổng
                      </span>
                    )}
                  </Td>
                  <Td className='whitespace-nowrap text-ink-muted'>
                    {formatDate(post.createdAt)}
                  </Td>
                  <Td align='right'>
                    <ButtonLink href={`/admin/posts/${post.id}`} variant='ghost' size='sm'>
                      Xử lý
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

AdminPostsPage.getLayout = function getLayout(page: React.ReactElement) {
  return <AdminLayout>{page}</AdminLayout>;
};

export default AdminPostsPage;
