import { useState } from 'react';
import { View, Text, TouchableOpacity, Alert } from 'react-native';
import { BottomSheetScrollView, BottomSheetTextInput } from '@gorhom/bottom-sheet';
import { router } from 'expo-router';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useThemeColors } from '@/hooks/useThemeColors';
import { useCurrency } from '@/hooks/useCurrency';
import { insertSavingsGoal } from '@/db/queries/savings';
import { ModalSheet } from '@/components/ui/ModalSheet';

const ICONS = [
  '🎯',
  '✈️',
  '🏠',
  '🚗',
  '💻',
  '🎓',
  '💍',
  '🏖️',
  '🎸',
  '👶',
  '🐶',
  '💊',
  '🛍️',
  '🌍',
  '⚽',
  '🎮',
];

export default function AddSavingsGoalModal() {
  const c = useThemeColors();
  const { currencySymbol } = useCurrency();

  const [name, setName] = useState('');
  const [icon, setIcon] = useState('🎯');
  const [target, setTarget] = useState('');
  const [deadline, setDeadline] = useState('');
  const [saving, setSaving] = useState(false);

  const canSave = name.trim().length > 0 && parseFloat(target) > 0;

  async function handleSave() {
    const amount = parseFloat(target.replace(/,/g, ''));
    if (isNaN(amount) || amount <= 0) {
      Alert.alert('Invalid amount', 'Enter a valid target amount.');
      return;
    }
    setSaving(true);
    try {
      await insertSavingsGoal(name.trim(), icon, amount, deadline.trim() || undefined);
      router.back();
    } catch {
      Alert.alert('Error', 'Could not save goal. Try again.');
      setSaving(false);
    }
  }

  return (
    <ModalSheet snapPoint="85%">
      {/* Header */}
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
        <Text style={{ fontFamily: 'Inter-SemiBold', fontSize: 17, color: c.text }}>New Goal</Text>
        <View style={{ width: 26 }} />
      </View>

      <BottomSheetScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 16 }}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled">
        <Label text="Icon" />
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 28 }}>
          {ICONS.map((ic) => (
            <TouchableOpacity
              key={ic}
              onPress={() => setIcon(ic)}
              activeOpacity={0.7}
              style={{
                width: 52,
                height: 52,
                borderRadius: 14,
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: icon === ic ? c.primary + '22' : c.surface,
                borderWidth: 1.5,
                borderColor: icon === ic ? c.primary : c.border,
              }}>
              <Text style={{ fontSize: 24 }}>{ic}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <Label text="Goal name" />
        <BottomSheetTextInput
          value={name}
          onChangeText={setName}
          placeholder="e.g. Vacation, Emergency Fund"
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
            marginBottom: 24,
          }}
        />

        <Label text={`Target amount · ${currencySymbol}`} />
        <BottomSheetTextInput
          value={target}
          onChangeText={setTarget}
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
            borderColor: target.length > 0 ? c.primary : c.border,
            marginBottom: 24,
          }}
        />

        <Label text="Deadline (optional · YYYY-MM)" />
        <BottomSheetTextInput
          value={deadline}
          onChangeText={setDeadline}
          placeholder="e.g. 2026-12"
          placeholderTextColor={c.textMuted}
          keyboardType="numbers-and-punctuation"
          style={{
            fontFamily: 'Inter-Regular',
            fontSize: 18,
            color: c.text,
            backgroundColor: c.surface,
            borderRadius: 16,
            padding: 16,
            borderWidth: 1,
            borderColor: c.border,
          }}
        />
      </BottomSheetScrollView>

      <View style={{ paddingHorizontal: 24, paddingTop: 10, paddingBottom: 24 }}>
        <TouchableOpacity
          onPress={handleSave}
          disabled={!canSave}
          activeOpacity={0.85}
          style={{
            backgroundColor: canSave ? c.primary : c.border,
            borderRadius: 16,
            padding: 18,
            alignItems: 'center',
          }}>
          <Text style={{ fontFamily: 'Inter-Bold', fontSize: 16, color: '#fff' }}>
            {saving ? 'Saving...' : 'Create Goal'}
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
