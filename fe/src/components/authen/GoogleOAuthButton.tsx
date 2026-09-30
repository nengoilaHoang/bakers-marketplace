import {
	startGoogleOAuth,
	type GoogleOAuthFlow,
} from '@/lib/googleOAuth';

type GoogleOAuthButtonProps = {
	children: string;
	flow: GoogleOAuthFlow;
	onError: (message: string) => void;
};

export default function GoogleOAuthButton({
	children,
	flow,
	onError,
}: GoogleOAuthButtonProps) {
	const handleClick = () => {
		try {
			startGoogleOAuth(flow);
		} catch (error) {
			onError(
				error instanceof Error
					? error.message
					: 'Không thể kết nối với Google. Vui lòng thử lại.',
			);
		}
	};

	return (
		<button
			type='button'
			onClick={handleClick}
			className='flex w-full cursor-pointer items-center justify-center gap-3 border border-black bg-white px-4 py-3.5 text-sm font-semibold text-black transition-colors hover:bg-black hover:text-white focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-black'
		>
			<svg aria-hidden='true' viewBox='0 0 24 24' className='size-5'>
				<path
					fill='currentColor'
					d='M21.6 12.23c0-.71-.06-1.4-.18-2.07H12v3.92h5.38a4.6 4.6 0 0 1-2 3.02v2.54h3.24c1.9-1.75 2.98-4.32 2.98-7.41Z'
				/>
				<path
					fill='currentColor'
					d='M12 22c2.7 0 4.98-.9 6.63-2.36l-3.24-2.54c-.9.6-2.05.96-3.39.96a5.84 5.84 0 0 1-5.49-4.04H3.17v2.62A10 10 0 0 0 12 22Z'
				/>
				<path
					fill='currentColor'
					d='M6.51 14.02A6.01 6.01 0 0 1 6.2 12c0-.7.12-1.38.31-2.02V7.36H3.17A10 10 0 0 0 2 12c0 1.66.4 3.23 1.17 4.64l3.34-2.62Z'
				/>
				<path
					fill='currentColor'
					d='M12 5.94c1.47 0 2.79.5 3.83 1.5l2.87-2.87A9.66 9.66 0 0 0 12 2a10 10 0 0 0-8.83 5.36l3.34 2.62A5.84 5.84 0 0 1 12 5.94Z'
				/>
			</svg>
			{children}
		</button>
	);
}
