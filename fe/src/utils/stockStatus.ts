import type { StockAlert } from '@/types/product';
import type { StockAlertType, StockStatus } from '@/types/stock';

// Thứ tự từ thấp đến cao, đúng thứ tự BE bắt buộc: MINIMUM < REORDER < MAXIMUM.
export const STOCK_ALERT_TYPES: StockAlertType[] = ['MINIMUM', 'REORDER', 'MAXIMUM'];

export const STOCK_ALERT_LABELS: Record<StockAlertType, string> = {
  MINIMUM: 'Tối thiểu',
  REORDER: 'Cần nhập lại',
  MAXIMUM: 'Tối đa',
};

export const STOCK_STATUS_LABELS: Record<StockStatus, string> = {
  OUT: 'Hết hàng',
  MINIMUM: 'Dưới mức tối thiểu',
  REORDER: 'Cần nhập lại',
  MAXIMUM: 'Vượt mức tối đa',
  NORMAL: 'Ổn định',
};

// Dùng để sắp xếp: trạng thái cần xử lý gấp đứng trước.
export const STOCK_STATUS_PRIORITY: Record<StockStatus, number> = {
  OUT: 0,
  MINIMUM: 1,
  REORDER: 2,
  MAXIMUM: 3,
  NORMAL: 4,
};

type Threshold = Pick<StockAlert, 'alertType' | 'threshold'>;

function findThreshold(alerts: Threshold[], alertType: StockAlertType) {
  return alerts.find((alert) => alert.alertType === alertType)?.threshold;
}

/** Trạng thái hiện tại của tồn kho, theo mốc nghiêm trọng nhất mà nó đang nằm trong. */
export function getStockStatus(stock: number, alerts: Threshold[]): StockStatus {
  const minimum = findThreshold(alerts, 'MINIMUM');
  const reorder = findThreshold(alerts, 'REORDER');
  const maximum = findThreshold(alerts, 'MAXIMUM');

  if (stock === 0) return 'OUT';
  if (minimum !== undefined && stock <= minimum) return 'MINIMUM';
  if (reorder !== undefined && stock <= reorder) return 'REORDER';
  if (maximum !== undefined && stock >= maximum) return 'MAXIMUM';

  return 'NORMAL';
}

/** Giống kiểm tra ở BE: các mốc đang bật phải tăng dần MINIMUM < REORDER < MAXIMUM. */
export function getThresholdOrderError(alerts: Threshold[]): string | null {
  const ordered = STOCK_ALERT_TYPES.flatMap((alertType) =>
    alerts.filter((alert) => alert.alertType === alertType),
  );

  for (let index = 1; index < ordered.length; index += 1) {
    const lower = ordered[index - 1];
    const higher = ordered[index];

    if (lower.threshold >= higher.threshold) {
      return `Mốc "${STOCK_ALERT_LABELS[lower.alertType]}" (${lower.threshold}) phải nhỏ hơn mốc "${STOCK_ALERT_LABELS[higher.alertType]}" (${higher.threshold}).`;
    }
  }

  return null;
}

export type AlertChange =
  | { action: 'set'; alertType: StockAlertType; threshold: number }
  | { action: 'remove'; alertType: StockAlertType };

/**
 * BE kiểm tra thứ tự mốc sau từng lần gọi, nên phải lưu theo thứ tự để mỗi bước đều hợp lệ:
 * xoá trước, rồi các mốc giảm (từ thấp lên cao), cuối cùng các mốc tăng hoặc mốc mới (từ cao xuống thấp).
 */
export function planAlertChanges(current: Threshold[], next: Threshold[]): AlertChange[] {
  const removals: AlertChange[] = [];
  const decreases: AlertChange[] = [];
  const increases: AlertChange[] = [];

  for (const alertType of STOCK_ALERT_TYPES) {
    const before = findThreshold(current, alertType);
    const after = findThreshold(next, alertType);

    if (after === undefined) {
      if (before !== undefined) removals.push({ action: 'remove', alertType });
    } else if (before === undefined || after > before) {
      increases.push({ action: 'set', alertType, threshold: after });
    } else if (after < before) {
      decreases.push({ action: 'set', alertType, threshold: after });
    }
  }

  return [...removals, ...decreases, ...increases.reverse()];
}
