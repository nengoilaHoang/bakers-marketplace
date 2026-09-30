import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useState, type FormEvent } from 'react';
import GoogleOAuthButton from '@/components/authen/GoogleOAuthButton';
import request, { ApiError } from '@/lib/api';

export default function LoginPage() {
	const router = useRouter();
	const [email, setEmail] = useState('');
	const [password, setPassword] = useState('');
	const [submitting, setSubmitting] = useState(false);
	const [error, setError] = useState<string | null>(null);

	const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
		event.preventDefault();
		setSubmitting(true);
		setError(null);

		try {
			await request('/authen/login', {
				method: 'POST',
				body: JSON.stringify({ email: email.trim(), password }),
			});
			await router.replace('/');
		} catch (requestError) {
			setError(
				requestError instanceof ApiError
					? requestError.message
					: 'Không thể đăng nhập. Vui lòng thử lại.',
			);
		} finally {
			setSubmitting(false);
		}
	};

	return (
		<>
			<Head>
				<title>Đăng nhập | Bakers Marketplace</title>
				<meta name='description' content='Đăng nhập vào Bakers Marketplace.' />
			</Head>

			<main className='flex min-h-screen items-center justify-center bg-white px-4 py-12 text-zinc-950 sm:px-6'>
				<section className='w-full max-w-md'>
					<Link
						href='/'
						className='mb-10 inline-flex text-sm font-medium text-zinc-600 transition-colors hover:text-black focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-black'
					>
						<span aria-hidden='true'>←</span>
						<span className='ml-2'>Về trang chủ</span>
					</Link>

					<div className='border border-zinc-200 bg-white p-6 shadow-[0_20px_60px_rgba(0,0,0,0.08)] sm:p-9'>
						<p className='text-xs font-bold uppercase tracking-[0.2em] text-zinc-500'>
							Bakers Marketplace
						</p>
						<h1 className='mt-3 text-3xl font-semibold tracking-tight'>Đăng nhập</h1>
						<p className='mt-2 text-sm leading-6 text-zinc-600'>
							Nhập email và mật khẩu để tiếp tục.
						</p>

						<div className='mt-8'>
							<GoogleOAuthButton flow='login' onError={setError}>
								Đăng nhập bằng Google
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
							<label className='block text-sm font-medium' htmlFor='email'>
								Email
								<input
									id='email'
									name='email'
									type='email'
									autoComplete='email'
									required
									maxLength={255}
									value={email}
									onChange={(event) => setEmail(event.target.value)}
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
									autoComplete='current-password'
									required
									value={password}
									onChange={(event) => setPassword(event.target.value)}
									className='mt-2 block w-full border border-zinc-300 bg-white px-3.5 py-3 text-sm outline-none transition hover:border-zinc-500 focus:border-black focus:ring-1 focus:ring-black'
								/>
							</label>
							<div className='-mt-2 text-right'>
								<Link
									href='/authen/forgot-password'
									className='text-xs font-semibold text-zinc-600 underline decoration-zinc-300 underline-offset-4 transition hover:text-black hover:decoration-black focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-black'
								>
									Quên mật khẩu?
								</Link>
							</div>

							{error && (
								<div role='alert' className='border border-black bg-zinc-50 px-4 py-3 text-sm leading-6'>
									{error}
								</div>
							)}

							<button
								type='submit'
								disabled={submitting}
								className='flex w-full cursor-pointer items-center justify-center bg-black px-4 py-3.5 text-sm font-semibold text-white transition hover:bg-zinc-800 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-black disabled:cursor-wait disabled:bg-zinc-400'
							>
								{submitting ? 'Đang đăng nhập...' : 'Đăng nhập'}
							</button>
						</form>

						<p className='mt-7 text-center text-sm text-zinc-600'>
							Chưa có tài khoản?{' '}
							<Link
								href='/authen/register'
								className='cursor-pointer font-semibold text-black underline decoration-zinc-400 underline-offset-4 hover:decoration-black focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-black'
							>
								Đăng ký
							</Link>
						</p>
					</div>
				</section>
			</main>
		</>
	);
}
