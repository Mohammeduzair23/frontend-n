import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  RefreshControl,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ConfirmModal } from '../components/ConfirmModal';
import { PatientNotificationDto } from '../lib/notifications-api';
import { useNotificationsStore } from '../lib/notifications-store';
import { useToastStore } from '../lib/toast-store';

function formatTime(dateString: string) {
  try {
    const date = new Date(dateString);
    const diffMins = Math.floor((Date.now() - date.getTime()) / 60000);
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} min ago`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
  } catch {
    return '';
  }
}

function minutesRemaining(expiresAt?: string | null): number | null {
  if (!expiresAt) return null;
  const diffMs = new Date(expiresAt).getTime() - Date.now();
  return diffMs <= 0 ? 0 : Math.ceil(diffMs / 60000);
}

export default function NotificationsScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const notifications = useNotificationsStore(s => s.notifications);
  const loading = useNotificationsStore(s => s.loading);
  const hasFetched = useNotificationsStore(s => s.hasFetched);
  const fetch = useNotificationsStore(s => s.fetch);
  const markAsRead = useNotificationsStore(s => s.markAsRead);
  const deleteNotification = useNotificationsStore(s => s.deleteNotification);
  const showToast = useToastStore(s => s.show);

  const [refreshing, setRefreshing] = useState(false);
  const [notificationToDelete, setNotificationToDelete] = useState<string | null>(null);

  // Purely a re-render trigger — ticks every 15s so "Expires in X min" recomputes
  // from the current time instead of sitting frozen until the next data fetch.
  const [, setTick] = useState(0);
  useEffect(() => {
    const interval = setInterval(() => setTick(t => t + 1), 15000);
    return () => clearInterval(interval);
  }, []);

  const isMounted = useRef(true);
  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
    };
  }, []);

  useEffect(() => {
    fetch(!hasFetched);
    const interval = setInterval(() => fetch(false), 30000);
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetch(false);
    if (isMounted.current) setRefreshing(false);
  };

  const confirmDelete = (id: string) => {
    setNotificationToDelete(id);
  };

  return (
    <View style={{ flex: 1, paddingTop: insets.top, backgroundColor: '#f8fafc' }}>
      <View className="flex-row items-center px-4 py-3 border-b border-slate-100 bg-white">
        <Pressable onPress={() => router.back()} className="p-2 -ml-2 mr-1">
          <Ionicons name="chevron-back" size={24} color="#0f172a" />
        </Pressable>
        <Text className="text-lg font-bold text-slate-900">Notifications</Text>
      </View>

      {loading && notifications.length === 0 ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#2563eb" />
        </View>
      ) : (
        <FlatList
          data={notifications}
          keyExtractor={item => item.id}
          contentContainerStyle={{ padding: 16, paddingBottom: 32, flexGrow: 1 }}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
          ItemSeparatorComponent={() => <View style={{ height: 10 }} />}
          ListEmptyComponent={
            <View className="flex-1 items-center justify-center py-20">
              <Ionicons name="notifications-off-outline" size={32} color="#cbd5e1" />
              <Text className="text-slate-400 text-sm mt-2">No notifications</Text>
            </View>
          }
          renderItem={({ item }: { item: PatientNotificationDto }) => {
            const remaining = minutesRemaining(item.expiresAt);
            const expired = remaining === 0;
            return (
              <Pressable
                onPress={() => markAsRead(item.id)}
                className="rounded-xl border p-4"
                style={{
                  backgroundColor: item.isRead ? '#ffffff' : '#eff6ff',
                  borderColor: item.isRead ? '#e2e8f0' : '#bfdbfe',
                }}
              >
                <View className="flex-row items-start" style={{ gap: 10 }}>
                  <Ionicons
                    name="key-outline"
                    size={20}
                    color="#2563eb"
                    style={{ opacity: item.isRead ? 0.5 : 1, marginTop: 2 }}
                  />
                  <View className="flex-1">
                    <View className="flex-row items-center justify-between mb-1.5">
                      <Text className="font-semibold text-sm text-slate-900 flex-1 pr-2">
                        Access Request from Dr. {item.doctorName || 'Unknown'}
                      </Text>
                      {!item.isRead && <View className="w-2 h-2 rounded-full bg-blue-600 mt-1" />}
                    </View>

                    {item.passkey && !expired && (
                      <View className="bg-blue-50 border border-blue-300 rounded-lg px-3 py-2.5 mb-2 flex-row items-center justify-between">
                        <Text className="text-xs font-medium text-slate-700">Access Code</Text>
                        <Text className="text-lg font-bold text-blue-600" style={{ letterSpacing: 4 }}>
                          {item.passkey}
                        </Text>
                      </View>
                    )}

                    {item.passkey && expired && (
                      <View className="bg-slate-100 border border-slate-200 rounded-lg px-3 py-2 mb-2">
                        <Text className="text-xs text-slate-500 text-center">This access code has expired</Text>
                      </View>
                    )}

                    <View className="flex-row items-center" style={{ gap: 6 }}>
                      <Ionicons name="time-outline" size={12} color="#94a3b8" />
                      <Text className="text-xs text-slate-400">{formatTime(item.createdAt)}</Text>
                      {remaining !== null && remaining > 0 && (
                        <>
                          <Text className="text-xs text-slate-300">•</Text>
                          <Text className="text-xs text-orange-600">Expires in {remaining} min</Text>
                        </>
                      )}
                    </View>
                  </View>

                  <Pressable onPress={() => confirmDelete(item.id)} hitSlop={8} className="p-1">
                    <Ionicons name="close" size={16} color="#94a3b8" />
                  </Pressable>
                </View>
              </Pressable>
            );
          }}
        />
      )}

      <ConfirmModal
        visible={notificationToDelete !== null}
        title="Delete notification"
        message="Are you sure you want to delete this notification?"
        confirmLabel="Delete"
        onCancel={() => setNotificationToDelete(null)}
        onConfirm={async () => {
          if (notificationToDelete) await deleteNotification(notificationToDelete);
          setNotificationToDelete(null);
          showToast('success', 'Notification deleted');
        }}
      />
    </View>
  );
}