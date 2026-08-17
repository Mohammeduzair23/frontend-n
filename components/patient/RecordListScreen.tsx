import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Alert, FlatList, Pressable, RefreshControl, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { medicalApi, RecordResponse } from '../../lib/medical-api';
import { Mode, MODES, RECORDS_CONFIG, RecordType } from '../../lib/records-config';
import RecordCard from './RecordCard';
import RecordFormModal from './RecordFormModal';

export default function RecordListScreen({ type }: { type: RecordType }) {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const config = RECORDS_CONFIG[type];

  const [records, setRecords] = useState<RecordResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [modalMode, setModalMode] = useState<Mode>(MODES.ADD);
  const [editingRecord, setEditingRecord] = useState<RecordResponse | null>(null);

  const fetchRecords = useCallback(async () => {
    try {
      const res = await medicalApi.getRecords(type);
      setRecords(res.records ?? []);
    } catch (err) {
      console.error('Failed to load records:', err);
      Alert.alert('Error', `Could not load ${config.title.toLowerCase()}s.`);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [type]);

  useEffect(() => {
    fetchRecords();
  }, [fetchRecords]);

  const openAdd = () => {
    setEditingRecord(null);
    setModalMode(MODES.ADD);
    setModalVisible(true);
  };

  const openEdit = (record: RecordResponse) => {
    setEditingRecord(record);
    setModalMode(MODES.EDIT);
    setModalVisible(true);
  };

  const handleDelete = (record: any) => {
    Alert.alert(
      `Delete ${config.title}`,
      'This cannot be undone. Continue?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await medicalApi.deleteRecord(type, record.id);
              fetchRecords();
            } catch (err) {
              console.error('Delete failed:', err);
              Alert.alert('Error', 'Failed to delete record.');
            }
          },
        },
      ]
    );
  };

  return (
    <View style={{ flex: 1, paddingTop: insets.top, backgroundColor: '#f8fafc' }}>
      {/* Header */}
      <View className="flex-row items-center justify-between px-6 py-4">
        <View className="flex-row items-center" style={{ gap: 12 }}>
          <Pressable onPress={() => router.back()} className="w-9 h-9 rounded-full bg-white items-center justify-center border border-slate-200">
            <Ionicons name="chevron-back" size={18} color="#0f172a" />
          </Pressable>
          <Text className="text-xl font-bold text-slate-900">{config.title}s</Text>
        </View>
        <Pressable onPress={openAdd} className="w-9 h-9 rounded-full bg-blue-600 items-center justify-center">
          <Ionicons name="add" size={20} color="#ffffff" />
        </Pressable>
      </View>

      {/* List */}
      {loading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator color="#2563eb" />
        </View>
      ) : (
        <FlatList
          data={records}
          keyExtractor={(item: any) => item.id}
          contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 24, flexGrow: 1 }}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchRecords(); }} />
          }
          renderItem={({ item }) => (
            <RecordCard
              card={config.card}
              record={item as any}
              onEdit={() => openEdit(item)}
              onDelete={() => handleDelete(item)}
            />
          )}
          ListEmptyComponent={
            <View className="flex-1 items-center justify-center py-24">
              <Ionicons name={config.card.icon as any} size={40} color="#cbd5e1" />
              <Text className="text-slate-400 mt-3">No {config.title.toLowerCase()}s yet</Text>
            </View>
          }
        />
      )}

      <RecordFormModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        type={type}
        mode={modalMode}
        recordId={(editingRecord as any)?.id}
        existingData={editingRecord as any}
        onSuccess={(msg) => { Alert.alert('Success', msg); fetchRecords(); }}
        onError={(msg) => Alert.alert('Error', msg)}
      />
    </View>
  );
}