import { useEffect, useState, type CSSProperties } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';

import { ApiError } from '@/lib/api';
import { collectionApi } from '@/services/collections';

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

export default function EditCollectionPage() {
	const router = useRouter();
	const id = router.query.id as string | undefined;

	const [form, setForm] = useState({
		name: '',
		slug: '',
		description: '',
		isActive: true,
	});

	const [loading, setLoading] = useState(true);
	const [saving, setSaving] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [details, setDetails] = useState<unknown>(null);

	useEffect(() => {
		if (!id) return;

		collectionApi
			.getById(id)
			.then((res) => {
				const c = res.data;
				setForm({
					name: c.name,
					slug: c.slug,
					description: c.description ?? '',
					isActive: c.isActive,
				});
			})
			.catch((err) => setError((err as Error).message))
			.finally(() => setLoading(false));
	}, [id]);

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();

		if (!id) return;

		setSaving(true);
		setError(null);
		setDetails(null);

		try {
			await collectionApi.update(id, {
				name: form.name,
				slug: form.slug,
				description: form.description || null,
				isActive: form.isActive,
			});

			router.push(`/collections/${id}`);
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
			<Link href={`/collections/${id}`} style={link}>
				← Chi tiết
			</Link>

			<h1 style={h1}>Sửa bộ sưu tập</h1>

			<form onSubmit={handleSubmit} style={{ marginTop: 20 }}>
				<label style={label}>
					Tên
					<input
						style={input}
						value={form.name}
						onChange={(e) =>
							setForm({ ...form, name: e.target.value })
						}
					/>
				</label>

				<label style={label}>
					Slug
					<input
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

				<div style={row}>
					<button
						type="submit"
						disabled={saving}
						style={buttonPrimary}
					>
						{saving ? 'Đang lưu...' : 'Lưu thay đổi'}
					</button>
					<Link href={`/collections/${id}`} style={button}>
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
}
