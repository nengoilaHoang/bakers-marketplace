import { useState, type CSSProperties } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';

import { ApiError, collectionApi } from '@/lib/api';

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

const row: CSSProperties = {
	display: 'flex',
	gap: 6,
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

export default function NewCollectionPage() {
	const router = useRouter();

	const [form, setForm] = useState({
		name: '',
		slug: '',
		description: '',
		isActive: true,
	});

	const [error, setError] = useState<string | null>(null);
	const [details, setDetails] = useState<unknown>(null);
	const [saving, setSaving] = useState(false);

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setSaving(true);
		setError(null);
		setDetails(null);

		try {
			const created = await collectionApi.create({
				name: form.name,
				slug: form.slug,
				description: form.description || null,
				isActive: form.isActive,
			});

			router.push(`/collections/${created.id}`);
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
			<Link href="/collections" style={link}>
				← Danh sách
			</Link>

			<h1 style={h1}>Tạo bộ sưu tập</h1>

			<form onSubmit={handleSubmit} style={{ marginTop: 20 }}>
				<label style={label}>
					Tên<span style={{ color: '#dc2626' }}> *</span>
					<input
						required
						style={input}
						value={form.name}
						onChange={(e) =>
							setForm({ ...form, name: e.target.value })
						}
					/>
				</label>

				<label style={label}>
					Slug<span style={{ color: '#dc2626' }}> *</span>
					<span style={{ ...muted, fontWeight: 400 }}>
						{' '}
						· vd: banh-trung-thu
					</span>
					<input
						required
						style={input}
						value={form.slug}
						onChange={(e) =>
							setForm({ ...form, slug: e.target.value })
						}
					/>
				</label>

				<label style={label}>
					Mô tả
					<input
						style={input}
						value={form.description}
						onChange={(e) =>
							setForm({ ...form, description: e.target.value })
						}
					/>
				</label>

				<label style={{ ...row, marginBottom: 18, fontSize: 13 }}>
					<input
						type="checkbox"
						checked={form.isActive}
						onChange={(e) =>
							setForm({ ...form, isActive: e.target.checked })
						}
					/>
					Đang hoạt động
				</label>

				<button type="submit" disabled={saving} style={buttonPrimary}>
					{saving ? 'Đang lưu...' : 'Tạo bộ sưu tập'}
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
}
