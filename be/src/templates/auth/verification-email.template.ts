type VerificationEmailTemplateInput = {
	displayName?: string;
	verificationUrl: string;
};

function escapeHtml(value: string): string {
	return value.replace(/[&<>'"]/g, (character) => {
		const entities: Record<string, string> = {
			'&': '&amp;',
			'<': '&lt;',
			'>': '&gt;',
			"'": '&#39;',
			'"': '&quot;',
		};

		return entities[character];
	});
}

export function createVerificationEmailTemplate({
	displayName,
	verificationUrl,
}: VerificationEmailTemplateInput): { html: string; text: string } {
	const safeDisplayName = displayName ? escapeHtml(displayName) : 'bạn';
	const safeVerificationUrl = escapeHtml(verificationUrl);

	return {
		html: `<!doctype html>
<html lang="vi">
<head>
	<meta charset="utf-8">
	<meta name="viewport" content="width=device-width, initial-scale=1">
	<title>Xác minh địa chỉ email</title>
</head>
<body style="margin:0;padding:0;background:#f4f4f4;color:#111111;font-family:Arial,Helvetica,sans-serif;">
	<table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background:#f4f4f4;padding:32px 16px;">
		<tr>
			<td align="center">
				<table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="max-width:600px;background:#ffffff;border:1px solid #111111;">
					<tr>
						<td style="padding:24px 32px;border-bottom:1px solid #111111;font-size:20px;font-weight:700;">Bakers Marketplace</td>
					</tr>
					<tr>
						<td style="padding:40px 32px;">
							<h1 style="margin:0 0 20px;font-size:28px;line-height:1.25;color:#111111;">Xác minh địa chỉ email</h1>
							<p style="margin:0 0 16px;font-size:16px;line-height:1.6;">Xin chào ${safeDisplayName},</p>
							<p style="margin:0 0 28px;font-size:16px;line-height:1.6;">Hãy xác minh địa chỉ email để hoàn tất việc thiết lập tài khoản của bạn.</p>
							<table role="presentation" cellspacing="0" cellpadding="0" border="0">
								<tr>
									<td style="background:#111111;cursor:pointer;">
										<a href="${safeVerificationUrl}" role="button" style="display:inline-block;padding:14px 24px;color:#ffffff;text-decoration:none;font-size:16px;font-weight:700;cursor:pointer;" target="_blank" rel="noopener noreferrer">Xác minh email</a>
									</td>
								</tr>
							</table>
							<p style="margin:16px 0 0;font-size:14px;line-height:1.6;color:#444444;">Lưu ý: Liên kết kích hoạt sẽ hết hạn sau 15 phút.</p>
							<p style="margin:28px 0 0;font-size:14px;line-height:1.6;color:#444444;">Nếu bạn không tạo tài khoản này, bạn có thể bỏ qua email.</p>
						</td>
					</tr>
					<tr>
						<td style="padding:20px 32px;border-top:1px solid #111111;font-size:12px;line-height:1.5;color:#555555;">Email tự động từ Bakers Marketplace Support.</td>
					</tr>
				</table>
			</td>
		</tr>
	</table>
</body>
</html>`,
		text: [
			'Bakers Marketplace',
			'',
			`Xin chào ${displayName ?? 'bạn'},`,
			'Hãy xác minh địa chỉ email để hoàn tất việc thiết lập tài khoản của bạn.',
			`Liên kết xác minh: ${verificationUrl}`,
			'Lưu ý: Liên kết kích hoạt sẽ hết hạn sau 15 phút.',
			'',
			'Nếu bạn không tạo tài khoản này, bạn có thể bỏ qua email.',
		].join('\n'),
	};
}
