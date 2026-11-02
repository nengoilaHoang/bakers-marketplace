import { useRouter } from 'next/router';
import Link from 'next/link';
import { useState } from 'react';

import ReasonForm from '@/components/admin/ReasonForm';
import ReportTable from '@/components/admin/ReportTable';
import TakedownHistory from '@/components/admin/TakedownHistory';
import { USER_ROLE_LABELS, UserStatusBadge } from '@/components/admin/StatusBadges';
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
  banUser,
  dismissUserReports,
  getAdminUser,
  unbanUser,
  warnUser,
} from '@/services/admin';
import type { AdminWarningReport } from '@/types/admin';
import { formatDate, formatDateTime } from '@/utils/format';

// Các báo cáo một lần cảnh cáo đã xử lý: gom theo bài viết, báo cáo về tài khoản để riêng.
function WarningReports({ reports }: { reports: AdminWarningReport[] }) {
  if (reports.length === 0) {
    return <p className='text-body-sm text-ink-muted'>Không gắn báo cáo nào.</p>;
  }

  const byPost = new Map<string, { title: string; count: number }>();
  let aboutUser = 0;

  for (const report of reports) {
    if (report.postId) {
      const entry = byPost.get(report.postId) ?? { title: report.postTitle ?? 'Bài viết', count: 0 };
      entry.count += 1;
      byPost.set(report.postId, entry);
    } else {
      aboutUser += 1;
    }
  }

  return (
    <ul className='flex flex-col gap-0.5 text-body-sm text-ink-muted'>
      {[...byPost].map(([postId, { title, count }]) => (
        <li key={postId}>
          Xử lý {count} báo cáo về bài{' '}
          <Link href={`/admin/posts/${postId}`} className='text-ink hover:underline'>
            {title}
          </Link>
        </li>
      ))}
      {aboutUser > 0 && <li>Xử lý {aboutUser} báo cáo về tài khoản</li>}
    </ul>
  );
}

const AdminUserDetailPage: NextPageWithLayout = () => {
  const router = useRouter();
  const id = readString(router.query.id);
  const { data, isLoading, error, reload } = useAdminData(
    (signal) => getAdminUser(id!, { signal }).then((response) => response.data),
    id ?? '',
    Boolean(id),
  );
  const [notice, setNotice] = useState<string | null>(null);
  const [actionError, setActionError] = useState<unknown>(null);
  const [isUnbanning, setIsUnbanning] = useState(false);

  function done(message: string) {
    setActionError(null);
    setNotice(message);
    reload();
  }

  const breadcrumb = [
    { label: 'Người dùng', href: '/admin/users' },
    { label: data?.displayName ?? 'Chi tiết' },
  ];

  if (isLoading || !id) {
    return (
      <DashboardPage title='Người dùng' breadcrumb={breadcrumb}>
        <PanelSkeleton className='h-96' />
      </DashboardPage>
    );
  }

  if (error || !data) {
    return (
      <DashboardPage title='Người dùng' breadcrumb={breadcrumb}>
        <ErrorState
          title='Không thể tải tài khoản'
          message={error ?? 'Đã có lỗi xảy ra.'}
          onRetry={reload}
        />
      </DashboardPage>
    );
  }

  const pendingCount = data.reports.filter((report) => report.status === 'PENDING').length;
  const activeBan = data.bans.find((ban) => ban.revokedAt === null);
  const isAdmin = data.role === 'ADMIN';

  async function unban() {
    setIsUnbanning(true);

    try {
      await unbanUser(data!.id);
      done(`Đã mở khoá ${data!.displayName}.`);
    } catch (unbanError) {
      setActionError(unbanError);
    } finally {
      setIsUnbanning(false);
    }
  }

  return (
    <DashboardPage
      title={data.displayName}
      heading={
        <span className='flex flex-wrap items-center gap-3'>
          {data.displayName}
          <UserStatusBadge status={data.status} />
        </span>
      }
      description={`${data.email} · ${USER_ROLE_LABELS[data.role]} · Tham gia ${formatDate(data.createdAt)}`}
      breadcrumb={breadcrumb}
    >
      {notice && <Alert tone='success'>{notice}</Alert>}
      {actionError !== null && <ApiErrorAlert error={actionError} />}

      {data.status === 'BANNED' && (
        <Alert
          tone='danger'
          title='Tài khoản đang bị khoá'
          action={
            <Button variant='outline' size='sm' disabled={isUnbanning} onClick={() => void unban()}>
              Mở khoá
            </Button>
          }
        >
          {activeBan
            ? `${activeBan.issuedBy?.displayName ?? 'Quản trị viên'} khoá lúc ${formatDateTime(activeBan.issuedAt)}. Lý do: ${activeBan.reason}`
            : 'Không tìm thấy lần khoá đang có hiệu lực.'}
        </Alert>
      )}

      <div className='grid items-start gap-6 lg:grid-cols-3'>
        <div className='flex flex-col gap-6 lg:col-span-2'>
          <Panel
            title={`Báo cáo về tài khoản (${data.reports.length})`}
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

          <Panel title={`Cảnh cáo (${data.warnings.length})`}>
            {data.warnings.length === 0 ? (
              <p className='text-body-sm text-ink-muted'>Chưa bị cảnh cáo lần nào.</p>
            ) : (
              <ul className='flex flex-col divide-y divide-line'>
                {data.warnings.map((warning) => (
                  <li key={warning.id} className='py-3'>
                    <p className='text-body text-ink'>{warning.reason}</p>
                    <p className='text-body-sm text-ink-muted'>
                      {warning.issuedBy?.displayName ?? 'Quản trị viên'} ·{' '}
                      {formatDateTime(warning.createdAt)}
                    </p>
                    <div className='mt-1'>
                      <WarningReports reports={warning.reports} />
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </Panel>

          <Panel title={`Lịch sử khoá (${data.bans.length})`}>
            <TakedownHistory
              items={data.bans}
              issuedLabel='Khoá'
              revokedLabel='Mở khoá'
              emptyText='Chưa bị khoá lần nào.'
            />
          </Panel>
        </div>

        <div className='flex flex-col gap-6'>
          {isAdmin ? (
            <Alert tone='info'>Không thể cảnh cáo hay khoá tài khoản quản trị viên.</Alert>
          ) : (
            <>
              <ReasonForm
                title='Cảnh cáo'
                description='Ghi một lần cảnh cáo; các báo cáo đang chờ về tài khoản này được đánh dấu đã xử lý. Tài khoản vẫn dùng bình thường.'
                label='Lý do cảnh cáo'
                submitLabel='Gửi cảnh cáo'
                variant='outline'
                onSubmit={async (reason) => {
                  await warnUser(data.id, reason);
                  done(`Đã cảnh cáo ${data.displayName}.`);
                }}
              />

              {data.status !== 'BANNED' && (
                <ReasonForm
                  title='Khoá tài khoản'
                  description='Đăng xuất khỏi mọi thiết bị và không đăng nhập lại được cho tới khi mở khoá.'
                  label='Lý do khoá'
                  submitLabel='Khoá tài khoản'
                  variant='danger'
                  onSubmit={async (reason) => {
                    await banUser(data.id, reason);
                    done(`Đã khoá ${data.displayName}.`);
                  }}
                />
              )}

              {pendingCount > 0 && (
                <ReasonForm
                  title='Bỏ qua báo cáo'
                  description='Tài khoản không vi phạm: bỏ qua mọi báo cáo đang chờ.'
                  label='Ghi chú'
                  required={false}
                  submitLabel={`Bỏ qua ${pendingCount} báo cáo`}
                  variant='ghost'
                  onSubmit={async (note) => {
                    await dismissUserReports(data.id, note || undefined);
                    done('Đã bỏ qua các báo cáo đang chờ.');
                  }}
                />
              )}
            </>
          )}
        </div>
      </div>
    </DashboardPage>
  );
};

AdminUserDetailPage.getLayout = function getLayout(page: React.ReactElement) {
  return <AdminLayout>{page}</AdminLayout>;
};

export default AdminUserDetailPage;
