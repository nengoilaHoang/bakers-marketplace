import { useId, useState, type FormEvent, type ReactNode } from 'react';

import Button, { type ButtonVariant } from '@/components/ui/Button';
import Field from '@/components/ui/Field';
import { Textarea } from '@/components/ui/Input';
import ApiErrorAlert from '@/components/dashboard/ApiErrorAlert';
import Panel from '@/components/dashboard/Panel';

const MAX_LENGTH = 500;

type ReasonFormProps = Readonly<{
  title: string;
  description?: ReactNode;
  label: string;
  placeholder?: string;
  submitLabel: string;
  variant?: ButtonVariant;
  // false: lý do không bắt buộc (ghi chú khi bỏ qua báo cáo).
  required?: boolean;
  // Trường bổ sung đặt trên ô lý do (ví dụ chọn báo cáo liên quan).
  children?: ReactNode;
  onSubmit: (reason: string) => Promise<void>;
}>;

// Khối thao tác quản trị cần lý do: gỡ bài, cảnh cáo, khoá tài khoản, từ chối đơn.
// Ô lý do đóng vai trò bước xác nhận, nên không cần hộp thoại riêng.
export default function ReasonForm({
  title,
  description,
  label,
  placeholder,
  submitLabel,
  variant = 'primary',
  required = true,
  children,
  onSubmit,
}: ReasonFormProps) {
  const inputId = useId();
  const [reason, setReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<unknown>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      await onSubmit(reason.trim());
      setReason('');
    } catch (submitError) {
      setError(submitError);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Panel title={title} description={description} onSubmit={handleSubmit}>
      <div className='flex flex-col gap-4'>
        {children}
        <Field label={label} htmlFor={inputId} required={required} size='sm'>
          <Textarea
            id={inputId}
            rows={3}
            value={reason}
            required={required}
            maxLength={MAX_LENGTH}
            placeholder={placeholder}
            onChange={(event) => setReason(event.target.value)}
          />
        </Field>
        {error !== null && <ApiErrorAlert error={error} />}
        <div>
          <Button
            type='submit'
            size='sm'
            variant={variant}
            disabled={isSubmitting || (required && !reason.trim())}
          >
            {isSubmitting ? 'Đang xử lý…' : submitLabel}
          </Button>
        </div>
      </div>
    </Panel>
  );
}
