type ChangeEmailTemplateInput = {
  displayName?: string;
  actionUrl: string;
  step: 'current' | 'new';
  newEmail: string;
};

function escapeHtml(value: string): string {
  const entities: Record<string, string> = { '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' };
  return value.replace(/[&<>'"]/g, (character) => entities[character]);
}

export function createChangeEmailTemplate({ displayName, actionUrl, step, newEmail }: ChangeEmailTemplateInput) {
  const title = step === 'current' ? 'Xác nhận yêu cầu đổi email' : 'Xác minh email mới';
  const description = step === 'current'
    ? `Bạn đã yêu cầu đổi email tài khoản sang ${newEmail}. Mở liên kết bên dưới và nhập lại email mới để xác nhận yêu cầu.`
    : `Xác minh ${newEmail} để hoàn tất đổi email tài khoản. Email chính thức chỉ thay đổi sau khi bạn nhấn xác nhận trên trang liên kết.`;
  const greeting = `Xin chào ${displayName || 'bạn'},`;
  const note = 'Liên kết chỉ dùng một lần và hết hạn sau 15 phút. Nếu bạn không yêu cầu thay đổi này, hãy bỏ qua email.';

  return {
    html: `<!doctype html>
<html lang="vi"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>${title}</title></head>
<body style="margin:0;padding:24px;background:#f5f5f5;color:#111;font-family:Arial,Helvetica,sans-serif;">
  <main style="max-width:560px;margin:auto;border:1px solid #111;background:#fff;padding:32px;">
    <h1 style="font-size:24px;">${title}</h1>
    <p>${escapeHtml(greeting)}</p><p style="line-height:1.6;">${escapeHtml(description)}</p>
    <p style="margin:28px 0;"><a href="${escapeHtml(actionUrl)}" style="display:inline-block;background:#111;color:#fff;padding:12px 20px;text-decoration:none;" target="_blank" rel="noopener noreferrer">${title}</a></p>
    <p style="font-size:14px;line-height:1.6;">${note}</p>
    <p style="font-size:12px;word-break:break-all;">Nếu nút không hoạt động, mở: ${escapeHtml(actionUrl)}</p>
  </main>
</body></html>`,
    text: [title, '', greeting, description, '', actionUrl, '', note].join('\n'),
  };
}
