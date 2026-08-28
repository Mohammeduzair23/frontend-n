import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { InlineToast } from '../components/InlineToast';
import '../global.css';
import { useAuthStore } from '../lib/auth-store';

export default function RootLayout() {
  const isHydrating = useAuthStore((s) => s.isHydrating);

  useEffect(() => {
    useAuthStore.getState().hydrate();
  }, []);

  if (isHydrating) {
    return null;
  }

  return (
    <SafeAreaProvider>
      <StatusBar style="dark" />
      <Stack screenOptions={{ headerShown: false }} />
      <InlineToast />
    </SafeAreaProvider>
  );
}