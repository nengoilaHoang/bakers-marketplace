import { useRouter } from 'next/router';
import { useCallback, useEffect, useState, type FormEvent } from 'react';

import VendorLayout from '@/components/layout/VendorLayout';
import VendorScope from '@/components/layout/VendorScope';
import StockLevelBar from '@/components/stock/StockLevelBar';
import StockStatusBadge from '@/components/stock/StockStatusBadge';
import Alert from '@/components/ui/Alert';
import Button, { ButtonLink } from '@/components/ui/Button';
import Checkbox from '@/components/ui/Checkbox';
import { ErrorState } from '@/components/ui/ErrorState';
import Field from '@/components/ui/Field';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import Panel, { PanelSkeleton } from '@/components/vendor/Panel';
import VendorPage from '@/components/vendor/VendorPage';
import useAuth from '@/hooks/user/useAuthContext';
import type { NextPageWithLayout } from '@/pages/_app';
import { productApi } from '@/services/products';
import type { Product } from '@/types/product';
import type { StockAlertType } from '@/types/stock';
import {
  STOCK_ALERT_LABELS,
  STOCK_ALERT_TYPES,
  getStockStatus,
  getThresholdOrderError,
  planAlertChanges,
} from '@/utils/stockStatus';

type AdjustMode = 'set' | 'add' | 'subtract';

type Message = { ok: boolean; text: string };

type ThresholdField = { enabled: boolean; value: string };
type ThresholdForm = Record<StockAlertType, ThresholdField>;

const ADJUST_LABELS: Record<AdjustMode, string> = {
  add: 'Nhập thêm (+)',
  subtract: 'Xuất bớt (−)',
  set: 'Đặt số mới',
};

function toThresholdForm(product: Product): ThresholdForm {
  const alerts = product.stock?.alerts ?? [];

  return Object.fromEntries(
    STOCK_ALERT_TYPES.map((alertType) => {
      const alert = alerts.find((item) => item.alertType === alertType);
      return [
        alertType,
        {
          enabled: Boolean(alert),
          value: alert ? String(alert.threshold) : '',
        },
      ];
    }),
  ) as ThresholdForm;
}

const StockDetailPage: NextPageWithLayout = () => {
  const router = useRouter();
  const productId =
    typeof router.query.productId === 'string'
      ? router.query.productId
      : undefined;
  const { account } = useAuth();

  const [product, setProduct] = useState<Product | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);

  const [mode, setMode] = useState<AdjustMode>('add');
  const [amount, setAmount] = useState('');
  const [adjustMessage, setAdjustMessage] = useState<Message | null>(null);

  const [thresholds, setThresholds] = useState<ThresholdForm | null>(null);
  const [alertMessage, setAlertMessage] = useState<Message | null>(null);
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
    const isValid =
      Number.isInteger(value) && (mode === 'set' ? value >= 0 : value > 0);

    if (!isValid) {
      setAdjustMessage({
        ok: false,
        text: mode === 'set' ? 'Nhập số nguyên ≥ 0.' : 'Nhập số nguyên dương.',
      });
      return;
    }

    setIsSaving(true);
    setAdjustMessage(null);

    try {
      if (mode === 'set') {
        await productApi.updateStock(product.id, value);
      } else {
        await productApi.adjustStock(
          product.id,
          mode === 'add' ? value : -value,
        );
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
        setAlertMessage({
          ok: false,
          text: `Mốc "${STOCK_ALERT_LABELS[alertType]}" phải là số nguyên ≥ 0.`,
        });
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
      for (const change of planAlertChanges(
        product.stock?.alerts ?? [],
        next,
      )) {
        if (change.action === 'remove') {
          await productApi.removeAlert(product.id, change.alertType);
        } else {
          await productApi.setAlert(
            product.id,
            change.alertType,
            change.threshold,
          );
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

  function updateThreshold(
    alertType: StockAlertType,
    patch: Partial<ThresholdField>,
  ) {
    setThresholds((current) =>
      current
        ? { ...current, [alertType]: { ...current[alertType], ...patch } }
        : current,
    );
  }

  const breadcrumb = [
    { label: 'Tồn kho', href: '/vendors/stocks' },
    { label: product?.title ?? 'Chi tiết' },
  ];

  if (loadError) {
    return (
      <VendorPage title='Tồn kho' breadcrumb={breadcrumb} size='narrow'>
        <ErrorState
          title='Không thể tải sản phẩm'
          message={loadError}
          onRetry={() => void load()}
        />
      </VendorPage>
    );
  }

  if (!product || !thresholds) {
    return (
      <VendorPage title='Tồn kho' breadcrumb={breadcrumb} size='narrow'>
        <PanelSkeleton />
        <PanelSkeleton />
      </VendorPage>
    );
  }

  const stock = product.stock?.stock ?? 0;
  const alerts = product.stock?.alerts ?? [];
  const status = getStockStatus(stock, alerts);
  const isOwner = account?.id === product.vendorId;

  return (
    <VendorPage
      title={`Tồn kho · ${product.title}`}
      heading={
        <span className='flex flex-wrap items-center gap-3'>
          {product.title}
          <StockStatusBadge status={status} />
        </span>
      }
      breadcrumb={breadcrumb}
      size='narrow'
      actions={
        <ButtonLink
          href={`/vendors/products/${product.id}`}
          variant='outline'
          size='sm'
        >
          Xem sản phẩm
        </ButtonLink>
      }
    >
      {!isOwner && (
        <Alert tone='warning'>
          Sản phẩm này không thuộc cửa hàng của bạn nên không thể điều chỉnh.
        </Alert>
      )}

      {/* ---------- Track Stock Levels ---------- */}
      <Panel title='Mức tồn kho'>
        <p className='mb-4'>
          <span className='text-display font-semibold text-ink'>{stock}</span>{' '}
          <span className='text-lead text-ink-muted'>{product.unit}</span>
        </p>
        <StockLevelBar
          stock={stock}
          unit={product.unit}
          alerts={alerts}
          status={status}
        />
      </Panel>

      {/* ---------- Manage Stocks ---------- */}
      <Panel
        onSubmit={(event) => void handleAdjust(event)}
        title='Điều chỉnh tồn kho'
        description='Nhập thêm khi có hàng về, xuất bớt khi bán hoặc hỏng, đặt số mới sau khi kiểm kê.'
      >
        <div className='flex flex-wrap items-end gap-3'>
          <Field label='Cách điều chỉnh' htmlFor='adjust-mode' size='sm'>
            <Select
              id='adjust-mode'
              value={mode}
              onChange={(event) => setMode(event.target.value as AdjustMode)}
            >
              {(Object.keys(ADJUST_LABELS) as AdjustMode[]).map((key) => (
                <option key={key} value={key}>
                  {ADJUST_LABELS[key]}
                </option>
              ))}
            </Select>
          </Field>
          <Field
            label={`Số lượng (${product.unit})`}
            htmlFor='adjust-amount'
            size='sm'
          >
            <div className='w-36'>
              <Input
                id='adjust-amount'
                type='number'
                min={0}
                size='sm'
                value={amount}
                onChange={(event) => setAmount(event.target.value)}
                placeholder='0'
              />
            </div>
          </Field>
          <Button type='submit' disabled={isSaving || !isOwner}>
            Cập nhật
          </Button>
        </div>
        {adjustMessage && (
          <Alert
            tone={adjustMessage.ok ? 'success' : 'danger'}
            className='mt-4'
          >
            {adjustMessage.text}
          </Alert>
        )}
      </Panel>

      {/* ---------- Configure Stock Alerts ---------- */}
      <Panel
        onSubmit={(event) => void handleSaveThresholds(event)}
        title='Mốc cảnh báo'
        description='Trạng thái tồn kho được tính theo các mốc này. Các mốc phải tăng dần: Tối thiểu < Cần nhập lại < Tối đa.'
      >
        <div className='flex flex-col gap-3'>
          {STOCK_ALERT_TYPES.map((alertType) => (
            <div key={alertType} className='flex flex-wrap items-center gap-4'>
              <div className='w-44'>
                <Checkbox
                  label={STOCK_ALERT_LABELS[alertType]}
                  checked={thresholds[alertType].enabled}
                  onChange={(event) =>
                    updateThreshold(alertType, {
                      enabled: event.target.checked,
                    })
                  }
                />
              </div>
              <div className='w-36'>
                <Input
                  type='number'
                  min={0}
                  size='sm'
                  value={thresholds[alertType].value}
                  disabled={!thresholds[alertType].enabled}
                  onChange={(event) =>
                    updateThreshold(alertType, { value: event.target.value })
                  }
                  aria-label={`Giá trị mốc ${STOCK_ALERT_LABELS[alertType]}`}
                />
              </div>
              <span className='text-body-sm text-ink-muted'>
                {product.unit}
              </span>
            </div>
          ))}
        </div>

        <Button type='submit' disabled={isSaving || !isOwner} className='mt-5'>
          Lưu các mốc
        </Button>
        {alertMessage && (
          <Alert tone={alertMessage.ok ? 'success' : 'danger'} className='mt-4'>
            {alertMessage.text}
          </Alert>
        )}
      </Panel>
    </VendorPage>
  );
};

StockDetailPage.getLayout = function getLayout(page: React.ReactElement) {
  return (
    <VendorScope>
      <VendorLayout>{page}</VendorLayout>
    </VendorScope>
  );
};

export default StockDetailPage;
