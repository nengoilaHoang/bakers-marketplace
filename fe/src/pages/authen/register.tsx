import Head from 'next/head';
import Link from 'next/link';
import { useState, type FormEvent } from 'react';
import GoogleOAuthButton from '@/components/authen/GoogleOAuthButton';
import request, { ApiError } from '@/lib/api';
import AuthLayout from '@/components/layout/AuthLayout';

export default function RegisterPage() {
	const [form, setForm] = useState({
		displayName: '',
		email: '',
		password: '',
		confirmPassword: '',
	});
	const [submitting, setSubmitting] = useState(false);
	const [submittedEmail, setSubmittedEmail] = useState<string | null>(null);
	const [error, setError] = useState<string | null>(null);

	const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
		event.preventDefault();
		setError(null);

		if (form.password !== form.confirmPassword) {
			setError('Mật khẩu xác nhận không khớp.');
			return;
		}

		setSubmitting(true);

		try {
			await request<{ message: string }>('/authen/register', {
				method: 'POST',
				body: JSON.stringify({
					displayName: form.displayName.trim(),
					email: form.email.trim(),
					password: form.password,
				}),
			});

			setSubmittedEmail(form.email.trim());
		} catch (requestError) {
			setError(
				requestError instanceof ApiError
					? requestError.message
					: 'Không thể gửi yêu cầu đăng ký. Vui lòng thử lại.',
			);
		} finally {
			setSubmitting(false);
		}
	};

	return (
		<>
			<Head>
				<title>Đăng ký | Bakers Marketplace</title>
				<meta
					name='description'
					content='Tạo tài khoản Bakers Marketplace bằng email.'
				/>
			</Head>

			<section className='w-full max-w-md'>
				<Link
					href='/'
					className='mb-10 inline-flex text-sm font-medium text-zinc-600 transition-colors hover:text-black focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-black'
				>
					<span aria-hidden='true'>←</span>
					<span className='ml-2'>Về trang chủ</span>
				</Link>

				<div className='border border-zinc-200 bg-white p-6 shadow-[0_20px_60px_rgba(0,0,0,0.08)] sm:p-9'>
					{submittedEmail ? (
						<div aria-live='polite' className='py-6 text-center'>
							<div className='mx-auto flex size-12 items-center justify-center rounded-full bg-black text-xl text-white'>
								✓
							</div>
							<h1 className='mt-6 text-2xl font-semibold tracking-tight'>
								Kiểm tra email của bạn
							</h1>
							<p className='mt-3 text-sm leading-6 text-zinc-600'>
								Chúng tôi đã gửi liên kết xác minh tới{' '}
								<strong className='font-semibold text-black'>
									{submittedEmail}
								</strong>
								. Mở email và bấm vào liên kết để hoàn tất đăng ký.
							</p>
							<p className='mt-3 border border-zinc-200 bg-zinc-50 px-4 py-3 text-xs leading-5 text-zinc-600'>
								Nếu chưa thấy email, hãy kiểm tra thư mục Spam hoặc Thư rác.
							</p>
							<button
								type='button'
								onClick={() => setSubmittedEmail(null)}
								className='mt-7 cursor-pointer text-sm font-semibold underline decoration-zinc-400 underline-offset-4 hover:decoration-black focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-black'
							>
								Dùng email khác
							</button>
						</div>
					) : (
						<>
							<p className='text-xs font-bold uppercase tracking-[0.2em] text-zinc-500'>
								Bakers Marketplace
							</p>
							<h1 className='mt-3 text-3xl font-semibold tracking-tight'>
								Tạo tài khoản
							</h1>
							<p className='mt-2 text-sm leading-6 text-zinc-600'>
								Điền đầy đủ thông tin. Chúng tôi sẽ gửi email để xác minh tài khoản của bạn.
							</p>

							<div className='mt-8'>
								<GoogleOAuthButton flow='register' onError={setError}>
									Đăng ký bằng Google
								</GoogleOAuthButton>
							</div>

							<div className='my-6 flex items-center gap-4' aria-hidden='true'>
								<div className='h-px flex-1 bg-zinc-200' />
								<span className='text-xs font-medium uppercase tracking-wider text-zinc-400'>
									hoặc
								</span>
								<div className='h-px flex-1 bg-zinc-200' />
							</div>

							<form className='space-y-5' onSubmit={handleSubmit}>
								<label className='block text-sm font-medium' htmlFor='displayName'>
									Tên hiển thị
									<input
										id='displayName'
										name='displayName'
										type='text'
										autoComplete='name'
										required
										minLength={1}
										maxLength={255}
										value={form.displayName}
										onChange={(event) =>
											setForm({ ...form, displayName: event.target.value })
										}
										className='mt-2 block w-full border border-zinc-300 bg-white px-3.5 py-3 text-sm outline-none transition placeholder:text-zinc-400 hover:border-zinc-500 focus:border-black focus:ring-1 focus:ring-black'
										placeholder='Nguyễn Văn An'
									/>
								</label>

								<label className='block text-sm font-medium' htmlFor='email'>
									Email
									<input
										id='email'
										name='email'
										type='email'
										autoComplete='email'
										required
										maxLength={255}
										value={form.email}
										onChange={(event) =>
											setForm({ ...form, email: event.target.value })
										}
										className='mt-2 block w-full border border-zinc-300 bg-white px-3.5 py-3 text-sm outline-none transition placeholder:text-zinc-400 hover:border-zinc-500 focus:border-black focus:ring-1 focus:ring-black'
										placeholder='ban@example.com'
									/>
								</label>

								<label className='block text-sm font-medium' htmlFor='password'>
									Mật khẩu
									<input
										id='password'
										name='password'
										type='password'
										autoComplete='new-password'
										required
										minLength={8}
										maxLength={72}
										value={form.password}
										onChange={(event) =>
											setForm({ ...form, password: event.target.value })
										}
										className='mt-2 block w-full border border-zinc-300 bg-white px-3.5 py-3 text-sm outline-none transition hover:border-zinc-500 focus:border-black focus:ring-1 focus:ring-black'
									/>
									<span className='mt-1.5 block text-xs font-normal text-zinc-500'>
										Từ 8 đến 72 ký tự.
									</span>
								</label>

								<label className='block text-sm font-medium' htmlFor='confirmPassword'>
									Xác nhận mật khẩu
									<input
										id='confirmPassword'
										name='confirmPassword'
										type='password'
										autoComplete='new-password'
										required
										minLength={8}
										maxLength={72}
										value={form.confirmPassword}
										onChange={(event) =>
											setForm({ ...form, confirmPassword: event.target.value })
										}
										className='mt-2 block w-full border border-zinc-300 bg-white px-3.5 py-3 text-sm outline-none transition hover:border-zinc-500 focus:border-black focus:ring-1 focus:ring-black'
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
									className='flex w-full cursor-pointer items-center justify-center bg-black px-4 py-3.5 text-sm font-semibold text-white transition hover:bg-zinc-800 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-black disabled:cursor-not-allowed disabled:bg-zinc-400'
								>
									{submitting ? 'Đang gửi email...' : 'Đăng ký'}
								</button>
							</form>

							<p className='mt-7 text-center text-sm text-zinc-600'>
								Đã có tài khoản?{' '}
								<Link
									href='/authen/login'
									className='font-semibold text-black underline decoration-zinc-400 underline-offset-4 transition hover:decoration-black focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-black'
								>
									Đăng nhập
								</Link>
							</p>
						</>
					)}
				</div>
			</section>
		</>
	);
}

RegisterPage.getLayout = function getLayout(page: React.ReactElement) {
	return <AuthLayout>{page}</AuthLayout>;
};
