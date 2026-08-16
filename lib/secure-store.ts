import * as SecureStore from 'expo-secure-store';

const ACCESS_TOKEN_KEY = 'medicare_access_token';
const REFRESH_TOKEN_KEY = 'medicare_refresh_token';
const USER_KEY = 'medicare_user';

export type StoredUser = {
  id: string;
  email: string;
  role: 'Patient' | 'Doctor' | 'Hospital' | 'Labs';
};

export async function saveTokens(accessToken: string, refreshToken?: string) {
  await SecureStore.setItemAsync(ACCESS_TOKEN_KEY, accessToken);
  if (refreshToken) {
    await SecureStore.setItemAsync(REFRESH_TOKEN_KEY, refreshToken);
  }
}

export async function getAccessToken() {
  return SecureStore.getItemAsync(ACCESS_TOKEN_KEY);
}

export async function getRefreshToken() {
  return SecureStore.getItemAsync(REFRESH_TOKEN_KEY);
}

export async function saveUser(user: StoredUser) {
  await SecureStore.setItemAsync(USER_KEY, JSON.stringify(user));
}

export async function getUser(): Promise<StoredUser | null> {
  const raw = await SecureStore.getItemAsync(USER_KEY);
  return raw ? (JSON.parse(raw) as StoredUser) : null;
}

export async function clearTokens() {
  await SecureStore.deleteItemAsync(ACCESS_TOKEN_KEY);
  await SecureStore.deleteItemAsync(REFRESH_TOKEN_KEY);
  await SecureStore.deleteItemAsync(USER_KEY);
}