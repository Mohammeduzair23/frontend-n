import { create } from 'zustand';
import { notificationsApi, PatientNotificationDto } from './notifications-api';

interface NotificationsState {
  notifications: PatientNotificationDto[];
  unreadCount: number;
  loading: boolean;
  hasFetched: boolean;
  fetch: (showSpinner?: boolean) => Promise<void>;
  markAsRead: (id: string) => Promise<void>;
  deleteNotification: (id: string) => Promise<void>;
}

// Module-level guard (not store state) — prevents overlapping fetches when
// both the dashboard's poll and a manual refresh land at the same time.
let fetchInFlight = false;

/**
 * Single source of truth for notifications. The bell badge (patient/index.tsx)
 * and the full notifications screen (app/notifications.tsx) both read from
 * this store, so marking something read anywhere updates the badge everywhere
 * instantly — no more syncing two separate copies of the count.
 */
export const useNotificationsStore = create<NotificationsState>((set, get) => ({
  notifications: [],
  unreadCount: 0,
  loading: false,
  hasFetched: false,

  fetch: async (showSpinner = false) => {
    if (fetchInFlight) return;
    fetchInFlight = true;
    if (showSpinner) set({ loading: true });
    try {
      const result = await notificationsApi.getNotifications();
      if (!result.error) {
        set({
          notifications: result.notifications ?? [],
          unreadCount: result.unreadCount ?? 0,
          hasFetched: true,
        });
      }
    } catch (err) {
      console.error('Error fetching notifications:', err);
    } finally {
      fetchInFlight = false;
      if (showSpinner) set({ loading: false });
    }
  },

  markAsRead: async (id: string) => {
    const { notifications, unreadCount } = get();
    const target = notifications.find(n => n.id === id);
    if (!target || target.isRead) return;

    const previousNotifications = notifications;
    const previousCount = unreadCount;
    const updated = notifications.map(n => (n.id === id ? { ...n, isRead: true } : n));
    set({ notifications: updated, unreadCount: Math.max(0, previousCount - 1) });

    try {
      const result = await notificationsApi.markAsRead(id);
      if (result.error) set({ notifications: previousNotifications, unreadCount: previousCount });
    } catch {
      set({ notifications: previousNotifications, unreadCount: previousCount });
    }
  },

  deleteNotification: async (id: string) => {
    const { notifications, unreadCount } = get();
    const previousNotifications = notifications;
    const previousCount = unreadCount;
    const removed = notifications.find(n => n.id === id);
    const updated = notifications.filter(n => n.id !== id);
    const newCount = removed && !removed.isRead ? Math.max(0, previousCount - 1) : previousCount;
    set({ notifications: updated, unreadCount: newCount });

    try {
      const result = await notificationsApi.deleteNotification(id);
      if (result.error) set({ notifications: previousNotifications, unreadCount: previousCount });
    } catch {
      set({ notifications: previousNotifications, unreadCount: previousCount });
    }
  },
}));