import { useEffect, useRef, useState } from 'react';

// Trạng thái mở/đóng cho menu thả xuống: tự đóng khi bấm ra ngoài hoặc nhấn Escape.
export function useDropdown<T extends HTMLElement = HTMLDivElement>() {
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef<T>(null);

  useEffect(() => {
    if (!isOpen) return;

    function closeWhenClickingOutside(event: MouseEvent) {
      if (!ref.current?.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    function closeOnEscape(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    }

    document.addEventListener('mousedown', closeWhenClickingOutside);
    document.addEventListener('keydown', closeOnEscape);

    return () => {
      document.removeEventListener('mousedown', closeWhenClickingOutside);
      document.removeEventListener('keydown', closeOnEscape);
    };
  }, [isOpen]);

  return {
    ref,
    isOpen,
    toggle: () => setIsOpen((open) => !open),
    close: () => setIsOpen(false),
  };
}
