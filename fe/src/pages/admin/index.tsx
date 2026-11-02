import Link from 'next/link';

import { PendingCount } from '@/components/admin/StatusBadges';
import AdminLayout from '@/components/layout/AdminLayout';
import { ButtonLink } from '@/components/ui/Button';
import { ErrorState } from '@/components/ui/ErrorState';
import Icon from '@/components/ui/Icon';
import Panel, { PanelSkeleton } from '@/components/dashboard/Panel';
import StatCard from '@/components/dashboard/StatCard';
import DashboardPage from '@/components/dashboard/DashboardPage';
import { useAdminData } from '@/hooks/useAdminData';
import type { NextPageWithLayout } from '@/pages/_app';
import { getAdminPosts, getAdminUsers } from '@/services/admin';

// Số dòng hiển thị ở mỗi danh sách rút gọn.
const PREVIEW_SIZE = 5;

async function loadOverview(signal: AbortSignal) {
  const [reportedPosts, reportedUsers, bannedUsers] = await Promise.all([
    getAdminPosts({ reported: true, status: 'VISIBLE', pageSize: PREVIEW_SIZE }, { signal }),
    getAdminUsers({ reported: true, pageSize: 1 }, { signal }),
    getAdminUsers({ status: 'BANNED', pageSize: 1 }, { signal }),
  ]);

  return { reportedPosts, reportedUsers, bannedUsers };
}

const AdminHomePage: NextPageWithLayout = () => {
  const { data, isLoading, error, reload } = useAdminData(loadOverview, 'overview');

  return (
    <DashboardPage
      title='Tổng quan'
      description='Những việc đang chờ quản trị viên xử lý.'
    >
      {isLoading ? (
        <>
          <div className='grid gap-4 sm:grid-cols-3'>
            <PanelSkeleton className='h-20' />
            <PanelSkeleton className='h-20' />
            <PanelSkeleton className='h-20' />
          </div>
          <PanelSkeleton className='h-64' />
        </>
      ) : error || !data ? (
        <ErrorState title='Không thể tải tổng quan' message={error ?? 'Đã có lỗi xảy ra.'} onRetry={reload} />
      ) : (
        <>
          <div className='grid gap-4 sm:grid-cols-3'>
            <StatCard
              label='Bài bị báo cáo'
              value={data.reportedPosts.pagination.total}
              icon='flag'
              tone={data.reportedPosts.pagination.total > 0 ? 'warning' : 'default'}
              href='/admin/posts?view=reported'
            />
            <StatCard
              label='Người dùng bị báo cáo'
              value={data.reportedUsers.pagination.total}
              icon='users'
              tone={data.reportedUsers.pagination.total > 0 ? 'warning' : 'default'}
              href='/admin/users?reported=true'
            />
            <StatCard
              label='Tài khoản đang bị khoá'
              value={data.bannedUsers.pagination.total}
              icon='circle-alert'
              tone='danger'
              href='/admin/users?status=BANNED'
            />
          </div>

          <Panel
            title='Bài bị báo cáo nhiều nhất'
            actions={
              <ButtonLink href='/admin/posts?view=reported' variant='ghost' size='sm'>
                Xem tất cả
                <Icon name='chevron-right' className='size-4' />
              </ButtonLink>
            }
          >
            {data.reportedPosts.data.length === 0 ? (
              <p className='text-body-sm text-ink-muted'>Không có bài nào đang chờ xử lý.</p>
            ) : (
              <ul className='flex flex-col divide-y divide-line'>
                {data.reportedPosts.data.map((post) => (
                  <li key={post.id} className='flex items-center justify-between gap-3 py-3'>
                    <div className='min-w-0'>
                      <Link
                        href={`/admin/posts/${post.id}`}
                        className='block truncate font-medium text-ink hover:underline'
                      >
                        {post.title}
                      </Link>
                      <p className='text-body-sm text-ink-muted'>
                        {post.author?.displayName ?? 'Tài khoản đã xoá'}
                      </p>
                    </div>
                    <PendingCount count={post.pendingReportCount} />
                  </li>
                ))}
              </ul>
            )}
          </Panel>
        </>
      )}
    </DashboardPage>
  );
};

AdminHomePage.getLayout = function getLayout(page: React.ReactElement) {
  return <AdminLayout>{page}</AdminLayout>;
};

export default AdminHomePage;
