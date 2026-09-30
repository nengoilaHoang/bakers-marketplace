import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useEffect, useRef, useState } from 'react';
import request, { ApiError } from '@/lib/api';
import {
	consumeGoogleOAuthState,
	getGoogleOAuthRedirectUri,
} from '@/lib/googleOAuth';

function firstQueryValue(value: string | string[] | undefined): string {
	return Array.isArray(value) ? (value[0] ?? '') : (value ?? '');
}

export default function GoogleOAuthCallbackPage() {
	const router = useRouter();
	const callbackStarted = useRef(false);
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
			consumeGoogleOAuthState(state, 'login');
			queueMicrotask(() => setError(
				oauthErrorDescription ||
					(oauthError === 'access_denied'
						? 'Bạn đã hủy đăng nhập bằng Google.'
						: 'Google không thể xác thực tài khoản.'),
			));
			return;
		}

		if (!code || !state || !consumeGoogleOAuthState(state, 'login')) {
			queueMicrotask(() =>
				setError('Yêu cầu đăng nhập Google không hợp lệ hoặc đã hết hạn.'),
			);
			return;
		}

		void request('/authen/login/google', {
			method: 'POST',
			body: JSON.stringify({
				code,
				redirectUri: getGoogleOAuthRedirectUri('login'),
			}),
		})
			.then(() => router.replace('/'))
			.catch((requestError: unknown) => {
				setError(
					requestError instanceof ApiError
						? requestError.message
						: 'Không thể đăng nhập bằng Google. Vui lòng thử lại.',
				);
			});
	}, [router]);

	return (
		<>
			<Head>
				<title>Xác thực Google | Bakers Marketplace</title>
				<meta name='robots' content='noindex' />
			</Head>

			<main className='flex min-h-screen items-center justify-center bg-white px-4 py-12 text-black sm:px-6'>
				<section className='w-full max-w-md border border-black bg-white p-8 text-center shadow-[8px_8px_0_#000]'>
					{error ? (
						<>
							<h1 className='text-2xl font-semibold tracking-tight'>
								Không thể xác thực
							</h1>
							<p role='alert' className='mt-3 text-sm leading-6 text-black'>
								{error}
							</p>
							<Link
								href='/authen/login'
								className='mt-7 inline-flex border border-black bg-black px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-white hover:text-black focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-black'
							>
								Quay lại đăng nhập
							</Link>
						</>
					) : (
						<div aria-live='polite'>
							<div className='mx-auto size-9 animate-spin rounded-full border-2 border-black border-t-transparent' />
							<h1 className='mt-6 text-xl font-semibold tracking-tight'>
								Đang xác thực với Google...
							</h1>
							<p className='mt-2 text-sm text-black'>
								Vui lòng không đóng trang này.
							</p>
						</div>
					)}
				</section>
			</main>
		</>
	);
}
