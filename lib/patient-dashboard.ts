import { useCallback, useState } from 'react';
import { api } from './api';

export type Appointment = {
  id: string;
  doctorName: string;
  title: string;
  date: string; // ISO string
  time: string;
  location: string;
};

type DashboardData = {
  medicalRecordsCount: number;
  prescriptionsCount: number;
  labResultsCount: number;
  appointments: Appointment[];
  unreadNotificationsCount: number;
};

const EMPTY: DashboardData = {
  medicalRecordsCount: 0,
  prescriptionsCount: 0,
  labResultsCount: 0,
  appointments: [],
  unreadNotificationsCount: 0,
};

/**
 * Best-effort normalizer for AppointmentResponse — I haven't seen that DTO yet,
 * so this tries a few likely field-name variants instead of assuming one exact
 * shape. Once you share AppointmentResponse.java, this can be simplified to
 * match it exactly.
 */
function normalizeAppointment(raw: any): Appointment {
  const rawDate = raw.appointmentDate ?? raw.date ?? raw.scheduledAt ?? raw.dateTime;
  return {
    id: raw.id,
    doctorName: raw.doctorName ?? raw.doctor?.name ?? raw.doctor?.email ?? 'Doctor',
    title: raw.title ?? raw.reason ?? raw.type ?? 'Appointment',
    date: rawDate ?? new Date().toISOString(),
    time: raw.time ?? (rawDate ? new Date(rawDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''),
    location: raw.location ?? raw.hospitalName ?? raw.clinicName ?? '',
  };
}

export function usePatientDashboardData() {
  const [data, setData] = useState<DashboardData>(EMPTY);
  const [loading, setLoading] = useState(false);

  const fetch = useCallback(async () => {
    setLoading(true);
    try {
      const results = await Promise.allSettled([
        api.get('/medical/records'),
        api.get('/prescription/records'),
        api.get('/lab/records'),
        api.get('/appointments'),
        api.get('/notifications'),
      ]);

      const [medicalRes, prescriptionRes, labRes, appointmentRes, notifRes] = results;

      const appointments =
        appointmentRes.status === 'fulfilled'
          ? (appointmentRes.value.data?.appointments ?? []).map(normalizeAppointment)
          : [];

      setData({
        medicalRecordsCount:
          medicalRes.status === 'fulfilled' ? (medicalRes.value.data?.count ?? 0) : 0,
        prescriptionsCount:
          prescriptionRes.status === 'fulfilled' ? (prescriptionRes.value.data?.count ?? 0) : 0,
        labResultsCount: labRes.status === 'fulfilled' ? (labRes.value.data?.count ?? 0) : 0,
        appointments,
        unreadNotificationsCount:
          notifRes.status === 'fulfilled' ? Number(notifRes.value.data?.unreadCount ?? 0) : 0,
      });
    } finally {
      setLoading(false);
    }
  }, []);

  return { data, loading, fetch };
}