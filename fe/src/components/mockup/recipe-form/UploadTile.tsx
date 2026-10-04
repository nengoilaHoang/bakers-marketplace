import PlusCircle from '@/components/ui/PlusCircle';

type UploadTileProps = Readonly<{
  id: string;
  label?: string;
}>;

// Ô tải ảnh: nền surface, viền nét đứt accent, nút tải ở giữa.
export default function UploadTile({ id, label = 'Tải ảnh lên' }: UploadTileProps) {
  return (
    <label
      htmlFor={id}
      className='group grid aspect-375/245 cursor-pointer rounded-media bg-surface p-2 focus-within:ring-2 focus-within:ring-accent'
    >
      <input id={id} type='file' accept='image/*' className='sr-only' />
      <span className='grid place-items-center border border-dashed border-accent'>
        <span className='flex flex-col items-center gap-2 rounded-box bg-highlight-soft px-4 py-2.5 transition-colors group-hover:bg-highlight'>
          <PlusCircle className='size-9' />
          <span className='text-caption font-medium text-ink'>{label}</span>
        </span>
      </span>
    </label>
  );
}
