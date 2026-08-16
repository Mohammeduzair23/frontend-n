import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import { api } from '../lib/api';

export default function ForgotPassword() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);

  const handleSubmit = async () => {
    setError(null);
    setIsLoading(true);
    try {
      await api.post('/auth/forgot-password', { email });
      setSent(true); // backend always returns a generic success message — don't reveal account existence
    } catch (err: any) {
      setError(err?.response?.data?.message ?? 'Something went wrong. Please try again.');
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

        <View className="flex-1 px-8 pt-6">
          {sent ? (
            <View className="items-center mt-4">
              <View className="w-16 h-16 rounded-full bg-blue-50 items-center justify-center mb-4">
                <Ionicons name="mail-open-outline" size={28} color="#2563eb" />
              </View>
              <Text className="text-xl font-bold text-slate-900 text-center mb-2">Check your email</Text>
              <Text className="text-sm text-slate-500 text-center leading-5 mb-2">
                If an account exists for {email}, we've sent a password reset link.
              </Text>
              <Text className="text-sm text-slate-500 text-center leading-5 mb-8">
                Open the link on your phone or computer's browser to finish resetting your password.
              </Text>
              <Button label="Back to Login" variant="outline" onPress={() => router.replace('/login')} />
            </View>
          ) : (
            <>
              <View className="items-center mb-8">
                <View className="w-16 h-16 rounded-full bg-blue-50 items-center justify-center mb-4">
                  <Ionicons name="lock-open-outline" size={26} color="#2563eb" />
                </View>
                <Text className="text-2xl font-bold text-slate-900 text-center mb-1">Forgot Password?</Text>
                <Text className="text-sm text-slate-500 text-center">
                  Enter your email and we'll send you a reset link
                </Text>
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

              {error && <Text className="text-red-600 text-sm mb-4">{error}</Text>}

              <Button label="Send Reset Link" loading={isLoading} onPress={handleSubmit} />
            </>
          )}
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}
