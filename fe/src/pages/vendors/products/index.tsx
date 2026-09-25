import { useEffect, useState, type CSSProperties } from 'react';
import Link from 'next/link';

import { productApi } from '@/services/products';
import { type Product } from '@/types/product';
import { NextPageWithLayout } from '@/pages/_app';
import VendorLayout from '@/components/layout/VendorLayout';

const page: CSSProperties = {
  padding: '24px 32px',
  fontFamily: 'ui-sans-serif, system-ui, -apple-system, sans-serif',
  fontSize: 14,
  lineHeight: 1.6,
  maxWidth: 1200,
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

const toolbar: CSSProperties = {
  display: 'flex',
  gap: 12,
  alignItems: 'center',
  flexWrap: 'wrap',
  margin: '12px 0 20px',
};

const row: CSSProperties = {
  display: 'flex',
  gap: 6,
  alignItems: 'center',
  flexWrap: 'wrap',
};

const table: CSSProperties = {
  width: '100%',
  borderCollapse: 'collapse',
  fontSize: 13,
  border: '1px solid #d1d5db',
};

const th: CSSProperties = {
  textAlign: 'left',
  padding: '9px 12px',
  background: '#f3f4f6',
  border: '1px solid #d1d5db',
  fontWeight: 600,
  whiteSpace: 'nowrap',
};

const td: CSSProperties = {
  padding: '9px 12px',
  border: '1px solid #d1d5db',
  verticalAlign: 'top',
};

const tdRight: CSSProperties = {
  ...td,
  textAlign: 'right',
  whiteSpace: 'nowrap',
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

const buttonDanger: CSSProperties = {
  ...button,
  color: '#dc2626',
  borderColor: '#fca5a5',
};

const chip: CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: 6,
  padding: '3px 10px',
  background: '#f3f4f6',
  color: '#374151',
  borderRadius: 999,
  fontSize: 12,
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

const badge = (ok: boolean): CSSProperties => ({
  display: 'inline-block',
  padding: '2px 9px',
  borderRadius: 999,
  fontSize: 12,
  fontWeight: 500,
  background: ok ? '#dcfce7' : '#f3f4f6',
  color: ok ? '#166534' : '#6b7280',
});

const ProductListPage: NextPageWithLayout = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    setError(null);

    try {
      const res = await productApi.getAll();
      setProducts(res.data);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timeout = setTimeout(() => {
      void load();
    }, 0);

    return () => clearTimeout(timeout);
  }, []);

  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`Xóa "${title}"?`)) return;

    try {
      await productApi.remove(id);
      await load();
    } catch (err) {
      alert((err as Error).message);
    }
  };

  return (
    <div style={page}>
      <h1 style={h1}>
        Sản phẩm{' '}
        <span style={{ ...muted, fontWeight: 400 }}>({products.length})</span>
      </h1>

      <div style={toolbar}>
        <Link href='/vendors/products/new' style={buttonPrimary}>
          + Tạo sản phẩm
        </Link>
        <Link href='/vendors/products/search' style={button}>
          Tìm kiếm
        </Link>
        <button style={button} onClick={load}>
          Tải lại
        </button>
      </div>

      {loading && <p style={muted}>Đang tải...</p>}
      {error && <div style={errorBox}>Lỗi: {error}</div>}

      {!loading && !error && products.length === 0 && (
        <p style={muted}>Chưa có sản phẩm nào.</p>
      )}

      {!loading && !error && products.length > 0 && (
        <div style={{ overflowX: 'auto' }}>
          <table style={table}>
            <thead>
              <tr>
                <th style={th}>Tên</th>
                <th style={{ ...th, textAlign: 'right' }}>Giá bán</th>
                <th style={{ ...th, textAlign: 'right' }}>Giá vốn</th>
                <th style={{ ...th, textAlign: 'right' }}>Tồn</th>
                <th style={th}>Tags</th>
                <th style={th}>Bộ sưu tập</th>
                <th style={th}></th>
              </tr>
            </thead>
            <tbody>
              {products.map((p) => (
                <tr key={p.id}>
                  <td style={td}>
                    <Link href={`/vendors/products/${p.id}`} style={link}>
                      {p.title}
                    </Link>
                    <div style={{ ...muted, fontSize: 12 }}>
                      {p.slug} · {p.unit}
                    </div>
                  </td>

                  <td style={tdRight}>{p.unitPrice.toLocaleString('vi-VN')}</td>
                  <td style={{ ...tdRight, color: '#6b7280' }}>
                    {p.unitCost.toLocaleString('vi-VN')}
                  </td>

                  <td style={tdRight}>
                    <span style={badge((p.stock?.stock ?? 0) > 0)}>
                      {p.stock?.stock ?? 0}
                    </span>
                  </td>

                  <td style={td}>
                    <div style={row}>
                      {p.tags.map((t) => (
                        <span key={t.id} style={chip}>
                          {t.name}
                        </span>
                      ))}
                      {p.tags.length === 0 && <span style={muted}>—</span>}
                    </div>
                  </td>

                  <td style={td}>
                    {p.collections.map((c) => c.name).join(', ') || (
                      <span style={muted}>—</span>
                    )}
                  </td>

                  <td style={{ ...td, whiteSpace: 'nowrap' }}>
                    <div style={row}>
                      <Link href={`/vendors/products/${p.id}`} style={button}>
                        Xem
                      </Link>
                      <Link
                        href={`/vendors/products/${p.id}/edit`}
                        style={button}
                      >
                        Sửa
                      </Link>
                      <button
                        style={buttonDanger}
                        onClick={() => handleDelete(p.id, p.title)}
                      >
                        Xóa
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

ProductListPage.getLayout = function getLayout(page) {
  return <VendorLayout>{page}</VendorLayout>;
};

export default ProductListPage;
