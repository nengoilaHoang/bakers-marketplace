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

// "12/09/2026, 14:30"
export function formatDateTime(value: string | null | undefined) {
  const date = toValidDate(value);
  return date ? dateTimeFormatter.format(date) : undefined;
}
