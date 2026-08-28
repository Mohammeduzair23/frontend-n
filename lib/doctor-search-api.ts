import { api } from './api';

export interface DoctorSearchResult {
  id: string;
  name: string | null;
  specialty: string | null;
  hospitalName: string | null;
  city: string | null;
  bio: string | null;
  fee: number | null;
  gender: string | null;
  age: number | null;
}

interface DoctorSearchResponseBody {
  success: boolean;
  doctors: DoctorSearchResult[];
  count: number;
}

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

// Matches DoctorSearchService's DEFAULT_CITY — the backend defaults to this
// when no city param is sent, but we send it explicitly to be clear.
const DEFAULT_CITY = 'Gulbarga';

/**
 * Doctor search — matches DoctorSearchController (/api/doctors/search).
 * Empty query returns all doctors in the city (up to 20, per MAX_RESULTS).
 */
export const doctorSearchApi = {
  search: (query: string, city: string = DEFAULT_CITY) =>
    safeCall<DoctorSearchResponseBody>(() =>
      api.get('/doctors/search', { params: { q: query, city } })
    ),
};