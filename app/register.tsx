import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import { api } from '../lib/api';

type Role = 'Patient' | 'Doctor' | 'Hospital' | 'Labs';
const ROLES: Role[] = ['Patient', 'Doctor', 'Hospital', 'Labs'];

export default function Register() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState<Role>('Patient');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleRegister = async () => {
    setError(null);

    if (password.length < 8) {
      setError('Password must be at least 8 characters.');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setIsLoading(true);
    try {
      await api.post('/auth/register', { email, password, role });
      router.push({ pathname: '/verify-email', params: { email } });
    } catch (err: any) {
      setError(err?.response?.data?.message ?? 'Registration failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={{ flex: 1, paddingTop: insets.top, paddingBottom: insets.bottom, backgroundColor: '#ffffff' }}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
        <View className="px-6 pt-2">
          <Pressable onPress={() => router.back()} className="w-10 h-10 items-center justify-center -ml-2">
            <Ionicons name="chevron-back" size={26} color="#0f172a" />
          </Pressable>
        </View>

        <ScrollView className="px-8" keyboardShouldPersistTaps="handled">
          <Text className="text-2xl font-bold text-slate-900 text-center mb-1 mt-2">Create Account</Text>
          <Text className="text-sm text-slate-500 text-center mb-8">Join Medicare Hub</Text>

          <Text className="text-sm font-medium text-slate-700 mb-2">I am a</Text>
          <View className="flex-row flex-wrap mb-4" style={{ gap: 8 }}>
            {ROLES.map((r) => {
              const selected = role === r;
              return (
                <Pressable
                  key={r}
                  onPress={() => setRole(r)}
                  className={`px-4 py-2.5 rounded-xl border ${
                    selected ? 'bg-blue-600 border-blue-600' : 'bg-white border-slate-300'
                  }`}
                >
                  <Text className={selected ? 'text-white font-semibold' : 'text-slate-700'}>{r}</Text>
                </Pressable>
              );
            })}
          </View>

          <Input
            label="Email Address"
            icon="mail-outline"
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
            placeholder="Enter your email"
          />
          <Input
            label="Password"
            icon="lock-closed-outline"
            isPassword
            value={password}
            onChangeText={setPassword}
            placeholder="At least 8 characters"
          />
          <Input
            label="Confirm Password"
            icon="lock-closed-outline"
            isPassword
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            placeholder="Re-enter your password"
          />

          {error && <Text className="text-red-600 text-sm mb-4">{error}</Text>}

          <Button label="Create Account" loading={isLoading} onPress={handleRegister} />

          <View className="flex-row justify-center mt-6 mb-8">
            <Text className="text-sm text-slate-500">Already have an account? </Text>
            <Pressable onPress={() => router.replace('/login')}>
              <Text className="text-sm text-blue-600 font-semibold">Login</Text>
            </Pressable>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}