import { Ionicons } from '@expo/vector-icons';
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import { useRouter } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuthStore } from '../lib/auth-store';
import { useProfileStore } from '../lib/profile-store';
import { useToastStore } from '../lib/toast-store';
import { UpdateProfilePayload } from '../lib/userApi';

type FormState = {
  name: string;
  age: string;
  gender: string;
  dateOfBirth: string; // ISO yyyy-mm-dd
  hospitalName: string;
  // Doctor-specific
  specialty: string;
  city: string;
  bio: string;
  fee: string;
};

const emptyForm: FormState = {
  name: '', age: '', gender: '', dateOfBirth: '', hospitalName: '',
  specialty: '', city: '', bio: '', fee: '',
};

const GENDERS = ['Male', 'Female', 'Other'];

function calculateAge(dobString: string): string {
  if (!dobString) return '';
  const dob = new Date(dobString);
  if (isNaN(dob.getTime())) return '';
  const today = new Date();
  let age = today.getFullYear() - dob.getFullYear();
  const hadBirthday =
    today.getMonth() > dob.getMonth() ||
    (today.getMonth() === dob.getMonth() && today.getDate() >= dob.getDate());
  if (!hadBirthday) age -= 1;
  return age >= 0 ? String(age) : '';
}

function formatDisplayDate(iso: string) {
  if (!iso) return '';
  const d = new Date(iso);
  if (isNaN(d.getTime())) return '';
  return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
}

export default function EditProfile() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { user } = useAuthStore();
  const isDoctor = user?.role?.toLowerCase() === 'doctor';
  const accent = isDoctor ? '#2563eb' : '#0f766e';

  const profile = useProfileStore(s => s.profile);
  const storeLoading = useProfileStore(s => s.loading);
  const fetchProfile = useProfileStore(s => s.fetch);
  const updateProfileStore = useProfileStore(s => s.updateProfile);
  const showToast = useToastStore(s => s.show);

  const [saving, setSaving] = useState(false);
  const [profileComplete, setProfileComplete] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);

  const [formData, setFormData] = useState<FormState>(emptyForm);
  const [serverData, setServerData] = useState<FormState | null>(null);

  // Only populate the form from the store once — a background refresh
  // landing later shouldn't clobber whatever the user is mid-typing.
  const initializedRef = useRef(false);

  const isDirty = !!serverData && (
    formData.name !== serverData.name ||
    formData.gender !== serverData.gender ||
    formData.dateOfBirth !== serverData.dateOfBirth ||
    formData.hospitalName !== serverData.hospitalName ||
    (isDoctor && (
      formData.specialty !== serverData.specialty ||
      formData.city !== serverData.city ||
      formData.bio !== serverData.bio ||
      formData.fee !== serverData.fee
    ))
  );

  // Kick off a fetch on mount — spinner only if the store has genuinely
  // never loaded before (checked once, synchronously, not as a reactive
  // dependency, so a later hasFetched flip elsewhere doesn't re-trigger this).
  useEffect(() => {
    fetchProfile(!useProfileStore.getState().hasFetched);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (profile && !initializedRef.current) {
      const filled: FormState = {
        name: profile.name || '',
        age: profile.dateOfBirth
          ? calculateAge(profile.dateOfBirth)
          : (profile.age != null ? String(profile.age) : ''),
        gender: profile.gender || '',
        dateOfBirth: profile.dateOfBirth || '',
        hospitalName: profile.hospitalName || '',
        specialty: profile.specialty || '',
        city: profile.city || '',
        bio: profile.bio || '',
        fee: profile.fee != null ? String(profile.fee) : '',
      };
      setFormData(filled);
      setServerData(filled);
      setProfileComplete(profile.profileComplete || false);
      initializedRef.current = true;
    }
  }, [profile]);

  const handleDateChange = (event: DateTimePickerEvent, selectedDate?: Date) => {
    setShowDatePicker(false);
    if (event.type === 'set' && selectedDate) {
      const iso = selectedDate.toISOString().split('T')[0];
      setFormData(prev => ({ ...prev, dateOfBirth: iso, age: calculateAge(iso) }));
    }
  };

  const handleSubmit = async () => {
    if (!formData.name.trim()) { showToast('warning', 'Name is required'); return; }
    if (!formData.gender) { showToast('warning', 'Please select a gender'); return; }
    if (!formData.dateOfBirth) { showToast('warning', 'Date of birth is required'); return; }

    if (isDoctor) {
      if (!formData.hospitalName.trim()) { showToast('warning', 'Hospital name is required for doctors'); return; }
      if (!formData.specialty.trim()) { showToast('warning', 'Specialty is required for doctors'); return; }
      if (!formData.city.trim()) { showToast('warning', 'City is required for doctors'); return; }
    }

    setSaving(true);
    try {
      const payload: UpdateProfilePayload = {
        name: formData.name || undefined,
        gender: formData.gender || undefined,
        dateOfBirth: formData.dateOfBirth || undefined,
        hospitalName: formData.hospitalName || undefined,
        ...(isDoctor && {
          specialty: formData.specialty || undefined,
          city: formData.city || undefined,
          bio: formData.bio || undefined,
          fee: formData.fee !== '' ? Number(formData.fee) : undefined,
        }),
      };

      const result = await updateProfileStore(payload);
      if (!result.error) {
        setServerData(formData);
        setProfileComplete(result.profileComplete || false);
        showToast('success', 'Profile updated successfully!');
        router.back();
      } else {
        showToast('error', result.error || 'Failed to update profile');
      }
    } catch {
      showToast('error', 'Server error');
    } finally {
      setSaving(false);
    }
  };

  // Full-screen spinner only when there's truly nothing cached yet
  // (first-ever open). Every reopen after that shows cached data instantly
  // while fetchProfile() silently refreshes in the background.
  const showFullSpinner = storeLoading && !profile;

  return (
    <View style={{ flex: 1, paddingTop: insets.top, backgroundColor: '#f8fafc' }}>
      {/* Header */}
      <View className="flex-row items-center justify-between px-4 py-3 border-b border-slate-100 bg-white">
        <Pressable onPress={() => router.back()} className="p-2 -ml-2">
          <Ionicons name="chevron-back" size={24} color="#0f172a" />
        </Pressable>
        <Text className="text-base font-bold text-slate-900">
          {isDoctor ? 'Doctor Profile' : 'Patient Profile'}
        </Text>
        <View className="w-8" />
      </View>

      {showFullSpinner ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color={accent} />
        </View>
      ) : (
        <ScrollView className="px-5" contentContainerStyle={{ paddingBottom: 32, paddingTop: 16 }}>
          {!profileComplete && (
            <View className="flex-row items-start bg-orange-50 border-l-4 border-orange-500 rounded-lg p-4 mb-5">
              <Ionicons name="alert-circle" size={18} color="#ea580c" style={{ marginTop: 1, marginRight: 8 }} />
              <View className="flex-1">
                <Text className="text-sm font-semibold text-orange-800">Profile Incomplete</Text>
                <Text className="text-xs text-orange-700 mt-0.5">Please fill in all required fields</Text>
              </View>
            </View>
          )}

          {/* ── Common fields ── */}
          <Field label="Name" required>
            <TextInput
              value={formData.name}
              onChangeText={t => setFormData(prev => ({ ...prev, name: t }))}
              placeholder="Enter your full name"
              className="border border-slate-300 rounded-xl px-4 py-3 text-slate-900"
            />
          </Field>

          <Field label="Date of Birth" required>
            <Pressable
              onPress={() => setShowDatePicker(true)}
              className="border border-slate-300 rounded-xl px-4 py-3 flex-row items-center justify-between"
            >
              <Text className={formData.dateOfBirth ? 'text-slate-900' : 'text-slate-400'}>
                {formData.dateOfBirth ? formatDisplayDate(formData.dateOfBirth) : 'Select date'}
              </Text>
              <Ionicons name="calendar-outline" size={18} color="#94a3b8" />
            </Pressable>
          </Field>
          {showDatePicker && (
            <DateTimePicker
              value={formData.dateOfBirth ? new Date(formData.dateOfBirth) : new Date(2000, 0, 1)}
              mode="date"
              display={Platform.OS === 'ios' ? 'spinner' : 'default'}
              maximumDate={new Date()}
              onChange={handleDateChange}
            />
          )}

          <Field label="Gender" required>
            <View className="flex-row" style={{ gap: 8 }}>
              {GENDERS.map(g => {
                const selected = formData.gender === g;
                return (
                  <Pressable
                    key={g}
                    onPress={() => setFormData(prev => ({ ...prev, gender: g }))}
                    className="flex-1 rounded-xl py-3 items-center border"
                    style={{
                      backgroundColor: selected ? accent : '#ffffff',
                      borderColor: selected ? accent : '#cbd5e1',
                    }}
                  >
                    <Text style={{ color: selected ? '#ffffff' : '#334155', fontWeight: '600' }}>{g}</Text>
                  </Pressable>
                );
              })}
            </View>
          </Field>

          <Field label="Age">
            <View className="border border-slate-200 rounded-xl px-4 py-3 bg-slate-50">
              <Text className="text-slate-500">{formData.age || 'Calculated from date of birth'}</Text>
            </View>
          </Field>

          {/* ── Doctor-specific fields ── */}
          {isDoctor && (
            <>
              <Text className="text-xs font-semibold text-slate-400 uppercase tracking-wide mt-2 mb-3">
                Professional Details
              </Text>

              <Field label="Hospital Name" required>
                <TextInput
                  value={formData.hospitalName}
                  onChangeText={t => setFormData(prev => ({ ...prev, hospitalName: t }))}
                  placeholder="e.g. Gulbarga Institute of Medical Sciences"
                  className="border border-slate-300 rounded-xl px-4 py-3 text-slate-900"
                />
              </Field>

              <Field label="Specialty" required hint="Used so patients can find you in search">
                <TextInput
                  value={formData.specialty}
                  onChangeText={t => setFormData(prev => ({ ...prev, specialty: t }))}
                  placeholder="e.g. Cardiology, Paediatrics"
                  className="border border-slate-300 rounded-xl px-4 py-3 text-slate-900"
                />
              </Field>

              <Field label="City" required>
                <TextInput
                  value={formData.city}
                  onChangeText={t => setFormData(prev => ({ ...prev, city: t }))}
                  placeholder="e.g. Gulbarga"
                  className="border border-slate-300 rounded-xl px-4 py-3 text-slate-900"
                />
              </Field>

              <Field label="Consultation Fee (₹)">
                <TextInput
                  value={formData.fee}
                  onChangeText={t => setFormData(prev => ({ ...prev, fee: t.replace(/[^0-9]/g, '') }))}
                  placeholder="e.g. 500"
                  keyboardType="number-pad"
                  className="border border-slate-300 rounded-xl px-4 py-3 text-slate-900"
                />
              </Field>

              <Field label="Bio" hint={`${formData.bio.length}/2000 characters`}>
                <TextInput
                  value={formData.bio}
                  onChangeText={t => setFormData(prev => ({ ...prev, bio: t.slice(0, 2000) }))}
                  placeholder="Brief professional description shown to patients..."
                  multiline
                  numberOfLines={4}
                  textAlignVertical="top"
                  className="border border-slate-300 rounded-xl px-4 py-3 text-slate-900"
                  style={{ minHeight: 96 }}
                />
              </Field>
            </>
          )}
        </ScrollView>
      )}

      {!showFullSpinner && (
        <View
          className="flex-row px-5 py-4 border-t border-slate-100 bg-white"
          style={{ gap: 12, paddingBottom: Math.max(insets.bottom, 16) }}
        >
          <Pressable
            onPress={() => router.back()}
            disabled={saving}
            className="flex-1 py-3 rounded-xl border border-slate-300 items-center"
          >
            <Text className="font-semibold text-slate-700">Cancel</Text>
          </Pressable>
          <Pressable
            onPress={handleSubmit}
            disabled={saving || !isDirty}
            className="flex-1 py-3 rounded-xl items-center"
            style={{ backgroundColor: accent, opacity: saving || !isDirty ? 0.5 : 1 }}
          >
            <Text className="font-semibold text-white">
              {saving ? 'Saving...' : profileComplete ? 'Save Changes' : 'Complete Profile'}
            </Text>
          </Pressable>
        </View>
      )}
    </View>
  );
}

function Field({
  label,
  required,
  hint,
  children,
}: {
  label: string;
  required?: boolean;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <View className="mb-4">
      <Text className="text-sm font-medium text-slate-700 mb-2">
        {label} {required && <Text className="text-red-500">*</Text>}
      </Text>
      {children}
      {hint && <Text className="text-xs text-slate-400 mt-1">{hint}</Text>}
    </View>
  );
}
