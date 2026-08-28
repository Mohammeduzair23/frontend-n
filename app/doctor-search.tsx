import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useCallback, useEffect, useRef, useState } from 'react';
import { ActivityIndicator, FlatList, Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { doctorSearchApi, DoctorSearchResult } from '../lib/doctor-search-api';

const CITY = 'Gulbarga'; // matches DoctorSearchService's DEFAULT_CITY — no city picker yet
const DEBOUNCE_MS = 300;

export default function DoctorSearchScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const [query, setQuery] = useState('');
  const [results, setResults] = useState<DoctorSearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [selected, setSelected] = useState<DoctorSearchResult | null>(null);

  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const hasFetchedOnce = useRef(false);

  const fetchDoctors = useCallback(async (q: string) => {
    setLoading(true);
    setError('');
    try {
      const result = await doctorSearchApi.search(q, CITY);
      if (!result.error) {
        setResults(result.doctors ?? []);
      } else {
        setError('Failed to load results. Please try again.');
        setResults([]);
      }
    } catch {
      setError('Failed to load results. Please try again.');
      setResults([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // Initial load — empty query returns all doctors in the city
  useEffect(() => {
    if (!hasFetchedOnce.current) {
      hasFetchedOnce.current = true;
      fetchDoctors('');
    }
  }, [fetchDoctors]);

  // Debounced search as the user types
  useEffect(() => {
    if (!hasFetchedOnce.current) return;
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => fetchDoctors(query), DEBOUNCE_MS);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query]);

  const handleBookAppointment = (doctor: DoctorSearchResult) => {
    router.push({
      pathname: '/appointment-request',
      params: {
        doctorId: doctor.id,
        doctorName: doctor.name ?? '',
        specialty: doctor.specialty ?? '',
      },
    });
  };

  return (
    <View style={{ flex: 1, paddingTop: insets.top, backgroundColor: '#f8fafc' }}>
      {/* Header */}
      <View className="flex-row items-center px-4 py-3 border-b border-slate-100 bg-white">
        <Pressable
          onPress={() => (selected ? setSelected(null) : router.back())}
          className="p-2 -ml-2 mr-1"
        >
          <Ionicons name="chevron-back" size={24} color="#0f172a" />
        </Pressable>
        <Text className="text-lg font-bold text-slate-900">
          {selected ? 'Doctor Profile' : 'Search Doctors'}
        </Text>
      </View>

      {/* Search bar — stays visible whether showing results or a detail view */}
      <View className="px-4 pt-4 pb-2 bg-white border-b border-slate-100">
        <View
          className="flex-row items-center bg-slate-50 border border-slate-200 rounded-xl px-3"
          style={{ gap: 8 }}
        >
          {loading ? (
            <ActivityIndicator size="small" color="#0f766e" />
          ) : (
            <Ionicons name="search" size={18} color="#94a3b8" />
          )}
          <TextInput
            value={query}
            onChangeText={t => {
              setQuery(t);
              setSelected(null);
            }}
            placeholder={`Search doctors in ${CITY}`}
            className="flex-1 py-3 text-slate-900"
          />
          {query.length > 0 && (
            <Pressable
              onPress={() => {
                setQuery('');
                setSelected(null);
              }}
            >
              <Ionicons name="close-circle" size={18} color="#cbd5e1" />
            </Pressable>
          )}
        </View>
        <View className="flex-row items-center mt-2" style={{ gap: 4 }}>
          <Ionicons name="location-outline" size={12} color="#94a3b8" />
          <Text className="text-xs text-slate-400">{CITY}</Text>
        </View>
      </View>

      {selected ? (
        <DoctorDetail doctor={selected} onBook={() => handleBookAppointment(selected)} />
      ) : (
        <FlatList
          data={results}
          keyExtractor={item => item.id}
          contentContainerStyle={{ padding: 16, flexGrow: 1 }}
          ItemSeparatorComponent={() => <View style={{ height: 10 }} />}
          ListEmptyComponent={
            !loading ? (
              <View className="flex-1 items-center justify-center py-16">
                <Ionicons name="medkit-outline" size={32} color="#cbd5e1" />
                <Text className="text-slate-400 text-sm mt-2 text-center">
                  {error || `No doctors found${query ? ` for "${query}"` : ''}`}
                </Text>
              </View>
            ) : null
          }
          renderItem={({ item }) => (
            <Pressable
              onPress={() => setSelected(item)}
              className="flex-row items-center bg-white rounded-2xl border border-slate-100 p-4"
            >
              <View className="w-11 h-11 rounded-full bg-blue-50 items-center justify-center mr-3">
                <Text className="text-base font-bold text-blue-700">{item.name?.charAt(0) ?? 'D'}</Text>
              </View>
              <View className="flex-1">
                <Text className="font-semibold text-slate-900" numberOfLines={1}>
                  {item.name}
                </Text>
                {!!item.specialty && (
                  <Text className="text-xs text-blue-600" numberOfLines={1}>
                    {item.specialty}
                  </Text>
                )}
                {!!item.hospitalName && (
                  <Text className="text-xs text-slate-400" numberOfLines={1}>
                    {item.hospitalName}
                  </Text>
                )}
              </View>
              {item.fee != null && <Text className="text-xs text-green-700 font-semibold">₹{item.fee}</Text>}
            </Pressable>
          )}
        />
      )}
    </View>
  );
}

function DoctorDetail({ doctor, onBook }: { doctor: DoctorSearchResult; onBook: () => void }) {
  const genderLabel = doctor.gender === 'Female' ? 'Dr. (F)' : doctor.gender === 'Male' ? 'Dr. (M)' : null;
  const subline = [genderLabel, doctor.age ? `${doctor.age} yrs` : null].filter(Boolean).join(' · ');

  return (
    <>
      <ScrollView className="px-5" contentContainerStyle={{ paddingTop: 20, paddingBottom: 24 }}>
        <View className="flex-row items-start" style={{ gap: 16 }}>
          <View className="w-16 h-16 rounded-full bg-blue-100 items-center justify-center">
            <Text className="text-2xl font-bold text-blue-700">{doctor.name?.charAt(0) ?? 'D'}</Text>
          </View>
          <View className="flex-1">
            <Text className="text-xl font-bold text-slate-900">{doctor.name}</Text>
            {!!doctor.specialty && (
              <Text className="text-blue-600 font-medium text-sm mt-0.5">{doctor.specialty}</Text>
            )}
            {!!subline && (
              <View className="flex-row items-center mt-1" style={{ gap: 4 }}>
                <Ionicons name="person-outline" size={12} color="#94a3b8" />
                <Text className="text-xs text-slate-500">{subline}</Text>
              </View>
            )}
          </View>
        </View>

        <View className="mt-6" style={{ gap: 18 }}>
          {!!doctor.hospitalName && (
            <DetailRow icon="business-outline" label="Hospital" value={doctor.hospitalName} />
          )}
          {!!doctor.city && <DetailRow icon="location-outline" label="Location" value={doctor.city} />}
          {doctor.fee != null && (
            <DetailRow icon="cash-outline" label="Consultation Fee" value={`₹${doctor.fee} per visit`} />
          )}
        </View>

        {!!doctor.bio && (
          <View className="bg-slate-50 rounded-xl p-4 mt-5">
            <Text className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-2">About</Text>
            <Text className="text-sm text-slate-700" style={{ lineHeight: 20 }}>
              {doctor.bio}
            </Text>
          </View>
        )}
      </ScrollView>

      <View className="px-5 py-4 border-t border-slate-100 bg-white">
        <Pressable
          onPress={onBook}
          className="flex-row items-center justify-center rounded-xl py-3.5"
          style={{ backgroundColor: '#0f766e', gap: 8 }}
        >
          <Ionicons name="calendar-outline" size={18} color="#ffffff" />
          <Text className="text-white font-semibold">Book Appointment</Text>
        </Pressable>
      </View>
    </>
  );
}

function DetailRow({
  icon,
  label,
  value,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value: string;
}) {
  return (
    <View className="flex-row items-start" style={{ gap: 12 }}>
      <Ionicons name={icon} size={16} color="#94a3b8" style={{ marginTop: 2 }} />
      <View className="flex-1">
        <Text className="text-xs font-medium text-slate-500 uppercase tracking-wide">{label}</Text>
        <Text className="text-sm text-slate-800 mt-0.5">{value}</Text>
      </View>
    </View>
  );
}