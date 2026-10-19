import { Toast } from '@/components/ui/ToastContainer';

let toasts: Toast[] = [];
const listeners: Set<() => void> = new Set();

const emitChange = () => {
  listeners.forEach((listener) => listener());
};

export const toastStore = {
  addToast: (newToast: Omit<Toast, 'id'>) => {
    const toast: Toast = {
      id: window.crypto.randomUUID(),
      ...newToast,
    };
    toasts = [...toasts, toast];
    emitChange();
    return toast.id;
  },

  removeToast: (id: string) => {
    toasts = toasts.filter((t) => t.id !== id);
    emitChange();
  },

  subscribe: (onStoreChange: () => void) => {
    listeners.add(onStoreChange);
    return () => {
      listeners.delete(onStoreChange);
    };
  },

  getSnapshot: (): Toast[] => {
    return toasts;
  },
};
