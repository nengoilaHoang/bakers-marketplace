import { useEffect, useState, type CSSProperties } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';

import {
	productApi,
	collectionApi,
	type Product,
	type Collection,
	type StockAlert,
} from '@/lib/api';

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

const buttonX: CSSProperties = {
	border: 'none',
	background: 'none',
	cursor: 'pointer',
	color: '#dc2626',
	padding: 0,
	fontSize: 14,
};

const input: CSSProperties = {
	padding: '7px 10px',
	border: '1px solid #d1d5db',
	borderRadius: 6,
	fontSize: 13,
	fontFamily: 'inherit',
	background: '#fff',
	color: '#111827',
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

const ALERT_TYPES: StockAlert['alertType'][] = [
	'MINIMUM',
	'REORDER',
	'MAXIMUM',
];

export default function ProductDetailPage() {
	const router = useRouter();
	const id = router.query.id as string | undefined;

	const [product, setProduct] = useState<Product | null>(null);
	const [collections, setCollections] = useState<Collection[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	const [tagName, setTagName] = useState('');
	const [noteContent, setNoteContent] = useState('');
	const [stockValue, setStockValue] = useState('');
	const [alertType, setAlertType] =
		useState<StockAlert['alertType']>('MINIMUM');
	const [threshold, setThreshold] = useState('');
	const [collectionId, setCollectionId] = useState('');

	const load = async () => {
		if (!id) return;

		setLoading(true);
		setError(null);

		try {
			const [p, cs] = await Promise.all([
				productApi.getById(id),
				collectionApi.getAll(),
			]);

			setProduct(p);
			setCollections(cs);
			setStockValue(String(p.stock?.stock ?? 0));
		} catch (err) {
			setError((err as Error).message);
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		load();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [id]);

	const run = async (fn: () => Promise<unknown>) => {
		try {
			await fn();
			await load();
		} catch (err) {
			alert((err as Error).message);
		}
	};

	if (loading) return <p style={page}>Đang tải...</p>;

	if (error)
		return (
			<div style={page}>
				<Link href="/products" style={link}>
					← Danh sách
				</Link>
				<div style={errorBox}>Lỗi: {error}</div>
			</div>
		);

	if (!product) return <p style={page}>Không tìm thấy.</p>;

	const info: Array<[string, React.ReactNode]> = [
		['Slug', product.slug],
		['Mô tả', product.description ?? '—'],
		[
			'Giá bán',
			`${product.unitPrice.toLocaleString('vi-VN')} ${product.currency}`,
		],
		[
			'Giá vốn',
			`${product.unitCost.toLocaleString('vi-VN')} ${product.currency}`,
		],
		['Đơn vị', product.unit],
		['Hạn sử dụng', product.expirationDate?.slice(0, 10) ?? '—'],
		['Brand ID', <code key="b">{product.brandId}</code>],
		[
			'Vendor ID',
			product.vendorId ? <code key="v">{product.vendorId}</code> : '—',
		],
		['ID', <code key="i">{product.id}</code>],
	];

	const alerts = product.stock?.alerts ?? [];

	return (
		<div style={page}>
			<Link href="/products" style={link}>
				← Danh sách
			</Link>

			<h1 style={h1}>{product.title}</h1>

			<div style={toolbar}>
				<Link
					href={`/products/${product.id}/edit`}
					style={buttonPrimary}
				>
					Sửa sản phẩm
				</Link>
			</div>

			{/* ---------- thông tin ---------- */}
			<h2 style={h2}>Thông tin</h2>

			<table style={table}>
				<tbody>
					{info.map(([key, value]) => (
						<tr key={key}>
							<td style={{ ...td, width: 140, color: '#6b7280' }}>
								{key}
							</td>
							<td style={td}>{value}</td>
						</tr>
					))}
				</tbody>
			</table>

			{/* ---------- tồn kho ---------- */}
			<h2 style={h2}>Tồn kho</h2>

			<div style={card}>
				<div style={row}>
					<span style={badge((product.stock?.stock ?? 0) > 0)}>
						{product.stock?.stock ?? 0} {product.unit}
					</span>

					<input
						type="number"
						style={{ ...input, width: 110 }}
						value={stockValue}
						onChange={(e) => setStockValue(e.target.value)}
					/>
					<button
						style={button}
						onClick={() =>
							run(() =>
								productApi.updateStock(
									product.id,
									Number(stockValue),
								),
							)
						}
					>
						Cập nhật
					</button>
				</div>
			</div>

			<div style={card}>
				<div style={{ ...muted, marginBottom: 10 }}>
					Ngưỡng cảnh báo
				</div>

				{alerts.length === 0 && (
					<p style={muted}>Chưa đặt ngưỡng nào.</p>
				)}

				{alerts.map((a) => (
					<div key={a.id} style={{ ...row, marginBottom: 8 }}>
						<span style={{ ...chip, minWidth: 90 }}>
							{a.alertType}
						</span>
						<b>{a.threshold}</b>
						<button
							style={buttonDanger}
							onClick={() =>
								run(() =>
									productApi.removeAlert(product.id, a.alertType),
								)
							}
						>
							Xóa
						</button>
					</div>
				))}

				<div style={{ ...row, marginTop: 12 }}>
					<select
						style={input}
						value={alertType}
						onChange={(e) =>
							setAlertType(e.target.value as StockAlert['alertType'])
						}
					>
						{ALERT_TYPES.map((t) => (
							<option key={t} value={t}>
								{t}
							</option>
						))}
					</select>
					<input
						type="number"
						placeholder="ngưỡng"
						style={{ ...input, width: 110 }}
						value={threshold}
						onChange={(e) => setThreshold(e.target.value)}
					/>
					<button
						style={button}
						onClick={() =>
							run(async () => {
								await productApi.setAlert(
									product.id,
									alertType,
									Number(threshold),
								);
								setThreshold('');
							})
						}
					>
						Đặt ngưỡng
					</button>
				</div>
			</div>

			{/* ---------- tags ---------- */}
			<h2 style={h2}>Tags ({product.tags.length})</h2>

			<div style={card}>
				<div style={{ ...row, marginBottom: 12 }}>
					{product.tags.map((t) => (
						<span key={t.id} style={chip}>
							{t.name}
							<button
								style={buttonX}
								onClick={() =>
									run(() =>
										productApi.removeTag(product.id, t.name),
									)
								}
							>
								×
							</button>
						</span>
					))}
					{product.tags.length === 0 && (
						<span style={muted}>Chưa có tag nào.</span>
					)}
				</div>

				<div style={row}>
					<input
						placeholder="tên tag"
						style={{ ...input, width: 200 }}
						value={tagName}
						onChange={(e) => setTagName(e.target.value)}
					/>
					<button
						style={button}
						onClick={() =>
							run(async () => {
								await productApi.addTag(product.id, tagName);
								setTagName('');
							})
						}
					>
						Thêm tag
					</button>
				</div>
			</div>

			{/* ---------- ghi chú ---------- */}
			<h2 style={h2}>Ghi chú ({product.notes.length})</h2>

			<div style={card}>
				{product.notes.length === 0 && (
					<p style={muted}>Chưa có ghi chú nào.</p>
				)}

				{product.notes.map((n) => (
					<div
						key={n.id}
						style={{
							...row,
							justifyContent: 'space-between',
							paddingBottom: 8,
							marginBottom: 8,
							borderBottom: '1px solid #f1f2f4',
						}}
					>
						<span>{n.content}</span>
						<button
							style={buttonDanger}
							onClick={() =>
								run(() => productApi.removeNote(product.id, n.id))
							}
						>
							Xóa
						</button>
					</div>
				))}

				<div style={{ ...row, marginTop: 12 }}>
					<input
						placeholder="nội dung ghi chú"
						style={{ ...input, flex: 1, minWidth: 260 }}
						value={noteContent}
						onChange={(e) => setNoteContent(e.target.value)}
					/>
					<button
						style={button}
						onClick={() =>
							run(async () => {
								await productApi.addNote(product.id, noteContent);
								setNoteContent('');
							})
						}
					>
						Thêm
					</button>
				</div>
			</div>

			{/* ---------- bộ sưu tập ---------- */}
			<h2 style={h2}>Bộ sưu tập ({product.collections.length})</h2>

			<div style={card}>
				<div style={{ ...row, marginBottom: 12 }}>
					{product.collections.map((c) => (
						<span key={c.id} style={chip}>
							{c.name}
							<button
								style={buttonX}
								onClick={() =>
									run(() =>
										productApi.removeFromCollection(
											product.id,
											c.id,
										),
									)
								}
							>
								×
							</button>
						</span>
					))}
					{product.collections.length === 0 && (
						<span style={muted}>Chưa thuộc bộ sưu tập nào.</span>
					)}
				</div>

				<div style={row}>
					<select
						style={input}
						value={collectionId}
						onChange={(e) => setCollectionId(e.target.value)}
					>
						<option value="">— chọn bộ sưu tập —</option>
						{collections.map((c) => (
							<option key={c.id} value={c.id}>
								{c.name}
							</option>
						))}
					</select>
					<button
						style={button}
						disabled={!collectionId}
						onClick={() =>
							run(async () => {
								await productApi.assignToCollection(
									product.id,
									collectionId,
								);
								setCollectionId('');
							})
						}
					>
						Gán vào
					</button>
				</div>
			</div>

			{/* ---------- ảnh ---------- */}
			<h2 style={h2}>Ảnh ({product.media.length})</h2>

			<div style={card}>
				{product.media.length === 0 ? (
					<p style={muted}>
						Chưa có ảnh — backend chưa có API upload.
					</p>
				) : (
					product.media.map((m) => (
						<div key={m.id} style={{ marginBottom: 6 }}>
							<code style={{ fontSize: 12 }}>{m.url}</code>
						</div>
					))
				)}
			</div>
		</div>
	);
}
