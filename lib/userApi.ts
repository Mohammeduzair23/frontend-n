import { api } from './api';

// ── Response types ─────────────────────────────────────────────────────────

/**
 * Matches backend ProfileResponse record exactly.
 * specialty, city, bio, fee are populated for Doctor accounts only — null for others.
 */
export interface ProfileResponse {
  id: string;
  email: string;
  role: 'Patient' | 'Doctor' | 'Hospital' | 'Labs';
  name: string | null;
  gender: string | null;
  dateOfBirth: string | null;
  age: number | null;
  hospitalName: string | null;
  // Doctor-specific
  specialty: string | null;
  city: string | null;
  bio: string | null;
  fee: number | null;
  profileComplete: boolean;
  error?: string;
}

export interface UpdateProfilePayload {
  name?: string;
  age?: number;
  gender?: string;
  dateOfBirth?: string;
  hospitalName?: string;
  // Doctor-specific — ignored by backend for non-Doctor roles
  specialty?: string;
  city?: string;
  bio?: string;
  fee?: number;
}

/**
 * Wraps an axios call, returning the response payload on success or
 * `{ error }` on failure. Callers check `result.error` the same way
 * the rest of the app's API layer already does.
 */
async function safeCall<T>(fn: () => Promise<{ data: T }>): Promise<T & { error?: string }> {
  try {
    const { data } = await fn();
    return data as T & { error?: string };
  } catch (err: any) {
    const message =
      err?.response?.data?.message || err?.message || 'Something went wrong. Please try again.';
    return { error: message } as T & { error?: string };
  }
}

/**
 * User API — profile read/update for the currently authenticated user.
 * Backend derives identity from the JWT — no userId in URL or body.
 *
 * NOTE: assumes the axios baseURL already includes the `/api` prefix
 * (same convention as medical-api.ts) and that the backend exposes
 * this at `/profile` — double check against your ProfileController's
 * @RequestMapping if it isn't.
 */
export const userApi = {
  getProfile: () => safeCall<ProfileResponse>(() => api.get('/profile')),

  updateProfile: (profileData: UpdateProfilePayload) =>
    safeCall<ProfileResponse>(() => api.put('/profile', profileData)),
};