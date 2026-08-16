import { Text, View } from 'react-native';

export function Avatar({ label, size = 44 }: { label: string; size?: number }) {
  const initial = label?.trim()?.[0]?.toUpperCase() ?? '?';
  return (
    <View
      style={{ width: size, height: size, borderRadius: size / 2 }}
      className="bg-blue-600 items-center justify-center"
    >
      <Text className="text-white font-bold" style={{ fontSize: size * 0.4 }}>
        {initial}
      </Text>
    </View>
  );
}