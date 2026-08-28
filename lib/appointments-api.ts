import { api } from './api';

export interface AppointmentDto {
  id: string;
  patientId: string;
  doctorId: string;
  patientName?: string;
  doctorName?: string;
  appointmentDate: string;  // "yyyy-MM-dd" — see parseAppointmentDate() for the array-format fallback
  appointmentTime: string;  // "HH:mm:ss" — backend always calls LocalTime.toString(), so this is a plain string
  period?: string;          // "AM" | "PM"
  type: string;
  reason?: string;
  notes?: string;
  status: 'pending' | 'accepted' | 'rejected' | 'completed' | 'cancelled' | 'expired';
}

export interface DoctorListItem {
  id: string;
  name: string;
  specialty?: string | null;
}

export interface SlotDto {
  value: string; // "10:00"
  label: string; // "10:00 AM"
}

interface AppointmentsListResponse {
  success: boolean;
  count: number;
  appointments: AppointmentDto[];
}

export interface RequestAppointmentPayload {
  doctorId: string;
  appointmentDate: string; // "yyyy-MM-dd"
  appointmentTime: string; // "HH:mm"
  type: string;
  reason: string;
}

interface RequestAppointmentResponse {
  success: boolean;
  message: string;
  appointmentId: string;
  appointment: AppointmentDto;
}

interface DoctorListResponse {
  success: boolean;
  doctors: DoctorListItem[];
}

interface AvailableSlotsResponse {
  doctorId: string;
  date: string;
  slots: SlotDto[];
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

/**
 * Appointments API — matches AppointmentController (/api/appointments*)
 * and AppointmentSlotController (/api/appointments/available-slots).
 *
 * ASSUMPTIONS to double-check against your actual backend DTOs:
 *  - AvailableSlotsResponse's list field is named `slots` in the JSON body
 *    (matches how the web AppointmentRequestModal reads `result.slots`,
 *    but I don't have the AvailableSlotsResponse.java source to confirm
 *    the record's field name directly).
 *  - GET /api/doctor/list exists and returns { success, doctors: [{id,name,specialty}] }
 *    (referenced by the web modal — no controller for it was shared with me).
 */
export const appointmentsApi = {
  getAppointments: () =>
    safeCall<AppointmentsListResponse>(() => api.get('/appointments')),

  requestAppointment: (payload: RequestAppointmentPayload) =>
    safeCall<RequestAppointmentResponse>(() => api.post('/appointments/request', payload)),

  getAvailableSlots: (doctorId: string, date: string) =>
    safeCall<AvailableSlotsResponse>(() =>
      api.get('/appointments/available-slots', { params: { doctorId, date } })
    ),

  getDoctorList: () => safeCall<DoctorListResponse>(() => api.get('/doctor/list')),
};

// ── Date/time parsing helpers ──────────────────────────────────────
// The web AppointmentCard defensively handles LocalDate arriving either as
// an ISO string ("2026-08-01") or as a [year, month, day] array (the
// default Jackson shape for java.time types when timestamps-as-arrays
// isn't disabled). Porting the same defensiveness here since I can't see
// the Jackson config to confirm which one your backend actually sends.

export function parseAppointmentDate(dateValue: string | number[]): Date | null {
  try {
    if (Array.isArray(dateValue)) {
      const [year, month, day] = dateValue;
      return new Date(year, month - 1, day);
    }
    const d = new Date(dateValue);
    return isNaN(d.getTime()) ? null : d;
  } catch {
    return null;
  }
}

export function formatAppointmentDate(dateValue: string | number[]): string {
  const d = parseAppointmentDate(dateValue);
  if (!d) return 'N/A';
  return d.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
}

export function formatAppointmentTime(timeValue?: string | number[]): string {
  if (!timeValue) return 'N/A';
  try {
    let hour: number;
    let minute: number;
    if (Array.isArray(timeValue)) {
      [hour, minute] = timeValue;
    } else {
      [hour, minute] = timeValue.split(':').map(Number);
    }
    const d = new Date();
    d.setHours(hour, minute, 0);
    return d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
  } catch {
    return 'N/A';
  }
}

// Combines the (possibly array-shaped) date with the time-of-day so "is this
// in the future" compares a real timestamp, not just the calendar date —
// an appointment earlier today should count as past, not upcoming.
export function combineAppointmentDateTime(
  dateValue: string | number[],
  timeValue?: string | number[]
): Date | null {
  const datePart = parseAppointmentDate(dateValue);
  if (!datePart) return null;
  if (!timeValue) return datePart;

  let hour = 0;
  let minute = 0;
  try {
    if (Array.isArray(timeValue)) {
      [hour, minute] = timeValue;
    } else {
      [hour, minute] = timeValue.split(':').map(Number);
    }
  } catch {
    // fall through with midnight if time can't be parsed
  }

  const combined = new Date(datePart);
  combined.setHours(hour, minute, 0, 0);
  return combined;
}

const ACTIVE_STATUSES = new Set(['pending', 'accepted']);

/**
 * Filters to appointments that are still ahead of right now and haven't
 * been rejected/cancelled/completed/expired, sorted soonest-first.
 *
 * The backend's GET /appointments returns ALL of a patient's appointments
 * ordered by createdAt (when the request was made), not by appointment
 * date — so "the first one in the list" is not "the next upcoming one".
 * This is that filtering/sorting done properly, client-side.
 */
export function getUpcomingAppointments(appointments: AppointmentDto[]): AppointmentDto[] {
  const now = Date.now();
  return appointments
    .filter(a => ACTIVE_STATUSES.has((a.status || '').toLowerCase()))
    .map(a => ({ appt: a, when: combineAppointmentDateTime(a.appointmentDate as any, a.appointmentTime as any) }))
    .filter((x): x is { appt: AppointmentDto; when: Date } => x.when !== null && x.when.getTime() >= now)
    .sort((a, b) => a.when.getTime() - b.when.getTime())
    .map(x => x.appt);
}