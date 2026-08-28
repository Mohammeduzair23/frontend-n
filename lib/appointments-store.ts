import { create } from 'zustand';
import { AppointmentDto, appointmentsApi } from './appointments-api';

interface AppointmentsState {
  appointments: AppointmentDto[];
  loading: boolean;
  hasFetched: boolean;
  fetch: (showSpinner?: boolean) => Promise<void>;
}

let fetchInFlight = false;

/**
 * Single source of truth for appointments — same pattern as
 * notifications-store.ts / profile-store.ts. Both the Appointments list
 * screen and the dashboard's "Upcoming Appointment" card read from here,
 * so:
 *  - reopening the Appointments screen shows cached data instantly instead
 *    of a full spinner every time
 *  - the dashboard card and the full list are always showing the same data
 */
export const useAppointmentsStore = create<AppointmentsState>((set) => ({
  appointments: [],
  loading: false,
  hasFetched: false,

  fetch: async (showSpinner = false) => {
    if (fetchInFlight) return;
    fetchInFlight = true;
    if (showSpinner) set({ loading: true });
    try {
      const result = await appointmentsApi.getAppointments();
      if (!result.error) {
        set({ appointments: result.appointments ?? [], hasFetched: true });
      }
    } catch (err) {
      console.error('Error fetching appointments:', err);
    } finally {
      fetchInFlight = false;
      if (showSpinner) set({ loading: false });
    }
  },
}));