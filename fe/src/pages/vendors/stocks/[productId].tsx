import { useCallback, useEffect, useState, type CSSProperties, type FormEvent } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';

import VendorLayout from '@/components/layout/VendorLayout';
import VendorShellLayout from '@/components/layout/VendorShellLayout';
import useAuth from '@/hooks/user/useAuthContext';
import type { NextPageWithLayout } from '@/pages/_app';
import { productApi } from '@/services/products';
import type { Product } from '@/types/product';
import type { StockAlertType } from '@/types/stock';
import {
  STOCK_ALERT_LABELS,
  STOCK_ALERT_TYPES,
  STOCK_STATUS_LABELS,
  getStockStatus,
  getThresholdOrderError,
  planAlertChanges,
} from '@/utils/stockStatus';

// UI thô (inline style), sẽ làm lại theo design system sau.
const page: CSSProperties = { padding: '24px 32px', fontSize: 14, maxWidth: 800, margin: '0 auto' };
const h1: CSSProperties = { fontSize: 22, fontWeight: 600, margin: '12px 0 4px' };
const h2: CSSProperties = { fontSize: 16, fontWeight: 600, margin: '24px 0 8px' };
const muted: CSSProperties = { color: '#6b7280', fontSize: 13 };
const link: CSSProperties = { color: '#2563eb', textDecoration: 'none' };
const card: CSSProperties = { border: '1px solid #d1d5db', borderRadius: 8, padding: 16 };
const row: CSSProperties = { display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' };
const input: CSSProperties = { padding: '5px 8px', border: '1px solid #d1d5db', borderRadius: 6, fontSize: 13 };
const button: CSSProperties = { padding: '6px 14px', border: '1px solid #111827', borderRadius: 6, background: '#111827', color: '#fff', cursor: 'pointer', fontSize: 13 };
const errorBox: CSSProperties = { padding: 10, border: '1px solid #fecaca', background: '#fef2f2', color: '#991b1b', borderRadius: 6, marginTop: 10 };
const successBox: CSSProperties = { padding: 10, border: '1px solid #bbf7d0', background: '#f0fdf4', color: '#166534', borderRadius: 6, marginTop: 10 };

type AdjustMode = 'set' | 'add' | 'subtract';

type ThresholdField = { enabled: boolean; value: string };
type ThresholdForm = Record<StockAlertType, ThresholdField>;

function toThresholdForm(product: Product): ThresholdForm {
  const alerts = product.stock?.alerts ?? [];

  return Object.fromEntries(
    STOCK_ALERT_TYPES.map((alertType) => {
      const alert = alerts.find((item) => item.alertType === alertType);
      return [alertType, { enabled: Boolean(alert), value: alert ? String(alert.threshold) : '' }];
    }),
  ) as ThresholdForm;
}

const StockDetailPage: NextPageWithLayout = () => {
  const router = useRouter();
  const productId = typeof router.query.productId === 'string' ? router.query.productId : undefined;
  const { account } = useAuth();

  const [product, setProduct] = useState<Product | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);

  const [mode, setMode] = useState<AdjustMode>('add');
  const [amount, setAmount] = useState('');
  const [adjustMessage, setAdjustMessage] = useState<{ ok: boolean; text: string } | null>(null);

  const [thresholds, setThresholds] = useState<ThresholdForm | null>(null);
  const [alertMessage, setAlertMessage] = useState<{ ok: boolean; text: string } | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const load = useCallback(async () => {
    if (!productId) return;

    try {
      const response = await productApi.getById(productId);
      setProduct(response.data);
      setThresholds(toThresholdForm(response.data));
      setLoadError(null);
    } catch (error) {
      setLoadError((error as Error).message);
    }
  }, [productId]);

  useEffect(() => {
    const timer = window.setTimeout(() => void load(), 0);
    return () => window.clearTimeout(timer);
  }, [load]);

  async function handleAdjust(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!product) return;

    const value = Number(amount);
    const isValid = Number.isInteger(value) && (mode === 'set' ? value >= 0 : value > 0);

    if (!isValid) {
      setAdjustMessage({ ok: false, text: mode === 'set' ? 'Nhập số nguyên ≥ 0.' : 'Nhập số nguyên dương.' });
      return;
    }

    setIsSaving(true);
    setAdjustMessage(null);

    try {
      if (mode === 'set') {
        await productApi.updateStock(product.id, value);
      } else {
        await productApi.adjustStock(product.id, mode === 'add' ? value : -value);
      }

      setAmount('');
      setAdjustMessage({ ok: true, text: 'Đã cập nhật tồn kho.' });
      await load();
    } catch (error) {
      setAdjustMessage({ ok: false, text: (error as Error).message });
    } finally {
      setIsSaving(false);
    }
  }

  async function handleSaveThresholds(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!product || !thresholds) return;

    const next = [];

    for (const alertType of STOCK_ALERT_TYPES) {
      const field = thresholds[alertType];
      if (!field.enabled) continue;

      const value = Number(field.value);

      if (field.value.trim() === '' || !Number.isInteger(value) || value < 0) {
        setAlertMessage({ ok: false, text: `Mốc "${STOCK_ALERT_LABELS[alertType]}" phải là số nguyên ≥ 0.` });
        return;
      }

      next.push({ alertType, threshold: value });
    }

    const orderError = getThresholdOrderError(next);

    if (orderError) {
      setAlertMessage({ ok: false, text: orderError });
      return;
    }

    setIsSaving(true);
    setAlertMessage(null);

    try {
      for (const change of planAlertChanges(product.stock?.alerts ?? [], next)) {
        if (change.action === 'remove') {
          await productApi.removeAlert(product.id, change.alertType);
        } else {
          await productApi.setAlert(product.id, change.alertType, change.threshold);
        }
      }

      setAlertMessage({ ok: true, text: 'Đã lưu các mốc cảnh báo.' });
    } catch (error) {
      setAlertMessage({ ok: false, text: (error as Error).message });
    } finally {
      setIsSaving(false);
      await load();
    }
  }

  function updateThreshold(alertType: StockAlertType, patch: Partial<ThresholdField>) {
    setThresholds((current) => (current ? { ...current, [alertType]: { ...current[alertType], ...patch } } : current));
  }

  if (loadError) {
    return (
      <div style={page}>
        <Link href='/vendors/stocks' style={link}>
          ← Tồn kho
        </Link>
        <div style={errorBox}>Lỗi: {loadError}</div>
      </div>
    );
  }

  if (!product || !thresholds) return <p style={page}>Đang tải...</p>;

  const stock = product.stock?.stock ?? 0;
  const status = getStockStatus(stock, product.stock?.alerts ?? []);
  const isOwner = account?.id === product.vendorId;

  return (
    <div style={page}>
      <Head>
        <title>{`Tồn kho · ${product.title}`}</title>
      </Head>

      <Link href='/vendors/stocks' style={link}>
        ← Tồn kho
      </Link>

      <h1 style={h1}>{product.title}</h1>
      <p style={muted}>
        Tồn kho hiện tại: <b style={{ color: '#111827', fontSize: 16 }}>{stock}</b> {product.unit} · Trạng thái:{' '}
        <b style={{ color: '#111827' }}>{STOCK_STATUS_LABELS[status]}</b> ·{' '}
        <Link href={`/vendors/products/${product.id}`} style={link}>
          Xem sản phẩm
        </Link>
      </p>

      {!isOwner && <div style={errorBox}>Sản phẩm này không thuộc cửa hàng của bạn, bạn không thể điều chỉnh.</div>}

      {/* ---------- Manage Stocks ---------- */}
      <h2 style={h2}>Điều chỉnh tồn kho</h2>
      <form style={card} onSubmit={(event) => void handleAdjust(event)}>
        <div style={row}>
          <select style={input} value={mode} onChange={(event) => setMode(event.target.value as AdjustMode)} aria-label='Cách điều chỉnh'>
            <option value='add'>Nhập thêm (+)</option>
            <option value='subtract'>Xuất bớt (−)</option>
            <option value='set'>Đặt số mới</option>
          </select>
          <input
            type='number'
            min={0}
            value={amount}
            onChange={(event) => setAmount(event.target.value)}
            placeholder='Số lượng'
            aria-label='Số lượng'
            style={{ ...input, width: 120 }}
          />
          <span style={muted}>{product.unit}</span>
          <button type='submit' style={button} disabled={isSaving || !isOwner}>
            Cập nhật
          </button>
        </div>
        {adjustMessage && <div style={adjustMessage.ok ? successBox : errorBox}>{adjustMessage.text}</div>}
      </form>

      {/* ---------- Configure Stock Alerts ---------- */}
      <h2 style={h2}>Mốc cảnh báo</h2>
      <form style={card} onSubmit={(event) => void handleSaveThresholds(event)}>
        <p style={{ ...muted, marginTop: 0 }}>
          Trạng thái tồn kho được tính theo các mốc này. Các mốc phải tăng dần: Tối thiểu &lt; Cần nhập lại &lt; Tối đa.
        </p>

        {STOCK_ALERT_TYPES.map((alertType) => (
          <div key={alertType} style={{ ...row, marginBottom: 8 }}>
            <label style={{ ...row, width: 170 }}>
              <input
                type='checkbox'
                checked={thresholds[alertType].enabled}
                onChange={(event) => updateThreshold(alertType, { enabled: event.target.checked })}
              />
              {STOCK_ALERT_LABELS[alertType]}
            </label>
            <input
              type='number'
              min={0}
              value={thresholds[alertType].value}
              disabled={!thresholds[alertType].enabled}
              onChange={(event) => updateThreshold(alertType, { value: event.target.value })}
              aria-label={`Giá trị mốc ${STOCK_ALERT_LABELS[alertType]}`}
              style={{ ...input, width: 120 }}
            />
            <span style={muted}>{product.unit}</span>
          </div>
        ))}

        <button type='submit' style={button} disabled={isSaving || !isOwner}>
          Lưu các mốc
        </button>
        {alertMessage && <div style={alertMessage.ok ? successBox : errorBox}>{alertMessage.text}</div>}
      </form>
    </div>
  );
};

StockDetailPage.getLayout = function getLayout(page: React.ReactElement) {
  return (
    <VendorShellLayout>
      <VendorLayout>{page}</VendorLayout>
    </VendorShellLayout>
  );
};

export default StockDetailPage;
