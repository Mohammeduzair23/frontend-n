import { Modal, Pressable, Text, View } from 'react-native';

type Props = {
  visible: boolean;
  title: string;
  message: string;
  confirmLabel: string;
  onCancel: () => void;
  onConfirm: () => void;
};

export function ConfirmModal({ visible, title, message, confirmLabel, onCancel, onConfirm }: Props) {
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onCancel}>
      <View className="flex-1 bg-black/40 items-center justify-center px-6">
        <View
          className="w-full max-w-sm rounded-2xl bg-white p-5"
          style={{
            elevation: 8,
            shadowColor: '#000000',
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.2,
            shadowRadius: 12,
          }}
        >
          <Text className="text-lg font-bold text-slate-900">{title}</Text>
          <Text className="text-sm text-slate-500 mt-2">{message}</Text>
          <View className="flex-row justify-end mt-6" style={{ gap: 12 }}>
            <Pressable onPress={onCancel} className="px-4 py-2.5 rounded-lg border border-slate-300">
              <Text className="font-semibold text-slate-700">Cancel</Text>
            </Pressable>
            <Pressable onPress={onConfirm} className="px-4 py-2.5 rounded-lg bg-red-600">
              <Text className="font-semibold text-white">{confirmLabel}</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}