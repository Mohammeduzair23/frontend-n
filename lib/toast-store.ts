import { create } from 'zustand';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

interface ToastState {
  visible: boolean;
  type: ToastType;
  message: string;
  show: (type: ToastType, message: string, duration?: number) => void;
  hide: () => void;
}

let hideTimer: ReturnType<typeof setTimeout> | null = null;

/**
 * Global toast state. Deliberately not tied to any one screen — a screen
 * that navigates away right after calling show() (e.g. Profile saving then
 * router.back()) will simply hand the still-visible toast off to whichever
 * screen becomes visible next, as long as that screen also renders
 * <InlineToast />. That's what makes "show a message, then the underlying
 * page displays it" work without any extra plumbing.
 */
export const useToastStore = create<ToastState>((set) => ({
  visible: false,
  type: 'info',
  message: '',

  show: (type, message, duration = 4000) => {
    if (hideTimer) clearTimeout(hideTimer);
    set({ visible: true, type, message });
    if (duration > 0) {
      hideTimer = setTimeout(() => set({ visible: false }), duration);
    }
  },

  hide: () => {
    if (hideTimer) clearTimeout(hideTimer);
    set({ visible: false });
  },
}));