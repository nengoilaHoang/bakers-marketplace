import { useMemo, useState, type CSSProperties } from 'react';
import Head from 'next/head';
import Link from 'next/link';

import VendorLayout from '@/components/layout/VendorLayout';
import VendorShellLayout from '@/components/layout/VendorShellLayout';
import { useVendorStocks } from '@/hooks/useVendorStocks';
import type { NextPageWithLayout } from '@/pages/_app';
import { productApi } from '@/services/products';
import type { Product } from '@/types/product';
import type { StockStatus } from '@/types/stock';
import {
  STOCK_ALERT_TYPES,
  STOCK_STATUS_LABELS,
  STOCK_STATUS_PRIORITY,
  getStockStatus,
} from '@/utils/stockStatus';

// UI thô (inline style), sẽ làm lại theo design system sau.
const page: CSSProperties = { padding: '24px 32px', fontSize: 14, maxWidth: 1200, margin: '0 auto' };
const h1: CSSProperties = { fontSize: 22, fontWeight: 600, margin: '0 0 16px' };
const muted: CSSProperties = { color: '#6b7280', fontSize: 13 };
const link: CSSProperties = { color: '#2563eb', textDecoration: 'none' };
const row: CSSProperties = { display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' };
const cards: CSSProperties = { display: 'flex', gap: 12, flexWrap: 'wrap', marginBottom: 20 };
const card: CSSProperties = { border: '1px solid #d1d5db', borderRadius: 8, padding: '10px 14px', minWidth: 140, background: '#fff', cursor: 'pointer', textAlign: 'left' };
const input: CSSProperties = { padding: '5px 8px', border: '1px solid #d1d5db', borderRadius: 6, fontSize: 13 };
const button: CSSProperties = { padding: '5px 10px', border: '1px solid #d1d5db', borderRadius: 6, background: '#fff', cursor: 'pointer', fontSize: 13 };
const table: CSSProperties = { width: '100%', borderCollapse: 'collapse', fontSize: 13, marginTop: 16 };
const th: CSSProperties = { textAlign: 'left', padding: '8px 10px', background: '#f3f4f6', border: '1px solid #d1d5db', whiteSpace: 'nowrap' };
const td: CSSProperties = { padding: '8px 10px', border: '1px solid #d1d5db', verticalAlign: 'middle' };
const errorBox: CSSProperties = { padding: 12, border: '1px solid #fecaca', background: '#fef2f2', color: '#991b1b', borderRadius: 6, margin: '12px 0' };

const STATUS_COLORS: Record<StockStatus, CSSProperties> = {
  OUT: { background: '#fee2e2', color: '#991b1b' },
  MINIMUM: { background: '#fee2e2', color: '#b91c1c' },
  REORDER: { background: '#fef3c7', color: '#92400e' },
  MAXIMUM: { background: '#dbeafe', color: '#1e40af' },
  NORMAL: { background: '#dcfce7', color: '#166534' },
};

const STATUSES = Object.keys(STOCK_STATUS_LABELS) as StockStatus[];

type SortKey = 'status' | 'stock-asc' | 'stock-desc' | 'title';

function statusOf(product: Product): StockStatus {
  return getStockStatus(product.stock?.stock ?? 0, product.stock?.alerts ?? []);
}

function StatusBadge({ status }: { status: StockStatus }) {
  return (
    <span style={{ ...STATUS_COLORS[status], padding: '2px 8px', borderRadius: 999, fontSize: 12, whiteSpace: 'nowrap' }}>
      {STOCK_STATUS_LABELS[status]}
    </span>
  );
}

// Điều chỉnh nhanh: nhập số rồi bấm Nhập thêm (+) hoặc Xuất bớt (−).
function QuickAdjust({ product, onDone }: { product: Product; onDone: () => void }) {
  const [amount, setAmount] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  async function adjust(sign: 1 | -1) {
    const value = Number(amount);

    if (!Number.isInteger(value) || value <= 0) {
      alert('Nhập số nguyên dương.');
      return;
    }

    setIsSaving(true);

    try {
      await productApi.adjustStock(product.id, sign * value);
      setAmount('');
      onDone();
    } catch (error) {
      alert((error as Error).message);
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <div style={row}>
      <input
        type='number'
        min={1}
        value={amount}
        onChange={(event) => setAmount(event.target.value)}
        placeholder='Số lượng'
        aria-label={`Số lượng điều chỉnh cho ${product.title}`}
        style={{ ...input, width: 90 }}
      />
      <button type='button' style={button} disabled={isSaving} onClick={() => void adjust(1)}>
        + Nhập
      </button>
      <button type='button' style={button} disabled={isSaving} onClick={() => void adjust(-1)}>
        − Xuất
      </button>
    </div>
  );
}

const StockListPage: NextPageWithLayout = () => {
  const { products, isLoading, error, reload } = useVendorStocks();
  const [keyword, setKeyword] = useState('');
  const [statusFilter, setStatusFilter] = useState<StockStatus | 'ALL'>('ALL');
  const [sortKey, setSortKey] = useState<SortKey>('status');

  const counts = useMemo(() => {
    const result = Object.fromEntries(STATUSES.map((status) => [status, 0])) as Record<StockStatus, number>;
    for (const product of products) result[statusOf(product)] += 1;
    return result;
  }, [products]);

  const visibleProducts = useMemo(() => {
    const normalizedKeyword = keyword.trim().toLowerCase();

    return products
      .filter((product) => statusFilter === 'ALL' || statusOf(product) === statusFilter)
      .filter((product) => !normalizedKeyword || product.title.toLowerCase().includes(normalizedKeyword))
      .sort((a, b) => {
        const stockA = a.stock?.stock ?? 0;
        const stockB = b.stock?.stock ?? 0;

        if (sortKey === 'stock-asc') return stockA - stockB;
        if (sortKey === 'stock-desc') return stockB - stockA;
        if (sortKey === 'title') return a.title.localeCompare(b.title, 'vi');
        return STOCK_STATUS_PRIORITY[statusOf(a)] - STOCK_STATUS_PRIORITY[statusOf(b)];
      });
  }, [products, keyword, statusFilter, sortKey]);

  return (
    <div style={page}>
      <Head>
        <title>Tồn kho</title>
      </Head>

      <h1 style={h1}>Tồn kho</h1>

      {isLoading ? (
        <p style={muted}>Đang tải...</p>
      ) : error ? (
        <div style={errorBox}>
          Lỗi: {error}{' '}
          <button type='button' style={button} onClick={reload}>
            Thử lại
          </button>
        </div>
      ) : (
        <>
          {/* Tổng quan: bấm vào thẻ để lọc theo trạng thái */}
          <div style={cards}>
            <button type='button' style={{ ...card, outline: statusFilter === 'ALL' ? '2px solid #111827' : 'none' }} onClick={() => setStatusFilter('ALL')}>
              <div style={muted}>Tổng sản phẩm</div>
              <div style={{ fontSize: 20, fontWeight: 600 }}>{products.length}</div>
            </button>
            {STATUSES.map((status) => (
              <button
                key={status}
                type='button'
                style={{ ...card, outline: statusFilter === status ? '2px solid #111827' : 'none' }}
                onClick={() => setStatusFilter(status)}
              >
                <div style={muted}>{STOCK_STATUS_LABELS[status]}</div>
                <div style={{ fontSize: 20, fontWeight: 600 }}>{counts[status]}</div>
              </button>
            ))}
          </div>

          <div style={row}>
            <input
              type='search'
              value={keyword}
              onChange={(event) => setKeyword(event.target.value)}
              placeholder='Tìm theo tên sản phẩm'
              aria-label='Tìm theo tên sản phẩm'
              style={{ ...input, width: 240 }}
            />
            <label style={row}>
              Trạng thái
              <select style={input} value={statusFilter} onChange={(event) => setStatusFilter(event.target.value as StockStatus | 'ALL')}>
                <option value='ALL'>Tất cả</option>
                {STATUSES.map((status) => (
                  <option key={status} value={status}>
                    {STOCK_STATUS_LABELS[status]}
                  </option>
                ))}
              </select>
            </label>
            <label style={row}>
              Sắp xếp
              <select style={input} value={sortKey} onChange={(event) => setSortKey(event.target.value as SortKey)}>
                <option value='status'>Cần xử lý trước</option>
                <option value='stock-asc'>Tồn kho tăng dần</option>
                <option value='stock-desc'>Tồn kho giảm dần</option>
                <option value='title'>Tên A → Z</option>
              </select>
            </label>
          </div>

          {visibleProducts.length === 0 ? (
            <p style={{ ...muted, marginTop: 16 }}>Không có sản phẩm nào.</p>
          ) : (
            <table style={table}>
              <thead>
                <tr>
                  <th style={th}>Sản phẩm</th>
                  <th style={th}>Tồn kho</th>
                  <th style={th}>Trạng thái</th>
                  {STOCK_ALERT_TYPES.map((alertType) => (
                    <th key={alertType} style={th}>
                      {alertType}
                    </th>
                  ))}
                  <th style={th}>Điều chỉnh nhanh</th>
                  <th style={th} />
                </tr>
              </thead>
              <tbody>
                {visibleProducts.map((product) => (
                  <tr key={product.id}>
                    <td style={td}>{product.title}</td>
                    <td style={{ ...td, whiteSpace: 'nowrap' }}>
                      <b>{product.stock?.stock ?? 0}</b> {product.unit}
                    </td>
                    <td style={td}>
                      <StatusBadge status={statusOf(product)} />
                    </td>
                    {STOCK_ALERT_TYPES.map((alertType) => (
                      <td key={alertType} style={td}>
                        {product.stock?.alerts.find((alert) => alert.alertType === alertType)?.threshold ?? '—'}
                      </td>
                    ))}
                    <td style={td}>
                      <QuickAdjust product={product} onDone={reload} />
                    </td>
                    <td style={td}>
                      <Link href={`/vendors/stocks/${product.id}`} style={link}>
                        Chi tiết →
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </>
      )}
    </div>
  );
};

StockListPage.getLayout = function getLayout(page: React.ReactElement) {
  return (
    <VendorShellLayout>
      <VendorLayout>{page}</VendorLayout>
    </VendorShellLayout>
  );
};

export default StockListPage;
