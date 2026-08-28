import { create } from 'zustand';
import { ProfileResponse, UpdateProfilePayload, userApi } from './userApi';

interface ProfileState {
  profile: ProfileResponse | null;
  loading: boolean;
  hasFetched: boolean;
  fetch: (showSpinner?: boolean) => Promise<void>;
  updateProfile: (payload: UpdateProfilePayload) => Promise<ProfileResponse & { error?: string }>;
}

let fetchInFlight = false;

/**
 * Single source of truth for the profile. Both the profile edit screen and
 * the dashboard's display name read from here, so:
 *  - reopening the profile screen shows cached data instantly instead of a
 *    full spinner every time (only the very first-ever fetch shows one)
 *  - saving a name change on the profile screen is reflected on the
 *    dashboard immediately, no separate re-fetch needed
 */
export const useProfileStore = create<ProfileState>((set) => ({
  profile: null,
  loading: false,
  hasFetched: false,

  fetch: async (showSpinner = false) => {
    if (fetchInFlight) return;
    fetchInFlight = true;
    if (showSpinner) set({ loading: true });
    try {
      const result = await userApi.getProfile();
      if (!result.error) {
        set({ profile: result, hasFetched: true });
      }
    } catch (err) {
      console.error('Error fetching profile:', err);
    } finally {
      fetchInFlight = false;
      if (showSpinner) set({ loading: false });
    }
  },

  updateProfile: async (payload: UpdateProfilePayload) => {
    const result = await userApi.updateProfile(payload);
    if (!result.error) set({ profile: result });
    return result;
  },
}));
