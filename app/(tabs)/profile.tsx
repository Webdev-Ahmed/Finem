import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useThemeColors } from '@/hooks/useThemeColors';
import { useApp } from '@/context/AppContext';
import { ThemeColors } from '@/constants/colors';

const TAB_BAR_HEIGHT = 54;

export default function ProfileScreen() {
  const c = useThemeColors();
  const { userName, currencyCode } = useApp();
  const insets = useSafeAreaInsets();
  const initial = (userName || 'U').charAt(0).toUpperCase();

  return (
    <View style={{ flex: 1, backgroundColor: c.background }}>
      <SafeAreaView style={{ flex: 1 }} edges={['top']}>
        <View style={{ paddingHorizontal: 24, paddingTop: 20, paddingBottom: 8 }}>
          <Text style={{ fontFamily: 'Inter-Bold', fontSize: 30, color: c.text }}>Profile</Text>
          <Text
            style={{ fontFamily: 'Inter-Regular', fontSize: 14, color: c.textMuted, marginTop: 2 }}>
            Settings & preferences
          </Text>
        </View>

        <ScrollView
          contentContainerStyle={{
            paddingHorizontal: 24,
            paddingBottom: TAB_BAR_HEIGHT + insets.bottom + 24,
          }}
          showsVerticalScrollIndicator={false}>
          {/* User card */}
          <TouchableOpacity
            activeOpacity={0.85}
            onPress={() => router.push('/edit-profile')}
            style={{
              backgroundColor: c.surface,
              borderRadius: 22,
              padding: 20,
              marginTop: 16,
              marginBottom: 28,
              borderWidth: 1,
              borderColor: c.border,
              flexDirection: 'row',
              alignItems: 'center',
            }}>
            <View
              style={{
                width: 56,
                height: 56,
                borderRadius: 28,
                backgroundColor: c.primary + '22',
                alignItems: 'center',
                justifyContent: 'center',
                marginRight: 16,
              }}>
              <Text style={{ fontFamily: 'Inter-Bold', fontSize: 22, color: c.primary }}>
                {initial}
              </Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{ fontFamily: 'Inter-SemiBold', fontSize: 17, color: c.text }}>
                {userName || 'Set your name'}
              </Text>
              <Text
                style={{
                  fontFamily: 'Inter-Regular',
                  fontSize: 13,
                  color: c.textMuted,
                  marginTop: 2,
                }}>
                Currency · {currencyCode}
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={c.textMuted} />
          </TouchableOpacity>

          <SectionLabel text="Manage" c={c} />
          <View
            style={{
              backgroundColor: c.surface,
              borderRadius: 20,
              borderWidth: 1,
              borderColor: c.border,
              overflow: 'hidden',
              marginBottom: 28,
            }}>
            <SettingsRow
              icon="pricetags-outline"
              label="Categories"
              sub="Manage income & expense categories"
              onPress={() => router.push('/categories')}
              c={c}
            />
            <Divider c={c} />
            <SettingsRow
              icon="layers-outline"
              label="Delegations"
              sub="Budget envelopes & period history"
              onPress={() => router.push('/delegations')}
              c={c}
            />
          </View>

          <SectionLabel text="About" c={c} />
          <View
            style={{
              backgroundColor: c.surface,
              borderRadius: 20,
              borderWidth: 1,
              borderColor: c.border,
              overflow: 'hidden',
              padding: 18,
            }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 6 }}>
              <Ionicons name="cloud-offline-outline" size={18} color={c.success} />
              <Text style={{ fontFamily: 'Inter-Medium', fontSize: 14, color: c.text }}>
                100% offline
              </Text>
            </View>
            <Text
              style={{
                fontFamily: 'Inter-Regular',
                fontSize: 13,
                color: c.textMuted,
                lineHeight: 19,
              }}>
              All your data lives only on this device. Nothing is ever uploaded, synced, or shared.
            </Text>
          </View>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

function SectionLabel({ text, c }: { text: string; c: ThemeColors }) {
  return (
    <Text
      style={{
        fontFamily: 'Inter-SemiBold',
        fontSize: 11,
        letterSpacing: 1.3,
        textTransform: 'uppercase',
        color: c.textMuted,
        marginBottom: 10,
        marginLeft: 4,
      }}>
      {text}
    </Text>
  );
}

function Divider({ c }: { c: ThemeColors }) {
  return <View style={{ height: 1, backgroundColor: c.border, marginLeft: 64 }} />;
}

function SettingsRow({
  icon,
  label,
  sub,
  onPress,
  c,
}: {
  icon: React.ComponentProps<typeof Ionicons>['name'];
  label: string;
  sub: string;
  onPress: () => void;
  c: ThemeColors;
}) {
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.7}
      style={{ flexDirection: 'row', alignItems: 'center', padding: 16 }}>
      <View
        style={{
          width: 40,
          height: 40,
          borderRadius: 12,
          backgroundColor: c.primary + '18',
          alignItems: 'center',
          justifyContent: 'center',
          marginRight: 14,
        }}>
        <Ionicons name={icon} size={19} color={c.primary} />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={{ fontFamily: 'Inter-Medium', fontSize: 15, color: c.text }}>{label}</Text>
        <Text
          style={{ fontFamily: 'Inter-Regular', fontSize: 12, color: c.textMuted, marginTop: 1 }}>
          {sub}
        </Text>
      </View>
      <Ionicons name="chevron-forward" size={18} color={c.textMuted} />
    </TouchableOpacity>
  );
}
