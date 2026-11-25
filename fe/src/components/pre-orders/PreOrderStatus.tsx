import Badge from '@/components/ui/Badge';
import type { CycleStatus, PreOrderStatus, RecurrenceFrequency } from '@/types/preOrder';

type Tone = 'success' | 'warning' | 'danger' | 'info' | 'neutral';
type Style = { label: string; tone: Tone };

export const PRE_ORDER_STATUS: Record<PreOrderStatus, Style> = {
  PENDING: { label: 'Chờ tiệm duyệt', tone: 'warning' },
  APPROVED: { label: 'Đã duyệt, chờ bắt đầu', tone: 'info' },
  ACTIVE: { label: 'Đang giao định kỳ', tone: 'success' },
  COMPLETED: { label: 'Đã xong', tone: 'neutral' },
  DECLINED: { label: 'Bị từ chối', tone: 'danger' },
  EXPIRED: { label: 'Quá hạn duyệt', tone: 'neutral' },
  CANCELLED: { label: 'Đã huỷ', tone: 'neutral' },
};

export const CYCLE_STATUS: Record<CycleStatus, Style> = {
  SCHEDULED: { label: 'Chưa tới', tone: 'info' },
  ORDER_CREATED: { label: 'Đã tạo đơn', tone: 'success' },
  SKIPPED: { label: 'Bỏ qua', tone: 'neutral' },
  CANCELLED: { label: 'Đã huỷ', tone: 'neutral' },
};

export const FREQUENCY_LABELS: Record<RecurrenceFrequency, string> = {
  MONTHLY: 'Mỗi tháng 1 lần',
  BIWEEKLY: 'Mỗi tháng 2 lần',
};

export function PreOrderStatusBadge({ status }: { status: PreOrderStatus }) {
  const style = PRE_ORDER_STATUS[status];
  return <Badge tone={style.tone}>{style.label}</Badge>;
}

export function CycleStatusBadge({ status }: { status: CycleStatus }) {
  const style = CYCLE_STATUS[status];
  return <Badge tone={style.tone}>{style.label}</Badge>;
}

// Mã ngắn để gọi tên một yêu cầu đặt định kỳ (chưa có số thứ tự riêng như đơn hàng).
export function preOrderCode(id: string): string {
  return `DK-${id.slice(0, 8).toUpperCase()}`;
}

// "Mỗi tháng 2 lần · 2 tháng (4 kỳ)"
export function describeSchedule(preOrder: {
  frequency: RecurrenceFrequency;
  durationMonths: number;
  cycleCount: number;
}): string {
  return `${FREQUENCY_LABELS[preOrder.frequency]} · ${preOrder.durationMonths} tháng (${preOrder.cycleCount} kỳ)`;
}

// "2026-11-25" → "25/11/2026" (ngày lịch, không đổi múi giờ)
export function formatPlainDate(value: string): string {
  const [year, month, day] = value.split('-');
  return `${day}/${month}/${year}`;
}

// Ngày hôm nay (giờ Việt Nam) + plusDays, dạng YYYY-MM-DD cho ô chọn ngày.
export function vnDateInput(plusDays = 0): string {
  const date = new Date(Date.now() + plusDays * 24 * 60 * 60 * 1000);
  return new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Ho_Chi_Minh' }).format(date);
}

// Số kỳ của một yêu cầu: tháng × (1 hoặc 2).
export function countCycles(frequency: RecurrenceFrequency, durationMonths: number): number {
  return durationMonths * (frequency === 'BIWEEKLY' ? 2 : 1);
}
