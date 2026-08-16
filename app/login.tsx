import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import { api } from '../lib/api';
import { useAuthStore } from '../lib/auth-store';

type LoginResponse = {
  success: boolean;
  message: string;
  token: string;
  refreshToken?: string;
  userData: { id: string; email: string; role: 'Patient' | 'Doctor' | 'Hospital' | 'Labs' };
};

export default function Login() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const login = useAuthStore((s) => s.login);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async () => {
    setError(null);
    setIsLoading(true);
    try {
      const { data } = await api.post<LoginResponse>('/auth/login', { email, password });
      await login(data.token, data.refreshToken, data.userData);
      router.replace(data.userData.role === 'Patient' ? '/patient' : '/');
    } catch (err: any) {
      setError(err?.response?.data?.message ?? 'Login failed. Check your email and password.');
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

        <View className="items-center mt-2 mb-6">
          <View className="w-16 h-16 rounded-full bg-blue-50 items-center justify-center">
            <Ionicons name="medical" size={26} color="#2563eb" />
          </View>
        </View>

        <View className="flex-1 px-8">
          <Text className="text-2xl font-bold text-slate-900 text-center mb-1">Welcome Back</Text>
          <Text className="text-sm text-slate-500 text-center mb-8">Login to your account</Text>

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
            placeholder="Enter your password"
          />

          <Pressable className="self-end mb-6" onPress={() => router.push('/forgot-password')}>
            <Text className="text-sm text-blue-600 font-medium">Forgot Password?</Text>
          </Pressable>

          {error && <Text className="text-red-600 text-sm mb-4">{error}</Text>}

          <Button label="Login" loading={isLoading} onPress={handleLogin} />

          <View className="flex-row items-center my-6">
            <View className="flex-1 h-px bg-slate-200" />
            <Text className="mx-3 text-xs text-slate-400">or</Text>
            <View className="flex-1 h-px bg-slate-200" />
          </View>

          <Button
            label="Continue with Google"
            variant="outline"
            onPress={() => {}}
            icon={<Ionicons name="logo-google" size={18} color="#0f172a" />}
          />

          <View className="flex-row justify-center mt-6">
            <Text className="text-sm text-slate-500">Don't have an account? </Text>
            <Pressable onPress={() => router.push('/register')}>
              <Text className="text-sm text-blue-600 font-semibold">Create Account</Text>
            </Pressable>
          </View>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}