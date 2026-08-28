import axios from 'axios';
import { clearTokens, getAccessToken, getRefreshToken, saveTokens } from './secure-store';

const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL as string;

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: { 'X-Client-Type': 'mobile' },
});

// Attach access token on every request
api.interceptors.request.use(async (config) => {
  const token = await getAccessToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

/**
 * Calls /auth/refresh with the stored refresh token and saves whatever new
 * tokens come back. Returns true on success, false on failure (and clears
 * stored tokens on failure, since a dead refresh token means the session is
 * over either way).
 *
 * Extracted out of the response interceptor so it can also be called
 * proactively from auth-store's hydrate() on app launch, not just
 * reactively after a request has already failed with 401.
 */
export async function refreshAccessToken(): Promise<boolean> {
  try {
    const refreshToken = await getRefreshToken();
    if (!refreshToken) throw new Error('No refresh token');

    const { data } = await axios.post(
      `${API_BASE_URL}/auth/refresh`,
      { refreshToken },
      { headers: { 'X-Client-Type': 'mobile' } }
    );
    await saveTokens(data.token, data.refreshToken);
    return true;
  } catch {
    await clearTokens();
    return false;
  }
}

// Silent refresh — queue requests that arrive while a refresh is already in flight
let isRefreshing = false;
let pendingQueue: Array<() => void> = [];

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status !== 401 || originalRequest._retry) {
      return Promise.reject(error);
    }

    if (isRefreshing) {
      return new Promise((resolve) => {
        pendingQueue.push(() => resolve(api(originalRequest)));
      });
    }

    originalRequest._retry = true;
    isRefreshing = true;

    try {
      const refreshed = await refreshAccessToken();
      if (!refreshed) throw new Error('Refresh failed');

      pendingQueue.forEach((resolve) => resolve());
      pendingQueue = [];

      return api(originalRequest);
    } catch (refreshError) {
      pendingQueue = [];
      return Promise.reject(refreshError);
    } finally {
      isRefreshing = false;
    }
  }
);