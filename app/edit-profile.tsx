import { useState } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { BottomSheetScrollView, BottomSheetTextInput } from '@gorhom/bottom-sheet';
import { router } from 'expo-router';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useThemeColors } from '@/hooks/useThemeColors';
import { useApp } from '@/context/AppContext';
import { setSetting } from '@/db/queries/settings';
import { ModalSheet } from '@/components/ui/ModalSheet';

const CURRENCIES = [
  { code: 'USD', symbol: '$' },
  { code: 'EUR', symbol: '€' },
  { code: 'GBP', symbol: '£' },
  { code: 'PKR', symbol: '₨' },
  { code: 'AED', symbol: 'د.إ' },
  { code: 'SAR', symbol: '﷼' },
  { code: 'CAD', symbol: 'CA$' },
  { code: 'AUD', symbol: 'A$' },
  { code: 'JPY', symbol: '¥' },
  { code: 'INR', symbol: '₹' },
  { code: 'SGD', symbol: 'S$' },
  { code: 'CHF', symbol: 'Fr' },
  { code: 'MYR', symbol: 'RM' },
  { code: 'NGN', symbol: '₦' },
  { code: 'BRL', symbol: 'R$' },
  { code: 'ZAR', symbol: 'R' },
  { code: 'CNY', symbol: '¥' },
  { code: 'KES', symbol: 'KSh' },
];

export default function EditProfileModal() {
  const c = useThemeColors();
  const { userName, currencyCode, refresh } = useApp();
  const [name, setName] = useState(userName);
  const [currency, setCurrency] = useState(currencyCode);
  const [saving, setSaving] = useState(false);

  async function handleSave() {
    if (!name.trim()) return;
    setSaving(true);
    try {
      await setSetting('user_name', name.trim());
      await setSetting('currency', currency);
      refresh();
      router.back();
    } finally {
      setSaving(false);
    }
  }

  return (
    <ModalSheet
      snapPoint="75%"
      footer={
        <TouchableOpacity
          onPress={handleSave}
          disabled={!name.trim() || saving}
          activeOpacity={0.85}
          style={{
            backgroundColor: name.trim() ? c.primary : c.border,
            borderRadius: 16,
            padding: 18,
            alignItems: 'center',
          }}>
          <Text style={{ fontFamily: 'Inter-Bold', fontSize: 16, color: '#fff' }}>
            {saving ? 'Saving...' : 'Save Changes'}
          </Text>
        </TouchableOpacity>
      }>
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          paddingHorizontal: 24,
          paddingTop: 6,
          paddingBottom: 14,
        }}>
        <TouchableOpacity onPress={() => router.back()} hitSlop={12}>
          <Ionicons name="close" size={26} color={c.text} />
        </TouchableOpacity>
        <Text style={{ fontFamily: 'Inter-SemiBold', fontSize: 17, color: c.text }}>
          Edit Profile
        </Text>
        <View style={{ width: 26 }} />
      </View>

      <BottomSheetScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 100 }}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled">
        <Label text="Your name" />
        <BottomSheetTextInput
          value={name}
          onChangeText={setName}
          placeholder="e.g. Alex"
          placeholderTextColor={c.textMuted}
          autoCapitalize="words"
          style={{
            fontFamily: 'Inter-Regular',
            fontSize: 18,
            color: c.text,
            backgroundColor: c.surface,
            borderRadius: 16,
            padding: 16,
            borderWidth: 1.5,
            borderColor: name.length > 0 ? c.primary : c.border,
            marginBottom: 28,
          }}
        />

        <Label text="Currency" />
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10 }}>
          {CURRENCIES.map((cur) => {
            const selected = currency === cur.code;
            return (
              <TouchableOpacity
                key={cur.code}
                onPress={() => setCurrency(cur.code)}
                activeOpacity={0.7}
                style={{
                  paddingHorizontal: 16,
                  paddingVertical: 10,
                  borderRadius: 12,
                  borderWidth: 1.5,
                  backgroundColor: selected ? c.primary : c.surface,
                  borderColor: selected ? c.primary : c.border,
                }}>
                <Text
                  style={{
                    fontFamily: selected ? 'Inter-SemiBold' : 'Inter-Regular',
                    fontSize: 14,
                    color: selected ? '#fff' : c.text,
                  }}>
                  {cur.symbol} {cur.code}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </BottomSheetScrollView>
    </ModalSheet>
  );
}

function Label({ text }: { text: string }) {
  const c = useThemeColors();
  return (
    <Text
      style={{
        fontFamily: 'Inter-SemiBold',
        fontSize: 11,
        letterSpacing: 1.3,
        textTransform: 'uppercase',
        color: c.textMuted,
        marginBottom: 12,
      }}>
      {text}
    </Text>
  );
}
