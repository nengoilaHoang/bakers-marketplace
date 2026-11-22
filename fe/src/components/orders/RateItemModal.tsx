import { useState, type FormEvent } from 'react';

import Alert from '@/components/ui/Alert';
import Button from '@/components/ui/Button';
import Field from '@/components/ui/Field';
import { Textarea } from '@/components/ui/Input';
import Modal from '@/components/ui/Modal';
import { RatingInput } from '@/components/ui/RatingStars';
import { ApiError } from '@/lib/api';
import { rateOrderItem, type OrderDetail, type OrderItem } from '@/services/orders';

type RateItemModalProps = Readonly<{
  orderId: string;
  // null: hộp đang đóng.
  item: OrderItem | null;
  onClose: () => void;
  onRated: (order: OrderDetail) => void;
}>;

// Chấm sao (1–5) và nhận xét một món trong đơn đã hoàn thành; mỗi món chỉ đánh giá một lần.
export default function RateItemModal({ orderId, item, onClose, onRated }: RateItemModalProps) {
  const [error, setError] = useState<string | null>(null);
  const [isSending, setIsSending] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!item) return;

    const form = new FormData(event.currentTarget);
    const rating = Number(form.get('rating'));
    const comment = String(form.get('comment') ?? '').trim();

    if (!rating) {
      setError('Hãy chọn số sao.');
      return;
    }

    setIsSending(true);
    setError(null);

    try {
      const { data } = await rateOrderItem(orderId, item.id, {
        rating,
        ...(comment ? { comment } : {}),
      });
      onRated(data);
    } catch (requestError) {
      setError(
        requestError instanceof ApiError && requestError.code === 'ALREADY_RATED'
          ? 'Bạn đã đánh giá món này rồi.'
          : 'Không gửi được đánh giá. Vui lòng thử lại.',
      );
    } finally {
      setIsSending(false);
    }
  }

  return (
    <Modal open={item !== null} onClose={onClose} title='Đánh giá sản phẩm'>
      {item && (
        // key: mở cho món khác thì form trống lại
        <form key={item.id} onSubmit={(event) => void handleSubmit(event)} className='flex flex-col gap-5'>
          <p className='text-body text-ink'>{item.productTitle}</p>
          <Field label='Số sao' size='sm'>
            <RatingInput name='rating' label={`Số sao cho ${item.productTitle}`} />
          </Field>
          <Field label='Nhận xét' htmlFor='rate-comment' size='sm'>
            <Textarea
              id='rate-comment'
              name='comment'
              rows={4}
              maxLength={1000}
              placeholder='Bánh có ngon không, giao có đúng hẹn không...'
            />
          </Field>
          {error && <Alert tone='danger'>{error}</Alert>}
          <div className='flex justify-end gap-3'>
            <Button variant='ghost' onClick={onClose} disabled={isSending}>
              Để sau
            </Button>
            <Button type='submit' disabled={isSending}>
              {isSending ? 'Đang gửi...' : 'Gửi đánh giá'}
            </Button>
          </div>
        </form>
      )}
    </Modal>
  );
}
