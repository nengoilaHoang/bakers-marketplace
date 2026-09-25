import { useEffect, useState, type CSSProperties } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';

import { ApiError } from '@/lib/api';
import { productApi } from '@/services/products';
import { NextPageWithLayout } from '@/pages/_app';
import VendorLayout from '@/components/layout/VendorLayout';

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

const button: CSSProperties = {
  display: 'inline-block',
  padding: '5px 12px',
  border: '1px solid #d1d5db',
  borderRadius: 6,
  background: '#fff',
  color: '#111827',
  cursor: 'pointer',
  fontSize: 13,
  textDecoration: 'none',
  fontFamily: 'inherit',
  lineHeight: 1.6,
};

const buttonPrimary: CSSProperties = {
  ...button,
  background: '#2563eb',
  borderColor: '#2563eb',
  color: '#fff',
  fontWeight: 500,
};

const row: CSSProperties = {
  display: 'flex',
  gap: 8,
  alignItems: 'center',
  flexWrap: 'wrap',
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
}> = [
  { key: 'title', label: 'Tên sản phẩm' },
  { key: 'slug', label: 'Slug' },
  { key: 'description', label: 'Mô tả' },
  { key: 'unitPrice', label: 'Giá bán', type: 'number' },
  { key: 'unitCost', label: 'Giá vốn', type: 'number' },
  { key: 'unit', label: 'Đơn vị' },
  { key: 'expirationDate', label: 'Hạn sử dụng', type: 'date' },
];

const EditProductPage: NextPageWithLayout = () => {
  const router = useRouter();
  const id = router.query.id as string | undefined;

  const [form, setForm] = useState(initialForm);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [details, setDetails] = useState<unknown>(null);

  useEffect(() => {
    if (!id) return;

    productApi
      .getById(id)
      .then((res) => {
        const p = res.data;
        setForm({
          title: p.title,
          slug: p.slug,
          description: p.description ?? '',
          unitPrice: String(p.unitPrice),
          unitCost: String(p.unitCost),
          unit: p.unit,
          expirationDate: p.expirationDate?.slice(0, 10) ?? '',
        });
      })
      .catch((err) => setError((err as Error).message))
      .finally(() => setLoading(false));
  }, [id]);

  const handleSubmit = async (e: React.SubmitEvent) => {
    e.preventDefault();

    if (!id) return;

    setSaving(true);
    setError(null);
    setDetails(null);

    try {
      await productApi.update(id, {
        title: form.title,
        description: form.description || null,
        slug: form.slug,
        unitPrice: Number(form.unitPrice),
        unitCost: Number(form.unitCost),
        unit: form.unit,
        expirationDate: form.expirationDate || null,
      });

      router.push(`/vendors/products/${id}`);
    } catch (err) {
      setError((err as Error).message);

      if (err instanceof ApiError) {
        setDetails(err.details);
      }
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <p style={page}>Đang tải...</p>;

  return (
    <div style={page}>
      <Link href={`/vendors/products/${id}`} style={link}>
        ← Chi tiết
      </Link>

      <h1 style={h1}>Sửa sản phẩm</h1>

      <form onSubmit={handleSubmit} style={{ marginTop: 20 }}>
        {fields.map((f) => (
          <label key={f.key} style={label}>
            {f.label}
            <input
              type={f.type ?? 'text'}
              style={input}
              value={form[f.key]}
              onChange={(e) => setForm({ ...form, [f.key]: e.target.value })}
            />
          </label>
        ))}

        <div style={row}>
          <button type='submit' disabled={saving} style={buttonPrimary}>
            {saving ? 'Đang lưu...' : 'Lưu thay đổi'}
          </button>
          <Link href={`/vendors/products/${id}`} style={button}>
            Hủy
          </Link>
        </div>
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

EditProductPage.getLayout = function getLayout(page) {
  return <VendorLayout>{page}</VendorLayout>;
};

export default EditProductPage;
