import Head from 'next/head';
import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import request, { ApiError } from '@/lib/api';

export default function ChangePasswordPage() {
	const requestStarted = useRef(false);
	const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
	const [message, setMessage] = useState('Đang gửi email đổi mật khẩu...');

	const sendResetEmail = async () => {
		setStatus('loading');
		setMessage('Đang gửi email đổi mật khẩu...');

		try {
			await request<{ message: string }>('/authen/reset-password/me', {
				method: 'POST',
			});
			setStatus('success');
			setMessage(
				'Email đổi mật khẩu đã được gửi. Hãy mở email và sử dụng liên kết trong vòng 15 phút.',
			);
		} catch (requestError) {
			setStatus('error');
			setMessage(
				requestError instanceof ApiError
					? requestError.message
					: 'Không thể gửi email đổi mật khẩu. Vui lòng thử lại.',
			);
		}
	};

	useEffect(() => {
		if (requestStarted.current) {
			return;
		}

		requestStarted.current = true;
		void sendResetEmail();
	}, []);

	return (
		<>
			<Head>
				<title>Đổi mật khẩu | Bakers Marketplace</title>
			</Head>

			<main className='flex min-h-screen items-center justify-center bg-white px-4 py-12 text-zinc-950 sm:px-6'>
				<section
					aria-live='polite'
					className='w-full max-w-md border border-zinc-200 bg-white p-7 text-center shadow-[0_20px_60px_rgba(0,0,0,0.08)] sm:p-10'
				>
					{status === 'loading' && (
						<div
							aria-hidden='true'
							className='mx-auto size-11 animate-spin rounded-full border-2 border-zinc-200 border-t-black'
						/>
					)}
					{status === 'success' && (
						<div className='mx-auto flex size-12 items-center justify-center rounded-full bg-black text-xl text-white'>
							✓
						</div>
					)}
					{status === 'error' && (
						<div className='mx-auto flex size-12 items-center justify-center rounded-full border-2 border-black text-xl font-semibold'>
							!
						</div>
					)}

					<p className='mt-6 text-xs font-bold uppercase tracking-[0.2em] text-zinc-500'>
						Bakers Marketplace
					</p>
					<h1 className='mt-3 text-2xl font-semibold tracking-tight'>
						{status === 'loading'
							? 'Đang chuẩn bị liên kết'
							: status === 'success'
								? 'Kiểm tra email của bạn'
								: 'Không thể gửi email'}
					</h1>
					<p className='mt-3 text-sm leading-6 text-zinc-600'>{message}</p>

					{status === 'success' && (
						<p className='mt-4 border border-zinc-200 bg-zinc-50 px-4 py-3 text-xs leading-5 text-zinc-600'>
							Nếu chưa thấy email, hãy kiểm tra thư mục Spam hoặc Thư rác.
						</p>
					)}

					<div className='mt-8 flex flex-col gap-3'>
						{status === 'error' && (
							<button
								type='button'
								onClick={() => void sendResetEmail()}
								className='w-full cursor-pointer bg-black px-4 py-3.5 text-sm font-semibold text-white transition hover:bg-zinc-800 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-black'
							>
								Thử gửi lại
							</button>
						)}
						{status !== 'loading' && (
							<Link
								href='/'
								className={`${status === 'success' ? 'bg-black text-white hover:bg-zinc-800' : 'border border-zinc-300 text-black hover:border-black hover:bg-zinc-50'} inline-flex w-full items-center justify-center px-4 py-3.5 text-sm font-semibold transition focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-black`}
							>
								Về trang chủ
							</Link>
						)}
					</div>
				</section>
			</main>
		</>
	);
}
