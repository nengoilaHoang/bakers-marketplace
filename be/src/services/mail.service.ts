import dotenv from 'dotenv';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { Resend } from 'resend';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({
	path: [
		path.resolve(__dirname, '../../.env'),
		path.resolve(__dirname, '../../.env.development'),
	],
	quiet: true,
});

type MailContent =
	| { html: string; text?: string }
	| { text: string; html?: never };

export type SendMailInput = {
	to: string | string[];
	subject: string;
	from?: string;
} & MailContent;

class MailService {
	private client?: Resend;

	public async send(mail: SendMailInput): Promise<boolean> {
		try {
			const client = this.getClient();
			const from = mail.from ?? process.env.RESEND_FROM;

			if (!from) {
				throw new Error('RESEND_FROM is not configured');
			}

			this.assertSenderCanReceiveReplies(from);

			const baseMail = {
				from,
				to: mail.to,
				subject: mail.subject,
			};

			const result = mail.html !== undefined
				? await client.emails.send({
					...baseMail,
					html: mail.html,
					...(mail.text !== undefined ? { text: mail.text } : {}),
				})
				: await client.emails.send({
					...baseMail,
					text: mail.text,
				});

			if (result.error) {
				console.error('Resend error:', result.error);
				return false;
			}

			console.log(`Email sent successfully via Resend: ${result.data.id}`);
			return true;
		} catch (error) {
			console.error('Email sending failed:', error);
			return false;
		}
	}

	private getClient(): Resend {
		if (this.client) {
			return this.client;
		}

		const apiKey = process.env.RESEND_API_KEY;

		if (!apiKey) {
			throw new Error('RESEND_API_KEY is not configured');
		}

		this.client = new Resend(apiKey);
		return this.client;
	}

	private assertSenderCanReceiveReplies(from: string): void {
		const address = from.match(/<([^<>]+)>/)?.[1] ?? from;
		const localPart = address.split('@')[0]?.replace(/[._-]/g, '').toLowerCase();

		if (localPart === 'noreply') {
			throw new Error('RESEND_FROM must not use a no-reply address');
		}
	}
}

export default new MailService();
