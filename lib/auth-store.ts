import { create } from 'zustand';
import { api, refreshAccessToken } from './api';
import {
  clearTokens,
  getAccessToken,
  getRefreshToken,
  getUser,
  isTokenExpired,
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
    let token = await getAccessToken();
    const user = await getUser();

    // Proactive refresh: if the stored access token is already expired
    // (e.g. the app was closed overnight — access tokens live 15 minutes),
    // refresh it right here before the dashboard fires its usual batch of
    // requests, instead of letting every one of them fail with 401 first
    // and only then triggering the reactive refresh in api.ts.
    if (token && isTokenExpired(token)) {
      const refreshed = await refreshAccessToken();
      token = refreshed ? await getAccessToken() : null;
    }

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