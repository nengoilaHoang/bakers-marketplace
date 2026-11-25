import Badge from '@/components/ui/Badge';
import type { OrderItemStatus, OrderStatus, ShipmentStatus } from '@/types/order';

type Tone = 'success' | 'warning' | 'danger' | 'info' | 'neutral';
type Style = { label: string; tone: Tone };

export const ORDER_STATUS: Record<OrderStatus, Style> = {
  PENDING: { label: 'Chờ xác nhận', tone: 'warning' },
  APPROVED: { label: 'Đã xác nhận', tone: 'info' },
  COMPLETED: { label: 'Hoàn thành', tone: 'success' },
  DECLINED: { label: 'Bị từ chối', tone: 'danger' },
  EXPIRED: { label: 'Quá hạn duyệt', tone: 'neutral' },
  CANCELLED: { label: 'Đã huỷ', tone: 'neutral' },
  REFUNDED: { label: 'Đã hoàn tiền', tone: 'neutral' },
};

// Trạng thái từng món theo góc nhìn người mua và góc nhìn tiệm.
export const ORDER_ITEM_STATUS: Record<OrderItemStatus, Style> = {
  PENDING: { label: 'Chờ tiệm duyệt', tone: 'warning' },
  APPROVED: { label: 'Tiệm đã duyệt', tone: 'success' },
  DECLINED: { label: 'Tiệm từ chối', tone: 'danger' },
  EXPIRED: { label: 'Tiệm không phản hồi', tone: 'neutral' },
};

export const VENDOR_PART_STATUS: Record<OrderItemStatus, Style> = {
  PENDING: { label: 'Cần duyệt', tone: 'warning' },
  APPROVED: { label: 'Đã duyệt', tone: 'success' },
  DECLINED: { label: 'Đã từ chối', tone: 'danger' },
  EXPIRED: { label: 'Quá hạn duyệt', tone: 'neutral' },
};

// Các bước giao hàng theo thứ tự; admin chuyển từng bước một.
export const SHIPMENT_STEPS: ShipmentStatus[] = [
  'LABEL_CREATED',
  'PICKED_UP',
  'IN_TRANSIT',
  'OUT_FOR_DELIVERY',
  'DELIVERED',
];

export const SHIPMENT_STATUS_LABELS: Record<ShipmentStatus, string> = {
  LABEL_CREATED: 'Đã tạo vận đơn',
  PICKED_UP: 'Đã lấy hàng',
  IN_TRANSIT: 'Đang vận chuyển',
  OUT_FOR_DELIVERY: 'Đang giao hàng',
  DELIVERED: 'Đã giao hàng',
};

export function OrderStatusBadge({ status }: { status: OrderStatus }) {
  const style = ORDER_STATUS[status];
  return <Badge tone={style.tone}>{style.label}</Badge>;
}

export function StatusBadge({ style }: { style: Style }) {
  return <Badge tone={style.tone}>{style.label}</Badge>;
}
