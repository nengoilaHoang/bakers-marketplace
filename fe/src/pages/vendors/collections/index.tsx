import { useEffect, useState, type CSSProperties } from "react";
import Link from "next/link";

import { collectionApi } from "@/services/collections";
import { type Collection } from "@/types/collection";

const page: CSSProperties = {
  padding: "24px 32px",
  fontFamily: "ui-sans-serif, system-ui, -apple-system, sans-serif",
  fontSize: 14,
  lineHeight: 1.6,
  maxWidth: 900,
  margin: "0 auto",
  background: "#fff",
  color: "#111827",
  minHeight: "100vh",
  colorScheme: "light",
};

const h1: CSSProperties = {
  fontSize: 22,
  fontWeight: 600,
  margin: "12px 0 4px",
};

const muted: CSSProperties = { color: "#6b7280", fontSize: 13 };

const link: CSSProperties = { color: "#2563eb", textDecoration: "none" };

const toolbar: CSSProperties = {
  display: "flex",
  gap: 12,
  alignItems: "center",
  flexWrap: "wrap",
  margin: "12px 0 20px",
};

const row: CSSProperties = {
  display: "flex",
  gap: 6,
  alignItems: "center",
  flexWrap: "wrap",
};

const table: CSSProperties = {
  width: "100%",
  borderCollapse: "collapse",
  fontSize: 13,
  border: "1px solid #d1d5db",
};

const th: CSSProperties = {
  textAlign: "left",
  padding: "9px 12px",
  background: "#f3f4f6",
  border: "1px solid #d1d5db",
  fontWeight: 600,
  whiteSpace: "nowrap",
};

const td: CSSProperties = {
  padding: "9px 12px",
  border: "1px solid #d1d5db",
  verticalAlign: "top",
};

const button: CSSProperties = {
  display: "inline-block",
  padding: "5px 12px",
  border: "1px solid #d1d5db",
  borderRadius: 6,
  background: "#fff",
  color: "#111827",
  cursor: "pointer",
  fontSize: 13,
  textDecoration: "none",
  fontFamily: "inherit",
  lineHeight: 1.6,
};

const buttonPrimary: CSSProperties = {
  ...button,
  background: "#2563eb",
  borderColor: "#2563eb",
  color: "#fff",
  fontWeight: 500,
};

const buttonDanger: CSSProperties = {
  ...button,
  color: "#dc2626",
  borderColor: "#fca5a5",
};

const errorBox: CSSProperties = {
  marginTop: 16,
  padding: "10px 14px",
  background: "#fef2f2",
  border: "1px solid #fecaca",
  borderRadius: 6,
  color: "#b91c1c",
  fontSize: 13,
};

const badge = (ok: boolean): CSSProperties => ({
  display: "inline-block",
  padding: "2px 9px",
  borderRadius: 999,
  fontSize: 12,
  fontWeight: 500,
  background: ok ? "#dcfce7" : "#f3f4f6",
  color: ok ? "#166534" : "#6b7280",
});

export default function CollectionListPage() {
  const [collections, setCollections] = useState<Collection[]>([]);
  const [onlyActive, setOnlyActive] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async (active: boolean) => {
      setLoading(true);
      setError(null);

      try {
        const res = await collectionApi.getAll(active);
        setCollections(res.data);
      } catch (err) {
        setError((err as Error).message);
      } finally {
        setLoading(false);
      }
    };

    load(onlyActive);
  }, [onlyActive]);

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Xóa "${name}"?`)) return;

    try {
      await collectionApi.remove(id);
      await load(onlyActive);
    } catch (err) {
      alert((err as Error).message);
    }
  };

  return (
    <div style={page}>
      <Link href="/" style={link}>
        ← Trang chủ
      </Link>

      <h1 style={h1}>
        Bộ sưu tập{" "}
        <span style={{ ...muted, fontWeight: 400 }}>
          ({collections.length})
        </span>
      </h1>

      <div style={toolbar}>
        <Link href="/collections/new" style={buttonPrimary}>
          + Tạo bộ sưu tập
        </Link>

        <label style={{ ...row, fontSize: 13 }}>
          <input
            type="checkbox"
            checked={onlyActive}
            onChange={(e) => setOnlyActive(e.target.checked)}
          />
          Chỉ hiện đang hoạt động
        </label>
      </div>

      {loading && <p style={muted}>Đang tải...</p>}
      {error && <div style={errorBox}>Lỗi: {error}</div>}

      {!loading && !error && collections.length === 0 && (
        <p style={muted}>Chưa có bộ sưu tập nào.</p>
      )}

      {!loading && !error && collections.length > 0 && (
        <table style={table}>
          <thead>
            <tr>
              <th style={th}>Tên</th>
              <th style={th}>Mô tả</th>
              <th style={th}>Trạng thái</th>
              <th style={th}></th>
            </tr>
          </thead>
          <tbody>
            {collections.map((c) => (
              <tr key={c.id}>
                <td style={td}>
                  <Link href={`/collections/${c.id}`} style={link}>
                    {c.name}
                  </Link>
                  <div style={{ ...muted, fontSize: 12 }}>{c.slug}</div>
                </td>

                <td style={{ ...td, color: "#6b7280" }}>
                  {c.description ?? "—"}
                </td>

                <td style={td}>
                  <span style={badge(c.isActive)}>
                    {c.isActive ? "Hoạt động" : "Tắt"}
                  </span>
                </td>

                <td style={{ ...td, whiteSpace: "nowrap" }}>
                  <div style={row}>
                    <Link href={`/collections/${c.id}`} style={button}>
                      Xem
                    </Link>
                    <Link href={`/collections/${c.id}/edit`} style={button}>
                      Sửa
                    </Link>
                    <button
                      style={buttonDanger}
                      onClick={() => handleDelete(c.id, c.name)}
                    >
                      Xóa
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
