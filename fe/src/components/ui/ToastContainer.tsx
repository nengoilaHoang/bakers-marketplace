import { toastStore } from '@/hooks/toastStore';
import { cn } from '@/lib/cn';
import { memo, useEffect, useRef, useState, useSyncExternalStore } from 'react';
import { createPortal } from 'react-dom';
import Icon from './Icon';

export type Toast = {
  id: string;
  type: 'warning' | 'error' | 'success' | 'info';
  message: string;
};

// Stable snapshot reference for SSR / hydration
const EMPTY_TOASTS: Toast[] = [];
const getServerSnapshot = () => EMPTY_TOASTS;

const ToastContainer = () => {
  const [mounted, setMounted] = useState(false);
  const toasts = useSyncExternalStore(
    toastStore.subscribe,
    toastStore.getSnapshot,
    getServerSnapshot,
  );

  useEffect(() => {
    queueMicrotask(() => setMounted(true));
  }, []);

  if (!mounted || typeof document === 'undefined') return null;

  return createPortal(
    <div className='fixed flex flex-col bottom-10 right-10 gap-5 max-w-[calc(100vw-2rem)] z-9999'>
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast}></ToastItem>
      ))}
    </div>,
    document.body,
  );
};
interface ToastItemProps {
  toast: Toast;
}

const ToastItem = memo(function ToastItem({ toast }: ToastItemProps) {
  const [mounted, setMounted] = useState(false);
  const itemRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const frame = requestAnimationFrame(() => setMounted(true));
    const timer = setTimeout(() => {
      setMounted(false);
    }, 5000);
    return () => {
      cancelAnimationFrame(frame);
      clearTimeout(timer);
    };
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      toastStore.removeToast(toast.id);
    }, 5300);
    return () => clearTimeout(timer);
  }, [toast.id]);

  const iconName = {
    error: 'circle-alert',
    success: 'check',
    info: 'info',
    warning: 'triangle-alert',
  } as const;

  const toastBgColor = {
    error: 'bg-danger',
    success: 'bg-success',
    info: 'bg-info',
    warning: 'bg-warning',
  } as const;

  const toastTextColor = {
    error: 'text-danger',
    success: 'text-success',
    info: 'text-info',
    warning: 'text-warning',
  } as const;

  return (
    <div
      ref={itemRef}
      className={cn(
        'relative flex flex-row items-center justify-center min-w-0 w-100 rounded-box overflow-hidden border border-line bg-white',
        'transition-all duration-300 ease-out transform',
        mounted ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0',
      )}
    >
      <div
        className={cn('w-2 shrink-0 self-stretch', toastBgColor[toast.type])}
      />

      <span className='flex flex-1 flex-row items-center gap-4 py-4 px-4 pr-10'>
        <Icon
          name={iconName[toast.type]}
          className={cn('size-5 shrink-0', toastTextColor[toast.type])}
        />
        <span className='flex-1 text-body-sm text-ink inline-block line-clamp-2'>
          {toast.message}
        </span>
      </span>
      <button
        type='button'
        onClick={() => toastStore.removeToast(toast.id)}
        className='absolute top-3 right-3 text-ink-muted hover:text-ink transition-colors'
        aria-label='Close toast'
      >
        <Icon name='close' className='size-4'></Icon>
      </button>
    </div>
  );
});

export default ToastContainer;
