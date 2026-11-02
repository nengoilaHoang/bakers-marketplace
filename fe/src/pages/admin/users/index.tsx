import Link from 'next/link';

import KeywordSearch from '@/components/admin/KeywordSearch';
import Pagination from '@/components/admin/Pagination';
import {
  PendingCount,
  USER_ROLE_LABELS,
  USER_STATUS,
  UserStatusBadge,
} from '@/components/admin/StatusBadges';
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
import { getAdminUsers } from '@/services/admin';
import type { UserRole, UserStatus } from '@/types/user';
import { formatDate } from '@/utils/format';

const ROLES = Object.keys(USER_ROLE_LABELS) as UserRole[];
const STATUSES = Object.keys(USER_STATUS) as UserStatus[];

const AdminUsersPage: NextPageWithLayout = () => {
  const { query, isReady, update } = useUrlFilters();
  const role = readEnum(query.role, ROLES);
  const status = readEnum(query.status, STATUSES);
  const reported = query.reported === 'true' ? true : undefined;
  const keyword = readString(query.keyword);
  const page = readPage(query.page);

  const { data, isLoading, error, reload } = useAdminData(
    (signal) => getAdminUsers({ role, status, reported, keyword, page }, { signal }),
    `${role}|${status}|${reported}|${keyword}|${page}`,
    isReady,
  );

  return (
    <DashboardPage
      title='Người dùng'
      description='Tìm tài khoản, xem báo cáo và lịch sử xử lý, cảnh cáo hoặc khoá tài khoản.'
    >
      <div className='flex flex-wrap items-center gap-3'>
        {isReady && (
          <KeywordSearch
            value={keyword ?? ''}
            placeholder='Tìm theo tên, email'
            onSearch={(value) => update({ keyword: value })}
          />
        )}
        <Select
          aria-label='Lọc theo báo cáo'
          value={reported ? 'true' : ''}
          onChange={(event) => update({ reported: event.target.value })}
        >
          <option value=''>Mọi tài khoản</option>
          <option value='true'>Đang bị báo cáo</option>
        </Select>
        <Select
          aria-label='Lọc theo vai trò'
          value={role ?? ''}
          onChange={(event) => update({ role: event.target.value })}
        >
          <option value=''>Mọi vai trò</option>
          {ROLES.map((item) => (
            <option key={item} value={item}>
              {USER_ROLE_LABELS[item]}
            </option>
          ))}
        </Select>
        <Select
          aria-label='Lọc theo trạng thái'
          value={status ?? ''}
          onChange={(event) => update({ status: event.target.value })}
        >
          <option value=''>Mọi trạng thái</option>
          {STATUSES.map((item) => (
            <option key={item} value={item}>
              {USER_STATUS[item].label}
            </option>
          ))}
        </Select>
      </div>

      {isLoading ? (
        <PanelSkeleton className='h-80' />
      ) : error || !data ? (
        <ErrorState
          title='Không thể tải người dùng'
          message={error ?? 'Đã có lỗi xảy ra.'}
          onRetry={reload}
        />
      ) : data.data.length === 0 ? (
        <EmptyState icon='users' title='Không có tài khoản nào khớp bộ lọc.' />
      ) : (
        <>
          <Table caption='Danh sách người dùng'>
            <thead>
              <tr>
                <Th>Tài khoản</Th>
                <Th>Vai trò</Th>
                <Th>Trạng thái</Th>
                <Th>Báo cáo</Th>
                <Th align='right'>Cảnh cáo</Th>
                <Th>Ngày tạo</Th>
                <Th>
                  <span className='sr-only'>Chi tiết</span>
                </Th>
              </tr>
            </thead>
            <tbody>
              {data.data.map((user) => (
                <tr key={user.id} className='hover:bg-surface-soft/60'>
                  <Td>
                    <Link
                      href={`/admin/users/${user.id}`}
                      className='font-medium text-ink hover:underline'
                    >
                      {user.displayName}
                    </Link>
                    <span className='block text-ink-muted'>{user.email}</span>
                  </Td>
                  <Td className='whitespace-nowrap'>{USER_ROLE_LABELS[user.role]}</Td>
                  <Td>
                    <UserStatusBadge status={user.status} />
                  </Td>
                  <Td className='whitespace-nowrap'>
                    <PendingCount count={user.pendingReportCount} />
                  </Td>
                  <Td align='right'>{user.warningCount}</Td>
                  <Td className='whitespace-nowrap text-ink-muted'>
                    {formatDate(user.createdAt)}
                  </Td>
                  <Td align='right'>
                    <ButtonLink href={`/admin/users/${user.id}`} variant='ghost' size='sm'>
                      Chi tiết
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

AdminUsersPage.getLayout = function getLayout(page: React.ReactElement) {
  return <AdminLayout>{page}</AdminLayout>;
};

export default AdminUsersPage;
