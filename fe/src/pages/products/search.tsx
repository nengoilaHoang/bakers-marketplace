import { useState, type CSSProperties } from 'react';
import Link from 'next/link';

import { productApi } from '@/services/products';
import { type Product } from '@/types/product';

const page: CSSProperties = {
	padding: '24px 32px',
	fontFamily: 'ui-sans-serif, system-ui, -apple-system, sans-serif',
	fontSize: 14,
	lineHeight: 1.6,
	maxWidth: 760,
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
	gap: 8,
	alignItems: 'center',
	flexWrap: 'wrap',
};

const input: CSSProperties = {
	width: 300,
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

const card: CSSProperties = {
	border: '1px solid #e5e7eb',
	borderRadius: 8,
	padding: '14px 16px',
	marginBottom: 12,
};

const chip: CSSProperties = {
	display: 'inline-flex',
	alignItems: 'center',
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

export default function SearchPage() {
	const [keyword, setKeyword] = useState('');
	const [results, setResults] = useState<Product[] | null>(null);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);

	const handleSearch = async (e: React.FormEvent) => {
		e.preventDefault();
		setLoading(true);
		setError(null);

		try {
			const res = await productApi.search(keyword);
			setResults(res.data);
		} catch (err) {
			setError((err as Error).message);
			setResults(null);
		} finally {
			setLoading(false);
		}
	};

	return (
		<div style={page}>
			<Link href="/products" style={link}>
				← Danh sách sản phẩm
			</Link>

			<h1 style={h1}>Tìm kiếm sản phẩm</h1>

			<form onSubmit={handleSearch} style={toolbar}>
				<input
					placeholder="nhập từ khóa..."
					style={input}
					value={keyword}
					onChange={(e) => setKeyword(e.target.value)}
				/>
				<button type="submit" disabled={loading} style={buttonPrimary}>
					{loading ? 'Đang tìm...' : 'Tìm'}
				</button>
			</form>

			{error && <div style={errorBox}>Lỗi: {error}</div>}

			{results && (
				<>
					<p style={muted}>Tìm thấy {results.length} kết quả</p>

					{results.map((p) => (
						<div key={p.id} style={card}>
							<Link
								href={`/products/${p.id}`}
								style={{ ...link, fontWeight: 500 }}
							>
								{p.title}
							</Link>

							<div style={{ ...muted, fontSize: 12 }}>{p.slug}</div>

							<div style={{ ...row, marginTop: 8 }}>
								<b>
									{p.unitPrice.toLocaleString('vi-VN')} {p.currency}
								</b>
								<span style={badge((p.stock?.stock ?? 0) > 0)}>
									tồn {p.stock?.stock ?? 0}
								</span>
								{p.tags.map((t) => (
									<span key={t.id} style={chip}>
										{t.name}
									</span>
								))}
							</div>
						</div>
					))}

					{results.length === 0 && (
						<p style={muted}>Không có kết quả nào.</p>
					)}
				</>
			)}
		</div>
	);
}
