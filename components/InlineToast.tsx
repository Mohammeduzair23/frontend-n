import { Ionicons } from '@expo/vector-icons';
import { Pressable, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ToastType, useToastStore } from '../lib/toast-store';

const styles: Record<ToastType, { backgroundColor: string; icon: keyof typeof Ionicons.glyphMap }> = {
  success: { backgroundColor: '#15803d', icon: 'checkmark-circle-outline' },
  error: { backgroundColor: '#dc2626', icon: 'alert-circle-outline' },
  warning: { backgroundColor: '#d97706', icon: 'warning-outline' },
  info: { backgroundColor: '#2563eb', icon: 'information-circle-outline' },
};

export function InlineToast() {
  const insets = useSafeAreaInsets();
  const visible = useToastStore(s => s.visible);
  const type = useToastStore(s => s.type);
  const message = useToastStore(s => s.message);
  const hide = useToastStore(s => s.hide);

  if (!visible) return null;

  const style = styles[type];

  return (
    <View
      pointerEvents="box-none"
      style={{
        position: 'absolute',
        bottom: insets.bottom + 72,
        left: 16,
        right: 16,
        zIndex: 1000,
        elevation: 1000,
      }}
    >
      <View
        accessible
        accessibilityRole="alert"
        className="flex-row items-center rounded-xl px-4 py-3"
        style={{ backgroundColor: style.backgroundColor, elevation: 6, shadowColor: '#000', shadowOpacity: 0.2, shadowRadius: 8 }}
      >
        <Ionicons name={style.icon} size={22} color="#ffffff" />
        <Text className="flex-1 text-white font-medium ml-2">{message}</Text>
        <Pressable onPress={hide} hitSlop={8} className="ml-2">
          <Ionicons name="close" size={20} color="#ffffff" />
        </Pressable>
      </View>
    </View>
  );
}