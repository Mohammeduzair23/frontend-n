import { Ionicons } from '@expo/vector-icons';
import { Modal, Pressable, Text, View } from 'react-native';
import { Avatar } from './Avatar';

type Props = {
  visible: boolean;
  onClose: () => void;
  email?: string | null;
  role?: string | null;
  onLogout: () => void;
};

export function ProfileModal({ visible, onClose, email, role, onLogout }: Props) {
  return (
    <Modal visible={visible} animationType="fade" transparent onRequestClose={onClose}>
      <Pressable className="flex-1 bg-black/40 justify-center px-8" onPress={onClose}>
        {/* stopPropagation via an inner Pressable so tapping the card itself doesn't close it */}
        <Pressable onPress={() => {}}>
          <View className="bg-white rounded-2xl p-6">
            <View className="items-center mb-5">
              <Avatar label={email ?? '?'} size={64} />
            </View>

            <View className="mb-4">
              <Text className="text-xs text-slate-400 mb-1">Email</Text>
              <Text className="text-base font-semibold text-slate-900">{email ?? '—'}</Text>
            </View>
            <View className="mb-6">
              <Text className="text-xs text-slate-400 mb-1">Role</Text>
              <Text className="text-base font-semibold text-slate-900">{role ?? '—'}</Text>
            </View>

            <Pressable
              onPress={() => {
                onClose();
                onLogout();
              }}
              className="flex-row items-center justify-center bg-red-50 rounded-xl py-3.5 mb-3"
            >
              <Ionicons name="log-out-outline" size={18} color="#dc2626" />
              <Text className="text-red-600 font-semibold ml-2">Logout</Text>
            </Pressable>

            <Pressable onPress={onClose} className="items-center py-1">
              <Text className="text-sm text-slate-400">Close</Text>
            </Pressable>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}