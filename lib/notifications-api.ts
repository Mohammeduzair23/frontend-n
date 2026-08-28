import { api } from './api';

export interface PatientNotificationDto {
  id: string;
  patientId: string;
  doctorName?: string | null;
  passkey?: string | null;
  createdAt: string;
  expiresAt?: string | null;
  isRead: boolean;
}

interface NotificationsListResponse {
  success: boolean;
  notifications: PatientNotificationDto[];
  unreadCount: number;
}

interface ActionResponse {
  success: boolean;
  message: string;
}

/**
 * Wraps an axios call, returning the response payload on success or
 * `{ error }` on failure — same convention as userApi.ts.
 */
async function safeCall<T>(fn: () => Promise<{ data: T }>): Promise<T & { error?: string }> {
  try {
    const { data } = await fn();
    return data as T & { error?: string };
  } catch (err: any) {
    const message =
      err?.response?.data?.message || err?.message || 'Something went wrong. Please try again.';
    return { error: message } as T & { error?: string };
  }
}

/**
 * Notifications API — matches PatientNotificationController (/api/notifications).
 * Identity is derived from the JWT on the backend; no patientId is sent.
 */
export const notificationsApi = {
  getNotifications: () =>
    safeCall<NotificationsListResponse>(() => api.get('/notifications')),

  markAsRead: (notificationId: string) =>
    safeCall<ActionResponse>(() => api.put(`/notifications/${notificationId}/read`)),

  deleteNotification: (notificationId: string) =>
    safeCall<ActionResponse>(() => api.delete(`/notifications/${notificationId}`)),
};