import Alert from '@/components/ui/Alert';
import { ApiError } from '@/lib/api';

type Issue = { path?: unknown; message?: unknown };

function toIssues(details: unknown): string[] {
  if (!Array.isArray(details)) return [];

  return (details as Issue[])
    .filter((issue) => typeof issue?.message === 'string')
    .map((issue) => {
      const path = Array.isArray(issue.path) ? issue.path.join('.') : issue.path;
      return path ? `${String(path)}: ${String(issue.message)}` : String(issue.message);
    });
}

// Hộp lỗi sau khi gửi form: câu báo lỗi + danh sách lỗi từng trường (nếu API trả về).
export default function ApiErrorAlert({ error }: { error: unknown }) {
  const message =
    error instanceof Error && error.message ? error.message : 'Đã có lỗi xảy ra. Vui lòng thử lại.';
  const issues = error instanceof ApiError ? toIssues(error.details) : [];

  return (
    <Alert tone='danger' title={message}>
      {issues.length > 0 && (
        <ul className='list-disc pl-5'>
          {issues.map((issue) => (
            <li key={issue}>{issue}</li>
          ))}
        </ul>
      )}
    </Alert>
  );
}
