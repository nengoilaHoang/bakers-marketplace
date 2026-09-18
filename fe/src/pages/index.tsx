import type { CSSProperties } from 'react';
import Link from 'next/link';

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

const h2: CSSProperties = {
	fontSize: 16,
	fontWeight: 600,
	margin: '28px 0 8px',
	paddingBottom: 6,
	borderBottom: '1px solid #e5e7eb',
};

const muted: CSSProperties = { color: '#6b7280', fontSize: 13 };

const card: CSSProperties = {
	display: 'block',
	border: '1px solid #e5e7eb',
	borderRadius: 8,
	padding: '14px 16px',
	marginBottom: 12,
	color: '#2563eb',
	textDecoration: 'none',
};

const links = [
	{
		group: 'Products',
		items: [
			{ href: '/products', label: 'Danh sách sản phẩm' },
			{ href: '/products/new', label: 'Tạo sản phẩm' },
			{ href: '/products/search', label: 'Tìm kiếm sản phẩm' },
		],
	},
	{
		group: 'Collections',
		items: [
			{ href: '/collections', label: 'Danh sách bộ sưu tập' },
			{ href: '/collections/new', label: 'Tạo bộ sưu tập' },
		],
	},
];

export default function Home() {
	return (
		<div style={page}>
			<h1 style={h1}>Bakers Marketplace</h1>
			<p style={muted}>UI thô để test API. Giao diện sẽ làm sau.</p>

			{links.map((section) => (
				<div key={section.group}>
					<h2 style={h2}>{section.group}</h2>

					{section.items.map((item) => (
						<Link key={item.href} href={item.href} style={card}>
							{item.label}
							<span style={{ ...muted, marginLeft: 8 }}>
								{item.href}
							</span>
						</Link>
					))}
				</div>
			))}

			<p style={{ ...muted, marginTop: 32, fontSize: 12 }}>
				API: {process.env.NEXT_PUBLIC_API_URL ?? '(chưa cấu hình)'}
			</p>
		</div>
	);
}
