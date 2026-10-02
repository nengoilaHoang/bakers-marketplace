import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useState, type FormEvent } from 'react';
import request, { ApiError } from '@/lib/api';
import AuthLayout from '@/components/layout/AuthLayout';

export default function ResetPasswordPage() {
	const router = useRouter();
	const [password, setPassword] = useState('');
	const [confirmPassword, setConfirmPassword] = useState('');
	const [submitting, setSubmitting] = useState(false);
	const [passwordChanged, setPasswordChanged] = useState(false);
	const [error, setError] = useState<string | null>(null);

	const code = typeof router.query.code === 'string' ? router.query.code : '';
	const passwordsMismatch = confirmPassword.length > 0 && password !== confirmPassword;

	const logoutAndRedirect = async () => {
		setSubmitting(true);
		setError(null);

		try {
			await request('/authen/logout', { method: 'POST' });
			await router.replace('/');
		} catch (requestError) {
			setError(
				requestError instanceof ApiError
					? `Mật khẩu đã được đổi nhưng chưa thể đăng xuất: ${requestError.message}`
					: 'Mật khẩu đã được đổi nhưng chưa thể đăng xuất. Vui lòng thử lại.',
			);
		} finally {
			setSubmitting(false);
		}
	};

	const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
		event.preventDefault();
		setError(null);

		if (!code) {
			setError('Liên kết đặt lại mật khẩu không hợp lệ.');
			return;
		}

		if (password !== confirmPassword) {
			setError('Mật khẩu xác nhận không khớp.');
			return;
		}

		setSubmitting(true);

		try {
			await request<{ message: string }>(
				`/authen/reset-password/${encodeURIComponent(code)}`,
				{
					method: 'PATCH',
					body: JSON.stringify({ password, confirmPassword }),
				},
			);
			setPasswordChanged(true);
			await logoutAndRedirect();
		} catch (requestError) {
			setError(
				requestError instanceof ApiError
					? requestError.message
					: 'Không thể đổi mật khẩu. Liên kết có thể đã hết hạn.',
			);
		} finally {
			setSubmitting(false);
		}
	};

	return (
		<>
			<Head>
				<title>Đặt lại mật khẩu | Bakers Marketplace</title>
				<meta name='description' content='Tạo mật khẩu mới cho tài khoản Bakers Marketplace.' />
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
					{passwordChanged ? (
						<div aria-live='polite' className='py-5 text-center'>
							<div className='mx-auto flex size-12 items-center justify-center rounded-full bg-black text-xl text-white'>
								✓
							</div>
							<h1 className='mt-6 text-2xl font-semibold tracking-tight'>
								Mật khẩu đã được thay đổi
							</h1>
							<p className='mt-3 text-sm leading-6 text-zinc-600'>
								{submitting
									? 'Đang đăng xuất và đưa bạn về trang chủ...'
									: 'Hãy đăng nhập lại bằng mật khẩu mới.'}
							</p>

							{error && (
								<div
									role='alert'
									className='mt-5 border border-black bg-zinc-50 px-4 py-3 text-left text-sm leading-6'
								>
									{error}
								</div>
							)}

							{!submitting && (
								<button
									type='button'
									onClick={() => void logoutAndRedirect()}
									className='mt-7 w-full cursor-pointer bg-black px-4 py-3.5 text-sm font-semibold text-white transition hover:bg-zinc-800 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-black'
								>
									Đăng xuất và về trang chủ
								</button>
							)}
						</div>
					) : (
						<>
							<p className='text-xs font-bold uppercase tracking-[0.2em] text-zinc-500'>
								Bakers Marketplace
							</p>
							<h1 className='mt-3 text-3xl font-semibold tracking-tight'>
								Tạo mật khẩu mới
							</h1>
							<p className='mt-2 text-sm leading-6 text-zinc-600'>
								Mật khẩu mới phải có từ 8 đến 72 ký tự và được nhập giống nhau ở cả
								 hai ô.
							</p>

							{router.isReady && !code ? (
								<div role='alert' className='mt-7 border border-black bg-zinc-50 px-4 py-3 text-sm leading-6'>
									Liên kết đặt lại mật khẩu không hợp lệ.
								</div>
							) : (
								<form className='mt-8 space-y-5' onSubmit={handleSubmit}>
									<label className='block text-sm font-medium' htmlFor='password'>
										Mật khẩu mới
										<input
											id='password'
											name='password'
											type='password'
											autoComplete='new-password'
											autoFocus
											required
											minLength={8}
											maxLength={72}
											value={password}
											onChange={(event) => setPassword(event.target.value)}
											className='mt-2 block w-full border border-zinc-300 bg-white px-3.5 py-3 text-sm outline-none transition hover:border-zinc-500 focus:border-black focus:ring-1 focus:ring-black'
										/>
									</label>

									<label className='block text-sm font-medium' htmlFor='confirmPassword'>
										Nhập lại mật khẩu mới
										<input
											id='confirmPassword'
											name='confirmPassword'
											type='password'
											autoComplete='new-password'
											required
											minLength={8}
											maxLength={72}
											value={confirmPassword}
											onChange={(event) => setConfirmPassword(event.target.value)}
											aria-invalid={passwordsMismatch}
											aria-describedby={passwordsMismatch ? 'password-match-error' : undefined}
											className='mt-2 block w-full border border-zinc-300 bg-white px-3.5 py-3 text-sm outline-none transition hover:border-zinc-500 focus:border-black focus:ring-1 focus:ring-black'
										/>
										{passwordsMismatch && (
											<span id='password-match-error' className='mt-1.5 block text-xs font-normal text-zinc-700'>
												Hai mật khẩu chưa giống nhau.
											</span>
										)}
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
										disabled={submitting || !router.isReady || passwordsMismatch}
										className='flex w-full cursor-pointer items-center justify-center bg-black px-4 py-3.5 text-sm font-semibold text-white transition hover:bg-zinc-800 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-black disabled:cursor-not-allowed disabled:bg-zinc-400'
									>
										{submitting ? 'Đang đổi mật khẩu...' : 'Đổi mật khẩu'}
									</button>
								</form>
							)}
						</>
					)}
				</div>
			</section>
		</>
	);
}

ResetPasswordPage.getLayout = function getLayout(page: React.ReactElement) {
	return <AuthLayout>{page}</AuthLayout>;
};
