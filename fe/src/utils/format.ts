const dateFormatter = new Intl.DateTimeFormat('vi-VN', {
  day: '2-digit',
  month: '2-digit',
  year: 'numeric',
});

const dateTimeFormatter = new Intl.DateTimeFormat('vi-VN', {
  day: '2-digit',
  month: '2-digit',
  year: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
});

const timeFormatter = new Intl.DateTimeFormat('vi-VN', {
  hour: '2-digit',
  minute: '2-digit',
});

function toValidDate(value: string | null | undefined) {
  if (!value) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

// "12/09/2026" — trả về undefined khi không có hoặc sai định dạng.
export function formatDate(value: string | null | undefined) {
  const date = toValidDate(value);
  return date ? dateFormatter.format(date) : undefined;
}

// "12/09" — ngày gọn cho chỗ hẹp
export function formatDayMonth(value: string | null | undefined) {
  // Cắt từ "12/09/2026" để giữ dấu "/" (Intl vi-VN không có năm thì dùng "-")
  return formatDate(value)?.slice(0, 5);
}

// "14:30"
export function formatTime(value: string | null | undefined) {
  const date = toValidDate(value);
  return date ? timeFormatter.format(date) : undefined;
}

// "12/09/2026, 14:30"
export function formatDateTime(value: string | null | undefined) {
  const date = toValidDate(value);
  return date ? dateTimeFormatter.format(date) : undefined;
}

// "125.000 VND"
export function formatMoney(value: number, currency = 'VND') {
  return `${value.toLocaleString('vi-VN')} ${currency}`;
}
