import Badge from '@/components/ui/Badge';
import type { PostStatus, ReportStatus } from '@/types/admin';
import type { UserRole, UserStatus } from '@/types/user';

type Tone = 'success' | 'warning' | 'danger' | 'info' | 'neutral';
type Style = { label: string; tone: Tone };

export const USER_STATUS: Record<UserStatus, Style> = {
  ACTIVE: { label: 'Hoạt động', tone: 'success' },
  BANNED: { label: 'Đã khoá', tone: 'danger' },
  PENDING_VERIFICATION: { label: 'Chưa xác thực', tone: 'neutral' },
};

export const USER_ROLE_LABELS: Record<UserRole, string> = {
  CUSTOMER: 'Khách hàng',
  BAKER: 'Thợ làm bánh',
  VENDOR: 'Vendor',
  ADMIN: 'Quản trị viên',
};

export const POST_STATUS: Record<PostStatus, Style> = {
  VISIBLE: { label: 'Đang hiện', tone: 'success' },
  REMOVED: { label: 'Đã gỡ', tone: 'danger' },
};

export const REPORT_STATUS: Record<ReportStatus, Style> = {
  PENDING: { label: 'Chờ xử lý', tone: 'warning' },
  RESOLVED: { label: 'Đã xử lý', tone: 'success' },
  DISMISSED: { label: 'Bỏ qua', tone: 'neutral' },
};

function StatusBadge({ style }: { style: Style }) {
  return <Badge tone={style.tone}>{style.label}</Badge>;
}

export function UserStatusBadge({ status }: { status: UserStatus }) {
  return <StatusBadge style={USER_STATUS[status]} />;
}

export function PostStatusBadge({ status }: { status: PostStatus }) {
  return <StatusBadge style={POST_STATUS[status]} />;
}

export function ReportStatusBadge({ status }: { status: ReportStatus }) {
  return <StatusBadge style={REPORT_STATUS[status]} />;
}

// Số báo cáo đang chờ: nổi bật khi > 0, mờ khi không có.
export function PendingCount({ count }: { count: number }) {
  return count > 0 ? (
    <Badge tone='warning'>{count} chờ xử lý</Badge>
  ) : (
    <span className='text-ink-subtle'>—</span>
  );
}
