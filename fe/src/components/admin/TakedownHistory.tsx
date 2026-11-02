import type { AdminTakedown } from '@/types/admin';
import { formatDateTime } from '@/utils/format';

type TakedownHistoryProps = Readonly<{
  items: AdminTakedown[];
  // Tên hành động, ví dụ 'Gỡ' / 'Khôi phục' cho bài viết, 'Khoá' / 'Mở khoá' cho tài khoản.
  issuedLabel: string;
  revokedLabel: string;
  emptyText: string;
}>;

// Lịch sử gỡ bài / khoá tài khoản: mỗi lần một dòng, kèm ai làm và ai gỡ bỏ.
export default function TakedownHistory({
  items,
  issuedLabel,
  revokedLabel,
  emptyText,
}: TakedownHistoryProps) {
  if (items.length === 0) {
    return <p className='text-body-sm text-ink-muted'>{emptyText}</p>;
  }

  return (
    <ul className='flex flex-col divide-y divide-line'>
      {items.map((takedown) => (
        <li key={takedown.id} className='py-3'>
          <p className='text-body text-ink'>{takedown.reason}</p>
          <p className='text-body-sm text-ink-muted'>
            {issuedLabel}: {takedown.issuedBy?.displayName ?? 'Quản trị viên'},{' '}
            {formatDateTime(takedown.issuedAt)}
          </p>
          <p className='text-body-sm text-ink-muted'>
            {takedown.revokedAt
              ? `${revokedLabel}: ${takedown.revokedBy?.displayName ?? 'Quản trị viên'}, ${formatDateTime(takedown.revokedAt)}`
              : 'Đang có hiệu lực'}
          </p>
        </li>
      ))}
    </ul>
  );
}
