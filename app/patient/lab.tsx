import { View, Text } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

export default function LabPlaceholder() {
  const insets = useSafeAreaInsets();
  return (
    <View
      style={{ flex: 1, paddingTop: insets.top, backgroundColor: '#f8fafc' }}
      className="items-center justify-center px-8"
    >
      <Ionicons name="construct-outline" size={40} color="#94a3b8" />
      <Text className="text-lg font-bold text-slate-900 mt-4 mb-1">Coming soon</Text>
      <Text className="text-sm text-slate-500 text-center">
        This section is being built next — check back shortly.
      </Text>
    </View>
  );
}
