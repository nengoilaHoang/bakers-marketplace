import Icon from '@/components/ui/Icon';
import Image from 'next/image';
import { useCallback, useEffect, useRef, useState } from 'react';

type FilePickerProps = {
  id: string;
  name: string;
  currentValue: string | null;
  onValueChange: (value: string | null) => void;
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
};

const ALLOWED_MIME_TYPES = [
  'image/jpeg',
  'image/png',
  'image/gif',
  'image/webp',
];

const FilePicker = ({
  id,
  name,
  currentValue,
  onValueChange,
  isOpen,
  onOpenChange,
}: FilePickerProps) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [blob, setBlob] = useState<Blob | null>(null);
  const [mimeType, setMimeType] = useState<string | null>(null);
  const [blobUrl, setBlobUrl] = useState<string | null>(null);

  const handleClick = useCallback(() => {
    const input = inputRef.current;
    if (!input) return;
    input.click();
  }, []);

  const handleImageChange = useCallback(() => {
    const input = inputRef.current;
    if (!input?.files || input.files.length === 0) return;
    const selectedFile = input.files[0];
    const fileUrl = URL.createObjectURL(selectedFile);
    setBlobUrl(fileUrl);
    setBlob(selectedFile);
    setMimeType(selectedFile.type);
    onValueChange(fileUrl);
  }, [onValueChange]);

  const handleRemove = useCallback(
    (e: React.MouseEvent<HTMLButtonElement>) => {
      e.stopPropagation();

      if (blobUrl) {
        URL.revokeObjectURL(blobUrl);
      }

      setBlob(null);
      setBlobUrl(null);
      setMimeType(null);
      onValueChange(null);

      if (inputRef.current) {
        inputRef.current.value = '';
      }
    },
    [blobUrl, onValueChange],
  );

  useEffect(() => {
    if (!currentValue) {
      queueMicrotask(() => {
        setBlob(null);
        setBlobUrl(null);
        setMimeType(null);
      });
      return;
    }
    void fetch(currentValue)
      .then((res) => res.blob())
      .then((blob) => {
        setBlob(blob);
        const url = URL.createObjectURL(blob);
        setBlobUrl(url);
        setMimeType(blob.type);
      })
      .catch(() => {
        setBlob(null);
        setBlobUrl(null);
        setMimeType(null);
      });
  }, [currentValue]);

  return (
    <>
      {blob !== null && blobUrl && mimeType ? (
        (() => {
          switch (mimeType.split('/')[0]) {
            case 'image': {
              return (
                <div className='relative h-32 w-full overflow-hidden rounded-md border border-zinc-200 bg-zinc-50'>
                  <Image
                    className='object-contain'
                    src={blobUrl}
                    alt='Image'
                    fill
                    unoptimized
                  />
                  <button
                    type='button'
                    onClick={handleRemove}
                    aria-label='Remove image'
                    title='Remove image'
                    className='absolute top-2 right-2 z-10 grid size-6 place-items-center rounded-full bg-white/90 text-zinc-600 shadow-sm transition hover:bg-white hover:text-zinc-950 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-950'
                  >
                    <Icon name='close' className='size-3.5' />
                  </button>
                </div>
              );
            }
            default:
              return <></>;
          }
        })()
      ) : (
        <div
          onClick={handleClick}
          className='flex cursor-pointer items-center justify-center rounded-md border border-zinc-200 bg-zinc-50/50 p-2.5 text-xs text-zinc-600 transition hover:bg-white focus-within:ring-1 focus-within:ring-zinc-950'
        >
          <span>Please select a file</span>
          <input
            ref={inputRef}
            type='file'
            id={id}
            name={name}
            onChange={handleImageChange}
            onFocus={() => onOpenChange(true)}
            onBlur={() => onOpenChange(false)}
            className='sr-only'
            accept={ALLOWED_MIME_TYPES.join(',')}
          />
        </div>
      )}
    </>
  );
};

export default FilePicker;
