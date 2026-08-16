import { Ionicons } from '@expo/vector-icons';
import { Redirect, useRouter } from 'expo-router';
import { Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Button } from '../components/Button';
import { useAuthStore } from '../lib/auth-store';

const features: { icon: keyof typeof Ionicons.glyphMap; label: string }[] = [
  { icon: 'shield-checkmark-outline', label: 'Secure' },
  { icon: 'stats-chart-outline', label: 'Efficient' },
  { icon: 'heart-outline', label: 'Reliable' },
];

export default function Home() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  //const { isLoggedIn, user, logout } = useAuthStore();

  const { isLoggedIn, user, logout } = useAuthStore();
  if (isLoggedIn && user?.role === 'Patient') {
    return <Redirect href="/patient" />;
  }

  return (
    // flex/height/padding are set via inline style, not className — this always
    // applies regardless of whether NativeWind has been configured to style
    // third-party components. Colors/spacing below still use className, which
    // works fine for plain View/Text/Pressable.
    <View
      style={{
        flex: 1,
        paddingTop: insets.top,
        paddingBottom: insets.bottom,
        backgroundColor: '#f8fafc',
      }}
    >
      <View style={{ flex: 1, justifyContent: 'space-between' }} className="px-8 py-10">
        <View />

        <View className="items-center">
          <View className="w-24 h-24 rounded-full bg-white items-center justify-center mb-6 shadow-lg">
            <Ionicons name="medical" size={40} color="#2563eb" />
          </View>
          <Text className="text-3xl font-bold text-slate-900 tracking-tight">
            Medicare<Text className="text-blue-600">Hub</Text>
          </Text>
          <Text className="mt-1 text-sm font-medium text-slate-500 tracking-wide">
            SMART MANAGEMENT SYSTEM
          </Text>
          <Text className="mt-4 text-center text-sm text-slate-400 leading-5">
            Your all-in-one solution for seamless healthcare management and better patient care
          </Text>

          {isLoggedIn && (
            <View className="mt-6 bg-white rounded-xl px-5 py-3 border border-slate-300">
              <Text className="text-sm text-slate-600">
                Signed in as <Text className="font-semibold text-slate-900">{user?.email}</Text>
              </Text>
            </View>
          )}
        </View>

        <View>
          {isLoggedIn ? (
            <Button label="Logout" variant="secondary" onPress={logout} />
          ) : (
            <>
              <Button label="Login" onPress={() => router.push('/login')} />
              <View className="mt-3">
                <Button label="Create Account" variant="outline" onPress={() => router.push('/register')} />
              </View>
            </>
          )}

          <View className="flex-row justify-around mt-8">
            {features.map((f) => (
              <View key={f.label} className="items-center">
                <View className="w-11 h-11 rounded-full bg-blue-50 items-center justify-center mb-1.5">
                  <Ionicons name={f.icon} size={18} color="#2563eb" />
                </View>
                <Text className="text-xs text-slate-500">{f.label}</Text>
              </View>
            ))}
          </View>
        </View>
      </View>
    </View>
  );
}