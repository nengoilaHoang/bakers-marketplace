import { useState, type FormEvent } from 'react';

import Alert from '@/components/ui/Alert';
import Button from '@/components/ui/Button';
import Field from '@/components/ui/Field';
import { Textarea } from '@/components/ui/Input';
import Modal from '@/components/ui/Modal';
import { ApiError } from '@/lib/api';
import { cancelOrder, type OrderDetail } from '@/services/orders';

type CancelOrderModalProps = Readonly<{
  orderId: string;
  open: boolean;
  onClose: () => void;
  onCancelled: (order: OrderDetail) => void;
}>;

// Xác nhận huỷ đơn (chỉ khi đơn còn chờ xác nhận), kèm lý do tuỳ chọn.
export default function CancelOrderModal({ orderId, open, onClose, onCancelled }: CancelOrderModalProps) {
  const [reason, setReason] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSending, setIsSending] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSending(true);
    setError(null);

    try {
      const { data } = await cancelOrder(orderId, reason.trim() || undefined);
      onCancelled(data);
    } catch (requestError) {
      setError(
        requestError instanceof ApiError && requestError.code === 'ORDER_NOT_PENDING'
          ? 'Đơn đã được tiệm xác nhận nên không huỷ được nữa.'
          : 'Không huỷ được đơn. Vui lòng thử lại.',
      );
    } finally {
      setIsSending(false);
    }
  }

  return (
    <Modal open={open} onClose={onClose} title='Huỷ đơn hàng?'>
      <form onSubmit={(event) => void handleSubmit(event)} className='flex flex-col gap-5'>
        <p className='text-body-sm text-ink-muted'>
          Đơn sẽ bị huỷ và các tiệm không chuẩn bị hàng nữa. Bạn không thể hoàn tác.
        </p>
        <Field label='Lý do (tuỳ chọn)' htmlFor='cancel-reason' size='sm'>
          <Textarea
            id='cancel-reason'
            rows={3}
            maxLength={500}
            value={reason}
            onChange={(event) => setReason(event.target.value)}
            placeholder='Ví dụ: đặt nhầm số lượng'
          />
        </Field>
        {error && <Alert tone='danger'>{error}</Alert>}
        <div className='flex justify-end gap-3'>
          <Button variant='ghost' onClick={onClose} disabled={isSending}>
            Giữ đơn
          </Button>
          <Button type='submit' variant='danger' disabled={isSending}>
            {isSending ? 'Đang huỷ...' : 'Huỷ đơn'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
