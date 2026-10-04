import Avatar from '@/components/ui/Avatar';
import Icon from '@/components/ui/Icon';
import RatingStars from '@/components/ui/RatingStars';

const REVIEWS = [
  { id: 1, name: 'Thu Hà', rating: 4, date: '27/01/2026', text: 'Vỏ bánh phồng đều, nhân kem vừa ngọt. Mình giảm 10g đường và vẫn rất ngon. Lần sau sẽ thử thêm chút rượu rum vào kem.' },
  { id: 2, name: 'Minh Khoa', rating: 5, date: '25/01/2026', text: 'Hướng dẫn rất dễ hiểu, lần đầu làm đã thành công. Cả nhà ai cũng khen!' },
  { id: 3, name: 'Lan Anh', rating: 4, date: '20/01/2026', text: 'Nên để bột nguội hẳn rồi mới cho trứng vào, nếu không bột sẽ bị lỏng. Cảm ơn công thức nhé.' },
  { id: 4, name: 'Quốc Bảo', rating: 3, date: '18/01/2026', text: 'Lò nhà mình nóng hơn nên vỏ hơi sẫm màu, giảm 10 độ là vừa.' },
];

// Danh sách đánh giá của người dùng.
export default function ReviewList() {
  return (
    <section aria-label='Đánh giá'>
      <ul className='divide-y divide-line border-b border-line'>
        {REVIEWS.map((review) => (
          <li key={review.id} className='flex gap-5 py-6'>
            <Avatar size='sm' label={`Ảnh đại diện ${review.name}`} />
            <div className='flex min-w-0 flex-1 flex-col gap-3 pt-1'>
              <div className='flex flex-wrap items-center gap-x-3 gap-y-1'>
                <p className='text-lead font-semibold text-ink'>{review.name}</p>
                <RatingStars value={review.rating} valuePosition='none' />
                <p className='ml-auto text-meta font-medium text-ink-muted'>{review.date}</p>
              </div>
              <p className='text-body-sm text-ink-muted'>{review.text}</p>
              <div className='flex items-center justify-between text-body-sm text-ink'>
                <button type='button' className='hover:underline'>
                  Trả lời
                </button>
                <button type='button' className='inline-flex items-center gap-1.5 text-caption hover:underline'>
                  Hữu ích
                  <Icon name='thumbs-up' className='size-5 text-ink-muted' />
                </button>
              </div>
            </div>
          </li>
        ))}
      </ul>
      <button
        type='button'
        className='mx-auto mt-6 flex items-center gap-2 text-body-sm text-ink hover:underline'
      >
        <Icon name='chevron-down' className='size-5' />
        Xem thêm đánh giá
      </button>
    </section>
  );
}
