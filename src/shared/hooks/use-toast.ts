import { create } from "zustand";

export interface Toast {
  id: string;
  title: string;
  variant?: "default" | "destructive";
}

interface ToastStore {
  toasts: Toast[];
  toast: (title: string, variant?: Toast["variant"]) => void;
  dismiss: (id: string) => void;
}

let counter = 0;
const timers = new Map<string, ReturnType<typeof setTimeout>>();

export const useToastStore = create<ToastStore>()((set) => ({
  toasts: [],

  toast: (title, variant = "default") => {
    const id = String(++counter);
    set((state) => ({ toasts: [...state.toasts, { id, title, variant }] }));
    timers.set(
      id,
      setTimeout(() => {
        useToastStore.getState().dismiss(id);
      }, 4000),
    );
  },

  dismiss: (id) => {
    const timer = timers.get(id);
    if (timer) {
      clearTimeout(timer);
      timers.delete(id);
    }
    set((state) => ({ toasts: state.toasts.filter((t) => t.id !== id) }));
  },
}));

export function useToast() {
  const toast = useToastStore((s) => s.toast);
  return { toast };
}
