import { useEffect, useState } from 'react';
import { View, Text, ScrollView, Pressable } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '../../lib/auth-store';
import { usePatientDashboardData } from '../../lib/patient-dashboard';
import { Avatar } from '../../components/Avatar';
import { ProfileModal } from '../../components/ProfileModal';

function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return { emoji: '👋', text: 'Good morning' };
  if (hour < 17) return { emoji: '👋', text: 'Good afternoon' };
  return { emoji: '👋', text: 'Good evening' };
}

// TODO: replace with a real display name once the backend has a name/fullName field.
// Falling back to the email's local part, capitalized, for now.
function displayNameFromEmail(email?: string | null) {
  if (!email) return 'there';
  const local = email.split('@')[0];
  return local.charAt(0).toUpperCase() + local.slice(1);
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
  const { user, logout } = useAuthStore();
  const { data, loading, fetch } = usePatientDashboardData();
  const [showTip, setShowTip] = useState(true);
  const [showProfile, setShowProfile] = useState(false);

  useEffect(() => {
    fetch();
  }, [fetch]);

  const greeting = getGreeting();
  const name = displayNameFromEmail(user?.email);
  const nextAppointment = data.appointments[0];

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
              onPress={() => router.push('/patient/more')}
              className="w-11 h-11 rounded-full bg-white items-center justify-center border border-slate-200"
            >
              <Ionicons name="notifications-outline" size={20} color="#0f172a" />
              {data.unreadNotificationsCount > 0 && (
                <View className="absolute -top-1 -right-1 bg-red-500 rounded-full w-5 h-5 items-center justify-center">
                  <Text className="text-white text-[10px] font-bold">
                    {data.unreadNotificationsCount}
                  </Text>
                </View>
              )}
            </Pressable>
            <Pressable onPress={() => setShowProfile(true)}>
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
            <SummaryItem icon="calendar-outline" value={String(data.appointments.length)} label="Upcoming" />
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
              onPress={() => router.push(`/patient/${item.key === 'appointments' || item.key === 'notifications' ? 'more' : item.key}` as any)}
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
            <Pressable onPress={() => router.push('/patient/more')}>
              <Text className="text-blue-600 text-sm font-medium">View All</Text>
            </Pressable>
          </View>

          {loading ? (
            <Text className="text-sm text-slate-400">Loading…</Text>
          ) : nextAppointment ? (
            <View className="flex-row items-center">
              <View className="bg-blue-50 rounded-xl px-3 py-2 items-center mr-3" style={{ minWidth: 56 }}>
                <Text className="text-xs text-blue-600 font-medium">
                  {new Date(nextAppointment.date).toLocaleString('en-US', { month: 'short' })}
                </Text>
                <Text className="text-lg font-bold text-slate-900">
                  {new Date(nextAppointment.date).getDate()}
                </Text>
              </View>
              <View className="flex-1">
                <Text className="font-semibold text-slate-900">{nextAppointment.title}</Text>
                <Text className="text-sm text-slate-500">{nextAppointment.doctorName}</Text>
                <Text className="text-xs text-slate-400 mt-0.5">
                  {nextAppointment.time} · {nextAppointment.location}
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

      <ProfileModal
        visible={showProfile}
        onClose={() => setShowProfile(false)}
        email={user?.email}
        role={user?.role}
        onLogout={logout}
      />
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
