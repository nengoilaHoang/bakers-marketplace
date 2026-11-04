import Link from 'next/link';

import KeywordSearch from '@/components/admin/KeywordSearch';
import Pagination from '@/components/admin/Pagination';
import { USER_STATUS, UserStatusBadge } from '@/components/admin/StatusBadges';
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
import { getAdminVendors } from '@/services/admin';
import type { UserStatus } from '@/types/user';
import { formatDate } from '@/utils/format';

const STATUSES = Object.keys(USER_STATUS) as UserStatus[];

const AdminVendorsPage: NextPageWithLayout = () => {
  const { query, isReady, update } = useUrlFilters();
  const status = readEnum(query.status, STATUSES);
  const keyword = readString(query.keyword);
  const page = readPage(query.page);

  const { data, isLoading, error, reload } = useAdminData(
    (signal) => getAdminVendors({ status, keyword, page }, { signal }),
    `${status}|${keyword}|${page}`,
    isReady,
  );

  return (
    <DashboardPage
      title='Vendor'
      description='Các tài khoản bán hàng. Khoá một vendor từ trang chi tiết tài khoản.'
    >
      <div className='flex flex-wrap items-center gap-3'>
        {isReady && (
          <KeywordSearch
            value={keyword ?? ''}
            placeholder='Tìm theo tên, email, thương hiệu'
            onSearch={(value) => update({ keyword: value })}
          />
        )}
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
          title='Không thể tải danh sách vendor'
          message={error ?? 'Đã có lỗi xảy ra.'}
          onRetry={reload}
        />
      ) : data.data.length === 0 ? (
        <EmptyState icon='cart' title='Không có vendor nào khớp bộ lọc.' />
      ) : (
        <>
          <Table caption='Danh sách vendor'>
            <thead>
              <tr>
                <Th>Vendor</Th>
                <Th>Thương hiệu</Th>
                <Th>Mã số thuế</Th>
                <Th>Trạng thái</Th>
                <Th>Ngày duyệt</Th>
                <Th>
                  <span className='sr-only'>Chi tiết</span>
                </Th>
              </tr>
            </thead>
            <tbody>
              {data.data.map((vendor) => (
                <tr key={vendor.id} className='hover:bg-surface-soft/60'>
                  <Td>
                    <Link
                      href={`/admin/users/${vendor.id}`}
                      className='font-medium text-ink hover:underline'
                    >
                      {vendor.displayName}
                    </Link>
                    <span className='block text-ink-muted'>{vendor.email}</span>
                  </Td>
                  <Td>{vendor.brandName ?? <span className='text-ink-subtle'>—</span>}</Td>
                  <Td className='whitespace-nowrap'>{vendor.taxCode}</Td>
                  <Td>
                    <UserStatusBadge status={vendor.status} />
                  </Td>
                  <Td className='whitespace-nowrap text-ink-muted'>
                    {formatDate(vendor.registeredAt) ?? '—'}
                  </Td>
                  <Td align='right'>
                    <ButtonLink href={`/admin/users/${vendor.id}`} variant='ghost' size='sm'>
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

AdminVendorsPage.getLayout = function getLayout(page: React.ReactElement) {
  return <AdminLayout>{page}</AdminLayout>;
};

export default AdminVendorsPage;
