import { Ionicons } from '@expo/vector-icons';
import { Linking, Pressable, Text, View } from 'react-native';
import { CardConfig } from '../../lib/records-config';

const STATUS_COLORS: Record<string, string> = {
  Active: '#16a34a',
  Completed: '#64748b',
  Expired: '#dc2626',
};

export default function RecordCard({
  card, record, onEdit, onDelete,
}: {
  card: CardConfig;
  record: Record<string, any>;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const title = record[card.titleField] || card.titleLabel || 'Record';
  const date = record[card.dateField];
  const status = card.statusField ? record[card.statusField] : null;

  return (
    <View className="bg-white rounded-2xl border border-slate-100 p-4 mb-3">
      <View className="flex-row items-start justify-between mb-2">
        <View className="flex-row items-center flex-1" style={{ gap: 10 }}>
          <View className="w-10 h-10 rounded-full items-center justify-center" style={{ backgroundColor: `${card.iconColor}1A` }}>
            <Ionicons name={card.icon as any} size={18} color={card.iconColor} />
          </View>
          <View className="flex-1">
            <Text className="font-semibold text-slate-900" numberOfLines={1}>{title}</Text>
            {date && (
              <Text className="text-xs text-slate-400">
                {new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
              </Text>
            )}
          </View>
        </View>

        {status && (
          <View className="px-2 py-1 rounded-full" style={{ backgroundColor: `${STATUS_COLORS[status] || '#64748b'}1A` }}>
            <Text className="text-xs font-medium" style={{ color: STATUS_COLORS[status] || '#64748b' }}>{status}</Text>
          </View>
        )}
      </View>

      {card.displayFields
        .filter(f => !f.isFile && record[f.key])
        .sort((a, b) => a.priority - b.priority)
        .map(f => (
          <Text key={f.key} className="text-sm text-slate-600 mb-1">
            <Text className="font-medium text-slate-500">{f.label}: </Text>{record[f.key]}
          </Text>
        ))}

      <View className="flex-row" style={{ gap: 16, marginTop: 4 }}>
        {card.displayFields
          .filter(f => f.isFile && record[f.key])
          .map(f => (
            <Pressable key={f.key} onPress={() => Linking.openURL(record[f.key])} className="flex-row items-center" style={{ gap: 4 }}>
              <Ionicons name="eye-outline" size={14} color="#2563eb" />
              <Text className="text-blue-600 text-xs font-medium">{f.label}</Text>
            </Pressable>
          ))}
      </View>

      <View className="flex-row justify-end border-t border-slate-100 mt-3 pt-3" style={{ gap: 20 }}>
        <Pressable onPress={onEdit} className="flex-row items-center" style={{ gap: 4 }}>
          <Ionicons name="create-outline" size={16} color="#475569" />
          <Text className="text-slate-600 text-sm">Edit</Text>
        </Pressable>
        <Pressable onPress={onDelete} className="flex-row items-center" style={{ gap: 4 }}>
          <Ionicons name="trash-outline" size={16} color="#dc2626" />
          <Text className="text-red-600 text-sm">Delete</Text>
        </Pressable>
      </View>
    </View>
  );
}