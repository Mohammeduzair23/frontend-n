import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, Pressable, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ConfirmModal } from '../../components/ConfirmModal';
import { useAuthStore } from '../../lib/auth-store';
import { useToastStore } from '../../lib/toast-store';

const MENU_ITEMS = [
  {
    key: 'appointments',
    label: 'Appointments',
    desc: 'View and manage your appointments',
    icon: 'calendar-outline' as const,
    route: '/appointments-list',
  },
  {
    key: 'search',
    label: 'Search Doctors',
    desc: 'Find a doctor by name, specialty, or hospital',
    icon: 'search-outline' as const,
    route: '/doctor-search',
  },
];

export default function More() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { user, logout } = useAuthStore();
  const showToast = useToastStore(s => s.show);
  const [loggingOut, setLoggingOut] = useState(false);
  const [confirmLogout, setConfirmLogout] = useState(false);

  // No explicit navigation needed here — app/patient/_layout.tsx already
  // redirects to /login the instant isLoggedIn flips false, since this
  // screen (unlike app/profile.tsx) lives inside that Tabs layout. This
  // just handles the loading state for the async gap before that happens.
  const handleLogout = () => {
    setConfirmLogout(true);
  };

  const confirmLogoutAction = async () => {
    setConfirmLogout(false);
    setLoggingOut(true);
    try {
      await logout();
      showToast('success', 'Logged out successfully');
    } finally {
      setLoggingOut(false);
    }
  };

  return (
    <View style={{ flex: 1, paddingTop: insets.top, backgroundColor: '#f8fafc' }} className="px-6">
      <Text className="text-2xl font-bold text-slate-900 mt-4 mb-6">More</Text>

      <View className="bg-white rounded-2xl border border-slate-100 p-4 mb-4">
        <Text className="text-sm text-slate-500">Signed in as</Text>
        <Text className="text-base font-semibold text-slate-900">{user?.email}</Text>
      </View>

      <View style={{ gap: 12 }} className="mb-4">
        {MENU_ITEMS.map(item => (
          <Pressable
            key={item.key}
            onPress={() => router.push(item.route as any)}
            className="flex-row items-center bg-white rounded-2xl border border-slate-100 p-4"
          >
            <View
              className="w-11 h-11 rounded-xl items-center justify-center mr-3"
              style={{ backgroundColor: '#f0fdfa' }}
            >
              <Ionicons name={item.icon} size={20} color="#0f766e" />
            </View>
            <View className="flex-1">
              <Text className="font-semibold text-slate-900">{item.label}</Text>
              <Text className="text-xs text-slate-400 mt-0.5">{item.desc}</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color="#94a3b8" />
          </Pressable>
        ))}
      </View>

      <Pressable
        onPress={handleLogout}
        disabled={loggingOut}
        className="flex-row items-center justify-center bg-white rounded-2xl border border-slate-100 p-4"
        style={{ opacity: loggingOut ? 0.6 : 1, gap: 10 }}
      >
        {loggingOut ? (
          <>
            <ActivityIndicator size="small" color="#dc2626" />
            <Text className="text-red-600 font-semibold">Logging out...</Text>
          </>
        ) : (
          <>
            <Ionicons name="log-out-outline" size={20} color="#dc2626" />
            <Text className="text-red-600 font-semibold">Logout</Text>
          </>
        )}
      </Pressable>

      <ConfirmModal
        visible={confirmLogout}
        title="Log out"
        message="Are you sure you want to log out?"
        confirmLabel="Log out"
        onCancel={() => setConfirmLogout(false)}
        onConfirm={confirmLogoutAction}
      />
    </View>
  );
}