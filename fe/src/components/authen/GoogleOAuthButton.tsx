import SocialButton from '@/components/ui/SocialButton';
import {
	startGoogleOAuth,
	type GoogleOAuthFlow,
} from '@/lib/googleOAuth';

type GoogleOAuthButtonProps = {
	// Động từ trước "với Google", ví dụ "Đăng nhập" → "Đăng nhập với Google".
	action: string;
	flow: GoogleOAuthFlow;
	onError: (message: string) => void;
};

export default function GoogleOAuthButton({
	action,
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

	return <SocialButton provider='google' action={action} onClick={handleClick} />;
}
