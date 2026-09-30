import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useEffect, useRef, useState } from 'react';
import request, { ApiError } from '@/lib/api';

export default function VerifyEmailPage() {
	const router = useRouter();
	const requestedCode = useRef<string | null>(null);
	const [attempt, setAttempt] = useState(0);
	const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
	const [message, setMessage] = useState('Đang xác minh địa chỉ email của bạn...');

	useEffect(() => {
		if (!router.isReady) {
			return;
		}

		const code = typeof router.query.code === 'string' ? router.query.code : '';
		const controller = new AbortController();
		const requestTimer = window.setTimeout(() => {
			if (!code) {
				setStatus('error');
				setMessage('Liên kết xác minh không hợp lệ.');
				return;
			}

			if (requestedCode.current === `${code}:${attempt}`) {
				return;
			}

			requestedCode.current = `${code}:${attempt}`;
			setStatus('loading');
			setMessage('Đang xác minh địa chỉ email của bạn...');

			void request(`/authen/verify/${encodeURIComponent(code)}`, {
				method: 'GET',
				signal: controller.signal,
			})
				.then(() => {
					setStatus('success');
					setMessage('Email đã được xác minh và tài khoản của bạn đã sẵn sàng.');
				})
				.catch((requestError: unknown) => {
					if (requestError instanceof DOMException && requestError.name === 'AbortError') {
						return;
					}

					setStatus('error');
					setMessage(
						requestError instanceof ApiError
							? requestError.message
							: 'Không thể xác minh email. Liên kết có thể đã hết hạn.',
					);
				});
		}, 0);

		return () => {
			window.clearTimeout(requestTimer);
			controller.abort();
		};
	}, [attempt, router.isReady, router.query.code]);

	return (
		<>
			<Head>
				<title>Xác minh email | Bakers Marketplace</title>
			</Head>

			<main className='flex min-h-screen items-center justify-center bg-white px-4 py-12 text-zinc-950 sm:px-6'>
				<section
					aria-live='polite'
					className='w-full max-w-md border border-zinc-200 bg-white p-7 text-center shadow-[0_20px_60px_rgba(0,0,0,0.08)] sm:p-10'
				>
					{status === 'loading' && (
						<>
							<div
								aria-hidden='true'
								className='mx-auto size-11 animate-spin rounded-full border-2 border-zinc-200 border-t-black'
							/>
							<p className='mt-6 text-xs font-bold uppercase tracking-[0.2em] text-zinc-500'>
								Bakers Marketplace
							</p>
							<h1 className='mt-3 text-2xl font-semibold tracking-tight'>
								Xác minh email
							</h1>
						</>
					)}

					{status === 'success' && (
						<>
							<div className='mx-auto flex size-12 items-center justify-center rounded-full bg-black text-xl text-white'>
								✓
							</div>
							<h1 className='mt-6 text-2xl font-semibold tracking-tight'>
								Xác minh thành công
							</h1>
						</>
					)}

					{status === 'error' && (
						<>
							<div className='mx-auto flex size-12 items-center justify-center rounded-full border-2 border-black text-xl font-semibold'>
								!
							</div>
							<h1 className='mt-6 text-2xl font-semibold tracking-tight'>
								Không thể xác minh
							</h1>
						</>
					)}

					<p className='mt-3 text-sm leading-6 text-zinc-600'>{message}</p>

					{status === 'success' && (
						<Link
							href='/'
							className='mt-8 inline-flex w-full items-center justify-center bg-black px-4 py-3.5 text-sm font-semibold text-white transition hover:bg-zinc-800 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-black'
						>
							Tiếp tục
						</Link>
					)}

					{status === 'error' && (
						<div className='mt-8 flex flex-col gap-3'>
							<button
								type='button'
								onClick={() => setAttempt((current) => current + 1)}
								className='w-full cursor-pointer bg-black px-4 py-3.5 text-sm font-semibold text-white transition hover:bg-zinc-800 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-black'
							>
								Thử lại
							</button>
							<Link
								href='/authen/register'
								className='inline-flex w-full items-center justify-center border border-zinc-300 px-4 py-3 text-sm font-semibold transition hover:border-black hover:bg-zinc-50 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-black'
							>
								Đăng ký lại
							</Link>
						</div>
					)}
				</section>
			</main>
		</>
	);
}
