import Head from 'next/head';
import { useEffect, useState } from 'react';

import AppLayout from '@/components/layout/AppLayout';
import request, { ApiError } from '@/lib/api';

type AccountInfo = {
	displayName: string;
	email: string;
};

type ResetEmailStatus = 'idle' | 'sending' | 'success' | 'error';

export default function SettingsPage() {
	const [account, setAccount] = useState<AccountInfo | null>(null);
	const [status, setStatus] = useState<ResetEmailStatus>('idle');
	const [message, setMessage] = useState<string | null>(null);

	useEffect(() => {
		let isActive = true;

		void request<{ data: AccountInfo }>('/authen/session')
			.then(({ data }) => {
				if (isActive) setAccount(data);
			})
			.catch(() => {
				// Proxy đã chặn khách, lỗi ở đây chỉ làm thiếu phần thông tin tài khoản.
			});

		return () => {
			isActive = false;
		};
	}, []);

	const sendResetEmail = async () => {
		setStatus('sending');
		setMessage(null);

		try {
			await request<{ message: string }>('/authen/reset-password/me', {
				method: 'POST',
			});
			setStatus('success');
			setMessage(
				'Email đổi mật khẩu đã được gửi. Hãy mở email và sử dụng liên kết trong vòng 15 phút. Nếu chưa thấy email, hãy kiểm tra thư mục Spam hoặc Thư rác.',
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

	return (
		<>
			<Head>
				<title>Cài đặt | Bakers Marketplace</title>
			</Head>

			<div className='mx-auto max-w-2xl'>
				<h1 className='text-3xl font-semibold tracking-tight'>Cài đặt</h1>

				<section className='mt-8 rounded-2xl border border-zinc-200 bg-white p-6'>
					<h2 className='text-lg font-semibold'>Tài khoản</h2>
					<dl className='mt-4 grid grid-cols-[8rem_1fr] gap-y-2 text-sm'>
						<dt className='text-zinc-500'>Tên hiển thị</dt>
						<dd>{account?.displayName ?? '…'}</dd>
						<dt className='text-zinc-500'>Email</dt>
						<dd>{account?.email ?? '…'}</dd>
					</dl>
				</section>

				<section
					aria-live='polite'
					className='mt-6 rounded-2xl border border-zinc-200 bg-white p-6'
				>
					<h2 className='text-lg font-semibold'>Đổi mật khẩu</h2>
					<p className='mt-2 text-sm leading-6 text-zinc-600'>
						Chúng tôi sẽ gửi liên kết đổi mật khẩu tới email của bạn.
					</p>
					<button
						type='button'
						onClick={() => void sendResetEmail()}
						disabled={status === 'sending'}
						className='mt-4 inline-flex min-h-10 cursor-pointer items-center justify-center rounded-full bg-zinc-950 px-4 text-sm font-medium text-white transition hover:bg-zinc-700 disabled:cursor-wait disabled:bg-zinc-400 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-zinc-950'
					>
						{status === 'sending'
							? 'Đang gửi...'
							: status === 'success'
								? 'Gửi lại email'
								: 'Gửi email đổi mật khẩu'}
					</button>
					{message && (
						<p
							role={status === 'error' ? 'alert' : undefined}
							className={`mt-4 text-sm leading-6 ${status === 'error' ? 'text-red-700' : 'text-zinc-600'}`}
						>
							{message}
						</p>
					)}
				</section>
			</div>
		</>
	);
}

SettingsPage.getLayout = function getLayout(page: React.ReactElement) {
	return <AppLayout>{page}</AppLayout>;
};
