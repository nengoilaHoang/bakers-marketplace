import type { StockAlert } from '@/types/product';

export type StockAlertType = StockAlert['alertType'];

// OUT: hết hàng · MINIMUM/REORDER: đang ở dưới mốc · MAXIMUM: đang ở trên mốc · NORMAL: ổn định
export type StockStatus = 'OUT' | 'MINIMUM' | 'REORDER' | 'MAXIMUM' | 'NORMAL';
