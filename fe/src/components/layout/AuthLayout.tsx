import type { ReactNode } from 'react';

type AuthLayoutProps = Readonly<{
	children: ReactNode;
}>;

export default function AuthLayout({ children }: AuthLayoutProps) {
	return (
		<main className='flex min-h-screen items-center justify-center bg-white px-4 py-12 text-zinc-950 sm:px-6'>
			{children}
		</main>
	);
}
