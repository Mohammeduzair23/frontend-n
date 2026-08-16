import { Redirect, Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '../../lib/auth-store';

export default function PatientTabsLayout() {
  const { isLoggedIn, isHydrating, user } = useAuthStore();

  // Don't redirect while we're still checking SecureStore on boot
  if (isHydrating) {
    return null;
  }

  if (!isLoggedIn) {
    return <Redirect href="/login" />;
  }

  if (user?.role !== 'Patient') {
    // Not a patient — send back to Home (which will route Doctor/Hospital/Labs
    // to their own dashboards once those exist)
    return <Redirect href="/" />;
  }

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#2563eb',
        tabBarInactiveTintColor: '#94a3b8',
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color, size }) => <Ionicons name="home" color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="medical"
        options={{
          title: 'Medical',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="folder-open-outline" color={color} size={size} />
          ),
        }}
      />
      <Tabs.Screen
        name="lab"
        options={{
          title: 'Lab',
          tabBarIcon: ({ color, size }) => <Ionicons name="flask-outline" color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="prescription"
        options={{
          title: 'Prescription',
          tabBarIcon: ({ color, size }) => <Ionicons name="medkit-outline" color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="more"
        options={{
          title: 'More',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="ellipsis-horizontal" color={color} size={size} />
          ),
        }}
      />
    </Tabs>
  );
}
