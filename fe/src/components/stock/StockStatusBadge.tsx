import Badge from '@/components/ui/Badge';
import type { IconName } from '@/components/ui/Icon';
import type { StockStatus } from '@/types/stock';
import { STOCK_STATUS_LABELS } from '@/utils/stockStatus';

type StockTone = 'danger' | 'warning' | 'info' | 'success';

// Màu và icon cho từng trạng thái tồn kho, dùng chung cho nhãn và thẻ số liệu.
export const STOCK_STATUS_STYLES: Record<StockStatus, { tone: StockTone; icon: IconName }> = {
  OUT: { tone: 'danger', icon: 'circle-alert' },
  MINIMUM: { tone: 'danger', icon: 'triangle-alert' },
  REORDER: { tone: 'warning', icon: 'refresh' },
  MAXIMUM: { tone: 'info', icon: 'info' },
  NORMAL: { tone: 'success', icon: 'circle-check' },
};

export default function StockStatusBadge({ status }: { status: StockStatus }) {
  return <Badge tone={STOCK_STATUS_STYLES[status].tone}>{STOCK_STATUS_LABELS[status]}</Badge>;
}
