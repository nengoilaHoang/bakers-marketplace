import Icon from '@/components/ui/Icon';

// Ô ghi chú riêng của người dùng (viền nét đứt accent).
export default function NotesBox() {
  return (
    <section className='flex flex-col gap-4'>
      <h3 className='text-h3 font-medium text-ink'>Ghi chú</h3>
      <button
        type='button'
        className='relative flex min-h-76 w-full flex-col rounded-box border-3 border-dashed border-accent bg-page p-6 text-left outline-none hover:bg-highlight-soft/40 focus-visible:ring-2 focus-visible:ring-accent'
      >
        <span className='inline-flex items-center gap-2 text-lead font-medium text-ink-muted'>
          <Icon name='edit' className='size-6' />
          Thêm ghi chú
        </span>
        <span className='m-auto flex max-w-xs flex-col items-center gap-3 text-center text-body-sm text-ink-subtle'>
          <Icon name='notebook' strokeWidth={1.25} className='size-16' />
          Ghi lại suy nghĩ, ý tưởng hay cảm hứng của bạn bất cứ lúc nào
        </span>
      </button>
    </section>
  );
}
