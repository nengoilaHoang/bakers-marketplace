import Head from 'next/head';
import Link from 'next/link';
import { useState, type FormEvent } from 'react';
import request, { ApiError } from '@/lib/api';
import AuthLayout from '@/components/layout/AuthLayout';

export default function ForgotPasswordPage() {
	const [email, setEmail] = useState('');
	const [submittedEmail, setSubmittedEmail] = useState<string | null>(null);
	const [submitting, setSubmitting] = useState(false);
	const [error, setError] = useState<string | null>(null);

	const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
		event.preventDefault();
		setSubmitting(true);
		setError(null);
		const normalizedEmail = email.trim();

		try {
			await request<{ message: string }>('/authen/reset-password', {
				method: 'POST',
				body: JSON.stringify({ email: normalizedEmail }),
			});
			setSubmittedEmail(normalizedEmail);
		} catch (requestError) {
			setError(
				requestError instanceof ApiError
					? requestError.message
					: 'Không thể gửi email đặt lại mật khẩu. Vui lòng thử lại.',
			);
		} finally {
			setSubmitting(false);
		}
	};

	return (
		<>
			<Head>
				<title>Quên mật khẩu | Bakers Marketplace</title>
				<meta
					name='description'
					content='Nhận liên kết đặt lại mật khẩu Bakers Marketplace qua email.'
				/>
			</Head>

			<section className='w-full max-w-md'>
				<Link
					href='/authen/login'
					className='mb-10 inline-flex text-sm font-medium text-zinc-600 transition-colors hover:text-black focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-black'
				>
					<span aria-hidden='true'>←</span>
					<span className='ml-2'>Về trang đăng nhập</span>
				</Link>

				<div className='border border-zinc-200 bg-white p-6 shadow-[0_20px_60px_rgba(0,0,0,0.08)] sm:p-9'>
					{submittedEmail ? (
						<div aria-live='polite' className='py-5 text-center'>
							<div className='mx-auto flex size-12 items-center justify-center rounded-full bg-black text-xl text-white'>
								✓
							</div>
							<h1 className='mt-6 text-2xl font-semibold tracking-tight'>
								Kiểm tra email của bạn
							</h1>
							<p className='mt-3 text-sm leading-6 text-zinc-600'>
								Liên kết đặt lại mật khẩu đã được gửi tới{' '}
								<strong className='font-semibold text-black'>{submittedEmail}</strong>.
							</p>
							<p className='mt-4 border border-zinc-200 bg-zinc-50 px-4 py-3 text-xs leading-5 text-zinc-600'>
								Liên kết có hiệu lực trong 15 phút. Nếu chưa thấy email, hãy kiểm tra
								 thư mục Spam hoặc Thư rác.
							</p>
							<div className='mt-7 flex flex-col gap-3'>
								<Link
									href='/authen/login'
									className='inline-flex w-full items-center justify-center bg-black px-4 py-3.5 text-sm font-semibold text-white transition hover:bg-zinc-800 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-black'
								>
									Về trang đăng nhập
								</Link>
								<button
									type='button'
									onClick={() => {
										setSubmittedEmail(null);
										setError(null);
									}}
									className='cursor-pointer border border-zinc-300 px-4 py-3 text-sm font-semibold transition hover:border-black hover:bg-zinc-50 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-black'
								>
									Dùng email khác
								</button>
							</div>
						</div>
					) : (
						<>
							<p className='text-xs font-bold uppercase tracking-[0.2em] text-zinc-500'>
								Bakers Marketplace
							</p>
							<h1 className='mt-3 text-3xl font-semibold tracking-tight'>
								Quên mật khẩu?
							</h1>
							<p className='mt-2 text-sm leading-6 text-zinc-600'>
								Nhập email dùng để đăng nhập. Chúng tôi sẽ gửi cho bạn một liên kết
								 để tạo mật khẩu mới.
							</p>

							<form className='mt-8 space-y-5' onSubmit={handleSubmit}>
								<label className='block text-sm font-medium' htmlFor='email'>
									Email
									<input
										id='email'
										name='email'
										type='email'
										autoComplete='email'
										autoFocus
										required
										maxLength={255}
										value={email}
										onChange={(event) => setEmail(event.target.value)}
										className='mt-2 block w-full border border-zinc-300 bg-white px-3.5 py-3 text-sm outline-none transition placeholder:text-zinc-400 hover:border-zinc-500 focus:border-black focus:ring-1 focus:ring-black'
										placeholder='ban@example.com'
									/>
								</label>

								{error && (
									<div
										role='alert'
										className='border border-black bg-zinc-50 px-4 py-3 text-sm leading-6'
									>
										{error}
									</div>
								)}

								<button
									type='submit'
									disabled={submitting}
									className='flex w-full cursor-pointer items-center justify-center bg-black px-4 py-3.5 text-sm font-semibold text-white transition hover:bg-zinc-800 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-black disabled:cursor-wait disabled:bg-zinc-400'
								>
									{submitting ? 'Đang gửi email...' : 'Gửi liên kết đặt lại mật khẩu'}
								</button>
							</form>
						</>
					)}
				</div>
			</section>
		</>
	);
}

ForgotPasswordPage.getLayout = function getLayout(page: React.ReactElement) {
	return <AuthLayout>{page}</AuthLayout>;
};
