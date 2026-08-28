import { Ionicons } from '@expo/vector-icons';
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  appointmentsApi,
  DoctorListItem,
  SlotDto,
} from '../lib/appointments-api';
import { useToastStore } from '../lib/toast-store';

const ACCENT = '#0f766e'; // matches patient dashboard's teal

// Must match AppointmentSlotService / AppointmentRequestModal exactly.
const APPOINTMENT_TYPES = ['New Patient', 'Follow-up', 'Check-Up', 'Consultation', 'Emergency'];

function groupSlotsByPeriod(slots: SlotDto[]) {
  const groups: Record<'Morning' | 'Afternoon' | 'Evening', SlotDto[]> = {
    Morning: [],
    Afternoon: [],
    Evening: [],
  };
  slots.forEach(slot => {
    const hour = parseInt(slot.value.split(':')[0], 10);
    if (hour < 12) groups.Morning.push(slot);
    else if (hour < 17) groups.Afternoon.push(slot);
    else groups.Evening.push(slot);
  });
  return (Object.entries(groups) as [string, SlotDto[]][]).filter(([, list]) => list.length > 0);
}

function formatDisplayDate(iso: string) {
  if (!iso) return '';
  const d = new Date(iso);
  if (isNaN(d.getTime())) return '';
  return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
}

export default function AppointmentRequestScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const params = useLocalSearchParams<{ doctorId?: string; doctorName?: string; specialty?: string }>();
  const showToast = useToastStore(s => s.show);

  const [doctorId, setDoctorId] = useState(params.doctorId ?? '');
  const [appointmentDate, setAppointmentDate] = useState('');
  const [appointmentTime, setAppointmentTime] = useState('');
  const [type, setType] = useState('New Patient');
  const [reason, setReason] = useState('');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showDoctorPicker, setShowDoctorPicker] = useState(false);

  const [doctors, setDoctors] = useState<DoctorListItem[]>([]);
  const [doctorsLoading, setDoctorsLoading] = useState(false);
  const [doctorsError, setDoctorsError] = useState(false);

  const [slots, setSlots] = useState<SlotDto[]>([]);
  const [slotsLoading, setSlotsLoading] = useState(false);
  const [slotsError, setSlotsError] = useState('');

  // Show the pre-selected doctor's name immediately (from the search screen's
  // params) even before the full doctor list has finished loading.
  const selectedDoctor =
    doctors.find(d => d.id === doctorId) ??
    (params.doctorId && params.doctorId === doctorId
      ? { id: params.doctorId, name: params.doctorName || 'Selected doctor', specialty: params.specialty || null }
      : undefined);

  // ── Fetch doctors on mount ─────────────────────────────────────

  const fetchDoctors = useCallback(async () => {
    setDoctorsLoading(true);
    setDoctorsError(false);
    try {
      const result = await appointmentsApi.getDoctorList();
      if (!result.error && result.doctors?.length) {
        setDoctors(result.doctors);
      } else {
        setDoctors([]);
        setDoctorsError(true);
      }
    } catch {
      setDoctors([]);
      setDoctorsError(true);
    } finally {
      setDoctorsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDoctors();
  }, [fetchDoctors]);

  // ── Fetch slots whenever doctor + date are both set ─────────────

  const fetchAvailableSlots = useCallback(async (docId: string, date: string) => {
    if (!docId || !date) {
      setSlots([]);
      return;
    }
    setSlotsLoading(true);
    setSlotsError('');
    setSlots([]);
    setAppointmentTime('');

    try {
      const result = await appointmentsApi.getAvailableSlots(docId, date);
      if (!result.error) {
        const list = result.slots ?? [];
        setSlots(list);
        if (list.length === 0) {
          setSlotsError('No available slots for this date. Please choose another day.');
        }
      } else {
        setSlotsError('Failed to load available slots.');
      }
    } catch {
      setSlotsError('Failed to load available slots.');
    } finally {
      setSlotsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (doctorId && appointmentDate) {
      fetchAvailableSlots(doctorId, appointmentDate);
    } else {
      setSlots([]);
      setSlotsError('');
    }
  }, [doctorId, appointmentDate, fetchAvailableSlots]);

  // ── Handlers ─────────────────────────────────────────────────────

  const handleDateChange = (event: DateTimePickerEvent, selectedDate?: Date) => {
    setShowDatePicker(false);
    if (event.type === 'set' && selectedDate) {
      const iso = selectedDate.toISOString().split('T')[0];
      setAppointmentDate(iso);
    }
  };

  const handleSubmit = async () => {
    if (!doctorId) { showToast('warning', 'Please select a doctor'); return; }
    if (!appointmentDate) { showToast('warning', 'Please select an appointment date'); return; }
    if (!appointmentTime) { showToast('warning', 'Please select an appointment time'); return; }
    if (!reason.trim()) { showToast('warning', 'Please provide a reason'); return; }

    setIsSubmitting(true);
    try {
      const result = await appointmentsApi.requestAppointment({
        doctorId,
        appointmentDate,
        appointmentTime,
        type,
        reason: reason.trim(),
      });
      if (!result.error) {
        showToast('success', 'Appointment request sent! Waiting for doctor approval.');
        router.back();
      } else {
        showToast('error', result.error || 'Failed to request appointment');
      }
    } catch {
      showToast('error', 'Server error. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const groupedSlots = groupSlotsByPeriod(slots);
  const today = new Date();

  return (
    <View style={{ flex: 1, paddingTop: insets.top, backgroundColor: '#f8fafc' }}>
      {/* Header */}
      <View className="flex-row items-center px-4 py-3 border-b border-slate-100 bg-white">
        <Pressable onPress={() => !isSubmitting && router.back()} className="p-2 -ml-2 mr-1">
          <Ionicons name="chevron-back" size={24} color="#0f172a" />
        </Pressable>
        <View className="flex-1">
          <Text className="text-lg font-bold text-slate-900">Request Appointment</Text>
          <Text className="text-xs text-slate-400">Schedule a consultation with your doctor</Text>
        </View>
      </View>

      <ScrollView className="px-5" contentContainerStyle={{ paddingTop: 16, paddingBottom: 32 }}>
        {/* Doctor picker */}
        <Field label="Select Doctor" required>
          <Pressable
            onPress={() => !doctorsLoading && !doctorsError && setShowDoctorPicker(true)}
            className="border border-slate-300 rounded-xl px-4 py-3 flex-row items-center justify-between"
            style={{ opacity: doctorsLoading ? 0.6 : 1 }}
          >
            <Text className={selectedDoctor ? 'text-slate-900' : 'text-slate-400'} numberOfLines={1}>
              {doctorsLoading
                ? 'Loading doctors...'
                : selectedDoctor
                ? `${selectedDoctor.name}${selectedDoctor.specialty ? ` — ${selectedDoctor.specialty}` : ''}`
                : '-- Choose a Doctor --'}
            </Text>
            <Ionicons name="chevron-down" size={18} color="#94a3b8" />
          </Pressable>
          {doctorsError && (
            <Pressable onPress={fetchDoctors} className="mt-2">
              <Text className="text-sm text-red-600">
                Couldn't load the doctor list. <Text className="underline font-medium">Try again</Text>
              </Text>
            </Pressable>
          )}
        </Field>

        {/* Date — disabled until doctor selected */}
        <Field label="Appointment Date" required>
          <Pressable
            onPress={() => doctorId && setShowDatePicker(true)}
            disabled={!doctorId}
            className="border border-slate-300 rounded-xl px-4 py-3 flex-row items-center justify-between"
            style={{ opacity: doctorId ? 1 : 0.5 }}
          >
            <Text className={appointmentDate ? 'text-slate-900' : 'text-slate-400'}>
              {appointmentDate ? formatDisplayDate(appointmentDate) : 'Select date'}
            </Text>
            <Ionicons name="calendar-outline" size={18} color="#94a3b8" />
          </Pressable>
          {!doctorId && <Text className="text-xs text-slate-400 mt-1">Select a doctor first</Text>}
        </Field>
        {showDatePicker && (
          <DateTimePicker
            value={appointmentDate ? new Date(appointmentDate) : today}
            mode="date"
            display={Platform.OS === 'ios' ? 'spinner' : 'default'}
            minimumDate={today}
            onChange={handleDateChange}
          />
        )}

        {/* Time slots */}
        {doctorId && appointmentDate && (
          <Field label="Appointment Time" required>
            {slotsLoading ? (
              <View className="flex-row items-center py-3" style={{ gap: 8 }}>
                <ActivityIndicator size="small" color={ACCENT} />
                <Text className="text-sm text-slate-500">Checking available slots...</Text>
              </View>
            ) : slotsError ? (
              <View className="bg-orange-50 border border-orange-200 rounded-lg px-4 py-3">
                <Text className="text-sm text-orange-700">{slotsError}</Text>
              </View>
            ) : (
              <View style={{ gap: 12 }}>
                {groupedSlots.map(([period, periodSlots]) => (
                  <View key={period}>
                    <Text className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-2">
                      {period}
                    </Text>
                    <View className="flex-row flex-wrap" style={{ gap: 8 }}>
                      {periodSlots.map(slot => {
                        const selected = appointmentTime === slot.value;
                        return (
                          <Pressable
                            key={slot.value}
                            onPress={() => setAppointmentTime(slot.value)}
                            className="px-3 py-2 rounded-lg border"
                            style={{
                              backgroundColor: selected ? ACCENT : '#ffffff',
                              borderColor: selected ? ACCENT : '#cbd5e1',
                            }}
                          >
                            <Text style={{ color: selected ? '#ffffff' : '#334155', fontWeight: '600', fontSize: 13 }}>
                              {slot.label}
                            </Text>
                          </Pressable>
                        );
                      })}
                    </View>
                  </View>
                ))}
                {slots.length > 0 && (
                  <Text className="text-xs text-slate-400">
                    Showing {slots.length} available slot{slots.length !== 1 ? 's' : ''}
                  </Text>
                )}
              </View>
            )}
          </Field>
        )}

        {/* Type */}
        <Field label="Appointment Type" required>
          <View className="flex-row flex-wrap" style={{ gap: 8 }}>
            {APPOINTMENT_TYPES.map(t => {
              const selected = type === t;
              return (
                <Pressable
                  key={t}
                  onPress={() => setType(t)}
                  className="px-3 py-2 rounded-lg border"
                  style={{
                    backgroundColor: selected ? ACCENT : '#ffffff',
                    borderColor: selected ? ACCENT : '#cbd5e1',
                  }}
                >
                  <Text style={{ color: selected ? '#ffffff' : '#334155', fontWeight: '600', fontSize: 13 }}>
                    {t}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </Field>

        {/* Reason */}
        <Field label="Reason" required>
          <TextInput
            value={reason}
            onChangeText={setReason}
            placeholder="Describe your symptoms or reason for consultation..."
            multiline
            numberOfLines={4}
            textAlignVertical="top"
            className="border border-slate-300 rounded-xl px-4 py-3 text-slate-900"
            style={{ minHeight: 96 }}
          />
        </Field>

        <View className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <Text className="text-sm text-blue-800">
            Your request will be sent to the doctor. You'll be notified once they respond.
          </Text>
        </View>
      </ScrollView>

      {/* Footer */}
      <View
        className="flex-row px-5 py-4 border-t border-slate-100 bg-white"
        style={{ gap: 12, paddingBottom: Math.max(insets.bottom, 16) }}
      >
        <Pressable
          onPress={() => !isSubmitting && router.back()}
          disabled={isSubmitting}
          className="flex-1 py-3 rounded-xl border border-slate-300 items-center"
        >
          <Text className="font-semibold text-slate-700">Cancel</Text>
        </Pressable>
        <Pressable
          onPress={handleSubmit}
          disabled={isSubmitting}
          className="flex-1 py-3 rounded-xl items-center flex-row justify-center"
          style={{ backgroundColor: ACCENT, opacity: isSubmitting ? 0.6 : 1, gap: 8 }}
        >
          {isSubmitting && <ActivityIndicator size="small" color="#ffffff" />}
          <Text className="font-semibold text-white">
            {isSubmitting ? 'Sending...' : 'Request Appointment'}
          </Text>
        </Pressable>
      </View>

      {/* Doctor picker modal */}
      <Modal visible={showDoctorPicker} animationType="slide" onRequestClose={() => setShowDoctorPicker(false)}>
        <View style={{ flex: 1, paddingTop: insets.top, backgroundColor: '#ffffff' }}>
          <View className="flex-row items-center justify-between px-5 py-4 border-b border-slate-100">
            <Text className="text-lg font-bold text-slate-900">Choose a Doctor</Text>
            <Pressable onPress={() => setShowDoctorPicker(false)} className="p-1">
              <Ionicons name="close" size={22} color="#0f172a" />
            </Pressable>
          </View>
          <FlatList
            data={doctors}
            keyExtractor={item => item.id}
            contentContainerStyle={{ padding: 16 }}
            ItemSeparatorComponent={() => <View style={{ height: 8 }} />}
            renderItem={({ item }) => (
              <Pressable
                onPress={() => {
                  setDoctorId(item.id);
                  setAppointmentDate('');
                  setShowDoctorPicker(false);
                }}
                className="rounded-xl border border-slate-200 p-4"
                style={{ backgroundColor: item.id === doctorId ? '#f0fdfa' : '#ffffff' }}
              >
                <Text className="font-semibold text-slate-900">{item.name}</Text>
                {item.specialty && <Text className="text-sm text-slate-500 mt-0.5">{item.specialty}</Text>}
              </Pressable>
            )}
          />
        </View>
      </Modal>
    </View>
  );
}

function Field({
  label,
  required,
  children,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <View className="mb-4">
      <Text className="text-sm font-medium text-slate-700 mb-2">
        {label} {required && <Text className="text-red-500">*</Text>}
      </Text>
      {children}
    </View>
  );
}