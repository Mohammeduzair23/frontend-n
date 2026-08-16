import { ExpoConfig } from 'expo/config';

const config: ExpoConfig = {
  name: 'frontend-n',
  slug: 'frontend-n',
  scheme: 'medicarehub',
  version: '1.0.0',
  orientation: 'portrait',
  icon: './assets/images/icon.png',
  userInterfaceStyle: 'automatic',
  splash: {
    image: './assets/images/splash.png',
    resizeMode: 'contain',
    backgroundColor: '#ffffff',
  },
  ios: { supportsTablet: true },
  android: { adaptiveIcon: { foregroundImage: './assets/images/adaptive-icon.png', backgroundColor: '#ffffff' } },
  plugins: ['expo-router'],
  extra: {
    apiBaseUrl: process.env.EXPO_PUBLIC_API_URL ?? 'http://10.211.149.129:8081/api',
  },
};

export default config;