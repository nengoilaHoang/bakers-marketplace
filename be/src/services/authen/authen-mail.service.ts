import mailService from '#/services/mail.service.js';
import { createResetPasswordEmailTemplate } from '#/templates/auth/reset-password-email.template.js';
import { createVerificationEmailTemplate } from '#/templates/auth/verification-email.template.js';

class AuthenMailService {
	public async sendVerificationEmail(
		to: string,
		verificationUrl = '',
		displayName?: string,
	): Promise<boolean> {
		const actionUrl = verificationUrl || this.getFrontendUrl();

		this.assertMailBaseUrlMatchesSender();
		this.assertActionUrlMatchesFrontendUrl(actionUrl);

		const content = createVerificationEmailTemplate({
			displayName,
			verificationUrl: actionUrl,
		});

		return mailService.send({
			to,
			subject: 'Xác minh địa chỉ email',
			...content,
		});
	}

	public async sendResetPasswordEmail(
		to: string,
		resetPasswordUrl = '',
		displayName?: string,
	): Promise<boolean> {
		const actionUrl = resetPasswordUrl || this.getFrontendUrl();

		this.assertMailBaseUrlMatchesSender();
		this.assertActionUrlMatchesFrontendUrl(actionUrl);

		const content = createResetPasswordEmailTemplate({
			displayName,
			resetPasswordUrl: actionUrl,
		});

		return mailService.send({
			to,
			subject: 'Đặt lại mật khẩu',
			...content,
		});
	}

	private assertActionUrlMatchesFrontendUrl(actionUrl: string): void {
		const frontendUrl = this.getFrontendUrl();

		const actionOrigin = new URL(actionUrl).origin;
		const frontendOrigin = new URL(frontendUrl).origin;

		if (actionOrigin !== frontendOrigin) {
			throw new Error('Authentication email URL must match FE_URL');
		}
	}

	private getFrontendUrl(): string {
		const frontendUrl = process.env.FE_URL?.trim();

		if (!frontendUrl) {
			throw new Error('FE_URL is not configured');
		}

		return frontendUrl;
	}

	private assertMailBaseUrlMatchesSender(): void {
		const from = process.env.RESEND_FROM;
		const mailBaseUrl = process.env.MAIL_BASE_URL;

		if (!from || !mailBaseUrl) {
			throw new Error('RESEND_FROM and MAIL_BASE_URL must be configured');
		}

		const senderAddress = from.match(/<([^<>]+)>/)?.[1] ?? from;
		const senderDomain = senderAddress.split('@')[1]?.toLowerCase();
		const mailHostname = new URL(mailBaseUrl).hostname.toLowerCase();

		if (!senderDomain || senderDomain !== mailHostname) {
			throw new Error('MAIL_BASE_URL hostname must match RESEND_FROM domain');
		}
	}
}

export default new AuthenMailService();
