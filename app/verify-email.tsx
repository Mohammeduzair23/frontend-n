import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, Text, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Button } from '../components/Button';
import { api } from '../lib/api';
import { useAuthStore } from '../lib/auth-store';

type VerifyEmailResponse = {
  success: boolean;
  message: string;
  token: string;
  refreshToken?: string;
  userData: { id: string; email: string; role: 'Patient' | 'Doctor' | 'Hospital' | 'Labs' };
};

const RESEND_COOLDOWN_SECONDS = 60;

export default function VerifyEmail() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { email } = useLocalSearchParams<{ email: string }>();
  const login = useAuthStore((s) => s.login);

  const [otp, setOtp] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [cooldown, setCooldown] = useState(RESEND_COOLDOWN_SECONDS);
  const inputRef = useRef<TextInput>(null);

  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setInterval(() => setCooldown((c) => c - 1), 1000);
    return () => clearInterval(timer);
  }, [cooldown]);

  const handleVerify = async () => {
    setError(null);
    if (otp.length !== 6) {
      setError('Enter the 6-digit code sent to your email.');
      return;
    }
    setIsVerifying(true);
    try {
      const { data } = await api.post<VerifyEmailResponse>('/auth/verify-email', { email, otp });
      await login(data.token, data.refreshToken, data.userData);
      router.replace(data.userData.role === 'Patient' ? '/patient' : '/');
    } catch (err: any) {
      setError(err?.response?.data?.message ?? 'Verification failed. Please try again.');
    } finally {
      setIsVerifying(false);
    }
  };

  const handleResend = async () => {
    if (cooldown > 0) return;
    setError(null);
    setIsResending(true);
    try {
      await api.post('/auth/resend-otp', { email });
      setCooldown(RESEND_COOLDOWN_SECONDS);
    } catch (err: any) {
      setError(err?.response?.data?.message ?? 'Could not resend code. Please try again.');
    } finally {
      setIsResending(false);
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

        <View className="flex-1 px-8 pt-6">
          <View className="items-center mb-8">
            <View className="w-16 h-16 rounded-full bg-blue-50 items-center justify-center mb-4">
              <Ionicons name="mail-open-outline" size={26} color="#2563eb" />
            </View>
            <Text className="text-2xl font-bold text-slate-900 text-center mb-1">Verify your email</Text>
            <Text className="text-sm text-slate-500 text-center">
              Enter the 6-digit code sent to{'\n'}
              <Text className="font-semibold text-slate-700">{email}</Text>
            </Text>
          </View>

          <Pressable onPress={() => inputRef.current?.focus()}>
            <View className="flex-row justify-between mb-6">
              {Array.from({ length: 6 }).map((_, i) => (
                <View
                  key={i}
                  className={`w-11 h-13 rounded-xl border items-center justify-center ${
                    i < otp.length ? 'border-blue-600 bg-blue-50' : 'border-slate-300 bg-white'
                  }`}
                  style={{ height: 52 }}
                >
                  <Text className="text-xl font-semibold text-slate-900">{otp[i] ?? ''}</Text>
                </View>
              ))}
            </View>
          </Pressable>

          {/* Hidden input driving the boxes above — keeps native OTP autofill working */}
          <TextInput
            ref={inputRef}
            value={otp}
            onChangeText={(text) => setOtp(text.replace(/[^0-9]/g, '').slice(0, 6))}
            keyboardType="number-pad"
            maxLength={6}
            autoFocus
            textContentType="oneTimeCode"
            style={{ position: 'absolute', opacity: 0, height: 0 }}
          />

          {error && <Text className="text-red-600 text-sm mb-4 text-center">{error}</Text>}

          <Button label="Verify" loading={isVerifying} onPress={handleVerify} />

          <View className="flex-row justify-center mt-6">
            <Text className="text-sm text-slate-500">Didn't get the code? </Text>
            <Pressable onPress={handleResend} disabled={cooldown > 0 || isResending}>
              <Text className={`text-sm font-semibold ${cooldown > 0 ? 'text-slate-400' : 'text-blue-600'}`}>
                {cooldown > 0 ? `Resend in ${cooldown}s` : 'Resend'}
              </Text>
            </Pressable>
          </View>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}