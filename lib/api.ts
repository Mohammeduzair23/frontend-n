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
      const refreshToken = await getRefreshToken();
      if (!refreshToken) throw new Error('No refresh token');

      const { data } = await axios.post(
        `${API_BASE_URL}/auth/refresh`,
        { refreshToken },
        { headers: { 'X-Client-Type': 'mobile' } }
      );
      await saveTokens(data.token, data.refreshToken);

      pendingQueue.forEach((resolve) => resolve());
      pendingQueue = [];

      return api(originalRequest);
    } catch (refreshError) {
      await clearTokens();
      pendingQueue = [];
      return Promise.reject(refreshError);
    } finally {
      isRefreshing = false;
    }
  }
);