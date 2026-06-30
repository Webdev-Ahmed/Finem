import { useState } from 'react';
import { View, Text, TouchableOpacity, Alert } from 'react-native';
import { BottomSheetScrollView, BottomSheetTextInput } from '@gorhom/bottom-sheet';
import { router } from 'expo-router';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useThemeColors } from '@/hooks/useThemeColors';
import { useCurrency } from '@/hooks/useCurrency';
import { insertDelegation } from '@/db/queries/delegations';
import { ModalSheet } from '@/components/ui/ModalSheet';
import { DELEGATION_ICONS } from '@/constants/icons';
import { COLOR_PALETTE } from '@/constants/palette';
import { PeriodType } from '@/types';

const PERIODS: { key: PeriodType; label: string }[] = [
  { key: 'MONTHLY', label: 'Monthly' },
  { key: 'WEEKLY', label: 'Weekly' },
  { key: 'ONE_TIME', label: 'One-time' },
];

export default function AddDelegationModal() {
  const c = useThemeColors();
  const { currencySymbol } = useCurrency();

  const [name, setName] = useState('');
  const [icon, setIcon] = useState(DELEGATION_ICONS[0]);
  const [color, setColor] = useState(COLOR_PALETTE[0]);
  const [period, setPeriod] = useState<PeriodType>('MONTHLY');
  const [budget, setBudget] = useState('');
  const [saving, setSaving] = useState(false);

  const canSave = name.trim().length > 0 && parseFloat(budget) > 0;

  async function handleSave() {
    const amount = parseFloat(budget.replace(/,/g, ''));
    if (isNaN(amount) || amount <= 0) {
      Alert.alert('Invalid amount', 'Enter a valid budget amount.');
      return;
    }
    setSaving(true);
    try {
      await insertDelegation(name.trim(), icon, color, period, amount);
      router.back();
    } catch {
      Alert.alert('Error', 'Could not create delegation.');
      setSaving(false);
    }
  }

  return (
    <ModalSheet snapPoint="88%">
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
          New Delegation
        </Text>
        <View style={{ width: 26 }} />
      </View>

      <BottomSheetScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 16 }}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled">
        <Label text="Name" />
        <BottomSheetTextInput
          value={name}
          onChangeText={setName}
          placeholder="e.g. Groceries, Rent"
          placeholderTextColor={c.textMuted}
          style={{
            fontFamily: 'Inter-Regular',
            fontSize: 17,
            color: c.text,
            backgroundColor: c.surface,
            borderRadius: 16,
            padding: 16,
            borderWidth: 1.5,
            borderColor: name.length > 0 ? c.primary : c.border,
            marginBottom: 24,
          }}
        />

        <Label text="Icon" />
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 24 }}>
          {DELEGATION_ICONS.map((ic) => (
            <TouchableOpacity
              key={ic}
              onPress={() => setIcon(ic)}
              activeOpacity={0.7}
              style={{
                width: 48,
                height: 48,
                borderRadius: 13,
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: icon === ic ? color + '22' : c.surface,
                borderWidth: 1.5,
                borderColor: icon === ic ? color : c.border,
              }}>
              <Text style={{ fontSize: 22 }}>{ic}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <Label text="Color" />
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginBottom: 24 }}>
          {COLOR_PALETTE.map((col) => (
            <TouchableOpacity
              key={col}
              onPress={() => setColor(col)}
              activeOpacity={0.7}
              style={{
                width: 38,
                height: 38,
                borderRadius: 19,
                backgroundColor: col,
                alignItems: 'center',
                justifyContent: 'center',
                borderWidth: color === col ? 3 : 0,
                borderColor: c.text,
              }}>
              {color === col && <Ionicons name="checkmark" size={16} color="#fff" />}
            </TouchableOpacity>
          ))}
        </View>

        <Label text="Resets" />
        <View
          style={{
            flexDirection: 'row',
            marginBottom: 24,
            backgroundColor: c.surfaceAlt,
            borderRadius: 14,
            padding: 4,
          }}>
          {PERIODS.map((p) => (
            <TouchableOpacity
              key={p.key}
              onPress={() => setPeriod(p.key)}
              activeOpacity={0.75}
              style={{
                flex: 1,
                paddingVertical: 9,
                borderRadius: 11,
                alignItems: 'center',
                backgroundColor: period === p.key ? c.surface : 'transparent',
                borderWidth: period === p.key ? 1 : 0,
                borderColor: c.border,
              }}>
              <Text
                style={{
                  fontFamily: period === p.key ? 'Inter-SemiBold' : 'Inter-Regular',
                  fontSize: 12,
                  color: period === p.key ? c.text : c.textMuted,
                }}>
                {p.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <Label text={`Budget amount · ${currencySymbol}`} />
        <BottomSheetTextInput
          value={budget}
          onChangeText={setBudget}
          placeholder="0.00"
          placeholderTextColor={c.textMuted}
          keyboardType="decimal-pad"
          style={{
            fontFamily: 'Inter-Bold',
            fontSize: 36,
            color: c.text,
            backgroundColor: c.surface,
            borderRadius: 16,
            padding: 16,
            borderWidth: 1.5,
            borderColor: budget.length > 0 ? c.primary : c.border,
          }}
        />
      </BottomSheetScrollView>

      <View style={{ paddingHorizontal: 24, paddingTop: 10, paddingBottom: 24 }}>
        <TouchableOpacity
          onPress={handleSave}
          disabled={!canSave || saving}
          activeOpacity={0.85}
          style={{
            backgroundColor: canSave ? c.primary : c.border,
            borderRadius: 16,
            padding: 18,
            alignItems: 'center',
          }}>
          <Text style={{ fontFamily: 'Inter-Bold', fontSize: 16, color: '#fff' }}>
            {saving ? 'Creating...' : 'Create Delegation'}
          </Text>
        </TouchableOpacity>
      </View>
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
