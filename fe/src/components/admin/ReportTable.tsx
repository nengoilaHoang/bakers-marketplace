import { useState } from 'react';

import Button from '@/components/ui/Button';
import Table, { Td, Th } from '@/components/ui/Table';
import { dismissReport } from '@/services/admin';
import type { AdminReport } from '@/types/admin';
import { formatDateTime } from '@/utils/format';

import { ReportStatusBadge } from './StatusBadges';

type ReportTableProps = Readonly<{
  reports: AdminReport[];
  onChanged: () => void;
  onError: (error: unknown) => void;
}>;

// Danh sách báo cáo về một bài hoặc một người, bỏ qua được từng báo cáo đang chờ.
export default function ReportTable({ reports, onChanged, onError }: ReportTableProps) {
  const [busyId, setBusyId] = useState<string | null>(null);

  async function dismiss(id: string) {
    setBusyId(id);

    try {
      await dismissReport(id);
      onChanged();
    } catch (error) {
      onError(error);
    } finally {
      setBusyId(null);
    }
  }

  if (reports.length === 0) {
    return <p className='text-body-sm text-ink-muted'>Chưa có báo cáo nào.</p>;
  }

  return (
    <Table caption='Danh sách báo cáo'>
      <thead>
        <tr>
          <Th>Người báo cáo</Th>
          <Th>Lý do</Th>
          <Th>Thời gian</Th>
          <Th>Trạng thái</Th>
          <Th>Xử lý</Th>
          <Th>
            <span className='sr-only'>Thao tác</span>
          </Th>
        </tr>
      </thead>
      <tbody>
        {reports.map((report) => (
          <tr key={report.id}>
            <Td className='whitespace-nowrap'>
              {report.reporter?.displayName ?? (
                <span className='text-ink-subtle'>Tài khoản đã xoá</span>
              )}
            </Td>
            <Td className='min-w-48'>{report.reason}</Td>
            <Td className='whitespace-nowrap text-ink-muted'>
              {formatDateTime(report.createdAt)}
            </Td>
            <Td>
              <ReportStatusBadge status={report.status} />
            </Td>
            <Td className='min-w-40 text-ink-muted'>
              {report.handledBy ? (
                <>
                  {report.handledBy.displayName}, {formatDateTime(report.handledAt)}
                  {report.note && <span className='block text-ink'>{report.note}</span>}
                </>
              ) : (
                '—'
              )}
            </Td>
            <Td align='right'>
              {report.status === 'PENDING' && (
                <Button
                  variant='ghost'
                  size='sm'
                  disabled={busyId !== null}
                  onClick={() => void dismiss(report.id)}
                >
                  Bỏ qua
                </Button>
              )}
            </Td>
          </tr>
        ))}
      </tbody>
    </Table>
  );
}
