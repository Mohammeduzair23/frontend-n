import { create } from 'zustand';
import { api } from './api';
import {
  clearTokens,
  getAccessToken,
  getRefreshToken,
  getUser,
  saveTokens,
  saveUser,
  StoredUser,
} from './secure-store';

type AuthState = {
  user: StoredUser | null;
  isLoggedIn: boolean;
  isHydrating: boolean;
  hydrate: () => Promise<void>;
  login: (accessToken: string, refreshToken: string | undefined, user: StoredUser) => Promise<void>;
  logout: () => Promise<void>;
};

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isLoggedIn: false,
  isHydrating: true,

  hydrate: async () => {
    const token = await getAccessToken();
    const user = await getUser();
    set({ user, isLoggedIn: !!token && !!user, isHydrating: false });
  },

  login: async (accessToken, refreshToken, user) => {
    await saveTokens(accessToken, refreshToken);
    await saveUser(user);
    set({ user, isLoggedIn: true });
  },

  logout: async () => {
    try {
      const refreshToken = await getRefreshToken();
      await api.post('/auth/logout', { refreshToken });
    } catch {
      // best-effort — still clear local state even if the backend call fails
    }
    await clearTokens();
    set({ user: null, isLoggedIn: false });
  },
}));