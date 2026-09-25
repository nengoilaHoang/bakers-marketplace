import { useState, type CSSProperties } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';

import { ApiError } from '@/lib/api';
import { productApi } from '@/services/products';
import VendorLayout from '@/components/layout/VendorLayout';
import { NextPageWithLayout } from '@/pages/_app';

const page: CSSProperties = {
  padding: '24px 32px',
  fontFamily: 'ui-sans-serif, system-ui, -apple-system, sans-serif',
  fontSize: 14,
  lineHeight: 1.6,
  maxWidth: 620,
  margin: '0 auto',
  background: '#fff',
  color: '#111827',
  minHeight: '100vh',
  colorScheme: 'light',
};

const h1: CSSProperties = {
  fontSize: 22,
  fontWeight: 600,
  margin: '12px 0 4px',
};

const muted: CSSProperties = { color: '#6b7280', fontSize: 13 };

const link: CSSProperties = { color: '#2563eb', textDecoration: 'none' };

const label: CSSProperties = {
  display: 'block',
  marginBottom: 14,
  fontSize: 13,
  fontWeight: 500,
};

const input: CSSProperties = {
  width: '100%',
  boxSizing: 'border-box',
  marginTop: 4,
  padding: '7px 10px',
  border: '1px solid #d1d5db',
  borderRadius: 6,
  fontSize: 13,
  fontFamily: 'inherit',
  background: '#fff',
  color: '#111827',
};

const buttonPrimary: CSSProperties = {
  display: 'inline-block',
  padding: '5px 12px',
  border: '1px solid #2563eb',
  borderRadius: 6,
  background: '#2563eb',
  color: '#fff',
  fontWeight: 500,
  cursor: 'pointer',
  fontSize: 13,
  fontFamily: 'inherit',
  lineHeight: 1.6,
};

const errorBox: CSSProperties = {
  marginTop: 16,
  padding: '10px 14px',
  background: '#fef2f2',
  border: '1px solid #fecaca',
  borderRadius: 6,
  color: '#b91c1c',
  fontSize: 13,
};

const initialForm = {
  brandId: '',
  vendorId: '',
  title: '',
  slug: '',
  description: '',
  unitPrice: '',
  unitCost: '',
  unit: '',
  expirationDate: '',
};

const fields: Array<{
  key: keyof typeof initialForm;
  label: string;
  type?: string;
  required?: boolean;
  hint?: string;
}> = [
  {
    key: 'brandId',
    label: 'Brand ID',
    required: true,
    hint: 'Lấy từ bảng brands',
  },
  { key: 'vendorId', label: 'Vendor ID', hint: 'Bỏ trống nếu không có' },
  { key: 'title', label: 'Tên sản phẩm', required: true },
  { key: 'slug', label: 'Slug', required: true, hint: 'vd: banh-kem-dau' },
  { key: 'description', label: 'Mô tả' },
  { key: 'unitPrice', label: 'Giá bán', type: 'number', required: true },
  {
    key: 'unitCost',
    label: 'Giá vốn',
    type: 'number',
    required: true,
    hint: 'Phải nhỏ hơn hoặc bằng giá bán',
  },
  { key: 'unit', label: 'Đơn vị', required: true, hint: 'cái, hộp, ổ...' },
  { key: 'expirationDate', label: 'Hạn sử dụng', type: 'date' },
];

const NewProductPage: NextPageWithLayout = () => {
  const router = useRouter();

  const [form, setForm] = useState(initialForm);
  const [error, setError] = useState<string | null>(null);
  const [details, setDetails] = useState<unknown>(null);
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.SubmitEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setDetails(null);

    try {
      const res = await productApi.create({
        brandId: form.brandId,
        vendorId: form.vendorId || null,
        title: form.title,
        description: form.description || null,
        slug: form.slug,
        unitPrice: Number(form.unitPrice),
        unitCost: Number(form.unitCost),
        unit: form.unit,
        expirationDate: form.expirationDate || null,
      });

      router.push(`/vendors/products/${res.data.id}`);
    } catch (err) {
      setError((err as Error).message);

      if (err instanceof ApiError) {
        setDetails(err.details);
      }
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={page}>
      <Link href='/vendors/products' style={link}>
        ← Danh sách
      </Link>

      <h1 style={h1}>Tạo sản phẩm</h1>

      <form onSubmit={handleSubmit} style={{ marginTop: 20 }}>
        {fields.map((f) => (
          <label key={f.key} style={label}>
            {f.label}
            {f.required && <span style={{ color: '#dc2626' }}> *</span>}
            {f.hint && (
              <span style={{ ...muted, fontWeight: 400 }}> · {f.hint}</span>
            )}
            <input
              type={f.type ?? 'text'}
              required={f.required}
              style={input}
              value={form[f.key]}
              onChange={(e) => setForm({ ...form, [f.key]: e.target.value })}
            />
          </label>
        ))}

        <button type='submit' disabled={saving} style={buttonPrimary}>
          {saving ? 'Đang lưu...' : 'Tạo sản phẩm'}
        </button>
      </form>

      {error && (
        <div style={errorBox}>
          <b>Lỗi:</b> {error}
          {details != null && (
            <pre
              style={{
                fontSize: 12,
                marginTop: 8,
                whiteSpace: 'pre-wrap',
              }}
            >
              {JSON.stringify(details, null, 2)}
            </pre>
          )}
        </div>
      )}
    </div>
  );
};

NewProductPage.getLayout = function getLayout(page) {
  return <VendorLayout>{page}</VendorLayout>;
};

export default NewProductPage;
