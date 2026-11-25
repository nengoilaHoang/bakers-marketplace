import Icon from '@/components/ui/Icon';
import IconButton from '@/components/ui/IconButton';
import type { Pagination as PaginationData } from '@/types/admin';

type PaginationProps = Readonly<{
  pagination: PaginationData;
  onPageChange: (page: number) => void;
}>;

// Thanh chuyển trang dưới bảng: "1–20 / 57" + nút trang trước / sau.
export default function Pagination({ pagination, onPageChange }: PaginationProps) {
  const { page, pageSize, total } = pagination;
  const pageCount = Math.max(1, Math.ceil(total / pageSize));

  if (total === 0) {
    return null;
  }

  const first = (page - 1) * pageSize + 1;
  const last = Math.min(page * pageSize, total);

  return (
    <nav aria-label='Phân trang' className='flex items-center justify-end gap-3'>
      <p className='text-body-sm text-ink-muted'>
        {first}–{last} / {total}
      </p>
      <IconButton
        label='Trang trước'
        variant='muted'
        size='sm'
        disabled={page <= 1}
        onClick={() => onPageChange(page - 1)}
      >
        <Icon name='chevron-left' className='size-4' />
      </IconButton>
      <IconButton
        label='Trang sau'
        variant='muted'
        size='sm'
        disabled={page >= pageCount}
        onClick={() => onPageChange(page + 1)}
      >
        <Icon name='chevron-right' className='size-4' />
      </IconButton>
    </nav>
  );
}
