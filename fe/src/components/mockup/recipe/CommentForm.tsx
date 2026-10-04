import Button from '@/components/ui/Button';
import Checkbox from '@/components/ui/Checkbox';
import Field from '@/components/ui/Field';
import Input, { Textarea } from '@/components/ui/Input';
import RatingStars, { RatingInput } from '@/components/ui/RatingStars';

// Khung viết bình luận + chấm điểm công thức.
export default function CommentForm() {
  return (
    <section
      aria-labelledby='comments-title'
      className='flex flex-col gap-3 border-2 border-ink px-1 pb-6'
    >
      <div className='flex flex-col gap-3 px-2.5 pt-2'>
        <div className='flex items-center justify-between gap-4'>
          <h2 id='comments-title' className='text-h3 font-medium text-ink'>
            Bình luận
          </h2>
          <RatingStars value={4} size='lg' valuePosition='end' />
        </div>
        <p className='text-meta text-ink'>
          Email của bạn sẽ không được công khai. Các trường bắt buộc được đánh dấu{' '}
          <span className='text-danger'>*</span>
        </p>
      </div>

      <form
        onSubmit={(event) => event.preventDefault()}
        className='flex flex-col gap-6'
      >
        <div className='flex flex-col gap-5 bg-surface-soft px-4 py-6 sm:px-8'>
          <div className='flex flex-col gap-2'>
            <div className='flex flex-wrap items-center gap-3'>
              <p className='text-h5 font-medium text-ink'>
                Chấm điểm công thức<span className='text-danger'>*</span>
              </p>
              <RatingInput name='rating' label='Chấm điểm công thức' />
            </div>
            <Checkbox label='Bạn đã làm thử món này?' />
          </div>
          <Field label='Bình luận' htmlFor='comment' required size='md'>
            <Textarea
              id='comment'
              rows={4}
              placeholder='Chia sẻ cảm nhận của bạn về công thức này!!'
            />
          </Field>
          <Button className='self-start'>Gửi bình luận</Button>
        </div>

        <div className='flex flex-col gap-6 px-4'>
          <Checkbox label='Lưu tên, email và website của tôi cho lần bình luận sau.' />
          <div className='grid gap-4 sm:grid-cols-2 sm:px-12'>
            <Field label='Tên' htmlFor='comment-name' required>
              <Input id='comment-name' placeholder='Tên' />
            </Field>
            <Field label='Email' htmlFor='comment-email' required>
              <Input id='comment-email' type='email' placeholder='Địa chỉ email' />
            </Field>
          </div>
        </div>
      </form>
    </section>
  );
}
