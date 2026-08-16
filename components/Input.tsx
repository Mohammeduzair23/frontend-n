import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { Pressable, Text, TextInput, TextInputProps, View } from 'react-native';

type Props = TextInputProps & {
  label: string;
  icon?: keyof typeof Ionicons.glyphMap;
  isPassword?: boolean;
};

export function Input({ label, icon, isPassword, ...props }: Props) {
  const [hidden, setHidden] = useState(!!isPassword);

  return (
    <View className="mb-4">
      <Text className="text-sm font-medium text-slate-700 mb-1.5">{label}</Text>
      <View className="flex-row items-center border border-slate-300 rounded-xl px-4 bg-white">
        {icon && <Ionicons name={icon} size={18} color="#94a3b8" style={{ marginRight: 8 }} />}
        <TextInput
          placeholderTextColor="#94a3b8"
          secureTextEntry={hidden}
          className="flex-1 py-3.5 text-base text-slate-900"
          {...props}
        />
        {isPassword && (
          <Pressable onPress={() => setHidden(!hidden)} hitSlop={8}>
            <Ionicons name={hidden ? 'eye-off-outline' : 'eye-outline'} size={18} color="#94a3b8" />
          </Pressable>
        )}
      </View>
    </View>
  );
}