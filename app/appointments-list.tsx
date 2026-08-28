import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, Pressable, RefreshControl, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  formatAppointmentDate,
  formatAppointmentTime,
} from '../lib/appointments-api';
import { useAppointmentsStore } from '../lib/appointments-store';

const STATUS_STYLES: Record<
  string,
  { bg: string; color: string; icon: keyof typeof Ionicons.glyphMap; label: string }
> = {
  accepted: { bg: '#dcfce7', color: '#16a34a', icon: 'checkmark-circle', label: 'Accepted' },
  pending: { bg: '#fef9c3', color: '#ca8a04', icon: 'time-outline', label: 'Pending' },
  rejected: { bg: '#fee2e2', color: '#dc2626', icon: 'close-circle', label: 'Rejected' },
  completed: { bg: '#dbeafe', color: '#2563eb', icon: 'checkmark-circle', label: 'Completed' },
  cancelled: { bg: '#f1f5f9', color: '#64748b', icon: 'close-circle', label: 'Cancelled' },
  expired: { bg: '#ffedd5', color: '#ea580c', icon: 'alert-circle-outline', label: 'Expired' },
};

function statusStyle(status: string) {
  return (
    STATUS_STYLES[status?.toLowerCase()] ?? {
      bg: '#f1f5f9',
      color: '#64748b',
      icon: 'help-circle-outline' as const,
      label: 'Unknown',
    }
  );
}

export default function AppointmentsListScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const appointments = useAppointmentsStore(s => s.appointments);
  const loading = useAppointmentsStore(s => s.loading);
  const fetch = useAppointmentsStore(s => s.fetch);
  const [refreshing, setRefreshing] = useState(false);

  // Full spinner only if there's genuinely nothing cached yet; every reopen
  // after that shows cached data instantly while this refreshes silently.
  useEffect(() => {
    fetch(!useAppointmentsStore.getState().hasFetched);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetch(false);
    setRefreshing(false);
  };

  const showFullSpinner = loading && appointments.length === 0;

  return (
    <View style={{ flex: 1, paddingTop: insets.top, backgroundColor: '#f8fafc' }}>
      <View className="flex-row items-center justify-between px-4 py-3 border-b border-slate-100 bg-white">
        <View className="flex-row items-center flex-1">
          <Pressable onPress={() => router.back()} className="p-2 -ml-2 mr-1">
            <Ionicons name="chevron-back" size={24} color="#0f172a" />
          </Pressable>
          <Text className="text-lg font-bold text-slate-900">Appointments</Text>
        </View>
        <Pressable
          onPress={() => router.push('/appointment-request')}
          className="flex-row items-center rounded-full px-4 py-2"
          style={{ backgroundColor: '#0f766e', gap: 6 }}
        >
          <Ionicons name="add" size={16} color="#ffffff" />
          <Text className="text-white font-semibold text-sm">New</Text>
        </Pressable>
      </View>

      {showFullSpinner ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#0f766e" />
        </View>
      ) : (
        <FlatList
          data={appointments}
          keyExtractor={item => item.id}
          contentContainerStyle={{ padding: 16, paddingBottom: 32, flexGrow: 1 }}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
          ItemSeparatorComponent={() => <View style={{ height: 10 }} />}
          ListEmptyComponent={
            <View className="flex-1 items-center justify-center py-16">
              <Ionicons name="calendar-outline" size={32} color="#cbd5e1" />
              <Text className="text-slate-400 text-sm mt-2">No appointments yet</Text>
            </View>
          }
          renderItem={({ item }) => {
            const style = statusStyle(item.status);
            return (
              <View className="bg-white rounded-2xl border border-slate-100 p-4">
                <View className="flex-row items-start justify-between mb-3">
                  <View className="flex-row items-center flex-1" style={{ gap: 10 }}>
                    <View className="w-10 h-10 rounded-full bg-blue-50 items-center justify-center">
                      <Ionicons name="person-outline" size={18} color="#2563eb" />
                    </View>
                    <View className="flex-1">
                      <Text className="font-semibold text-slate-900" numberOfLines={1}>
                        {item.doctorName || 'Doctor'}
                      </Text>
                      <Text className="text-xs text-slate-400">{item.type}</Text>
                    </View>
                  </View>
                  <View
                    className="flex-row items-center rounded-full px-2.5 py-1"
                    style={{ backgroundColor: style.bg, gap: 4 }}
                  >
                    <Ionicons name={style.icon} size={12} color={style.color} />
                    <Text style={{ color: style.color, fontSize: 11, fontWeight: '700' }}>{style.label}</Text>
                  </View>
                </View>

                <View className="flex-row" style={{ gap: 20 }}>
                  <View className="flex-row items-center" style={{ gap: 6 }}>
                    <Ionicons name="calendar-outline" size={14} color="#94a3b8" />
                    <Text className="text-xs text-slate-600">
                      {formatAppointmentDate(item.appointmentDate as any)}
                    </Text>
                  </View>
                  <View className="flex-row items-center" style={{ gap: 6 }}>
                    <Ionicons name="time-outline" size={14} color="#94a3b8" />
                    <Text className="text-xs text-slate-600">
                      {formatAppointmentTime(item.appointmentTime as any)}
                    </Text>
                  </View>
                </View>

                {item.reason && (
                  <View className="mt-3 pt-3 border-t border-slate-100">
                    <Text className="text-xs text-slate-400 mb-0.5">Reason for Visit</Text>
                    <Text className="text-sm text-slate-700">{item.reason}</Text>
                  </View>
                )}

                {item.notes && (
                  <View className="mt-3 pt-3 border-t border-slate-100">
                    <Text className="text-xs text-slate-400 mb-0.5">Doctor's Notes</Text>
                    <Text className="text-sm text-slate-700 italic">{item.notes}</Text>
                  </View>
                )}
              </View>
            );
          }}
        />
      )}
    </View>
  );
}