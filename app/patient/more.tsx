import { View, Text, Pressable } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '../../lib/auth-store';

export default function More() {
  const insets = useSafeAreaInsets();
  const { user, logout } = useAuthStore();

  return (
    <View style={{ flex: 1, paddingTop: insets.top, backgroundColor: '#f8fafc' }} className="px-6">
      <Text className="text-2xl font-bold text-slate-900 mt-4 mb-6">More</Text>

      <View className="bg-white rounded-2xl border border-slate-100 p-4 mb-4">
        <Text className="text-sm text-slate-500">Signed in as</Text>
        <Text className="text-base font-semibold text-slate-900">{user?.email}</Text>
      </View>

      {/* TODO: Appointments and Notifications full-list screens go here once
          their endpoints are wired — Quick Access tiles on Home currently
          route here as a temporary landing spot. */}

      <Pressable
        onPress={logout}
        className="flex-row items-center bg-white rounded-2xl border border-slate-100 p-4"
      >
        <Ionicons name="log-out-outline" size={20} color="#dc2626" />
        <Text className="text-red-600 font-semibold ml-3">Logout</Text>
      </Pressable>
    </View>
  );
}
