import Icon from '@/components/ui/Icon';

type RemoveButtonProps = Readonly<{
  label: string;
  onClick: () => void;
  disabled?: boolean;
}>;

// Nút xoá dòng: ô vuông có dấu X.
export default function RemoveButton({ label, onClick, disabled }: RemoveButtonProps) {
  return (
    <button
      type='button'
      aria-label={label}
      title={label}
      onClick={onClick}
      disabled={disabled}
      className='grid size-7.5 shrink-0 place-items-center rounded-control text-ink outline-none hover:bg-ink/5 focus-visible:ring-2 focus-visible:ring-accent disabled:cursor-not-allowed disabled:opacity-40'
    >
      <Icon name='remove' className='size-6' />
    </button>
  );
}
