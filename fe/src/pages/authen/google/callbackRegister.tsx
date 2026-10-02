import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useEffect, useRef, useState, type FormEvent } from 'react';
import request, { ApiError } from '@/lib/api';
import AuthLayout from '@/components/layout/AuthLayout';
import {
	consumeGoogleOAuthState,
	getGoogleOAuthRedirectUri,
} from '@/lib/googleOAuth';

function firstQueryValue(value: string | string[] | undefined): string {
	return Array.isArray(value) ? (value[0] ?? '') : (value ?? '');
}

export default function GoogleOAuthRegisterCallbackPage() {
	const router = useRouter();
	const callbackStarted = useRef(false);
	const [authorizationCode, setAuthorizationCode] = useState<string | null>(null);
	const [displayName, setDisplayName] = useState('');
	const [submitting, setSubmitting] = useState(false);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		if (!router.isReady || callbackStarted.current) {
			return;
		}

		callbackStarted.current = true;

		const oauthError = firstQueryValue(router.query.error);
		const oauthErrorDescription = firstQueryValue(
			router.query.error_description,
		);
		const code = firstQueryValue(router.query.code);
		const state = firstQueryValue(router.query.state);

		if (oauthError) {
			consumeGoogleOAuthState(state, 'register');
			queueMicrotask(() =>
				setError(
					oauthErrorDescription ||
						(oauthError === 'access_denied'
							? 'Bạn đã hủy đăng ký bằng Google.'
							: 'Google không thể xác thực tài khoản.'),
				),
			);
			return;
		}

		if (!code || !state || !consumeGoogleOAuthState(state, 'register')) {
			queueMicrotask(() =>
				setError('Yêu cầu đăng ký Google không hợp lệ hoặc đã hết hạn.'),
			);
			return;
		}

		queueMicrotask(() => setAuthorizationCode(code));
	}, [router]);

	const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
		event.preventDefault();
		const normalizedDisplayName = displayName.trim();

		if (!authorizationCode || !normalizedDisplayName) {
			setError('Vui lòng nhập tên hiển thị.');
			return;
		}

		setSubmitting(true);
		setError(null);

		try {
			await request('/authen/register/google', {
				method: 'POST',
				body: JSON.stringify({
					code: authorizationCode,
					redirectUri: getGoogleOAuthRedirectUri('register'),
					displayName: normalizedDisplayName,
				}),
			});

			await router.replace('/');
		} catch (requestError) {
			setError(
				requestError instanceof ApiError
					? requestError.message
					: 'Không thể hoàn tất đăng ký. Vui lòng thử lại.',
			);
		} finally {
			setSubmitting(false);
		}
	};

	return (
		<>
			<Head>
				<title>Hoàn tất đăng ký | Bakers Marketplace</title>
				<meta name='robots' content='noindex' />
			</Head>

			<section className='w-full max-w-md border border-black bg-white p-6 shadow-[8px_8px_0_#000] sm:p-9'>
				{error && !authorizationCode ? (
					<div className='text-center'>
						<p className='text-xs font-bold uppercase tracking-[0.2em]'>
							Bakers Marketplace
						</p>
						<h1 className='mt-3 text-2xl font-semibold tracking-tight'>
							Không thể tiếp tục đăng ký
						</h1>
						<p role='alert' className='mt-3 text-sm leading-6'>
							{error}
						</p>
						<Link
							href='/authen/register'
							className='mt-7 inline-flex border border-black bg-black px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-white hover:text-black focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-black'
						>
							Quay lại đăng ký
						</Link>
					</div>
				) : authorizationCode ? (
					<>
						<p className='text-xs font-bold uppercase tracking-[0.2em]'>
							Bakers Marketplace
						</p>
						<h1 className='mt-3 text-3xl font-semibold tracking-tight'>
							Hoàn tất đăng ký
						</h1>
						<p className='mt-2 text-sm leading-6'>
							Nhập tên hiển thị. Email sẽ được lấy trực tiếp từ tài khoản Google của bạn.
						</p>

						<form className='mt-8 space-y-5' onSubmit={handleSubmit}>
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
									value={displayName}
									onChange={(event) => setDisplayName(event.target.value)}
									className='mt-2 block w-full border border-black bg-white px-3.5 py-3 text-sm text-black outline-none placeholder:text-black focus:ring-2 focus:ring-black'
									placeholder='Nguyễn Văn An'
								/>
							</label>

							{error && (
								<div role='alert' className='border border-black bg-white px-4 py-3 text-sm leading-6'>
									{error}
								</div>
							)}

							<button
								type='submit'
								disabled={submitting}
								className='flex w-full cursor-pointer items-center justify-center border border-black bg-black px-4 py-3.5 text-sm font-semibold text-white transition-colors hover:bg-white hover:text-black focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-black disabled:cursor-wait disabled:bg-white disabled:text-black'
							>
								{submitting ? 'Đang hoàn tất...' : 'Hoàn tất đăng ký'}
							</button>
						</form>
					</>
				) : (
					<div className='py-8 text-center' aria-live='polite'>
						<div className='mx-auto size-9 animate-spin rounded-full border-2 border-black border-t-transparent' />
						<h1 className='mt-6 text-xl font-semibold tracking-tight'>
							Đang xác thực tài khoản Google...
						</h1>
						<p className='mt-2 text-sm'>Vui lòng không đóng trang này.</p>
					</div>
				)}
			</section>
		</>
	);
}

GoogleOAuthRegisterCallbackPage.getLayout = function getLayout(page: React.ReactElement) {
	return <AuthLayout>{page}</AuthLayout>;
};
