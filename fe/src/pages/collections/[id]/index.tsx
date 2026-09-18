import { useEffect, useState, type CSSProperties } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';

import { collectionApi, type Collection } from '@/lib/api';

const page: CSSProperties = {
	padding: '24px 32px',
	fontFamily: 'ui-sans-serif, system-ui, -apple-system, sans-serif',
	fontSize: 14,
	lineHeight: 1.6,
	maxWidth: 780,
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

const h2: CSSProperties = {
	fontSize: 16,
	fontWeight: 600,
	margin: '28px 0 8px',
	paddingBottom: 6,
	borderBottom: '1px solid #e5e7eb',
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
	gap: 8,
	alignItems: 'center',
	flexWrap: 'wrap',
};

const table: CSSProperties = {
	width: '100%',
	borderCollapse: 'collapse',
	fontSize: 13,
	border: '1px solid #d1d5db',
};

const td: CSSProperties = {
	padding: '9px 12px',
	border: '1px solid #d1d5db',
	verticalAlign: 'top',
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
	textDecoration: 'none',
	fontFamily: 'inherit',
	lineHeight: 1.6,
};

const card: CSSProperties = {
	border: '1px solid #e5e7eb',
	borderRadius: 8,
	padding: '14px 16px',
	marginBottom: 12,
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

export default function CollectionDetailPage() {
	const router = useRouter();
	const id = router.query.id as string | undefined;

	const [collection, setCollection] = useState<Collection | null>(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		if (!id) return;

		collectionApi
			.getById(id)
			.then(setCollection)
			.catch((err) => setError((err as Error).message))
			.finally(() => setLoading(false));
	}, [id]);

	if (loading) return <p style={page}>Đang tải...</p>;

	if (error)
		return (
			<div style={page}>
				<Link href="/collections" style={link}>
					← Danh sách
				</Link>
				<div style={errorBox}>Lỗi: {error}</div>
			</div>
		);

	if (!collection) return <p style={page}>Không tìm thấy.</p>;

	const products = collection.products ?? [];

	return (
		<div style={page}>
			<Link href="/collections" style={link}>
				← Danh sách
			</Link>

			<h1 style={h1}>
				{collection.name}{' '}
				<span style={badge(collection.isActive)}>
					{collection.isActive ? 'Hoạt động' : 'Tắt'}
				</span>
			</h1>

			<div style={toolbar}>
				<Link
					href={`/collections/${collection.id}/edit`}
					style={buttonPrimary}
				>
					Sửa
				</Link>
			</div>

			<h2 style={h2}>Thông tin</h2>

			<table style={table}>
				<tbody>
					{[
						['Slug', collection.slug],
						['Mô tả', collection.description ?? '—'],
						['ID', collection.id],
					].map(([key, value]) => (
						<tr key={key}>
							<td style={{ ...td, width: 120, color: '#6b7280' }}>
								{key}
							</td>
							<td style={td}>{value}</td>
						</tr>
					))}
				</tbody>
			</table>

			<h2 style={h2}>Sản phẩm ({products.length})</h2>

			{products.length === 0 ? (
				<p style={muted}>
					Chưa có sản phẩm nào. Vào trang chi tiết sản phẩm để gán vào
					bộ sưu tập này.
				</p>
			) : (
				products.map((p) => (
					<div key={p.id} style={card}>
						<Link
							href={`/products/${p.id}`}
							style={{ ...link, fontWeight: 500 }}
						>
							{p.title}
						</Link>

						<div style={{ ...row, marginTop: 8 }}>
							<b>
								{p.unitPrice.toLocaleString('vi-VN')} {p.currency}
							</b>
							<span style={badge((p.stock?.stock ?? 0) > 0)}>
								tồn {p.stock?.stock ?? 0}
							</span>
						</div>
					</div>
				))
			)}
		</div>
	);
}
