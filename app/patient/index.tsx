import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Avatar } from '../../components/Avatar';
import { formatAppointmentTime, getUpcomingAppointments, parseAppointmentDate } from '../../lib/appointments-api';
import { useAppointmentsStore } from '../../lib/appointments-store';
import { useAuthStore } from '../../lib/auth-store';
import { useNotificationsStore } from '../../lib/notifications-store';
import { usePatientDashboardData } from '../../lib/patient-dashboard';
import { useProfileStore } from '../../lib/profile-store';

function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return { emoji: '👋', text: 'Good morning' };
  if (hour < 17) return { emoji: '👋', text: 'Good afternoon' };
  return { emoji: '👋', text: 'Good evening' };
}

// Temporary display name for a brand-new user whose profile hasn't been
// created yet — derived from the email's local part (before @), letters
// only (no digits), first letter capitalized. e.g. "john123doe@x.com" -> "Johndoe"
function displayNameFromEmail(email?: string | null) {
  if (!email) return 'there';
  const local = email.split('@')[0];
  const lettersOnly = local.replace(/[^a-zA-Z]/g, '');
  if (!lettersOnly) return 'there';
  return lettersOnly.charAt(0).toUpperCase() + lettersOnly.slice(1);
}

const quickAccess = [
  { key: 'medical', label: 'Medical', desc: 'View your medical records', icon: 'folder-open-outline', bg: 'bg-green-50', color: '#16a34a' },
  { key: 'lab', label: 'Lab Results', desc: 'View your lab reports', icon: 'flask-outline', bg: 'bg-blue-50', color: '#2563eb' },
  { key: 'prescription', label: 'Prescription', desc: 'View your prescriptions', icon: 'medkit-outline', bg: 'bg-purple-50', color: '#7c3aed' },
  { key: 'appointments', label: 'Appointment', desc: 'View and manage appointments', icon: 'calendar-outline', bg: 'bg-orange-50', color: '#ea580c' },
  { key: 'notifications', label: 'Notification', desc: 'View all health notifications', icon: 'notifications-outline', bg: 'bg-red-50', color: '#dc2626' },
] as const;

export default function PatientHome() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { user } = useAuthStore();
  const { data, fetch } = usePatientDashboardData();
  const [showTip, setShowTip] = useState(true);

  // Bell badge — shared store, same source the notifications screen reads/writes.
  const unreadNotifications = useNotificationsStore(s => s.unreadCount);
  const fetchNotifications = useNotificationsStore(s => s.fetch);

  // Profile — shared store, same source the profile screen reads/writes.
  const profile = useProfileStore(s => s.profile);
  const fetchProfile = useProfileStore(s => s.fetch);

  // Appointments — shared store, same source the Appointments list reads/writes.
  // "Next upcoming" is computed here (future-dated, active status, soonest
  // first) rather than trusting raw list order, which is sorted by when the
  // request was created, not by appointment date.
  const appointments = useAppointmentsStore(s => s.appointments);
  const appointmentsLoading = useAppointmentsStore(s => s.loading);
  const fetchAppointments = useAppointmentsStore(s => s.fetch);
  const upcomingAppointments = getUpcomingAppointments(appointments);
  const nextAppointment = upcomingAppointments[0];

  useEffect(() => {
    fetch();
  }, [fetch]);

  useEffect(() => {
    fetchNotifications(true);
    const interval = setInterval(() => fetchNotifications(false), 30000);
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    fetchProfile(!useProfileStore.getState().hasFetched);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    fetchAppointments(!useAppointmentsStore.getState().hasFetched);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const greeting = getGreeting();
  const name = profile?.name?.trim() ? profile.name.trim() : displayNameFromEmail(user?.email);

  return (
    <View style={{ flex: 1, paddingTop: insets.top, backgroundColor: '#f8fafc' }}>
      <ScrollView className="px-6" contentContainerStyle={{ paddingBottom: 24 }}>
        {/* Header */}
        <View className="flex-row items-center justify-between mt-4 mb-1">
          <View>
            <Text className="text-base text-slate-500">
              {greeting.emoji} {greeting.text},
            </Text>
            <Text className="text-2xl font-bold text-slate-900">{name}</Text>
          </View>
          <View className="flex-row items-center" style={{ gap: 12 }}>
            <Pressable
              onPress={() => router.push('/notifications')}
              className="w-11 h-11 rounded-full bg-white items-center justify-center border border-slate-200"
            >
              <Ionicons name="notifications-outline" size={20} color="#0f172a" />
              {unreadNotifications > 0 && (
                <View className="absolute -top-1 -right-1 bg-red-500 rounded-full w-5 h-5 items-center justify-center">
                  <Text className="text-white text-[10px] font-bold">
                    {unreadNotifications > 9 ? '9+' : unreadNotifications}
                  </Text>
                </View>
              )}
            </Pressable>
            <Pressable onPress={() => router.push('/profile')}>
              <Avatar label={name} />
            </Pressable>
          </View>
        </View>
        <Text className="text-sm text-slate-400 mb-6">Take care of your health today.</Text>

        {/* Health Summary */}
        <View className="rounded-2xl p-5 mb-6" style={{ backgroundColor: '#0f766e' }}>
          <View className="flex-row items-center justify-between mb-5">
            <View className="flex-row items-center" style={{ gap: 8 }}>
              <Ionicons name="pulse-outline" size={20} color="#ffffff" />
              <Text className="text-white font-semibold text-base">Health Summary</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color="#ffffff" />
          </View>
          <View className="flex-row justify-between">
            <SummaryItem icon="heart-outline" value="Good" label="Health Status" />
            <SummaryItem icon="calendar-outline" value={String(upcomingAppointments.length)} label="Upcoming" />
            <SummaryItem icon="medkit-outline" value={String(data.prescriptionsCount)} label="Prescriptions" />
            <SummaryItem icon="flask-outline" value={String(data.labResultsCount)} label="Lab Reports" />
          </View>
        </View>

        {/* Quick Access */}
        <Text className="text-lg font-bold text-slate-900 mb-3">Quick Access</Text>
        <View className="flex-row flex-wrap justify-between mb-6">
          {quickAccess.map((item) => (
            <Pressable
              key={item.key}
              onPress={() => {
                if (item.key === 'appointments') router.push('/appointments-list');
                else if (item.key === 'notifications') router.push('/notifications');
                else router.push(`/patient/${item.key}` as any);
              }}
              className="bg-white rounded-2xl border border-slate-100 p-4 mb-4"
              style={{ width: '48%' }}
            >
              <View className={`w-11 h-11 rounded-xl ${item.bg} items-center justify-center mb-3`}>
                <Ionicons name={item.icon as any} size={20} color={item.color} />
              </View>
              <Text className="font-semibold text-slate-900 mb-1">{item.label}</Text>
              <View className="flex-row items-center justify-between">
                <Text className="text-xs text-slate-400 flex-1 pr-1">{item.desc}</Text>
                <Ionicons name="chevron-forward" size={14} color="#94a3b8" />
              </View>
            </Pressable>
          ))}
        </View>

        {/* Upcoming Appointment */}
        <View className="bg-white rounded-2xl border border-slate-100 p-4 mb-6">
          <View className="flex-row items-center justify-between mb-3">
            <Text className="font-bold text-slate-900">Upcoming Appointment</Text>
            <Pressable onPress={() => router.push('/appointments-list')}>
              <Text className="text-blue-600 text-sm font-medium">View All</Text>
            </Pressable>
          </View>

          {appointmentsLoading && appointments.length === 0 ? (
            <Text className="text-sm text-slate-400">Loading…</Text>
          ) : nextAppointment ? (
            <View className="flex-row items-center">
              <View className="bg-blue-50 rounded-xl px-3 py-2 items-center mr-3" style={{ minWidth: 56 }}>
                <Text className="text-xs text-blue-600 font-medium">
                  {parseAppointmentDate(nextAppointment.appointmentDate as any)?.toLocaleString('en-US', { month: 'short' }) ?? ''}
                </Text>
                <Text className="text-lg font-bold text-slate-900">
                  {parseAppointmentDate(nextAppointment.appointmentDate as any)?.getDate() ?? ''}
                </Text>
              </View>
              <View className="flex-1">
                <Text className="font-semibold text-slate-900">{nextAppointment.doctorName || 'Doctor'}</Text>
                <Text className="text-sm text-slate-500">{nextAppointment.type}</Text>
                <Text className="text-xs text-slate-400 mt-0.5">
                  {formatAppointmentTime(nextAppointment.appointmentTime as any)}
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color="#94a3b8" />
            </View>
          ) : (
            <Text className="text-sm text-slate-400">No upcoming appointments</Text>
          )}
        </View>

        {/* Tip banner */}
        {showTip && (
          <View className="flex-row items-center bg-green-50 rounded-2xl p-4">
            <View className="w-11 h-11 rounded-full bg-green-500 items-center justify-center mr-3">
              <Ionicons name="water-outline" size={20} color="#ffffff" />
            </View>
            <View className="flex-1">
              <Text className="font-semibold text-slate-900">Stay Hydrated</Text>
              <Text className="text-xs text-slate-500">Drink plenty of water and stay healthy!</Text>
            </View>
            <Pressable onPress={() => setShowTip(false)} className="p-1">
              <Ionicons name="close" size={18} color="#64748b" />
            </Pressable>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

function SummaryItem({ icon, value, label }: { icon: string; value: string; label: string }) {
  return (
    <View className="items-center" style={{ width: '24%' }}>
      <View className="w-11 h-11 rounded-full bg-white/20 items-center justify-center mb-1.5">
        <Ionicons name={icon as any} size={18} color="#ffffff" />
      </View>
      <Text className="text-white font-bold text-sm">{value}</Text>
      <Text className="text-white/80 text-[10px] text-center">{label}</Text>
    </View>
  );
}