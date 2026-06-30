import { Tabs } from 'expo-router';
import { useColorScheme } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Ionicons from '@expo/vector-icons/Ionicons';
import { Colors } from '@/constants/colors';

type IconName = React.ComponentProps<typeof Ionicons>['name'];

const TABS: { name: string; label: string; icon: IconName; iconActive: IconName }[] = [
  { name: 'index', label: 'Home', icon: 'home-outline', iconActive: 'home' },
  { name: 'statistics', label: 'Statistics', icon: 'bar-chart-outline', iconActive: 'bar-chart' },
  { name: 'savings', label: 'Savings', icon: 'wallet-outline', iconActive: 'wallet' },
  { name: 'loans', label: 'Loans', icon: 'swap-horizontal-outline', iconActive: 'swap-horizontal' },
  { name: 'profile', label: 'Profile', icon: 'person-outline', iconActive: 'person' },
];

const TAB_BAR_HEIGHT = 54;

export default function TabLayout() {
  const scheme = useColorScheme();
  const c = scheme === 'dark' ? Colors.dark : Colors.light;
  const insets = useSafeAreaInsets();

  const tabBarHeight = TAB_BAR_HEIGHT + insets.bottom;

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: c.surface,
          borderTopColor: c.border,
          borderTopWidth: 1,
          height: tabBarHeight,
          paddingBottom: insets.bottom,
          paddingTop: 6,
        },
        tabBarActiveTintColor: c.primary,
        tabBarInactiveTintColor: c.textMuted,
        tabBarLabelStyle: { fontFamily: 'Inter-Medium', fontSize: 10 },
      }}>
      {TABS.map((t) => (
        <Tabs.Screen
          key={t.name}
          name={t.name}
          options={{
            title: t.label,
            tabBarIcon: ({ color, focused }) => (
              <Ionicons name={focused ? t.iconActive : t.icon} size={22} color={color} />
            ),
          }}
        />
      ))}
    </Tabs>
  );
}
